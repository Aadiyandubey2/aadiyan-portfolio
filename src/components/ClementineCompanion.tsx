import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClementineCompanionProps {
  onChatOpen: () => void;
  currentSection: string;
}

const sectionMessages: Record<string, { en: string; hi: string }> = {
  hero: { 
    en: "Welcome! I'm Clementine~ Click me to chat!", 
    hi: "स्वागत है! मैं Clementine हूं~ बात करने के लिए click करो!" 
  },
  about: { 
    en: "This is about Aadiyan! He's amazing~", 
    hi: "ये आदियन के बारे में है! वो amazing हैं~" 
  },
  skills: { 
    en: "Check out these awesome skills! ✨", 
    hi: "ये देखो कितने skills हैं! ✨" 
  },
  projects: { 
    en: "VishwaGuru is so cool! Take a look~", 
    hi: "VishwaGuru बहुत cool है! देखो~" 
  },
  clementine: { 
    en: "That's me! Let's chat here~", 
    hi: "ये मैं हूं! यहां बात करो~" 
  },
  contact: { 
    en: "Want to reach out? Fill the form!", 
    hi: "संपर्क करना है? Form भरो!" 
  },
};

const ClementineCompanion = ({ onChatOpen, currentSection }: ClementineCompanionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [mood, setMood] = useState<'happy' | 'excited' | 'thinking' | 'waving'>('happy');
  const [blinkCount, setBlink] = useState(0);
  const [language] = useState<'en' | 'hi'>('en');

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(prev => prev + 1);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Wave on section change
  useEffect(() => {
    setIsWaving(true);
    setMood('waving');
    setShowBubble(true);
    const timer = setTimeout(() => {
      setIsWaving(false);
      setMood('happy');
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
    setMood('excited');
    setTimeout(() => setMood('happy'), 500);
    onChatOpen();
  }, [onChatOpen]);

  const handleHover = useCallback((hovering: boolean) => {
    setIsHovered(hovering);
    if (hovering) {
      setShowBubble(true);
      setMood('excited');
    } else {
      setMood('happy');
    }
  }, []);

  const currentMessage = sectionMessages[currentSection] || sectionMessages.hero;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 cursor-pointer select-none"
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 1 }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-16 right-0 w-48 sm:w-56 p-2 sm:p-3 rounded-2xl bg-background/95 backdrop-blur-sm border border-primary/30 shadow-lg"
          >
            <p className="text-[10px] sm:text-xs text-foreground leading-relaxed">
              {language === 'hi' ? currentMessage.hi : currentMessage.en}
            </p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-background/95 border-r border-b border-primary/30 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clementine Character */}
      <motion.div
        onClick={handleClick}
        onHoverStart={() => handleHover(true)}
        onHoverEnd={() => handleHover(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)' }}
          animate={{ 
            scale: isHovered ? [1, 1.2, 1] : 1,
            opacity: isHovered ? 0.8 : 0.4 
          }}
          transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
        />

        {/* Character Container */}
        <motion.svg
          width="120"
          height="160"
          viewBox="0 0 120 160"
          className="relative z-10"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Body */}
          <motion.ellipse
            cx="60"
            cy="120"
            rx="35"
            ry="35"
            fill="url(#bodyGradient)"
            animate={{ 
              scaleY: mood === 'excited' ? [1, 0.95, 1] : 1 
            }}
            transition={{ duration: 0.3, repeat: mood === 'excited' ? Infinity : 0 }}
          />

          {/* Dress/Outfit */}
          <motion.path
            d="M25 115 Q60 90 95 115 Q95 145 60 155 Q25 145 25 115"
            fill="url(#dressGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />

          {/* Arms */}
          <motion.g
            animate={isWaving ? { rotate: [0, -20, 20, -10, 0] } : {}}
            transition={{ duration: 0.8, repeat: isWaving ? 2 : 0 }}
            style={{ transformOrigin: '30px 100px' }}
          >
            {/* Left Arm */}
            <ellipse cx="22" cy="105" rx="8" ry="15" fill="hsl(35, 80%, 85%)" />
            <circle cx="20" cy="118" r="6" fill="hsl(35, 80%, 85%)" />
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={isWaving ? { rotate: [0, 30, -10, 20, 0] } : {}}
            transition={{ duration: 0.6, repeat: isWaving ? 3 : 0 }}
            style={{ transformOrigin: '90px 100px' }}
          >
            <ellipse cx="98" cy="105" rx="8" ry="15" fill="hsl(35, 80%, 85%)" />
            <circle cx="100" cy="118" r="6" fill="hsl(35, 80%, 85%)" />
          </motion.g>

          {/* Head */}
          <motion.circle
            cx="60"
            cy="55"
            r="40"
            fill="hsl(35, 80%, 88%)"
            animate={{ 
              scale: mood === 'thinking' ? [1, 1.02, 1] : 1 
            }}
            transition={{ duration: 1, repeat: mood === 'thinking' ? Infinity : 0 }}
          />

          {/* Hair */}
          <motion.path
            d="M20 50 Q20 15 60 12 Q100 15 100 50 Q95 35 60 30 Q25 35 20 50"
            fill="hsl(25, 60%, 25%)"
          />
          <motion.ellipse cx="25" cy="55" rx="8" ry="20" fill="hsl(25, 60%, 25%)" />
          <motion.ellipse cx="95" cy="55" rx="8" ry="20" fill="hsl(25, 60%, 25%)" />

          {/* Hair Bangs */}
          <motion.path
            d="M35 30 Q45 45 40 50 M50 28 Q55 42 52 48 M70 28 Q65 42 68 48 M85 30 Q75 45 80 50"
            stroke="hsl(25, 60%, 25%)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* Blush */}
          <motion.ellipse
            cx="35"
            cy="62"
            rx="8"
            ry="5"
            fill="hsl(350, 80%, 80%)"
            opacity={0.6}
            animate={{ opacity: isHovered ? 0.8 : 0.5 }}
          />
          <motion.ellipse
            cx="85"
            cy="62"
            rx="8"
            ry="5"
            fill="hsl(350, 80%, 80%)"
            opacity={0.6}
            animate={{ opacity: isHovered ? 0.8 : 0.5 }}
          />

          {/* Eyes */}
          <motion.g animate={{ scaleY: blinkCount % 2 === 0 ? [1, 0.1, 1] : 1 }} transition={{ duration: 0.15 }}>
            {/* Left Eye */}
            <ellipse cx="45" cy="52" rx="8" ry="10" fill="white" />
            <motion.circle 
              cx="45" 
              cy="54" 
              r="5" 
              fill="hsl(200, 80%, 30%)"
              animate={{ 
                x: isHovered ? 2 : 0,
                y: mood === 'excited' ? -1 : 0 
              }}
            />
            <circle cx="43" cy="52" r="2" fill="white" />

            {/* Right Eye */}
            <ellipse cx="75" cy="52" rx="8" ry="10" fill="white" />
            <motion.circle 
              cx="75" 
              cy="54" 
              r="5" 
              fill="hsl(200, 80%, 30%)"
              animate={{ 
                x: isHovered ? 2 : 0,
                y: mood === 'excited' ? -1 : 0 
              }}
            />
            <circle cx="73" cy="52" r="2" fill="white" />
          </motion.g>

          {/* Eyebrows */}
          <motion.path
            d="M37 40 Q45 38 53 42"
            stroke="hsl(25, 60%, 25%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{ d: mood === 'excited' ? 'M37 38 Q45 34 53 38' : 'M37 40 Q45 38 53 42' }}
          />
          <motion.path
            d="M67 42 Q75 38 83 40"
            stroke="hsl(25, 60%, 25%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{ d: mood === 'excited' ? 'M67 38 Q75 34 83 38' : 'M67 42 Q75 38 83 40' }}
          />

          {/* Nose */}
          <ellipse cx="60" cy="60" rx="2" ry="3" fill="hsl(35, 60%, 75%)" />

          {/* Mouth */}
          <motion.path
            d={mood === 'excited' ? 'M50 72 Q60 82 70 72' : mood === 'happy' ? 'M50 70 Q60 78 70 70' : 'M52 72 Q60 70 68 72'}
            stroke="hsl(350, 60%, 50%)"
            strokeWidth="2.5"
            fill={mood === 'excited' ? 'hsl(350, 70%, 60%)' : 'none'}
            strokeLinecap="round"
          />

          {/* Sparkle effects when excited */}
          <AnimatePresence>
            {mood === 'excited' && (
              <>
                <motion.path
                  d="M10 30 L12 35 L17 35 L13 38 L15 43 L10 40 L5 43 L7 38 L3 35 L8 35 Z"
                  fill="hsl(50, 100%, 60%)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0.8, 1.2, 0.8], rotate: [0, 15, 0] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.path
                  d="M105 25 L107 30 L112 30 L108 33 L110 38 L105 35 L100 38 L102 33 L98 30 L103 30 Z"
                  fill="hsl(180, 100%, 60%)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0.8, 1.2, 0.8], rotate: [0, -15, 0] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Gradients */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <linearGradient id="dressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.9)" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Floating particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                initial={{ 
                  x: 60, 
                  y: 80,
                  opacity: 0 
                }}
                animate={{ 
                  x: 60 + Math.cos(i * 72 * Math.PI / 180) * 50,
                  y: 80 + Math.sin(i * 72 * Math.PI / 180) * 50,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="text-[8px] text-center text-muted-foreground mt-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Click to chat!
      </motion.p>
    </motion.div>
  );
};

export default ClementineCompanion;
