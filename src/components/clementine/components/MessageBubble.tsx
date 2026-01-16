import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Volume2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import clementineAvatar from "@/assets/clementine-avatar.png";
import { Message } from "../types";
import { TYPING_SPEED_MS } from "../constants";

interface MessageBubbleProps {
  message: Message;
  showTimestamp: boolean;
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  isLatestAssistant?: boolean;
  voiceEnabled?: boolean;
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
}: MessageBubbleProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasAnimated = useRef(false);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const hasContent = message.content && message.content.length > 0;

  // Typing animation for assistant messages
  useEffect(() => {
    if (!isAssistant || !hasContent || hasAnimated.current) {
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    if (message.isTyping === false) {
      // Message finished streaming, start typing animation
      hasAnimated.current = true;
      let index = 0;
      setDisplayedContent("");
      setIsTypingComplete(false);

      const interval = setInterval(() => {
        if (index < message.content.length) {
          setDisplayedContent(message.content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTypingComplete(true);
        }
      }, TYPING_SPEED_MS);

      return () => clearInterval(interval);
    } else {
      // Still streaming, show content as-is
      setDisplayedContent(message.content);
    }
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

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

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
            <div className="whitespace-pre-wrap break-words">
              {isAssistant ? displayedContent : message.content}
              {isAssistant && !isTypingComplete && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
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
                  onClick={() => onSpeak(message.content)}
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
