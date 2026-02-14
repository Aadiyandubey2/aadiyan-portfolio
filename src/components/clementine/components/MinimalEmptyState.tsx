import { memo } from "react";
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
      <div className="mb-4 animate-[fadeSlideUp_0.3s_ease-out]">
        <ClementineSprite status="idle" size="lg" />
      </div>

      {/* Greeting */}
      <div className="text-center mb-6 animate-[fadeSlideUp_0.3s_ease-out_0.1s_both]">
        <h3 className="text-lg font-semibold mb-1">
          {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {language === "hi"
            ? "Aadiyan की AI assistant। कुछ भी पूछो!"
            : "Aadiyan's AI assistant. Ask me anything!"}
        </p>
      </div>

      {/* Suggested Questions as Cards */}
      <div className="w-full max-w-lg animate-[fadeSlideUp_0.3s_ease-out_0.2s_both]">
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
      </div>
    </div>
  );
});

MinimalEmptyState.displayName = "MinimalEmptyState";