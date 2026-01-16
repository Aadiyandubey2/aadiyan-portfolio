export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSettings {
  voiceEnabled: boolean;
  language: "en" | "hi";
  autoScroll: boolean;
  showTimestamps: boolean;
}

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking";
