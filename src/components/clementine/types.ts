export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  reactions?: MessageReaction[];
  persona?: ClementinePersona;
  mood?: ClementineMood;
  hasSecretCommand?: boolean;
  mediaType?: "text" | "code" | "diagram" | "gif" | "emoji-art";
  codeLanguage?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface ChatSettings {
  voiceEnabled: boolean;
  language: "en" | "hi";
  autoScroll: boolean;
  showTimestamps: boolean;
  voiceSpeed: number;
  theme: "default" | "midnight" | "sakura" | "matrix" | "retro";
  soundEffects: boolean;
  persona: ClementinePersona;
  showMood: boolean;
  compactMode: boolean;
}

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking" | "easter-egg";

// Clementine Personality System
export type ClementinePersona = 
  | "default"      // Sweet, caring default
  | "professional" // Formal, business-like
  | "playful"      // Extra fun, uses more emojis
  | "mentor"       // Educational, encouraging
  | "creative"     // Artistic, poetic responses
  | "debug"        // Technical, detailed
  | "hype"         // Ultra enthusiastic!
  | "zen";         // Calm, mindful responses

export type ClementineMood = 
  | "happy"
  | "excited" 
  | "curious"
  | "thoughtful"
  | "playful"
  | "sleepy"
  | "energetic"
  | "zen";

// Relationship/XP System
export interface UserRelationship {
  visitorId: string;
  nickname?: string;
  level: number;
  xp: number;
  totalMessages: number;
  firstVisit: Date;
  lastVisit: Date;
  achievements: Achievement[];
  unlockedPersonas: ClementinePersona[];
  unlockedSecrets: string[];
  favoriteTopics: string[];
  streak: {
    current: number;
    longest: number;
    lastDate: string;
  };
  stats: {
    questionsAsked: number;
    projectsDiscussed: number;
    voiceChatsHad: number;
    secretsFound: number;
    easterEggsTriggered: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// Gamification
export interface EasterEgg {
  id: string;
  trigger: string | RegExp;
  response: string;
  animation?: string;
  sound?: string;
  achievement?: string;
  xpReward: number;
}

// Secret Commands
export interface SecretCommand {
  command: string;
  description: string;
  action: "persona" | "theme" | "animation" | "special" | "game";
  value?: string;
  unlockLevel?: number;
}

// Mini-games
export interface MiniGame {
  id: string;
  name: string;
  description: string;
  type: "trivia" | "word-guess" | "number-game" | "memory";
  state?: GameState;
}

export interface GameState {
  active: boolean;
  score: number;
  round: number;
  data?: unknown;
}

// Typing indicators
export interface TypingIndicator {
  style: "dots" | "wave" | "bounce" | "glitch" | "heart" | "rocket";
}

// Avatar expressions
export type AvatarExpression = 
  | "neutral"
  | "happy"
  | "thinking"
  | "speaking"
  | "surprised"
  | "wink"
  | "love"
  | "sleepy";
