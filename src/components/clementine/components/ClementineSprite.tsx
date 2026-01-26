import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // Select sprite based on status
  const currentSprite = useMemo(() => {
    switch (status) {
      case "thinking":
        return clementineThinking;
      case "speaking":
        return clementineSpeaking;
      case "listening":
        return clementineHappy;
      default:
        return clementineIdle;
    }
  }, [status]);

  const statusColors = {
    idle: "bg-green-500",
    listening: "bg-blue-500",
    thinking: "bg-amber-500",
    speaking: "bg-primary",
  };

  return (
    <div className="relative shrink-0">
      {/* Subtle glow for speaking/listening */}
      <AnimatePresence>
        {(status === "speaking" || status === "listening") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              className={`absolute inset-0 rounded-full ${
                status === "speaking" ? "bg-primary/20" : "bg-blue-500/20"
              } blur-md`}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main avatar container */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-border/50 shadow-md bg-muted`}
        animate={
          status === "speaking" 
            ? { scale: [1, 1.02, 1] } 
            : status === "thinking"
              ? { rotate: [0, -2, 2, 0] }
              : {}
        }
        transition={{ 
          duration: status === "speaking" ? 0.4 : 0.8, 
          repeat: (status === "speaking" || status === "thinking") ? Infinity : 0 
        }}
      >
        {/* Sprite image with crossfade */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSprite}
            src={currentSprite}
            alt="Clementine"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            loading="lazy"
            decoding="async"
          />
        </AnimatePresence>
      </motion.div>

      {/* Status indicator dot */}
      {showStatusIndicator && (
        <motion.div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${statusColors[status]}`}
          animate={
            status !== "idle"
              ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
              : {}
          }
          transition={{ duration: 0.6, repeat: status !== "idle" ? Infinity : 0 }}
        />
      )}
    </div>
  );
});

ClementineSprite.displayName = "ClementineSprite";
