import { Message } from "../types";

interface DynamicSuggestionsProps {
  messages: Message[];
  language: "en" | "hi";
  onSelect: (question: string) => void;
  disabled: boolean;
}

// Context-based follow-up suggestions
const getSuggestions = (messages: Message[], language: "en" | "hi"): string[] => {
  if (messages.length === 0) return [];

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");

  if (!lastAssistantMsg || !lastUserMsg) return [];

  const content = (lastAssistantMsg.content + " " + lastUserMsg.content).toLowerCase();

  const suggestions: string[] = [];

  if (content.includes("project") || content.includes("build") || content.includes("develop")) {
    suggestions.push(
      language === "hi"
        ? "इस project में कौन सी technologies use हुई?"
        : "What technologies were used in this project?",
    );
    suggestions.push(language === "hi" ? "और projects के बारे में बताओ" : "Tell me about more projects");
  }

  if (content.includes("skill") || content.includes("learn") || content.includes("tech")) {
    suggestions.push(language === "hi" ? "सबसे strong skills कौन सी हैं?" : "What are the strongest skills?");
    suggestions.push(language === "hi" ? "क्या certifications भी हैं?" : "Are there any certifications?");
  }

  if (
    content.includes("education") ||
    content.includes("study") ||
    content.includes("college") ||
    content.includes("degree")
  ) {
    suggestions.push(language === "hi" ? "College में क्या activities की?" : "What activities in college?");
    suggestions.push(language === "hi" ? "Future plans क्या हैं?" : "What are the future plans?");
  }

  if (
    content.includes("contact") ||
    content.includes("work") ||
    content.includes("hire") ||
    content.includes("collaborate")
  ) {
    suggestions.push(language === "hi" ? "Available कब से हैं?" : "When are you available?");
    suggestions.push(
      language === "hi" ? "कौन से type के projects prefer हैं?" : "What type of projects are preferred?",
    );
  }

  if (content.includes("experience") || content.includes("intern") || content.includes("job")) {
    suggestions.push(language === "hi" ? "किस तरह का experience है?" : "What kind of experience?");
    suggestions.push(language === "hi" ? "Best project कौन सा था?" : "What was the best project?");
  }

  if (suggestions.length === 0) {
    suggestions.push(language === "hi" ? "और details बताओ" : "Tell me more details");
    suggestions.push(language === "hi" ? "कोई और interesting बात?" : "Anything else interesting?");
  }

  if (messages.length >= 2) {
    suggestions.push(language === "hi" ? "Contact कैसे करें?" : "How to get in touch?");
  }

  return suggestions.slice(0, 3);
};

export const DynamicSuggestions = ({ messages, language, onSelect, disabled }: DynamicSuggestionsProps) => {
  const suggestions = getSuggestions(messages, language);

  if (suggestions.length === 0) return null;

  return (
    <div className="pt-2 pb-1 animate-[fadeSlideUp_0.2s_ease-out]">
      <p className="text-[9px] text-muted-foreground/50 mb-2 flex items-center gap-1">
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
            <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor" className="text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
              <path d="M224 128l-96-96v64H32v64h96v64z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};