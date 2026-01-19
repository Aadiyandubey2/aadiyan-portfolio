import { useCallback, useState } from "react";
import { EasterEgg, SecretCommand, ClementinePersona, MiniGame, GameState } from "../types";
import { 
  EASTER_EGGS, 
  SECRET_COMMANDS, 
  CODING_FORTUNES, 
  PROGRAMMING_JOKES,
  ASCII_ARTS,
  TRIVIA_QUESTIONS,
} from "../constants";

interface UseEasterEggsProps {
  onEasterEggTriggered: (egg: EasterEgg) => void;
  onPersonaChange: (persona: ClementinePersona) => void;
  onThemeChange: (theme: string) => void;
  relationship: {
    level: number;
    xp: number;
    totalMessages: number;
    achievements: { id: string; name: string }[];
    streak: { current: number; longest: number };
    stats: Record<string, number>;
  };
  language: "en" | "hi";
}

export const useEasterEggs = ({
  onEasterEggTriggered,
  onPersonaChange,
  onThemeChange,
  relationship,
  language,
}: UseEasterEggsProps) => {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [triviaGame, setTriviaGame] = useState<MiniGame | null>(null);

  const checkForEasterEgg = useCallback((message: string): EasterEgg | null => {
    const normalizedMessage = message.toLowerCase().trim();
    
    for (const egg of EASTER_EGGS) {
      if (egg.trigger instanceof RegExp) {
        if (egg.trigger.test(normalizedMessage)) return egg;
      } else if (normalizedMessage === egg.trigger.toLowerCase()) {
        return egg;
      }
    }
    return null;
  }, []);

  const processEasterEgg = useCallback((egg: EasterEgg): string => {
    onEasterEggTriggered(egg);
    
    if (egg.animation) {
      setActiveAnimation(egg.animation);
      setTimeout(() => setActiveAnimation(null), 3000);
    }
    
    if (egg.id === "matrix") {
      onThemeChange("matrix");
    }
    
    return egg.response;
  }, [onEasterEggTriggered, onThemeChange]);

  const checkForSecretCommand = useCallback((message: string): SecretCommand | null => {
    const normalizedMessage = message.toLowerCase().trim();
    
    for (const cmd of SECRET_COMMANDS) {
      if (normalizedMessage.startsWith(cmd.command)) {
        if (cmd.unlockLevel && relationship.level < cmd.unlockLevel) {
          return null; // Not unlocked yet
        }
        return cmd;
      }
    }
    return null;
  }, [relationship.level]);

  const processSecretCommand = useCallback((cmd: SecretCommand, fullMessage: string): string => {
    const args = fullMessage.slice(cmd.command.length).trim();
    
    switch (cmd.action) {
      case "persona":
        if (args) {
          const persona = args.toLowerCase() as ClementinePersona;
          if (["default", "professional", "playful", "mentor", "creative", "debug", "hype", "zen"].includes(persona)) {
            onPersonaChange(persona);
            return `✨ Persona switched to ${persona}! Let me adjust my style...`;
          }
        }
        return `Available personas: default, professional, playful, mentor, creative, debug, hype, zen. Use: /persona [name]`;
      
      case "theme":
        if (args) {
          onThemeChange(args.toLowerCase());
          return `🎨 Theme switched to ${args}!`;
        }
        return `Available themes: default, midnight, sakura, matrix, retro. Use: /theme [name]`;
      
      case "special":
        return processSpecialCommand(cmd.command, args);
      
      case "game":
        return startMiniGame(cmd.command);
      
      case "animation":
        setActiveAnimation(args || "party");
        setTimeout(() => setActiveAnimation(null), 3000);
        return "🎉 Party mode activated!";
      
      default:
        return "Unknown command!";
    }
  }, [onPersonaChange, onThemeChange]);

  const processSpecialCommand = useCallback((command: string, args: string): string => {
    switch (command) {
      case "/stats":
        return formatStats();
      
      case "/achievements":
        return formatAchievements();
      
      case "/fortune":
        const fortune = CODING_FORTUNES[Math.floor(Math.random() * CODING_FORTUNES.length)];
        return fortune;
      
      case "/joke":
        const joke = PROGRAMMING_JOKES[Math.floor(Math.random() * PROGRAMMING_JOKES.length)];
        return `${joke.setup}\n\n${joke.punchline}`;
      
      case "/haiku":
        return generateCodingHaiku();
      
      case "/ascii":
        const artType = args.toLowerCase() || "heart";
        const art = ASCII_ARTS[artType as keyof typeof ASCII_ARTS] || ASCII_ARTS.heart;
        return `\`\`\`\n${art}\n\`\`\``;
      
      case "/time":
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
          timeZone: 'Asia/Kolkata', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        };
        const time = now.toLocaleTimeString('en-IN', options);
        return `🕐 It's ${time} for Aadiyan in India! ${getTimeEmoji(now.getHours())}`;
      
      case "/speed":
        return "Use the voice speed slider in settings to adjust my speaking speed! 🎚️";
      
      case "/compact":
        return "Compact mode toggled! 📱";
      
      case "/secret":
        return "🤫 Shh... You found a secret! Aadiyan once coded for 48 hours straight to finish a project. True dedication! +100 XP!";
      
      case "/help":
        return formatHelp();
      
      default:
        return "Command not recognized! Type /help for available commands.";
    }
  }, [relationship]);

  const formatStats = useCallback((): string => {
    const { level, xp, totalMessages, streak, stats } = relationship;
    return `📊 **Your Stats with Clementine**

🎯 Level: ${level} (${xp} XP)
💬 Total Messages: ${totalMessages}
🔥 Current Streak: ${streak.current} days
⭐ Longest Streak: ${streak.longest} days
❓ Questions Asked: ${stats.questionsAsked || 0}
🎤 Voice Chats: ${stats.voiceChatsHad || 0}
🔍 Secrets Found: ${stats.secretsFound || 0}
🥚 Easter Eggs: ${stats.easterEggsTriggered || 0}`;
  }, [relationship]);

  const formatAchievements = useCallback((): string => {
    const { achievements } = relationship;
    if (achievements.length === 0) {
      return "🏆 No achievements yet! Keep chatting to unlock some! 💪";
    }
    
    const achievementList = achievements.map(a => `🏆 ${a.name}`).join("\n");
    return `🏆 **Your Achievements** (${achievements.length})\n\n${achievementList}`;
  }, [relationship]);

  const formatHelp = useCallback((): string => {
    const availableCommands = SECRET_COMMANDS.filter(
      cmd => !cmd.unlockLevel || relationship.level >= cmd.unlockLevel
    );
    
    const helpText = availableCommands.map(cmd => `${cmd.command} - ${cmd.description}`).join("\n");
    return `🤖 **Available Commands**\n\n${helpText}\n\nSome commands unlock at higher levels!`;
  }, [relationship.level]);

  const generateCodingHaiku = (): string => {
    const haikus = [
      "Code flows like water\nBugs swim against the current\nStack Overflow saves",
      "Semicolon missed\nThe compiler screams at me\nCoffee saves the day",
      "Git push to main branch\nPrayers sent to the server\nPipeline goes green",
      "Functions call each other\nRecursion without an end\nStack overflow... oops",
    ];
    return `📝 *A Coding Haiku*\n\n${haikus[Math.floor(Math.random() * haikus.length)]}`;
  };

  const getTimeEmoji = (hour: number): string => {
    if (hour >= 5 && hour < 12) return "☀️ Good morning vibes!";
    if (hour >= 12 && hour < 17) return "🌤️ Afternoon coding session!";
    if (hour >= 17 && hour < 21) return "🌅 Evening hours!";
    if (hour >= 21 || hour < 2) return "🌙 Night owl mode!";
    return "💤 Even coders need sleep!";
  };

  const startMiniGame = useCallback((command: string): string => {
    if (command === "/trivia") {
      const randomQuestion = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
      setTriviaGame({
        id: "trivia",
        name: "Aadiyan Trivia",
        description: "Test your knowledge about Aadiyan!",
        type: "trivia",
        state: {
          active: true,
          score: 0,
          round: 0,
          data: randomQuestion,
        },
      });
      
      const options = randomQuestion.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");
      return `🎮 **Trivia Time!**\n\n${randomQuestion.question}\n\n${options}\n\n*Reply with the number of your answer!*`;
    }
    return "Game not found!";
  }, []);

  const checkTriviaAnswer = useCallback((answer: string): string | null => {
    if (!triviaGame?.state?.active) return null;
    
    const answerNum = parseInt(answer.trim());
    if (isNaN(answerNum) || answerNum < 1 || answerNum > 4) return null;
    
    const question = triviaGame.state.data as { correct: number; options: string[] };
    const isCorrect = answerNum - 1 === question.correct;
    
    setTriviaGame(null); // End game
    
    if (isCorrect) {
      return `🎉 **Correct!** You really know your stuff about Aadiyan! +50 XP! 🌟`;
    } else {
      return `❌ Not quite! The correct answer was: ${question.options[question.correct]}. Keep learning about Aadiyan! 💪`;
    }
  }, [triviaGame]);

  const processMessage = useCallback((message: string): { response: string; isSpecial: boolean } | null => {
    // Check for trivia answer first
    const triviaResult = checkTriviaAnswer(message);
    if (triviaResult) {
      return { response: triviaResult, isSpecial: true };
    }
    
    // Check for secret commands
    const secretCmd = checkForSecretCommand(message);
    if (secretCmd) {
      return { response: processSecretCommand(secretCmd, message), isSpecial: true };
    }
    
    // Check for easter eggs
    const easterEgg = checkForEasterEgg(message);
    if (easterEgg) {
      return { response: processEasterEgg(easterEgg), isSpecial: true };
    }
    
    return null;
  }, [checkTriviaAnswer, checkForSecretCommand, processSecretCommand, checkForEasterEgg, processEasterEgg]);

  return {
    processMessage,
    activeAnimation,
    triviaGame,
  };
};
