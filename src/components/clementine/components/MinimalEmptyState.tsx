import { memo } from "react";
import { ClementineSprite } from "./ClementineSprite";
import type { ChatMode } from "./ChatInput";

interface MinimalEmptyStateProps {
  language: "en" | "hi";
  suggestedQuestions: string[];
  onSelectQuestion: (question: string, images?: string[], mode?: ChatMode) => void;
  disabled: boolean;
}

// Capability cards data
const CAPABILITIES: {
  en: { title: string; description: string; prompt: string; mode: ChatMode; icon: JSX.Element }[];
  hi: { title: string; description: string; prompt: string; mode: ChatMode; icon: JSX.Element }[];
} = {
  en: [
    {
      title: "Write & Debug Code",
      description: "Generate, review, and fix code in any language",
      prompt: "Write a responsive React navbar component with TypeScript",
      mode: "code",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M69.1 94.1 28.5 128l40.6 33.9a8 8 0 0 1-10.2 12.2l-48-40a8 8 0 0 1 0-12.2l48-40a8 8 0 1 1 10.2 12.2Zm176 21.8-48-40a8 8 0 0 0-10.2 12.2L227.5 128l-40.6 33.9a8 8 0 0 0 10.2 12.2l48-40a8 8 0 0 0 0-12.2Zm-82.4-89.4a7.9 7.9 0 0 0-10.2 4.8l-64 176a8 8 0 0 0 4.8 10.2 8.6 8.6 0 0 0 2.7.5 7.9 7.9 0 0 0 7.5-5.3l64-176a7.9 7.9 0 0 0-4.8-10.2Z" />
        </svg>
      ),
    },
    {
      title: "Generate Images",
      description: "Create visuals from text descriptions with AI",
      prompt: "Generate an image of a futuristic city skyline at sunset",
      mode: "image",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M208 144a15.8 15.8 0 0 1-10 14.8l-30.1 12.5-12.5 30.1a16 16 0 0 1-29.6 0l-12.5-30.1-30.1-12.5a16 16 0 0 1 0-29.6l30.1-12.5 12.5-30.1a16 16 0 0 1 29.6 0l12.5 30.1 30.1 12.5A15.8 15.8 0 0 1 208 144Zm-128-44a8 8 0 0 0 7.4-5l8.6-20.6 20.6-8.6a8 8 0 0 0 0-14.8L96 42.4 87.4 21.8a8 8 0 0 0-14.8 0L64 42.4 43.4 51a8 8 0 0 0 0 14.8L64 74.4l8.6 20.6a8 8 0 0 0 7.4 5Z" />
        </svg>
      ),
    },
    {
      title: "Create Presentations",
      description: "Build structured slide decks from any topic",
      prompt: "Create a 6-slide presentation about modern web development",
      mode: "slides",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M208 40H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 128H48V56h160Z" />
        </svg>
      ),
    },
    {
      title: "Analyze Images",
      description: "Upload images for AI-powered analysis",
      prompt: "What can you tell me about Aadiyan's projects?",
      mode: "chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56ZM40 200v-3l41-41 51 51H40Zm176 0h-28l-56-56 39-39 45 45ZM96 120a24 24 0 1 0-24-24 24 24 0 0 0 24 24Z" />
        </svg>
      ),
    },
    {
      title: "Deep Research",
      description: "Find information with AI-powered search",
      prompt: "What technologies and skills does Aadiyan specialize in?",
      mode: "search",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M232.5 215.5 185 168a92.1 92.1 0 1 0-17 17l47.5 47.5a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68 68.1 68.1 0 0 1-68-68Z" />
        </svg>
      ),
    },
    {
      title: "Smart Chat",
      description: "Natural conversation with voice support",
      prompt: "Tell me about Aadiyan's background and what makes him unique",
      mode: "chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M216 48H40a16 16 0 0 0-16 16v160a15.9 15.9 0 0 0 9.2 14.5A16.1 16.1 0 0 0 40 240a15.9 15.9 0 0 0 10.3-3.8l.2-.2L82.5 208H216a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM40 224V64h176v128H80a16 16 0 0 0-10.3 3.8Z" />
        </svg>
      ),
    },
  ],
  hi: [
    {
      title: "कोड लिखें और डिबग करें",
      description: "किसी भी भाषा में कोड जनरेट, रिव्यू और फिक्स करें",
      prompt: "TypeScript में एक responsive React navbar component लिखो",
      mode: "code",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M69.1 94.1 28.5 128l40.6 33.9a8 8 0 0 1-10.2 12.2l-48-40a8 8 0 0 1 0-12.2l48-40a8 8 0 1 1 10.2 12.2Zm176 21.8-48-40a8 8 0 0 0-10.2 12.2L227.5 128l-40.6 33.9a8 8 0 0 0 10.2 12.2l48-40a8 8 0 0 0 0-12.2Zm-82.4-89.4a7.9 7.9 0 0 0-10.2 4.8l-64 176a8 8 0 0 0 4.8 10.2 8.6 8.6 0 0 0 2.7.5 7.9 7.9 0 0 0 7.5-5.3l64-176a7.9 7.9 0 0 0-4.8-10.2Z" />
        </svg>
      ),
    },
    {
      title: "इमेज जनरेट करें",
      description: "AI से टेक्स्ट से विज़ुअल बनाएं",
      prompt: "सूर्यास्त के समय एक भविष्य के शहर की इमेज बनाओ",
      mode: "image",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M208 144a15.8 15.8 0 0 1-10 14.8l-30.1 12.5-12.5 30.1a16 16 0 0 1-29.6 0l-12.5-30.1-30.1-12.5a16 16 0 0 1 0-29.6l30.1-12.5 12.5-30.1a16 16 0 0 1 29.6 0l12.5 30.1 30.1 12.5A15.8 15.8 0 0 1 208 144Z" />
        </svg>
      ),
    },
    {
      title: "प्रेजेंटेशन बनाएं",
      description: "किसी भी विषय पर स्लाइड डेक बनाएं",
      prompt: "आधुनिक वेब डेवलपमेंट पर 6 स्लाइड की प्रेजेंटेशन बनाओ",
      mode: "slides",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M208 40H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 128H48V56h160Z" />
        </svg>
      ),
    },
    {
      title: "इमेज विश्लेषण",
      description: "AI-संचालित विश्लेषण के लिए इमेज अपलोड करें",
      prompt: "Aadiyan के प्रोजेक्ट्स के बारे में बताओ",
      mode: "chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56ZM40 200v-3l41-41 51 51H40Zm176 0h-28l-56-56 39-39 45 45Z" />
        </svg>
      ),
    },
    {
      title: "गहन शोध",
      description: "AI-संचालित खोज से जानकारी प्राप्त करें",
      prompt: "Aadiyan किन technologies और skills में माहिर है?",
      mode: "search",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M232.5 215.5 185 168a92.1 92.1 0 1 0-17 17l47.5 47.5a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68 68.1 68.1 0 0 1-68-68Z" />
        </svg>
      ),
    },
    {
      title: "स्मार्ट चैट",
      description: "वॉइस सपोर्ट के साथ प्राकृतिक बातचीत",
      prompt: "Aadiyan की पृष्ठभूमि और उसकी विशेषता बताओ",
      mode: "chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-primary">
          <path d="M216 48H40a16 16 0 0 0-16 16v160a15.9 15.9 0 0 0 9.2 14.5A16.1 16.1 0 0 0 40 240a15.9 15.9 0 0 0 10.3-3.8l.2-.2L82.5 208H216a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM40 224V64h176v128H80a16 16 0 0 0-10.3 3.8Z" />
        </svg>
      ),
    },
  ],
};

export const MinimalEmptyState = memo(({
  language,
  onSelectQuestion,
  disabled,
}: MinimalEmptyStateProps) => {
  const capabilities = language === "hi" ? CAPABILITIES.hi : CAPABILITIES.en;

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4">
      {/* Avatar */}
      <div className="mb-4 animate-[fadeSlideUp_0.3s_ease-out]">
        <ClementineSprite status="idle" size="lg" />
      </div>

      {/* Greeting */}
      <div className="text-center mb-6 animate-[fadeSlideUp_0.3s_ease-out_0.1s_both]">
        <h3 className="text-lg font-semibold mb-1 font-heading">
          {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {language === "hi"
            ? "Aadiyan की AI assistant। नीचे किसी capability को चुनें या कुछ भी पूछें।"
            : "Aadiyan's AI assistant. Choose a capability below or ask anything."}
        </p>
      </div>

      {/* Capabilities label */}
      <div className="w-full max-w-xl animate-[fadeSlideUp_0.3s_ease-out_0.15s_both]">
        <p className="text-[10px] text-muted-foreground/50 text-center mb-3 uppercase tracking-widest font-medium">
          {language === "hi" ? "क्षमताएं" : "Capabilities"}
        </p>

        {/* Capability grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {capabilities.map((cap, i) => (
            <button
              key={i}
              onClick={() => onSelectQuestion(cap.prompt, undefined, cap.mode)}
              disabled={disabled}
              className="group relative text-left p-3 rounded-xl
                border border-border/40 bg-card/50 backdrop-blur-sm
                hover:bg-card hover:border-primary/30 hover:shadow-sm
                active:scale-[0.98]
                transition-all duration-200
                disabled:opacity-30 disabled:pointer-events-none"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-primary/8 border border-primary/10 group-hover:bg-primary/12 transition-colors">
                  {cap.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/90 leading-tight mb-0.5">
                    {cap.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 leading-tight line-clamp-2">
                    {cap.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

MinimalEmptyState.displayName = "MinimalEmptyState";
