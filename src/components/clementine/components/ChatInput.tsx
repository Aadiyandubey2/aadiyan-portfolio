import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  language: "en" | "hi";
  suggestedQuestions: string[];
  showSuggestions: boolean;
}

export const ChatInput = ({
  onSend,
  disabled,
  language,
  suggestedQuestions,
  showSuggestions,
}: ChatInputProps) => {
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
    <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20">
      {/* Suggestions */}
      {showSuggestions && (
        <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {suggestedQuestions.slice(0, 4).map((q) => (
            <motion.button
              key={q}
              onClick={() => onSend(q)}
              disabled={disabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs 
                bg-muted/50 hover:bg-primary/20 hover:text-primary 
                border border-border/30 transition-all disabled:opacity-50
                flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {q}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={language === "hi" ? "अपना संदेश लिखें..." : "Type your message..."}
            disabled={disabled}
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl 
              bg-background/80 border border-border/50 
              focus:border-primary focus:ring-1 focus:ring-primary/20
              outline-none text-xs sm:text-sm disabled:opacity-50
              transition-all"
          />
          {inputValue.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              {inputValue.length}/500
            </span>
          )}
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
            bg-primary text-primary-foreground font-medium
            hover:shadow-lg hover:shadow-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </div>
    </div>
  );
};
