import { memo } from "react";
import { motion } from "framer-motion";

// Import 3D icons
import iconCode from "@/assets/icons/icon-code-3d.png";
import iconEducation from "@/assets/icons/icon-education-3d.png";
import iconContact from "@/assets/icons/icon-contact-3d.png";
import iconProject from "@/assets/icons/icon-project-3d.png";
import iconChat from "@/assets/icons/icon-chat-3d.png";

interface SuggestionCardProps {
  question: string;
  onClick: () => void;
  disabled: boolean;
  index: number;
  variant?: "primary" | "secondary";
}

// Map questions to appropriate 3D icons
const getIcon = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("skill") || q.includes("technologies") || q.includes("tech")) return iconCode;
  if (q.includes("education") || q.includes("college") || q.includes("study")) return iconEducation;
  if (q.includes("contact") || q.includes("touch") || q.includes("reach")) return iconContact;
  if (q.includes("project") || q.includes("vishwaguru") || q.includes("build")) return iconProject;
  return iconChat;
};

export const SuggestionCard = memo(({ 
  question, 
  onClick, 
  disabled, 
  index,
  variant = "primary"
}: SuggestionCardProps) => {
  const icon = getIcon(question);
  const isPrimary = variant === "primary";
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.08, 
        duration: 0.3,
        type: "spring",
        stiffness: 200
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -3,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.97 }}
      className={`
        group relative w-full text-left rounded-xl overflow-hidden
        border border-border/40 
        bg-card/70 backdrop-blur-sm
        hover:bg-card/90 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
        transition-all duration-300
        disabled:opacity-40 disabled:pointer-events-none
        ${isPrimary ? "p-3 sm:p-4" : "p-2.5 sm:p-3"}
      `}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative flex items-start gap-3">
        {/* 3D Icon with floating animation */}
        <motion.div 
          className={`
            relative flex-shrink-0 rounded-lg overflow-hidden
            ${isPrimary ? "w-10 h-10 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-9 sm:h-9"}
          `}
          animate={{ 
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        >
          <img 
            src={icon} 
            alt="" 
            className="w-full h-full object-cover rounded-lg"
          />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
        
        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`
            text-foreground/85 group-hover:text-foreground transition-colors duration-200
            ${isPrimary ? "text-xs sm:text-sm leading-relaxed" : "text-[10px] sm:text-xs leading-snug"}
            line-clamp-2
          `}>
            {question}
          </p>
        </div>
      </div>
      
      {/* Arrow indicator on hover */}
      <motion.div 
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity"
        initial={{ x: -4 }}
        whileHover={{ x: 0 }}
      >
        <svg 
          className={`text-primary ${isPrimary ? "w-4 h-4" : "w-3 h-3"}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.button>
  );
});

SuggestionCard.displayName = "SuggestionCard";
