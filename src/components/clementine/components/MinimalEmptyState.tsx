import { memo } from "react";
import { motion } from "framer-motion";
import { ClementineSprite } from "./ClementineSprite";

interface MinimalEmptyStateProps {
  language: "en" | "hi";
  suggestedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  disabled: boolean;
}

export const MinimalEmptyState = memo(({ 
  language, 
  suggestedQuestions, 
  onSelectQuestion, 
  disabled 
}: MinimalEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      {/* Avatar */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <ClementineSprite status="idle" size="lg" />
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h3 className="text-lg font-semibold mb-1">
          {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {language === "hi"
            ? "Aadiyan की AI assistant। कुछ भी पूछो!"
            : "Aadiyan's AI assistant. Ask me anything!"}
        </p>
      </motion.div>

      {/* Suggested Questions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        <p className="text-[10px] text-muted-foreground/70 text-center mb-3">
          {language === "hi" ? "सुझाव" : "Suggestions"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedQuestions.slice(0, 4).map((q, i) => (
            <motion.button
              key={q}
              onClick={() => onSelectQuestion(q)}
              disabled={disabled}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="px-3 py-2.5 rounded-xl text-xs text-left
                bg-muted/50 border border-border/30
                hover:border-border hover:bg-muted/80
                transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

MinimalEmptyState.displayName = "MinimalEmptyState";
