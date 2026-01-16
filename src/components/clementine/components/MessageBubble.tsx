import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Volume2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import clementineAvatar from "@/assets/clementine-avatar.png";
import { Message } from "../types";
import { TYPING_SPEED_MS } from "../constants";

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
        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
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

  // Render content with optional word highlighting for voice sync
  const renderedContent = useMemo(() => {
    if (!isAssistant) return message.content;
    
    const contentToShow = displayedContent;
    
    // If we have a speaking index and voice is active, highlight the current word
    if (currentSpeakingIndex >= 0 && currentSpeakingIndex < contentToShow.length) {
      const before = contentToShow.slice(0, currentSpeakingIndex);
      
      // Find word boundaries
      let wordEnd = currentSpeakingIndex;
      while (wordEnd < contentToShow.length && !/\s/.test(contentToShow[wordEnd])) {
        wordEnd++;
      }
      
      const word = contentToShow.slice(currentSpeakingIndex, wordEnd);
      const after = contentToShow.slice(wordEnd);
      
      return (
        <>
          {before}
          <span className="bg-primary/30 rounded px-0.5">{word}</span>
          {after}
        </>
      );
    }
    
    return contentToShow;
  }, [displayedContent, currentSpeakingIndex, isAssistant, message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2 group`}
    >
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 border border-primary/30 mt-1">
          <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%] sm:max-w-[75%]`}>
        {/* Message bubble */}
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm ${
            isUser
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-sm"
              : "bg-muted/80 rounded-bl-sm border border-border/30"
          }`}
        >
          {!hasContent ? (
            <TypingDots />
          ) : (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {renderedContent}
              {isAssistant && !isTypingComplete && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>

        {/* Message actions & timestamp */}
        <div
          className={`flex items-center gap-2 mt-1 ${
            isUser ? "flex-row-reverse" : "flex-row"
          } opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <span className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</span>
          )}

          {/* Actions for assistant messages */}
          {isAssistant && hasContent && isTypingComplete && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>

              {voiceEnabled && onSpeak && (
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                </button>
              )}

              {isLatestAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
