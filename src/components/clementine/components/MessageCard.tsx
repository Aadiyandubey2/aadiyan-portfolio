import { useState, useEffect, useRef, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { TYPING_SPEED_MS } from "../constants";
import { ClementineSprite } from "./ClementineSprite";
import { ThinkingBlock } from "./ThinkingBlock";


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

const ArtifactIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M200 32h-28.7A47.8 47.8 0 0 0 128 8a47.8 47.8 0 0 0-43.3 24H56a16 16 0 0 0-16 16v168a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-72-8a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32Zm72 192H56V48h22a47.4 47.4 0 0 0-2 8v8a8 8 0 0 0 8 8h88a8 8 0 0 0 8-8v-8a47.4 47.4 0 0 0-2-8h22Z" />
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
  onOpenArtifact?: (artifactId: string) => void;
}

const TypingDots = () => (
  <div className="flex gap-1.5 py-2">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-muted-foreground/50 rounded-full"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
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
  onOpenArtifact,
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

  // User message
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end group"
      >
        <div className="flex flex-col items-end max-w-[80%] sm:max-w-[70%]">
          {/* Attached images */}
          {message.images && message.images.length > 0 && (
            <div className="flex gap-1.5 mb-1.5">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt || "Uploaded image"}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-primary/20"
                />
              ))}
            </div>
          )}
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm font-body">
            {message.content}
          </div>
          {showTimestamp && (
            <span className="text-[10px] text-muted-foreground/60 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start gap-2.5 group"
    >
      <ClementineSprite
        status={!hasContent ? "thinking" : status}
        size="sm"
        showStatusIndicator={false}
      />

      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
        {/* Thinking block */}
        {message.thinking && (
          <ThinkingBlock
            thinking={message.thinking}
            isComplete={message.isThinkingComplete !== false}
          />
        )}

        <div className="px-4 py-3 rounded-2xl rounded-tl-md">
          {!hasContent && !message.thinking ? (
            <TypingDots />
          ) : (
            <>
              {/* Generated images */}
              {message.images && message.images.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.images.map((img, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={img.url}
                        alt={img.alt || "AI generated image"}
                        className="w-full max-h-72 object-contain bg-black/5"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Message content with markdown — strip code blocks if artifacts exist */}
              {(() => {
                const hasArtifacts = message.artifacts && message.artifacts.length > 0;
                // Remove code blocks from displayed content when they're in the canvas
                const contentToRender = hasArtifacts
                  ? displayedContent.replace(/```[\s\S]*?```/g, "").trim()
                  : displayedContent;

                return (
                  <div className="text-sm leading-relaxed text-card-foreground font-body prose prose-sm dark:prose-invert max-w-none
                    prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                    prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                    prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:max-w-full
                    prose-strong:text-foreground prose-a:text-primary
                    [&_pre]:max-w-[calc(100vw-8rem)] sm:[&_pre]:max-w-full">
                    {isTypingComplete ? (
                      <ReactMarkdown>{contentToRender}</ReactMarkdown>
                    ) : (
                      <span className="whitespace-pre-wrap break-words">
                        {contentToRender}
                        <motion.span
                          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Artifact buttons - GPT-style canvas open */}
              {message.artifacts && message.artifacts.length > 0 && isTypingComplete && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.artifacts.map((artifact) => (
                    <button
                      key={artifact.id}
                      onClick={() => onOpenArtifact?.(artifact.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl 
                        bg-muted/60 border border-border/50 
                        hover:bg-muted hover:border-primary/30 hover:shadow-sm
                        transition-all text-xs font-medium group"
                    >
                      <span className="text-primary group-hover:scale-105 transition-transform">
                        {artifact.type === "document" ? (
                          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
                            <path d="M208 40H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 128H48V56h160Z" />
                          </svg>
                        ) : artifact.type === "image" ? (
                          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
                            <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56Z" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
                            <path d="M69.1 94.1 28.5 128l40.6 33.9a8 8 0 0 1-10.2 12.2l-48-40a8 8 0 0 1 0-12.2l48-40a8 8 0 1 1 10.2 12.2Zm176 21.8-48-40a8 8 0 0 0-10.2 12.2L227.5 128l-40.6 33.9a8 8 0 0 0 10.2 12.2l48-40a8 8 0 0 0 0-12.2Z" />
                          </svg>
                        )}
                      </span>
                      <span className="text-foreground/80">{artifact.title}</span>
                      <span className="text-muted-foreground/50 text-[10px]">Open in Canvas</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

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
    </motion.div>
  );
});

MessageCard.displayName = "MessageCard";
