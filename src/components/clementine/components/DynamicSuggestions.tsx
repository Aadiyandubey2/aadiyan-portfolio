interface DynamicSuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (question: string) => void;
  disabled: boolean;
  language: "en" | "hi";
}

export const DynamicSuggestions = ({ suggestions, isLoading, onSelect, disabled, language }: DynamicSuggestionsProps) => {
  if (isLoading) {
    return (
      <div className="pt-2 pb-1">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-8 w-32 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="pt-2 pb-1 animate-[fadeSlideUp_0.2s_ease-out]">
      <p className="text-[9px] text-muted-foreground/50 mb-2">
        {language === "hi" ? "अगला सवाल" : "Continue with"}
      </p>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            disabled={disabled}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg
              bg-card/80 border border-border/50
              hover:bg-card hover:border-primary/30 hover:shadow-sm
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
              disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="text-[10px] sm:text-xs text-foreground/80 group-hover:text-foreground transition-colors">
              {q}
            </span>
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor" className="text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0">
              <path d="M224 128l-96-96v64H32v64h96v64z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};
