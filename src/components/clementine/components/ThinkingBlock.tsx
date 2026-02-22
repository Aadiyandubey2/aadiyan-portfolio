import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingBlockProps {
  thinking: string;
  isComplete: boolean;
}

const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M248 124a56.1 56.1 0 0 0-32-50.6V72a48 48 0 0 0-88-26.5A48 48 0 0 0 40 72v1.4a56 56 0 0 0 0 101.2V176a48 48 0 0 0 88 26.5A48 48 0 0 0 216 176v-1.4A56.1 56.1 0 0 0 248 124ZM88 216a32 32 0 0 1-32-32v-4.3a55.6 55.6 0 0 0 8 .3h8a8 8 0 0 0 0-16h-8a40 40 0 0 1 0-80h8a8 8 0 0 0 0-16h-8a55.6 55.6 0 0 0-8 .3V64a32 32 0 0 1 64 0v60H96a8 8 0 0 0 0 16h24v60a32 32 0 0 1-32 40Zm104-32a32 32 0 0 1-64 0v-60h24a8 8 0 0 0 0-16h-24V48a32 32 0 0 1 64 0v4.3a55.6 55.6 0 0 0-8-.3h-8a8 8 0 0 0 0 16h8a40 40 0 0 1 0 80h-8a8 8 0 0 0 0 16h8a55.6 55.6 0 0 0 8-.3Z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 256 256" fill="currentColor"
    className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
  >
    <path d="M184 128l-80 56V72z" />
  </svg>
);

export const ThinkingBlock = memo(({ thinking, isComplete }: ThinkingBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
          bg-amber-500/10 border border-amber-500/20 
          hover:bg-amber-500/15 transition-colors text-amber-600 dark:text-amber-400"
      >
        {!isComplete ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BrainIcon />
          </motion.div>
        ) : (
          <BrainIcon />
        )}
        <span className="text-[11px] font-medium">
          {isComplete ? "Thought process" : "Thinking..."}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/30 
              text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {thinking}
              {!isComplete && (
                <motion.span
                  className="inline-block w-1 h-3 bg-amber-500/60 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ThinkingBlock.displayName = "ThinkingBlock";
