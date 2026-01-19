import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Types and constants
import { 
  Message, 
  ChatSettings, 
  ChatStatus, 
  ClementinePersona,
  ClementineMood,
  EasterEgg,
} from "./clementine/types";
import { 
  SUGGESTED_QUESTIONS_EN, 
  SUGGESTED_QUESTIONS_HI,
  MOOD_EXPRESSIONS,
  PERSONA_INFO,
  RETURNING_USER_GREETINGS_EN,
  RETURNING_USER_GREETINGS_HI,
} from "./clementine/constants";

// Hooks
import { useSpeechRecognition } from "./clementine/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./clementine/hooks/useSpeechSynthesis";
import { useChatApi } from "./clementine/hooks/useChatApi";
import { useRelationship } from "./clementine/hooks/useRelationship";
import { useEasterEggs } from "./clementine/hooks/useEasterEggs";

// Components
import { ChatHeader } from "./clementine/components/ChatHeader";
import { MessageBubble } from "./clementine/components/MessageBubble";
import { ChatInput } from "./clementine/components/ChatInput";
import { EmptyState } from "./clementine/components/EmptyState";
import { DynamicSuggestions } from "./clementine/components/DynamicSuggestions";
import { LevelUpNotification } from "./clementine/components/LevelUpNotification";
import { AchievementNotification } from "./clementine/components/AchievementNotification";
import { MoodIndicator } from "./clementine/components/MoodIndicator";
import { AnimationOverlay } from "./clementine/components/AnimationOverlay";
import { XPBar } from "./clementine/components/XPBar";
import { PersonaSelector } from "./clementine/components/PersonaSelector";

const ClementineSection = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    voiceEnabled: false,
    language: "en",
    autoScroll: true,
    showTimestamps: true,
    voiceSpeed: 1.0,
    theme: "default",
    soundEffects: true,
    persona: "default",
    showMood: true,
    compactMode: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(-1);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Refs
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>("");

  // Relationship hook
  const {
    relationship,
    currentMood,
    showLevelUp,
    newAchievement,
    recordMessage,
    recordVoiceChat,
    recordEasterEgg,
    recordLanguageSwitch,
    isPersonaUnlocked,
    getLevelTitle,
    getXPProgress,
    isReturningUser,
    changeMood,
  } = useRelationship();

  // Easter eggs hook
  const { processMessage: processEasterEgg, activeAnimation } = useEasterEggs({
    onEasterEggTriggered: (egg: EasterEgg) => {
      recordEasterEgg(egg.id);
      if (settings.soundEffects) {
        // Play sound effect if available
      }
    },
    onPersonaChange: (persona: ClementinePersona) => {
      if (isPersonaUnlocked(persona)) {
        setSettings(prev => ({ ...prev, persona }));
        toast.success(`Persona changed to ${PERSONA_INFO[persona].name}!`);
      } else {
        toast.error(`Unlock level ${PERSONA_INFO[persona].unlockLevel} to use this persona!`);
      }
    },
    onThemeChange: (theme: string) => {
      setSettings(prev => ({ ...prev, theme: theme as ChatSettings["theme"] }));
    },
    relationship: {
      level: relationship.level,
      xp: relationship.xp,
      totalMessages: relationship.totalMessages,
      achievements: relationship.achievements,
      streak: relationship.streak,
      stats: relationship.stats,
    },
    language: settings.language,
  });

  // Hooks
  const { streamChat, parseStream } = useChatApi();
  const { isSpeaking, currentWordIndex, speak, stop: stopSpeaking } = useSpeechSynthesis({
    language: settings.language,
  });

  const handleVoiceMessage = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleSend(transcript);
      recordVoiceChat();
    }
  }, [recordVoiceChat]);

  const { isListening, currentTranscript, toggleListening } = useSpeechRecognition({
    language: settings.language,
    onFinalTranscript: handleVoiceMessage,
  });

  // Derived state
  const status: ChatStatus = isListening
    ? "listening"
    : isProcessing
      ? "thinking"
      : isSpeaking
        ? "speaking"
        : "idle";

  const suggestedQuestions =
    settings.language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  // Show welcome message for returning users
  useEffect(() => {
    if (isReturningUser() && !hasShownWelcome && messages.length === 0) {
      const greetings = settings.language === "hi" 
        ? RETURNING_USER_GREETINGS_HI 
        : RETURNING_USER_GREETINGS_EN;
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      const welcomeMessage: Message = {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: `${greeting} ${relationship.nickname ? `Good to see you again, ${relationship.nickname}!` : ""} You're at Level ${relationship.level} with a ${relationship.streak.current}-day streak! 🔥`,
        timestamp: new Date(),
        mood: currentMood,
        persona: settings.persona,
      };
      
      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
    }
  }, [isReturningUser, hasShownWelcome, settings.language, relationship, currentMood, settings.persona, messages.length]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll && messagesScrollRef.current) {
      requestAnimationFrame(() => {
        messagesScrollRef.current!.scrollTop = messagesScrollRef.current!.scrollHeight;
      });
    }
  }, [settings.autoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update speaking index when voice synth reports word boundary
  useEffect(() => {
    setCurrentSpeakingIndex(currentWordIndex);
  }, [currentWordIndex]);

  // Reset speaking state when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
      setCurrentSpeakingIndex(-1);
    }
  }, [isSpeaking]);

  // Handlers
  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    lastUserMessageRef.current = text;
    recordMessage();

    // Check for easter eggs or special commands first
    const specialResult = processEasterEgg(text);
    if (specialResult) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
        hasSecretCommand: true,
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: specialResult.response,
        timestamp: new Date(),
        mood: currentMood,
        persona: settings.persona,
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      
      if (settings.voiceEnabled) {
        setSpeakingMessageId(assistantMessage.id);
        speak(specialResult.response, (charIndex) => {
          setCurrentSpeakingIndex(charIndex);
        });
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
        mood: currentMood,
        persona: settings.persona,
      },
    ]);

    try {
      // Include persona context in messages
      const personaContext = `[Current persona: ${settings.persona}, mood: ${currentMood}]`;
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.role === "user" ? `${personaContext} ${m.content}` : m.content,
      }));

      const response = await streamChat(apiMessages, settings.language);

      const fullContent = await parseStream(response, (content) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content, isTyping: true } : m
          )
        );
      });

      // Mark typing as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fullContent, isTyping: false } : m
        )
      );

      // Speak if voice is enabled
      if (settings.voiceEnabled && fullContent) {
        setSpeakingMessageId(assistantId);
        speak(fullContent, (charIndex) => {
          setCurrentSpeakingIndex(charIndex);
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Oops! I encountered an error. Please try again!", isTyping: false }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeak = (text: string, messageId?: string) => {
    if (messageId) {
      setSpeakingMessageId(messageId);
    }
    speak(text, (charIndex) => {
      setCurrentSpeakingIndex(charIndex);
    });
  };

  const handleRegenerate = () => {
    if (lastUserMessageRef.current && !isProcessing) {
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessageRef.current);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    lastUserMessageRef.current = "";
    stopSpeaking();
    setHasShownWelcome(false);
    toast.success("Chat cleared");
  };

  const handleExportChat = () => {
    const exportData = {
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        mood: m.mood,
        persona: m.persona,
      })),
      relationship: {
        level: relationship.level,
        xp: relationship.xp,
        totalMessages: relationship.totalMessages,
        achievements: relationship.achievements.map(a => a.name),
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clementine-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported with stats!");
  };

  const toggleVoice = () => {
    const newState = !settings.voiceEnabled;
    setSettings((prev) => ({ ...prev, voiceEnabled: newState }));
    
    if (!newState) {
      stopSpeaking();
    }
    
    toast.success(newState ? "Voice replies enabled" : "Voice replies disabled");
  };

  const handleLanguageChange = (lang: "en" | "hi") => {
    if (lang !== settings.language) {
      recordLanguageSwitch();
    }
    setSettings((prev) => ({ ...prev, language: lang }));
    stopSpeaking();
  };

  const handlePersonaChange = (persona: ClementinePersona) => {
    if (isPersonaUnlocked(persona)) {
      setSettings(prev => ({ ...prev, persona }));
      setShowPersonaSelector(false);
      toast.success(`Now talking as ${PERSONA_INFO[persona].name}!`);
    } else {
      toast.error(`Reach level ${PERSONA_INFO[persona].unlockLevel} to unlock this persona!`);
    }
  };

  // Find last assistant message index
  const lastAssistantIndex = messages.reduce(
    (acc, msg, idx) => (msg.role === "assistant" ? idx : acc),
    -1
  );

  // Theme classes
  const themeClasses = useMemo(() => {
    switch (settings.theme) {
      case "midnight":
        return "bg-slate-950 border-blue-500/30";
      case "sakura":
        return "bg-pink-50 dark:bg-pink-950/20 border-pink-300/50";
      case "matrix":
        return "bg-black border-green-500/50";
      case "retro":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-500/30";
      default:
        return "bg-background/80 border-primary/20";
    }
  }, [settings.theme]);

  return (
    <section
      id="clementine"
      className="py-12 sm:py-16 px-4 bg-gradient-to-b from-background via-muted/10 to-background relative"
    >
      {/* Animation Overlay */}
      <AnimatePresence>
        {activeAnimation && <AnimationOverlay animation={activeAnimation} />}
      </AnimatePresence>

      {/* Level Up Notification */}
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpNotification 
            level={relationship.level} 
            title={getLevelTitle()} 
          />
        )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <AchievementNotification achievement={newAchievement} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/15 backdrop-blur-md text-primary text-[10px] sm:text-xs font-mono mb-4">
            AI Assistant • Level {relationship.level}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2 text-foreground">
            <span>Meet</span> <span className="text-primary">Clementine</span>
            <MoodIndicator mood={currentMood} show={settings.showMood} />
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm px-2">
            {settings.language === "hi"
              ? "मेरी AI assistant जो text और voice chat दोनों support करती है"
              : "My AI assistant with text and optional voice chat support"}
          </p>
          
          {/* XP Bar */}
          <div className="max-w-xs mx-auto mt-4">
            <XPBar 
              {...getXPProgress()} 
              level={relationship.level}
              streak={relationship.streak.current}
            />
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <div className={`rounded-2xl overflow-hidden border shadow-xl backdrop-blur-sm transition-colors duration-300 ${themeClasses}`}>
            {/* Header */}
            <ChatHeader
              status={status}
              settings={settings}
              onToggleVoice={toggleVoice}
              onToggleListening={toggleListening}
              onStopSpeaking={stopSpeaking}
              onClearChat={handleClearChat}
              onExportChat={handleExportChat}
              onLanguageChange={handleLanguageChange}
              messageCount={messages.length}
              currentTranscript={currentTranscript}
              persona={settings.persona}
              onPersonaClick={() => setShowPersonaSelector(true)}
              relationship={relationship}
            />

            {/* Persona Selector */}
            <AnimatePresence>
              {showPersonaSelector && (
                <PersonaSelector
                  currentPersona={settings.persona}
                  unlockedPersonas={relationship.unlockedPersonas as ClementinePersona[]}
                  onSelect={handlePersonaChange}
                  onClose={() => setShowPersonaSelector(false)}
                />
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={messagesScrollRef}
              className={`min-h-[280px] sm:min-h-[380px] max-h-[350px] sm:max-h-[480px] overflow-y-auto p-2.5 sm:p-4 space-y-2.5 ${
                settings.theme === "matrix" ? "text-green-400" : ""
              }`}
            >
              {messages.length === 0 ? (
                <EmptyState
                  language={settings.language}
                  suggestedQuestions={suggestedQuestions}
                  onSelectQuestion={handleSend}
                  disabled={isProcessing}
                  isReturningUser={isReturningUser()}
                  userName={relationship.nickname}
                />
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showTimestamp={settings.showTimestamps}
                      onSpeak={(text) => handleSpeak(text, message.id)}
                      onRegenerate={handleRegenerate}
                      isLatestAssistant={index === lastAssistantIndex}
                      voiceEnabled={settings.voiceEnabled}
                      currentSpeakingIndex={
                        speakingMessageId === message.id ? currentSpeakingIndex : -1
                      }
                      theme={settings.theme}
                      compact={settings.compactMode}
                    />
                  ))}
                  
                  {/* Dynamic suggestions based on conversation */}
                  {messages.length >= 2 && !isProcessing && (
                    <DynamicSuggestions
                      messages={messages}
                      language={settings.language}
                      onSelect={handleSend}
                      disabled={isProcessing}
                    />
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSend={handleSend}
              disabled={isProcessing}
              language={settings.language}
              placeholder={
                settings.language === "hi" 
                  ? "Type karein ya /help try karein..." 
                  : "Type a message or try /help..."
              }
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClementineSection;
