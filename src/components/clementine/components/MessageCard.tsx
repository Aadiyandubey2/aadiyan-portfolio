import { useState, useEffect, useRef, useMemo, memo } from "react";
import { toast } from "sonner";
import { Message } from "../types";
import { TYPING_SPEED_MS } from "../constants";
import { ClementineSprite } from "./ClementineSprite";
import { Card } from "@/components/ui/card";

/* ===== INLINE SVG ICONS ===== */
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M184 64H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8Zm-8 144H48V80h128Zm40-176v144a8 8 0 0 1-16 0V40H72a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M176 85a8 8 0 0 1 0 11l-59 59a8 8 0 0 1-11 0l-27-27a8 8 0 0 1 11-11l21 22 54-54a8 8 0 0 1 11 0Z" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49Zm40-120a8 8 0 0 1 14-6 72 72 0 0 1 0 82 8 8 0 0 1-14-6 56 56 0 0 0 0-70Z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 24a104 104 0 0 0 0 208 8 8 0 0 0 0-16 88 88 0 1 1 88-88 8 8 0 0 0 16 0A104 104 0 0 0 128 24Zm77 99-32-32a8 8 0 0 0-11 11l18 18h-52a8 8 0 0 0 0 16h52l-18 18a8 8 0 0 0 11 11l32-32a8 8 0 0 0 0-11Z" />
  </svg>
);

interface MessageCardProps {
  message: Message;
  showTimestamp: boolean;
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  isLatestAssistant?: boolean;
  voiceEnabled?: boolean;
  currentSpeakingIndex?: number;
  status?: "idle" | "speaking" | "thinking" | "listening";
}

const TypingDots = () => (
  <div className="flex gap-1.5 py-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.12}s`, animationDuration: '0.5s' }}
      />
    ))}
  </div>
);

export const MessageCard = memo(({
  message,
  showTimestamp,
  onSpeak,
  onRegenerate,
  isLatestAssistant,
  voiceEnabled,
  currentSpeakingIndex = -1,
  status = "idle",
}: MessageCardProps) => {
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

    if (message.isTyping !== false) {
      setDisplayedContent(message.content);
      prevContentLength.current = message.content.length;
      return;
    }

    if (hasAnimated.current) {
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    hasAnimated.current = true;
    let index = prevContentLength.current;
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      if (index < message.content.length) {
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
    
    if (currentSpeakingIndex >= 0 && currentSpeakingIndex < contentToShow.length) {
      let wordStart = currentSpeakingIndex;
      while (wordStart > 0 && !/[\s,.!?;:]/.test(contentToShow[wordStart - 1])) {
        wordStart--;
      }
      
      let wordEnd = currentSpeakingIndex;
      while (wordEnd < contentToShow.length && !/[\s,.!?;:]/.test(contentToShow[wordEnd])) {
        wordEnd++;
      }
      
      if (wordStart >= wordEnd) {
        wordStart = currentSpeakingIndex;
        wordEnd = Math.min(currentSpeakingIndex + 1, contentToShow.length);
      }
      
      const before = contentToShow.slice(0, wordStart);
      const word = contentToShow.slice(wordStart, wordEnd);
      const after = contentToShow.slice(wordEnd);
      
      return (
        <>
          <span className="opacity-60">{before}</span>
          <span className="bg-primary/20 text-foreground rounded px-0.5 font-medium">
            {word}
          </span>
          <span className="opacity-40">{after}</span>
        </>
      );
    }
    
    return contentToShow;
  }, [displayedContent, currentSpeakingIndex, isAssistant]);

  // User message - minimal bubble style
  if (isUser) {
    return (
      <div
        className="flex justify-end group"
        style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
      >
        <div className="flex flex-col items-end max-w-[80%] sm:max-w-[70%]">
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm">
            {message.content}
          </div>
          {showTimestamp && (
            <span className="text-[10px] text-muted-foreground/60 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Assistant message - card style
  return (
    <div
      className="flex justify-start gap-2.5 group"
      style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
    >
      {/* Avatar with sprite */}
      <ClementineSprite 
        status={!hasContent ? "thinking" : status} 
        size="sm" 
        showStatusIndicator={false}
      />

      {/* Message card */}
      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
        <Card className="px-4 py-3 rounded-2xl rounded-tl-md border-border/40 bg-card/80 shadow-sm">
          {!hasContent ? (
            <TypingDots />
          ) : (
            <div className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap break-words">
              {renderedContent}
              {!isTypingComplete && (
                <span
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-pulse"
                />
              )}
            </div>
          )}
        </Card>

        {/* Actions bar */}
        <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showTimestamp && (
            <span className="text-[10px] text-muted-foreground/60 mr-1">
              {formatTime(message.timestamp)}
            </span>
          )}

          {hasContent && isTypingComplete && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Copy"
              >
                {copied ? (
                  <span className="text-green-500"><CheckIcon /></span>
                ) : (
                  <CopyIcon />
                )}
              </button>

              {voiceEnabled && onSpeak && (
                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Read aloud"
                >
                  <VolumeIcon />
                </button>
              )}

              {isLatestAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Regenerate"
                >
                  <RefreshIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

MessageCard.displayName = "MessageCard";
