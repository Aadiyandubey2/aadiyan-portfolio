import { motion } from "framer-motion";
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
  
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  
  if (!lastAssistantMsg || !lastUserMsg) return [];
  
  const content = (lastAssistantMsg.content + " " + lastUserMsg.content).toLowerCase();
  
  // Detect context and suggest follow-ups
  const suggestions: string[] = [];
  
  // Project related
  if (content.includes("project") || content.includes("build") || content.includes("develop")) {
    suggestions.push(
      language === "hi" 
        ? "इस project में कौन सी technologies use हुई?" 
        : "What technologies were used in this project?"
    );
    suggestions.push(
      language === "hi"
        ? "और projects के बारे में बताओ"
        : "Tell me about more projects"
    );
  }
  
  // Skills related
  if (content.includes("skill") || content.includes("learn") || content.includes("tech")) {
    suggestions.push(
      language === "hi"
        ? "सबसे strong skills कौन सी हैं?"
        : "What are the strongest skills?"
    );
    suggestions.push(
      language === "hi"
        ? "क्या certifications भी हैं?"
        : "Are there any certifications?"
    );
  }
  
  // Education related
  if (content.includes("education") || content.includes("study") || content.includes("college") || content.includes("degree")) {
    suggestions.push(
      language === "hi"
        ? "College में क्या activities की?"
        : "What activities in college?"
    );
    suggestions.push(
      language === "hi"
        ? "Future plans क्या हैं?"
        : "What are the future plans?"
    );
  }
  
  // Contact/work related
  if (content.includes("contact") || content.includes("work") || content.includes("hire") || content.includes("collaborate")) {
    suggestions.push(
      language === "hi"
        ? "Available कब से हैं?"
        : "When are you available?"
    );
    suggestions.push(
      language === "hi"
        ? "कौन से type के projects prefer हैं?"
        : "What type of projects are preferred?"
    );
  }
  
  // Experience related
  if (content.includes("experience") || content.includes("intern") || content.includes("job")) {
    suggestions.push(
      language === "hi"
        ? "किस तरह का experience है?"
        : "What kind of experience?"
    );
    suggestions.push(
      language === "hi"
        ? "Best project कौन सा था?"
        : "What was the best project?"
    );
  }
  
  // General follow-ups if no specific context
  if (suggestions.length === 0) {
    suggestions.push(
      language === "hi"
        ? "और details बताओ"
        : "Tell me more details"
    );
    suggestions.push(
      language === "hi"
        ? "कोई और interesting बात?"
        : "Anything else interesting?"
    );
  }
  
  // Always add these general options
  if (messages.length >= 2) {
    suggestions.push(
      language === "hi"
        ? "Contact कैसे करें?"
        : "How to get in touch?"
    );
  }
  
  // Limit to 3 suggestions
  return suggestions.slice(0, 3);
};

export const DynamicSuggestions = ({ messages, language, onSelect, disabled }: DynamicSuggestionsProps) => {
  const suggestions = getSuggestions(messages, language);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2.5">
      {suggestions.map((q, i) => (
        <motion.button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px]
            bg-gradient-to-r from-muted/60 to-muted/40 backdrop-blur-md
            hover:from-primary/20 hover:to-primary/10 hover:text-primary
            border border-border/30 transition-all disabled:opacity-50
            flex items-center gap-1"
        >
          <span className="text-primary opacity-70">+</span>
          <span className="truncate max-w-[140px] sm:max-w-none">{q}</span>
        </motion.button>
      ))}
    </div>
  );
};
