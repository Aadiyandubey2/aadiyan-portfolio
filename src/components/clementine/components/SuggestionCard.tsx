import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  GraduationCap, 
  Mail, 
  Code2, 
  Lightbulb,
  MessageCircle 
} from "lucide-react";

interface SuggestionCardProps {
  question: string;
  onClick: () => void;
  disabled: boolean;
  index: number;
  variant?: "primary" | "secondary";
}

// Map questions to appropriate icons
const getIcon = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes("skill") || q.includes("technologies")) return Code2;
  if (q.includes("education") || q.includes("college")) return GraduationCap;
  if (q.includes("contact") || q.includes("touch")) return Mail;
  if (q.includes("project") || q.includes("vishwaguru") || q.includes("build")) return Lightbulb;
  return MessageCircle;
};

export const SuggestionCard = memo(({ 
  question, 
  onClick, 
  disabled, 
  index,
  variant = "primary"
}: SuggestionCardProps) => {
  const Icon = getIcon(question);
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative w-full text-left p-3 sm:p-4 rounded-xl
        border border-border/50 
        bg-card/60 backdrop-blur-sm
        hover:bg-card hover:border-primary/30 hover:shadow-md
        transition-all duration-200
        disabled:opacity-40 disabled:pointer-events-none
        ${variant === "secondary" ? "p-2 sm:p-3" : ""}
      `}
    >
      {/* Icon */}
      <div className={`
        inline-flex items-center justify-center rounded-lg mb-2
        ${variant === "primary" ? "w-8 h-8 sm:w-9 sm:h-9" : "w-6 h-6 sm:w-7 sm:h-7"}
        bg-primary/10 text-primary
        group-hover:bg-primary/20 transition-colors
      `}>
        <Icon className={variant === "primary" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"} />
      </div>
      
      {/* Text */}
      <p className={`
        text-foreground/90 group-hover:text-foreground transition-colors
        ${variant === "primary" ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"}
        line-clamp-2
      `}>
        {question}
      </p>
      
      {/* Hover indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3 h-3 text-primary/60" />
      </div>
    </motion.button>
  );
});

SuggestionCard.displayName = "SuggestionCard";
