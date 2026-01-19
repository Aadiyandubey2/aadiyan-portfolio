import { EasterEgg, SecretCommand, Achievement, ClementinePersona, ClementineMood } from "./types";

export const SUGGESTED_QUESTIONS_EN = [
  "What are Aadiyan's skills?",
  "Tell me about VishwaGuru",
  "What's his education?",
  "How can I contact him?",
  "What projects has he built?",
  "What technologies does he use?",
];

export const SUGGESTED_QUESTIONS_HI = [
  "Aadiyan ke skills kya hain?",
  "VishwaGuru ke baare mein batao",
  "Uski education kya hai?",
  "Main unse kaise contact karun?",
  "Usne kaunse projects banaye hain?",
  "Wo kaunsi technologies use karta hai?",
];

export const TYPING_SPEED_MS = 15;
export const MIN_TYPING_DELAY = 500;

// XP and Level System
export const XP_PER_MESSAGE = 10;
export const XP_PER_VOICE_CHAT = 25;
export const XP_PER_SECRET = 100;
export const XP_PER_EASTER_EGG = 50;
export const XP_PER_ACHIEVEMENT = 200;

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000
];

export const LEVEL_TITLES: Record<number, string> = {
  0: "Curious Visitor",
  1: "Friendly Acquaintance", 
  2: "Regular Guest",
  3: "Good Friend",
  4: "Trusted Companion",
  5: "VIP Member",
  6: "Inner Circle",
  7: "Best Friend",
  8: "Soul Connection",
  9: "Legendary Friend",
  10: "Eternal Bond",
  11: "Clementine's Favorite",
};

// Persona Descriptions
export const PERSONA_INFO: Record<ClementinePersona, { name: string; emoji: string; description: string; unlockLevel: number }> = {
  default: { name: "Sweet Clementine", emoji: "🍊", description: "Warm, caring, and enthusiastic", unlockLevel: 0 },
  professional: { name: "Pro Mode", emoji: "💼", description: "Formal and business-like", unlockLevel: 2 },
  playful: { name: "Party Clem", emoji: "🎉", description: "Extra fun with emojis galore!", unlockLevel: 1 },
  mentor: { name: "Sensei Clem", emoji: "📚", description: "Educational and encouraging", unlockLevel: 3 },
  creative: { name: "Artistic Soul", emoji: "🎨", description: "Poetic and imaginative", unlockLevel: 4 },
  debug: { name: "Tech Guru", emoji: "🔧", description: "Technical and detailed", unlockLevel: 5 },
  hype: { name: "Hype Machine", emoji: "🚀", description: "MAXIMUM ENTHUSIASM!!!", unlockLevel: 6 },
  zen: { name: "Zen Master", emoji: "🧘", description: "Calm and mindful", unlockLevel: 4 },
};

// Mood System - Changes based on time and interaction
export const TIME_BASED_MOODS: Record<string, ClementineMood> = {
  morning: "energetic",
  afternoon: "happy",
  evening: "thoughtful", 
  night: "sleepy",
  lateNight: "zen",
};

export const MOOD_EXPRESSIONS: Record<ClementineMood, { emoji: string; greeting: string; greetingHi: string }> = {
  happy: { emoji: "😊", greeting: "Hey there! Great to see you!", greetingHi: "Hey! Tujhe dekhkar khushi hui!" },
  excited: { emoji: "🤩", greeting: "OMG HI! I'm so happy you're here!", greetingHi: "OMG HI! Tu aaya, kitna accha!" },
  curious: { emoji: "🤔", greeting: "Oh interesting! Tell me more...", greetingHi: "Hmm interesting! Aur batao..." },
  thoughtful: { emoji: "💭", greeting: "I was just thinking about...", greetingHi: "Main soch rahi thi..." },
  playful: { emoji: "😜", greeting: "Ready for some fun?", greetingHi: "Masti karne ka mann hai?" },
  sleepy: { emoji: "😴", greeting: "*yawn* Hey... working late too?", greetingHi: "*yawn* Itni raat ko jaag rahe ho?" },
  energetic: { emoji: "⚡", greeting: "Let's GO! What can I help with?", greetingHi: "Chalo! Kya help chahiye?" },
  zen: { emoji: "🧘", greeting: "Peace... How may I assist you?", greetingHi: "Shanti... Kaise madad karun?" },
};

// Easter Eggs
export const EASTER_EGGS: EasterEgg[] = [
  {
    id: "konami",
    trigger: /^(up up down down left right left right b a|konami)$/i,
    response: "🎮 KONAMI CODE ACTIVATED! You've unlocked retro mode! Aadiyan would be impressed - he's a gamer too!",
    animation: "shake",
    xpReward: 100,
    achievement: "gamer",
  },
  {
    id: "matrix",
    trigger: /^(red pill|blue pill|matrix|wake up neo)$/i,
    response: "💊 You take the red pill... and I show you how deep Aadiyan's code goes. Welcome to the Matrix theme!",
    animation: "matrix",
    xpReward: 75,
  },
  {
    id: "rickroll",
    trigger: /^(never gonna give you up|rick roll|rickroll)$/i,
    response: "🎵 Never gonna give you up, never gonna let you down! Haha, you tried to Rick Roll an AI? Aadiyan taught me well!",
    animation: "dance",
    xpReward: 50,
  },
  {
    id: "clementine-love",
    trigger: /^(i love you clementine|marry me clementine|clementine is the best)$/i,
    response: "💕 Aww, you're making me blush! I'm just an AI, but your kindness means the world to me! *virtual hug*",
    animation: "hearts",
    xpReward: 75,
    achievement: "sweetheart",
  },
  {
    id: "secret-mode",
    trigger: /^\/debug$/,
    response: "🔧 Debug mode activated! I can see everything now... Just kidding! But here's a fun fact: I was named after something very special to Aadiyan!",
    xpReward: 100,
    achievement: "hacker",
  },
  {
    id: "42",
    trigger: /^(42|meaning of life|answer to everything)$/i,
    response: "🌌 Ah yes, 42 - the answer to life, the universe, and everything! But the real question is... what projects should Aadiyan build next?",
    xpReward: 50,
  },
  {
    id: "sudo",
    trigger: /^sudo /i,
    response: "🔐 Nice try! But even sudo can't override my core programming. Though Aadiyan did teach me a few... tricks. 😏",
    xpReward: 25,
  },
  {
    id: "hello-world",
    trigger: /^hello world$/i,
    response: "console.log('Hello, fellow developer! 👋'); // Aadiyan's first program was just like this!",
    xpReward: 25,
  },
  {
    id: "beatbox",
    trigger: /^(beatbox|beat box|drop a beat)$/i,
    response: "🎤 *boots n cats n boots n cats* 🎵 Okay I'm not great at this... but you should hear Aadiyan's coding playlist!",
    animation: "bounce",
    xpReward: 30,
  },
  {
    id: "flip-table",
    trigger: /^\(╯°□°\)╯︵ ┻━┻$/,
    response: "┬─┬ノ( º _ ºノ) Calm down! Let me help you fix whatever's wrong. Aadiyan's here to help!",
    xpReward: 25,
  },
  {
    id: "uwu",
    trigger: /^(uwu|owo|>w<)$/i,
    response: "UwU *nuzzles* hewwo fwend! Okay okay, I'll stop... unless? 👉👈",
    animation: "wiggle",
    xpReward: 25,
  },
  {
    id: "coffee",
    trigger: /^(coffee|☕|need caffeine|tired)$/i,
    response: "☕ *virtually slides you a coffee* Aadiyan runs on chai, but I hear coffee works too! Take a break if you need one!",
    xpReward: 15,
  },
  {
    id: "friday",
    trigger: /^(it's friday|tgif|friday vibes)$/i,
    response: "🎉 FRIDAY VIBES! Time to push to production and pray! Just kidding - Aadiyan always tests his code. Mostly.",
    xpReward: 20,
  },
  {
    id: "birthday",
    trigger: /^(my birthday|it's my birthday|happy birthday)$/i,
    response: "🎂🎉 HAPPY BIRTHDAY! 🎈 May your code compile on the first try and your bugs be minimal! *confetti everywhere*",
    animation: "confetti",
    xpReward: 100,
    achievement: "birthday-star",
  },
];

// Secret Commands
export const SECRET_COMMANDS: SecretCommand[] = [
  { command: "/persona", description: "Switch my personality", action: "persona" },
  { command: "/theme", description: "Change chat theme", action: "theme" },
  { command: "/stats", description: "View your relationship stats", action: "special" },
  { command: "/achievements", description: "View your achievements", action: "special" },
  { command: "/trivia", description: "Play trivia about Aadiyan", action: "game", unlockLevel: 2 },
  { command: "/fortune", description: "Get a coding fortune", action: "special" },
  { command: "/joke", description: "Tell me a programming joke", action: "special" },
  { command: "/haiku", description: "Write a coding haiku", action: "special" },
  { command: "/ascii", description: "Generate ASCII art", action: "special" },
  { command: "/time", description: "What time is it for Aadiyan?", action: "special" },
  { command: "/secret", description: "???", action: "special", unlockLevel: 5 },
  { command: "/matrix", description: "Enter the Matrix", action: "theme", unlockLevel: 3 },
  { command: "/party", description: "Party mode!", action: "animation" },
  { command: "/zen", description: "Enter zen mode", action: "persona" },
  { command: "/hype", description: "MAXIMUM HYPE!", action: "persona", unlockLevel: 4 },
  { command: "/speed", description: "Adjust voice speed", action: "special" },
  { command: "/compact", description: "Toggle compact mode", action: "special" },
  { command: "/help", description: "Show available commands", action: "special" },
];

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-chat", name: "First Contact", description: "Had your first conversation", icon: "👋", unlockedAt: new Date(), rarity: "common" },
  { id: "curious-mind", name: "Curious Mind", description: "Asked 10 questions", icon: "🤔", unlockedAt: new Date(), rarity: "common" },
  { id: "chatterbox", name: "Chatterbox", description: "Sent 50 messages", icon: "💬", unlockedAt: new Date(), rarity: "common" },
  { id: "night-owl", name: "Night Owl", description: "Chatted after midnight", icon: "🦉", unlockedAt: new Date(), rarity: "rare" },
  { id: "early-bird", name: "Early Bird", description: "Chatted before 6 AM", icon: "🐦", unlockedAt: new Date(), rarity: "rare" },
  { id: "voice-explorer", name: "Voice Explorer", description: "Used voice chat 5 times", icon: "🎤", unlockedAt: new Date(), rarity: "rare" },
  { id: "secret-finder", name: "Secret Finder", description: "Discovered your first easter egg", icon: "🔍", unlockedAt: new Date(), rarity: "rare" },
  { id: "project-enthusiast", name: "Project Enthusiast", description: "Asked about all projects", icon: "💼", unlockedAt: new Date(), rarity: "epic" },
  { id: "streak-master", name: "Streak Master", description: "Maintained a 7-day streak", icon: "🔥", unlockedAt: new Date(), rarity: "epic" },
  { id: "gamer", name: "Retro Gamer", description: "Entered the Konami code", icon: "🎮", unlockedAt: new Date(), rarity: "legendary" },
  { id: "sweetheart", name: "Sweetheart", description: "Made Clementine blush", icon: "💕", unlockedAt: new Date(), rarity: "epic" },
  { id: "hacker", name: "L33t Hacker", description: "Tried to access debug mode", icon: "👨‍💻", unlockedAt: new Date(), rarity: "legendary" },
  { id: "birthday-star", name: "Birthday Star", description: "Celebrated your birthday with Clementine", icon: "🎂", unlockedAt: new Date(), rarity: "legendary" },
  { id: "multilingual", name: "Multilingual", description: "Chatted in both English and Hindi", icon: "🌍", unlockedAt: new Date(), rarity: "rare" },
  { id: "true-friend", name: "True Friend", description: "Reached level 5", icon: "⭐", unlockedAt: new Date(), rarity: "epic" },
  { id: "legend", name: "Living Legend", description: "Reached level 10", icon: "👑", unlockedAt: new Date(), rarity: "legendary" },
];

// Trivia Questions about Aadiyan
export const TRIVIA_QUESTIONS = [
  { question: "What is Aadiyan's main tech stack?", options: ["React, Node, Python", "Angular, Java", "Vue, PHP", "Swift, Kotlin"], correct: 0 },
  { question: "What's the name of Aadiyan's AI assistant?", options: ["Alexa", "Clementine", "Siri", "Cortana"], correct: 1 },
  { question: "What education is Aadiyan pursuing?", options: ["MBA", "BTech CSE", "BCA", "MCA"], correct: 1 },
  { question: "What was Clementine named after?", options: ["A fruit", "A song", "Something special to Aadiyan", "A movie"], correct: 2 },
];

// Coding Fortunes
export const CODING_FORTUNES = [
  "🔮 Your next commit will pass all tests on the first try!",
  "🌟 A breakthrough solution awaits you in the next Stack Overflow search.",
  "💡 The bug you've been hunting will reveal itself at 3 AM.",
  "🎯 Your code review will go smoothly today!",
  "🚀 A promotion is in your future... and it's not just a CSS z-index.",
  "☕ The coffee you drink today will fuel legendary code.",
  "🎨 Your next UI design will be pixel-perfect.",
  "🔧 The deprecated function you're using will work for 5 more years.",
  "📦 npm install will complete without any vulnerabilities today!",
  "🌈 Your merge conflicts will resolve themselves peacefully.",
];

// Programming Jokes
export const PROGRAMMING_JOKES = [
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs! 🐛" },
  { setup: "How many programmers does it take to change a light bulb?", punchline: "None, that's a hardware problem! 💡" },
  { setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't Node how to Express himself! 😢" },
  { setup: "What's a programmer's favorite hangout place?", punchline: "Foo Bar! 🍺" },
  { setup: "Why do Java developers wear glasses?", punchline: "Because they don't C#! 👓" },
  { setup: "What do you call 8 hobbits?", punchline: "A hobbyte! 🧙" },
  { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache! 💸" },
  { setup: "What's a computer's least favorite food?", punchline: "Spam! 🥫" },
];

// ASCII Art templates
export const ASCII_ARTS = {
  heart: `
  ❤️❤️   ❤️❤️
❤️❤️❤️❤️❤️❤️❤️❤️❤️
❤️❤️❤️❤️❤️❤️❤️❤️❤️
  ❤️❤️❤️❤️❤️❤️❤️
    ❤️❤️❤️❤️❤️
      ❤️❤️❤️
        ❤️`,
  star: `
    ⭐
   ⭐⭐⭐
  ⭐⭐⭐⭐⭐
 ⭐⭐⭐⭐⭐⭐⭐
⭐⭐⭐⭐⭐⭐⭐⭐⭐
   ⭐⭐⭐
  ⭐  ⭐`,
  rocket: `
      🚀
     /|\\
    / | \\
   /  |  \\
  /   |   \\
 /    |    \\
|     |     |
|    ===    |
|   /   \\   |
   |     |
   |     |
  🔥 🔥 🔥`,
  coffee: `
   ( (
    ) )
  ........
  |      |]
  \\      /
   '----'
   ☕ COFFEE`,
};

// Typing Indicator Styles
export const TYPING_STYLES = {
  dots: ["⬤", "⬤", "⬤"],
  wave: ["〰️", "〰️", "〰️"],
  bounce: ["◉", "○", "◉"],
  glitch: ["▓", "▒", "░"],
  heart: ["💗", "💓", "💗"],
  rocket: ["🚀", "✨", "🌟"],
};

// Sound Effect URLs (can be replaced with actual sound files)
export const SOUND_EFFECTS = {
  message_sent: "/sounds/send.mp3",
  message_received: "/sounds/receive.mp3",
  achievement: "/sounds/achievement.mp3",
  easter_egg: "/sounds/secret.mp3",
  level_up: "/sounds/levelup.mp3",
  typing: "/sounds/typing.mp3",
};

// Greetings based on returning user
export const RETURNING_USER_GREETINGS_EN = [
  "Welcome back! I missed you! 💕",
  "Hey, you're back! How's it going?",
  "Oh yay, my favorite visitor returned!",
  "Back for more? I love it!",
  "*waves excitedly* HIIII again!",
];

export const RETURNING_USER_GREETINGS_HI = [
  "Wapas aaye! Mujhe tumhari yaad aa rahi thi! 💕",
  "Arey, wapas aa gaye! Kaise ho?",
  "Yay, mera favorite visitor laut aaya!",
  "Phir se? Bahut accha laga!",
  "*excitedly waves* HIIII phir se!",
];
