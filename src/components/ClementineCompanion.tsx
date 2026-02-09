import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import sprite variations
import clementineIdle from "@/assets/clementine-idle.png";
import clementineHappy from "@/assets/clementine-happy.png";

interface ClementineCompanionProps {
  onChatOpen: () => void;
  currentSection: string;
}

const sectionMessages: Record<string, { en: string; hi: string }> = {
  hero: {
    en: "Welcome! Click me to chat!",
    hi: "स्वागत है! बात करने के लिए click करो!",
  },
  about: {
    en: "Learn about Aadiyan here!",
    hi: "आदियन के बारे में जानो!",
  },
  skills: {
    en: "Check out these skills!",
    hi: "ये देखो कितने skills हैं!",
  },
  projects: {
    en: "VishwaGuru is cool! Take a look~",
    hi: "VishwaGuru देखो!",
  },
  clementine: {
    en: "That's me! Let's chat~",
    hi: "ये मैं हूं! बात करो~",
  },
  contact: {
    en: "Want to reach out?",
    hi: "संपर्क करना है?",
  },
};

const ClementineCompanion = ({ onChatOpen, currentSection }: ClementineCompanionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [isExcited, setIsExcited] = useState(false);
  const [language] = useState<"en" | "hi">("en");

  // Select sprite based on state
  const currentSprite = useMemo(() => {
    return isExcited || isHovered ? clementineHappy : clementineIdle;
  }, [isExcited, isHovered]);

  // Show bubble on section change
  useEffect(() => {
    setShowBubble(true);
    const timer = setTimeout(() => setShowBubble(false), 4000);
    return () => clearTimeout(timer);
  }, [currentSection]);

  const handleClick = useCallback(() => {
    setIsExcited(true);
    setTimeout(() => setIsExcited(false), 500);
    onChatOpen();
  }, [onChatOpen]);

  const handleHover = useCallback((hovering: boolean) => {
    setIsHovered(hovering);
    if (hovering) {
      setShowBubble(true);
    }
  }, []);

  const currentMessage = sectionMessages[currentSection] || sectionMessages.hero;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 cursor-pointer select-none"
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.5, delay: 1 }}
    >
      {/* Speech Bubble - Minimal design */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            className="absolute -top-16 right-0 w-44 sm:w-48 p-2.5 rounded-xl bg-background border border-border shadow-lg"
          >
            <p className="text-[10px] sm:text-xs text-foreground leading-relaxed">
              {language === "hi" ? currentMessage.hi : currentMessage.en}
            </p>
            <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-background border-r border-b border-border transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clementine Avatar - Clean minimal design */}
      <motion.div
        onClick={handleClick}
        onHoverStart={() => handleHover(true)}
        onHoverEnd={() => handleHover(false)}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Subtle glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
          animate={{
            scale: isHovered ? 1.3 : 1.1,
            opacity: isHovered ? 0.6 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Main Avatar Container */}
        <motion.div
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-border shadow-lg bg-muted"
          animate={{
            y: [0, -4, 0],
            scale: isExcited ? 1.05 : 1,
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.2 },
          }}
        >
          {/* Avatar Image with crossfade */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSprite}
              src={currentSprite}
              alt="Clementine"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="text-[8px] text-center text-muted-foreground mt-1.5"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Click to chat
      </motion.p>
    </motion.div>
  );
};

export default ClementineCompanion;
