import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clementineAvatar from "@/assets/clementine-avatar.png";

interface ClementineCompanionProps {
  onChatOpen: () => void;
  currentSection: string;
}

const sectionMessages: Record<string, { en: string; hi: string }> = {
  hero: {
    en: "Welcome! I'm Clementine~ Click me to chat!",
    hi: "स्वागत है! मैं Clementine हूं~ बात करने के लिए click करो!",
  },
  about: {
    en: "This is about Aadiyan! He's amazing~",
    hi: "ये आदियन के बारे में है! वो amazing हैं~",
  },
  skills: {
    en: "Check out these awesome skills! ",
    hi: "ये देखो कितने skills हैं! ",
  },
  projects: {
    en: "VishwaGuru is so cool! Take a look~",
    hi: "VishwaGuru बहुत cool है! देखो~",
  },
  clementine: {
    en: "That's me! Let's chat here~",
    hi: "ये मैं हूं! यहां बात करो~",
  },
  contact: {
    en: "Want to reach out? Fill the form!",
    hi: "संपर्क करना है? Form भरो!",
  },
};

const ClementineCompanion = ({ onChatOpen, currentSection }: ClementineCompanionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [mood, setMood] = useState<"happy" | "excited" | "waving">("happy");
  const [language] = useState<"en" | "hi">("en");

  // Wave on section change
  useEffect(() => {
    setIsWaving(true);
    setMood("waving");
    setShowBubble(true);
    const timer = setTimeout(() => {
      setIsWaving(false);
      setMood("happy");
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentSection]);

  // Auto hide bubble
  useEffect(() => {
    if (showBubble) {
      const timer = setTimeout(() => setShowBubble(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showBubble, currentSection]);

  const handleClick = useCallback(() => {
    setMood("excited");
    setTimeout(() => setMood("happy"), 500);
    onChatOpen();
  }, [onChatOpen]);

  const handleHover = useCallback((hovering: boolean) => {
    setIsHovered(hovering);
    if (hovering) {
      setShowBubble(true);
      setMood("excited");
    } else {
      setMood("happy");
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
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-20 right-0 w-48 sm:w-56 p-2 sm:p-3 rounded-2xl bg-background/95 backdrop-blur-sm border border-primary/30 shadow-lg"
          >
            <p className="text-[10px] sm:text-xs text-foreground leading-relaxed">
              {language === "hi" ? currentMessage.hi : currentMessage.en}
            </p>
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-background/95 border-r border-b border-primary/30 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clementine Avatar with Animations */}
      <motion.div
        onClick={handleClick}
        onHoverStart={() => handleHover(true)}
        onHoverEnd={() => handleHover(false)}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute -inset-3 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: isHovered ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isHovered ? [0.6, 0.8, 0.6] : [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Animated rings when speaking/excited */}
        <AnimatePresence>
          {(mood === "excited" || isWaving) && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-primary/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: [1, 1.5 + ring * 0.2], opacity: [0.6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: ring * 0.25 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Avatar Container */}
        <motion.div
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-primary/50 shadow-xl"
          animate={{
            y: [0, -6, 0],
            rotate: isWaving ? [0, -5, 5, -3, 0] : 0,
            scale: mood === "excited" ? [1, 1.05, 1] : 1,
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 0.6, repeat: isWaving ? 3 : 0 },
            scale: { duration: 0.3 },
          }}
          style={{
            boxShadow: isHovered
              ? "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)"
              : "0 0 20px hsl(var(--primary) / 0.3)",
          }}
        >
          {/* Avatar Image */}
          <motion.img
            src={clementineAvatar}
            alt="Clementine"
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Overlay effects */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
            animate={{ opacity: isHovered ? 0.6 : 0.3 }}
          />

          {/* Shimmer effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-3 border-background flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0.4)",
              "0 0 0 8px rgba(34, 197, 94, 0)",
              "0 0 0 0 rgba(34, 197, 94, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Sparkles around avatar */}
        <AnimatePresence>
          {(isHovered || mood === "excited") && (
            <>
              {[...Array(6)].map((_, i) => {
                const angle = i * 60 * (Math.PI / 180);
                const radius = 55;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: Math.cos(angle) * radius - 4,
                      y: Math.sin(angle) * radius - 4,
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full" fill={i % 2 === 0 ? "#FFD700" : "#FF69B4"}>
                      <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                    </svg>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Floating hearts on excited */}
        <AnimatePresence>
          {mood === "excited" && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-lg"
                  style={{ left: 10 + i * 25, top: -10 }}
                  initial={{ y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    y: -40 - i * 10,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: (i - 1) * 15,
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {i % 2 === 0 ? "" : ""}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="text-[8px] text-center text-muted-foreground mt-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Click to chat!
      </motion.p>
    </motion.div>
  );
};

export default ClementineCompanion;
