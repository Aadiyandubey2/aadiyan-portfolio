import { useState, useRef, memo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMode = "chat" | "code" | "image" | "slides" | "search";

interface ChatInputProps {
  onSend: (message: string, images?: string[], mode?: ChatMode) => void;
  disabled: boolean;
  language: "en" | "hi";
}

/* ===== INLINE SVG ICONS ===== */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224 128 32 48l48 80-48 80Z" opacity="0.2" />
    <path d="M229 121 37 41a8 8 0 0 0-10 10l44 77-44 77a8 8 0 0 0 10 10l192-80a8 8 0 0 0 0-14ZM57 189l30-53h59l-59-53-30-53 150 63Z" />
  </svg>
);

const ImageUploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56ZM40 200v-3l41-41 51 51H40Zm176 0h-28l-56-56 39-39 45 45ZM96 120a24 24 0 1 0-24-24 24 24 0 0 0 24 24Z" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor">
    <path d="M205 51a8 8 0 0 1 0 11L139 128l66 66a8 8 0 0 1-11 11l-66-66-66 66a8 8 0 0 1-11-11l66-66-66-66a8 8 0 0 1 11-11l66 66 66-66a8 8 0 0 1 11 0Z" />
  </svg>
);

// Mode definitions
const MODES: { id: ChatMode; label: string; labelHi: string; icon: JSX.Element }[] = [
  {
    id: "chat",
    label: "Chat",
    labelHi: "चैट",
    icon: (
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
        <path d="M216 48H40a16 16 0 0 0-16 16v160a15.9 15.9 0 0 0 9.2 14.5A16.1 16.1 0 0 0 40 240a15.9 15.9 0 0 0 10.3-3.8l.2-.2L82.5 208H216a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM40 224V64h176v128H80a16 16 0 0 0-10.3 3.8Z" />
      </svg>
    ),
  },
  {
    id: "code",
    label: "Code",
    labelHi: "कोड",
    icon: (
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
        <path d="M69.1 94.1 28.5 128l40.6 33.9a8 8 0 0 1-10.2 12.2l-48-40a8 8 0 0 1 0-12.2l48-40a8 8 0 1 1 10.2 12.2Zm176 21.8-48-40a8 8 0 0 0-10.2 12.2L227.5 128l-40.6 33.9a8 8 0 0 0 10.2 12.2l48-40a8 8 0 0 0 0-12.2Zm-82.4-89.4a7.9 7.9 0 0 0-10.2 4.8l-64 176a8 8 0 0 0 4.8 10.2 8.6 8.6 0 0 0 2.7.5 7.9 7.9 0 0 0 7.5-5.3l64-176a7.9 7.9 0 0 0-4.8-10.2Z" />
      </svg>
    ),
  },
  {
    id: "image",
    label: "Image",
    labelHi: "इमेज",
    icon: (
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
        <path d="M208 144a15.8 15.8 0 0 1-10 14.8l-30.1 12.5-12.5 30.1a16 16 0 0 1-29.6 0l-12.5-30.1-30.1-12.5a16 16 0 0 1 0-29.6l30.1-12.5 12.5-30.1a16 16 0 0 1 29.6 0l12.5 30.1 30.1 12.5A15.8 15.8 0 0 1 208 144Zm-128-44a8 8 0 0 0 7.4-5l8.6-20.6 20.6-8.6a8 8 0 0 0 0-14.8L96 42.4 87.4 21.8a8 8 0 0 0-14.8 0L64 42.4 43.4 51a8 8 0 0 0 0 14.8L64 74.4l8.6 20.6a8 8 0 0 0 7.4 5Z" />
      </svg>
    ),
  },
  {
    id: "slides",
    label: "Slides",
    labelHi: "स्लाइड",
    icon: (
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
        <path d="M208 40H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 128H48V56h160Z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    labelHi: "खोज",
    icon: (
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
        <path d="M232.5 215.5 185 168a92.1 92.1 0 1 0-17 17l47.5 47.5a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68 68.1 68.1 0 0 1-68-68Z" />
      </svg>
    ),
  },
];

const ModeSwitcher = memo(({
  activeMode,
  onModeChange,
  language,
}: {
  activeMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  language: "en" | "hi";
}) => (
  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/40 border border-border/30">
    {MODES.map((mode) => {
      const isActive = activeMode === mode.id;
      return (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`
            relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium
            transition-all duration-200
            ${isActive
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          <span className={isActive ? "text-primary" : ""}>{mode.icon}</span>
          <span className="hidden sm:inline">{language === "hi" ? mode.labelHi : mode.label}</span>
        </button>
      );
    })}
  </div>
));
ModeSwitcher.displayName = "ModeSwitcher";

const PLACEHOLDER: Record<ChatMode, { en: string; hi: string }> = {
  chat: { en: "Ask anything...", hi: "कुछ भी पूछें..." },
  code: { en: "Describe what you want to build...", hi: "क्या बनाना है बताएं..." },
  image: { en: "Describe the image you want to generate...", hi: "इमेज का विवरण दें..." },
  slides: { en: "Describe your presentation topic...", hi: "प्रेजेंटेशन का विषय बताएं..." },
  search: { en: "Search for anything...", hi: "कुछ भी खोजें..." },
};

export const ChatInput = ({ onSend, disabled, language }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<ChatMode>("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if ((trimmed || attachedImages.length > 0) && !disabled) {
      onSend(trimmed, attachedImages.length > 0 ? attachedImages : undefined, activeMode);
      setInputValue("");
      setAttachedImages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are supported");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAttachedImages((prev) => {
          if (prev.length >= 3) {
            toast.error("Maximum 3 images per message");
            return prev;
          }
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const placeholder = PLACEHOLDER[activeMode]?.[language] || PLACEHOLDER.chat[language];

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {/* Mode Switcher */}
      <div className="px-3 pt-2.5 pb-1 sm:px-4">
        <ModeSwitcher activeMode={activeMode} onModeChange={setActiveMode} language={language} />
      </div>

      {/* Attached images */}
      <AnimatePresence>
        {attachedImages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 sm:px-4 overflow-hidden"
          >
            <div className="flex gap-2 py-2">
              {attachedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-14 h-14 rounded-lg object-cover border border-border"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-muted-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CloseSmIcon />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-center gap-2 px-3 pb-3 sm:px-4">
        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2 rounded-lg text-muted-foreground 
            hover:text-foreground hover:bg-muted/60
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors"
          title={language === "hi" ? "इमेज अपलोड" : "Upload image"}
        >
          <ImageUploadIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2.5 rounded-xl 
              bg-muted/40 border border-border/40
              focus:bg-muted/60 focus:border-primary/40 focus:ring-1 focus:ring-primary/10
              outline-none text-sm disabled:opacity-40
              transition-all placeholder:text-muted-foreground/50 font-body"
          />
          {inputValue.length > 400 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] ${
              inputValue.length > 450 ? "text-destructive/70" : "text-muted-foreground/40"
            }`}>
              {inputValue.length}/500
            </span>
          )}
        </div>

        {/* Send */}
        <button
          onClick={handleSubmit}
          disabled={(!inputValue.trim() && attachedImages.length === 0) || disabled}
          className="flex-shrink-0 p-2.5 rounded-xl 
            bg-primary text-primary-foreground
            hover:shadow-md hover:shadow-primary/15
            hover:scale-[1.02] active:scale-[0.98]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};
