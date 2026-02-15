import { memo, useMemo } from "react";
import { ChatStatus } from "../types";

// Import all sprite variations
import clementineIdle from "@/assets/clementine-idle.png";
import clementineThinking from "@/assets/clementine-thinking.png";
import clementineSpeaking from "@/assets/clementine-speaking.png";
import clementineHappy from "@/assets/clementine-happy.png";

interface ClementineSpriteProps {
  status: ChatStatus;
  size?: "sm" | "md" | "lg";
  showStatusIndicator?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10 sm:w-12 sm:h-12",
  lg: "w-14 h-14 sm:w-16 sm:h-16",
};

export const ClementineSprite = memo(({ 
  status, 
  size = "md",
  showStatusIndicator = true 
}: ClementineSpriteProps) => {
  const currentSprite = useMemo(() => {
    switch (status) {
      case "thinking": return clementineThinking;
      case "speaking": return clementineSpeaking;
      case "listening": return clementineHappy;
      default: return clementineIdle;
    }
  }, [status]);

  const statusColors = {
    idle: "bg-green-500",
    listening: "bg-blue-500",
    thinking: "bg-amber-500",
    speaking: "bg-primary",
  };

  const isActive = status === "speaking" || status === "listening";

  return (
    <div className="relative shrink-0">
      {/* Subtle glow for speaking/listening — CSS only */}
      {isActive && (
        <div
          className={`absolute inset-0 rounded-full blur-md animate-pulse ${
            status === "speaking" ? "bg-primary/20" : "bg-blue-500/20"
          }`}
        />
      )}

      {/* Main avatar container */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-border/50 shadow-md bg-muted ${
          status === "speaking" ? "animate-[subtlePulse_0.4s_ease-in-out_infinite]" : ""
        }`}
      >
        <img
          src={currentSprite}
          alt="Clementine"
          className="w-full h-full object-cover transition-opacity duration-200"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Status indicator dot */}
      {showStatusIndicator && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${statusColors[status]} ${
            status !== "idle" ? "animate-pulse" : ""
          }`}
        />
      )}
    </div>
  );
});

ClementineSprite.displayName = "ClementineSprite";
