export interface MessageImage {
  url: string; // base64 data URL or remote URL
  alt?: string;
}

export interface Artifact {
  id: string;
  type: "code" | "image" | "document" | "html";
  title: string;
  content: string;
  language?: string; // for code artifacts
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  images?: MessageImage[];
  artifacts?: Artifact[];
  thinking?: string;
  isThinkingComplete?: boolean;
}

export interface ChatSettings {
  voiceEnabled: boolean;
  language: "en" | "hi";
  autoScroll: boolean;
  showTimestamps: boolean;
}

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking";
