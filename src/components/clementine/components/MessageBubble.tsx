import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import clementineAvatar from "@/assets/clementine-avatar.png";
import { Message } from "../types";
import { TYPING_SPEED_MS } from "../constants";

/* ===== INLINE SVG ICONS ===== */
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M184 72v144H40V72Z" opacity="0.25" />
    <path d="M184 64H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8Zm-8 144H48V80h128Zm40-176v144a8 8 0 0 1-16 0V40H72a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 24a104 104 0 1 0 104 104A104 104 0 0 0 128 24Z" opacity="0.25" />
    <path d="M176 85a8 8 0 0 1 0 11l-59 59a8 8 0 0 1-11 0l-27-27a8 8 0 0 1 11-11l21 22 54-54a8 8 0 0 1 11 0Z" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M160 32v192L88 160H40a8 8 0 0 1-8-8V104a8 8 0 0 1 8-8h48Z" opacity="0.25" />
    <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49Zm40-120a8 8 0 0 1 14-6 72 72 0 0 1 0 82 8 8 0 0 1-14-6 56 56 0 0 0 0-70Z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224 128a96 96 0 1 1-96-96 96 96 0 0 1 96 96Z" opacity="0.25" />
    <path d="M128 24a104 104 0 0 0 0 208 8 8 0 0 0 0-16 88 88 0 1 1 88-88 8 8 0 0 0 16 0A104 104 0 0 0 128 24Zm77 99-32-32a8 8 0 0 0-11 11l18 18h-52a8 8 0 0 0 0 16h52l-18 18a8 8 0 0 0 11 11l32-32a8 8 0 0 0 0-11Z" />
  </svg>
);

interface MessageBubbleProps {
  message: Message;
  showTimestamp: boolean;
  onSpeak?: (text: string, onWordBoundary?: (charIndex: number) => void) => void;
  onRegenerate?: () => void;
  isLatestAssistant?: boolean;
  voiceEnabled?: boolean;
  currentSpeakingIndex?: number;
}

const TypingDots = () => (
  <div className="flex gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 bg-primary rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
  </div>
);

export const MessageBubble = ({
  message,
  showTimestamp,
  onSpeak,
  onRegenerate,
  isLatestAssistant,
  voiceEnabled,
  currentSpeakingIndex = -1,
}: MessageBubbleProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasAnimated = useRef(false);
  const prevContentLength = useRef(0);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const hasContent = message.content && message.content.length > 0;

  // Typing animation for assistant messages
  useEffect(() => {
    if (!isAssistant || !hasContent) {
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    // If still streaming, show content directly
    if (message.isTyping !== false) {
      setDisplayedContent(message.content);
      prevContentLength.current = message.content.length;
      return;
    }

    // If already animated this message, just show full content
    if (hasAnimated.current) {
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    // Message finished streaming, start typing animation
    hasAnimated.current = true;
    let index = prevContentLength.current;
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      if (index < message.content.length) {
        // Type 2-3 characters at a time for smoother effect
        const charsToAdd = Math.min(3, message.content.length - index);
        setDisplayedContent(message.content.slice(0, index + charsToAdd));
        index += charsToAdd;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [message.content, message.isTyping, isAssistant, hasContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(message.content);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Render content with word highlighting for voice sync
  const renderedContent = useMemo(() => {
    if (!isAssistant) return message.content;
    
    const contentToShow = displayedContent;
    
    // Enhanced voice sync - highlight current word being spoken
    if (currentSpeakingIndex >= 0 && currentSpeakingIndex < contentToShow.length) {
      // Find word start (go back to start of word)
      let wordStart = currentSpeakingIndex;
      while (wordStart > 0 && !/\s/.test(contentToShow[wordStart - 1])) {
        wordStart--;
      }
      
      // Find word end
      let wordEnd = currentSpeakingIndex;
      while (wordEnd < contentToShow.length && !/\s/.test(contentToShow[wordEnd])) {
        wordEnd++;
      }
      
      const before = contentToShow.slice(0, wordStart);
      const word = contentToShow.slice(wordStart, wordEnd);
      const after = contentToShow.slice(wordEnd);
      
      return (
        <>
          <span className="opacity-80">{before}</span>
          <motion.span 
            className="bg-primary/25 text-primary rounded px-0.5 font-medium"
            initial={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
            animate={{ backgroundColor: "hsl(var(--primary) / 0.25)" }}
            transition={{ duration: 0.15 }}
          >
            {word}
          </motion.span>
          <span className="opacity-60">{after}</span>
        </>
      );
    }
    
    return contentToShow;
  }, [displayedContent, currentSpeakingIndex, isAssistant]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2 group`}
    >
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-primary/30 mt-0.5">
          <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
        {/* Message bubble */}
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-[11px] sm:text-sm ${
            isUser
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-sm shadow-sm"
              : "bg-muted/70 rounded-bl-sm border border-border/20"
          }`}
        >
          {!hasContent ? (
            <TypingDots />
          ) : (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {renderedContent}
              {isAssistant && !isTypingComplete && (
                <motion.span
                  className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>

        {/* Message actions & timestamp */}
        <div
          className={`flex items-center gap-1.5 mt-0.5 ${
            isUser ? "flex-row-reverse" : "flex-row"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-[9px] text-muted-foreground">{formatTime(message.timestamp)}</span>
          )}

          {/* Actions for assistant messages */}
          {isAssistant && hasContent && isTypingComplete && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Copy"
              >
                {copied ? (
                  <span className="text-green-500"><CheckIcon /></span>
                ) : (
                  <span className="text-muted-foreground hover:text-foreground"><CopyIcon /></span>
                )}
              </button>

              {voiceEnabled && onSpeak && (
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Read aloud"
                >
                  <VolumeIcon />
                </button>
              )}

              {isLatestAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Regenerate"
                >
                  <RefreshIcon />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
