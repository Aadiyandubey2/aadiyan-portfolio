import { useState, useRef, useEffect, memo } from "react";
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

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor">
    <path d="M205 51a8 8 0 0 1 0 11L139 128l66 66a8 8 0 0 1-11 11l-66-66-66 66a8 8 0 0 1-11-11l66-66-66-66a8 8 0 0 1 11-11l66 66 66-66a8 8 0 0 1 11 0Z" />
  </svg>
);

// Mode menu items with icons
const MODE_ITEMS: { id: ChatMode; label: string; labelHi: string; description: string; descriptionHi: string; icon: JSX.Element }[] = [
  {
    id: "chat",
    label: "Add photos & files",
    labelHi: "फोटो और फ़ाइल जोड़ें",
    description: "Upload images for analysis",
    descriptionHi: "विश्लेषण के लिए इमेज अपलोड करें",
    icon: (
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
        <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56ZM40 200v-3l41-41 51 51H40Zm176 0h-28l-56-56 39-39 45 45ZM96 120a24 24 0 1 0-24-24 24 24 0 0 0 24 24Z" />
      </svg>
    ),
  },
  {
    id: "image",
    label: "Create image",
    labelHi: "इमेज बनाएं",
    description: "Generate visuals from text",
    descriptionHi: "टेक्स्ट से इमेज जनरेट करें",
    icon: (
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
        <path d="M208 144a15.8 15.8 0 0 1-10 14.8l-30.1 12.5-12.5 30.1a16 16 0 0 1-29.6 0l-12.5-30.1-30.1-12.5a16 16 0 0 1 0-29.6l30.1-12.5 12.5-30.1a16 16 0 0 1 29.6 0l12.5 30.1 30.1 12.5A15.8 15.8 0 0 1 208 144Zm-128-44a8 8 0 0 0 7.4-5l8.6-20.6 20.6-8.6a8 8 0 0 0 0-14.8L96 42.4 87.4 21.8a8 8 0 0 0-14.8 0L64 42.4 43.4 51a8 8 0 0 0 0 14.8L64 74.4l8.6 20.6a8 8 0 0 0 7.4 5Z" />
      </svg>
    ),
  },
  {
    id: "code",
    label: "Write code",
    labelHi: "कोड लिखें",
    description: "Generate and debug code",
    descriptionHi: "कोड जनरेट और डिबग करें",
    icon: (
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
        <path d="M69.1 94.1 28.5 128l40.6 33.9a8 8 0 0 1-10.2 12.2l-48-40a8 8 0 0 1 0-12.2l48-40a8 8 0 1 1 10.2 12.2Zm176 21.8-48-40a8 8 0 0 0-10.2 12.2L227.5 128l-40.6 33.9a8 8 0 0 0 10.2 12.2l48-40a8 8 0 0 0 0-12.2Zm-82.4-89.4a7.9 7.9 0 0 0-10.2 4.8l-64 176a8 8 0 0 0 4.8 10.2 8.6 8.6 0 0 0 2.7.5 7.9 7.9 0 0 0 7.5-5.3l64-176a7.9 7.9 0 0 0-4.8-10.2Z" />
      </svg>
    ),
  },
  {
    id: "slides",
    label: "Create presentation",
    labelHi: "प्रेजेंटेशन बनाएं",
    description: "Build structured slide decks",
    descriptionHi: "स्लाइड डेक बनाएं",
    icon: (
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
        <path d="M208 40H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 128H48V56h160Z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Deep research",
    labelHi: "गहन शोध",
    description: "AI-powered search and research",
    descriptionHi: "AI-संचालित खोज और शोध",
    icon: (
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
        <path d="M232.5 215.5 185 168a92.1 92.1 0 1 0-17 17l47.5 47.5a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68 68.1 68.1 0 0 1-68-68Z" />
      </svg>
    ),
  },
];

const PLACEHOLDER: Record<ChatMode, { en: string; hi: string }> = {
  chat: { en: "Ask anything...", hi: "कुछ भी पूछें..." },
  code: { en: "Describe what you want to build...", hi: "क्या बनाना है बताएं..." },
  image: { en: "Describe the image to generate...", hi: "इमेज का विवरण दें..." },
  slides: { en: "Describe your presentation topic...", hi: "प्रेजेंटेशन का विषय बताएं..." },
  search: { en: "Search for anything...", hi: "कुछ भी खोजें..." },
};

const MODE_LABELS: Record<ChatMode, { en: string; hi: string }> = {
  chat: { en: "Chat", hi: "चैट" },
  code: { en: "Code", hi: "कोड" },
  image: { en: "Image", hi: "इमेज" },
  slides: { en: "Slides", hi: "स्लाइड" },
  search: { en: "Research", hi: "शोध" },
};

// Dropdown menu component
const ModeDropdown = memo(({
  isOpen,
  onClose,
  onSelectMode,
  onUploadClick,
  language,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ChatMode) => void;
  onUploadClick: () => void;
  language: "en" | "hi";
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 mb-2 w-64 
            rounded-xl border border-border bg-popover shadow-xl
            py-1.5 z-50"
        >
          {MODE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "chat") {
                  onUploadClick();
                } else {
                  onSelectMode(item.id);
                }
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5
                text-sm text-popover-foreground
                hover:bg-accent transition-colors text-left"
            >
              <span className="text-muted-foreground flex-shrink-0">{item.icon}</span>
              <span className="font-medium">{language === "hi" ? item.labelHi : item.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
ModeDropdown.displayName = "ModeDropdown";

export const ChatInput = ({ onSend, disabled, language }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<ChatMode>("chat");
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleModeSelect = (mode: ChatMode) => {
    setActiveMode(mode);
  };

  const placeholder = PLACEHOLDER[activeMode]?.[language] || PLACEHOLDER.chat[language];
  const modeLabel = MODE_LABELS[activeMode]?.[language] || "";
  const showModeBadge = activeMode !== "chat";

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
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
      <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
        {/* Plus button with dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            disabled={disabled}
            className={`p-2 rounded-full border transition-all duration-200
              ${menuOpen
                ? "bg-primary text-primary-foreground border-primary rotate-45"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              }
              disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <PlusIcon />
          </button>
          <ModeDropdown
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onSelectMode={handleModeSelect}
            onUploadClick={() => fileInputRef.current?.click()}
            language={language}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Text input with mode badge */}
        <div className="flex-1 relative flex items-center">
          {showModeBadge && (
            <button
              onClick={() => setActiveMode("chat")}
              className="absolute left-3 flex items-center gap-1 px-2 py-0.5 rounded-md 
                bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide
                hover:bg-primary/20 transition-colors z-10"
            >
              {modeLabel}
              <CloseSmIcon />
            </button>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full py-2.5 rounded-xl 
              bg-muted/40 border border-border/40
              focus:bg-muted/60 focus:border-primary/40 focus:ring-1 focus:ring-primary/10
              outline-none text-sm disabled:opacity-40
              transition-all placeholder:text-muted-foreground/50 font-body
              ${showModeBadge ? "pl-[4.5rem] sm:pl-20 pr-4" : "px-4"}`}
          />
          {inputValue.length > 400 && (
            <span className={`absolute right-3 text-[9px] ${
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
          className="flex-shrink-0 p-2.5 rounded-full 
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
