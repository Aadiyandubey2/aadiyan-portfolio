import { motion } from "framer-motion";
import { Message } from "../types";
import { ArrowRight } from "lucide-react";

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

  // Project related
  if (content.includes("project") || content.includes("build") || content.includes("develop")) {
    suggestions.push(
      language === "hi"
        ? "इस project में कौन सी technologies use हुई?"
        : "What technologies were used in this project?",
    );
    suggestions.push(language === "hi" ? "और projects के बारे में बताओ" : "Tell me about more projects");
  }

  // Skills related
  if (content.includes("skill") || content.includes("learn") || content.includes("tech")) {
    suggestions.push(language === "hi" ? "सबसे strong skills कौन सी हैं?" : "What are the strongest skills?");
    suggestions.push(language === "hi" ? "क्या certifications भी हैं?" : "Are there any certifications?");
  }

  // Education related
  if (
    content.includes("education") ||
    content.includes("study") ||
    content.includes("college") ||
    content.includes("degree")
  ) {
    suggestions.push(language === "hi" ? "College में क्या activities की?" : "What activities in college?");
    suggestions.push(language === "hi" ? "Future plans क्या हैं?" : "What are the future plans?");
  }

  // Contact/work related
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

  // Experience related
  if (content.includes("experience") || content.includes("intern") || content.includes("job")) {
    suggestions.push(language === "hi" ? "किस तरह का experience है?" : "What kind of experience?");
    suggestions.push(language === "hi" ? "Best project कौन सा था?" : "What was the best project?");
  }

  // General follow-ups if no specific context
  if (suggestions.length === 0) {
    suggestions.push(language === "hi" ? "और details बताओ" : "Tell me more details");
    suggestions.push(language === "hi" ? "कोई और interesting बात?" : "Anything else interesting?");
  }

  // Always add contact option
  if (messages.length >= 2) {
    suggestions.push(language === "hi" ? "Contact कैसे करें?" : "How to get in touch?");
  }

  return suggestions.slice(0, 3);
};

export const DynamicSuggestions = ({ messages, language, onSelect, disabled }: DynamicSuggestionsProps) => {
  const suggestions = getSuggestions(messages, language);

  if (suggestions.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2 pb-1">
      <p className="text-[9px] text-muted-foreground/50 mb-2 flex items-center gap-1">
        {language === "hi" ? "अगला सवाल" : "Continue with"}
      </p>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((q, i) => (
          <motion.button
            key={q}
            onClick={() => onSelect(q)}
            disabled={disabled}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg
              bg-card/80 border border-border/50
              hover:bg-card hover:border-primary/30 hover:shadow-sm
              transition-all duration-200
              disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="text-[10px] sm:text-xs text-foreground/80 group-hover:text-foreground transition-colors">
              {q}
            </span>
            <ArrowRight className="w-3 h-3 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
