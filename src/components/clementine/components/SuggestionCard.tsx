import { memo } from "react";

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
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full text-left rounded-xl overflow-hidden
        border border-border/40 
        bg-card/70 backdrop-blur-sm
        hover:bg-card/90 hover:border-primary/40
        transition-colors duration-200
        disabled:opacity-40 disabled:pointer-events-none
        ${isPrimary ? "p-2.5 sm:p-3" : "p-2 sm:p-2.5"}
      `}
    >
      {/* Content */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* 3D Icon - Static */}
        <div 
          className={`
            relative flex-shrink-0 rounded-lg overflow-hidden
            ${isPrimary ? "w-8 h-8 sm:w-10 sm:h-10" : "w-7 h-7 sm:w-8 sm:h-8"}
          `}
        >
          <img 
            src={icon} 
            alt="" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {/* Text - improved visibility */}
        <p className={`
          flex-1 text-foreground/90
          ${isPrimary ? "text-xs sm:text-sm leading-snug" : "text-[11px] sm:text-xs leading-snug"}
        `}>
          {question}
        </p>
      </div>
    </button>
  );
});

SuggestionCard.displayName = "SuggestionCard";
