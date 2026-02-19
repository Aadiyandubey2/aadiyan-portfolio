import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  language: "en" | "hi";
}

/* ===== INLINE SVG ICONS ===== */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224 128 32 48l48 80-48 80Z" opacity="0.25" />
    <path d="M229 121 37 41a8 8 0 0 0-10 10l44 77-44 77a8 8 0 0 0 10 10l192-80a8 8 0 0 0 0-14ZM57 189l30-53h59l-59-53-30-53 150 63Z" />
  </svg>
);

export const ChatInput = ({ onSend, disabled, language }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-2.5 sm:p-4 border-t border-border/50 bg-muted/20">
      {/* Input area */}
      <div className="flex gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyPress}
            placeholder={language === "hi" ? "अपना संदेश लिखें..." : "Type your message..."}
            disabled={disabled}
            className="w-full px-3 sm:px-4 py-2.5 rounded-xl 
              bg-background/80 border border-border/50 
              focus:border-primary focus:ring-1 focus:ring-primary/20
              outline-none text-xs sm:text-sm disabled:opacity-50
              transition-all placeholder:text-muted-foreground/60 font-body"
          />

          {inputValue.length > 0 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] ${
              inputValue.length > 450 ? "text-orange-400" : "text-muted-foreground/60"
            }`}>
              {inputValue.length}/500
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled}
          className="px-3 sm:px-5 py-2.5 rounded-xl 
            bg-primary text-primary-foreground font-medium
            hover:shadow-lg hover:shadow-primary/20
            hover:scale-[1.03] active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all flex items-center gap-1.5"
        >
          <SendIcon />
          <span className="hidden sm:inline text-sm">Send</span>
        </button>
      </div>
    </div>
  );
};