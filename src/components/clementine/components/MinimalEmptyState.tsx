import { memo } from "react";
import { motion } from "framer-motion";
import { ClementineSprite } from "./ClementineSprite";
import { SuggestionCard } from "./SuggestionCard";

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
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-4">
      {/* Avatar */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
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

      {/* Suggested Questions as Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg"
      >
        <p className="text-[10px] text-muted-foreground/60 text-center mb-3 uppercase tracking-wider">
          {language === "hi" ? "सुझाव" : "Suggestions"}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {suggestedQuestions.slice(0, 4).map((q, i) => (
            <SuggestionCard
              key={q}
              question={q}
              onClick={() => onSelectQuestion(q)}
              disabled={disabled}
              index={i}
              variant="primary"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
});

MinimalEmptyState.displayName = "MinimalEmptyState";
