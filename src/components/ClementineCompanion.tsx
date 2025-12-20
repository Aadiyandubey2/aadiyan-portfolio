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
  const [breathePhase, setBreathePhase] = useState(0);
  const [language] = useState<'en' | 'hi'>('en');

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(prev => prev + 1);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing animation
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathePhase(prev => (prev + 1) % 2);
    }, 2000);
    return () => clearInterval(breatheInterval);
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

  // Colors
  const skinColor = '#FFE4C9';
  const skinShadow = '#F5D0B0';
  const hairColor = '#5D3A1A';
  const hairHighlight = '#8B5A2B';
  const eyeColor = '#3B82F6';
  const dressColor1 = 'hsl(var(--primary))';
  const dressColor2 = 'hsl(var(--accent))';
  const blushColor = '#FFB6C1';

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

      {/* Clementine Full Body Character */}
      <motion.div
        onClick={handleClick}
        onHoverStart={() => handleHover(true)}
        onHoverEnd={() => handleHover(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)' }}
          animate={{ 
            scale: isHovered ? [1, 1.3, 1] : 1,
            opacity: isHovered ? 0.6 : 0.3 
          }}
          transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
        />

        {/* Character Container */}
        <motion.svg
          width="100"
          height="200"
          viewBox="0 0 100 200"
          className="relative z-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="dressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={dressColor1} />
              <stop offset="100%" stopColor={dressColor2} />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={hairHighlight} />
              <stop offset="100%" stopColor={hairColor} />
            </linearGradient>
            <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={skinColor} />
              <stop offset="100%" stopColor={skinShadow} />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
            </filter>
          </defs>

          {/* Shadow under character */}
          <motion.ellipse
            cx="50"
            cy="195"
            rx="25"
            ry="5"
            fill="rgba(0,0,0,0.15)"
            animate={{ rx: breathePhase === 0 ? 25 : 23 }}
          />

          {/* LEGS */}
          {/* Left Leg */}
          <motion.g
            animate={{ rotate: isHovered ? [0, -3, 3, 0] : 0 }}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
            style={{ transformOrigin: '38px 130px' }}
          >
            {/* Thigh */}
            <path
              d="M35 128 Q32 145 34 160 Q36 162 40 162 Q44 160 42 145 Q44 128 40 128 Z"
              fill="url(#legGrad)"
            />
            {/* Lower leg */}
            <path
              d="M34 160 Q32 175 34 188 Q38 190 40 188 Q42 175 40 160 Z"
              fill={skinColor}
            />
            {/* Shoe */}
            <ellipse cx="37" cy="190" rx="8" ry="4" fill={hairColor} />
            <ellipse cx="37" cy="189" rx="6" ry="3" fill="#8B4513" />
          </motion.g>

          {/* Right Leg */}
          <motion.g
            animate={{ rotate: isHovered ? [0, 3, -3, 0] : 0 }}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, delay: 0.1 }}
            style={{ transformOrigin: '62px 130px' }}
          >
            {/* Thigh */}
            <path
              d="M58 128 Q56 145 58 160 Q60 162 64 162 Q68 160 66 145 Q68 128 64 128 Z"
              fill="url(#legGrad)"
            />
            {/* Lower leg */}
            <path
              d="M58 160 Q56 175 58 188 Q62 190 64 188 Q66 175 64 160 Z"
              fill={skinColor}
            />
            {/* Shoe */}
            <ellipse cx="61" cy="190" rx="8" ry="4" fill={hairColor} />
            <ellipse cx="61" cy="189" rx="6" ry="3" fill="#8B4513" />
          </motion.g>

          {/* BODY / DRESS */}
          <motion.g
            animate={{ scaleY: breathePhase === 0 ? 1 : 1.01 }}
            transition={{ duration: 1 }}
            style={{ transformOrigin: '50px 110px' }}
          >
            {/* Dress body */}
            <path
              d="M30 85 Q28 95 26 130 Q50 140 74 130 Q72 95 70 85 Q50 80 30 85"
              fill="url(#dressGrad)"
              filter="url(#softShadow)"
            />
            {/* Dress details - collar */}
            <path
              d="M40 78 Q50 82 60 78"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            {/* Dress ribbon */}
            <circle cx="50" cy="88" r="3" fill="white" />
            <path d="M47 88 L42 95 M53 88 L58 95" stroke="white" strokeWidth="2" />
            
            {/* Skirt frills */}
            <path
              d="M26 128 Q30 132 34 128 Q38 132 42 128 Q46 132 50 128 Q54 132 58 128 Q62 132 66 128 Q70 132 74 128"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
          </motion.g>

          {/* ARMS */}
          {/* Left Arm */}
          <motion.g
            animate={isWaving ? { rotate: [0, -30, 10, -20, 0] } : { rotate: isHovered ? -5 : 0 }}
            transition={{ duration: isWaving ? 0.8 : 0.3, repeat: isWaving ? 2 : 0 }}
            style={{ transformOrigin: '28px 88px' }}
          >
            {/* Upper arm */}
            <ellipse cx="22" cy="95" rx="6" ry="12" fill={skinColor} />
            {/* Lower arm */}
            <ellipse cx="18" cy="110" rx="5" ry="10" fill={skinColor} />
            {/* Hand */}
            <circle cx="16" cy="120" r="5" fill={skinColor} />
            {/* Fingers suggestion */}
            <ellipse cx="14" cy="123" rx="2" ry="3" fill={skinShadow} opacity="0.5" />
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={isWaving ? { rotate: [0, 40, -5, 30, 0] } : { rotate: isHovered ? 5 : 0 }}
            transition={{ duration: isWaving ? 0.6 : 0.3, repeat: isWaving ? 3 : 0 }}
            style={{ transformOrigin: '72px 88px' }}
          >
            {/* Upper arm */}
            <ellipse cx="78" cy="95" rx="6" ry="12" fill={skinColor} />
            {/* Lower arm */}
            <ellipse cx="82" cy="110" rx="5" ry="10" fill={skinColor} />
            {/* Hand */}
            <circle cx="84" cy="120" r="5" fill={skinColor} />
            {/* Fingers suggestion */}
            <ellipse cx="86" cy="123" rx="2" ry="3" fill={skinShadow} opacity="0.5" />
          </motion.g>

          {/* NECK */}
          <ellipse cx="50" cy="75" rx="6" ry="8" fill={skinColor} />

          {/* HEAD */}
          <motion.g
            animate={{ 
              rotate: isHovered ? [0, 3, -3, 0] : 0,
              y: mood === 'excited' ? [0, -2, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: '50px 45px' }}
          >
            {/* Face */}
            <ellipse cx="50" cy="45" rx="28" ry="30" fill={skinColor} filter="url(#softShadow)" />
            
            {/* Hair Back */}
            <path
              d="M22 45 Q15 20 50 10 Q85 20 78 45 Q80 60 75 70 Q50 75 25 70 Q20 60 22 45"
              fill="url(#hairGrad)"
            />
            
            {/* Hair Bangs */}
            <path
              d="M25 35 Q30 25 35 38 Q38 28 45 40 Q48 25 55 40 Q60 28 65 38 Q70 25 75 35"
              fill={hairColor}
            />
            
            {/* Side hair */}
            <ellipse cx="22" cy="50" rx="6" ry="18" fill={hairColor} />
            <ellipse cx="78" cy="50" rx="6" ry="18" fill={hairColor} />
            
            {/* Hair strands */}
            <path d="M30 20 Q28 5 35 8" stroke={hairHighlight} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 15 Q50 2 55 5" stroke={hairHighlight} strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Ears */}
            <ellipse cx="23" cy="45" rx="4" ry="6" fill={skinColor} />
            <ellipse cx="77" cy="45" rx="4" ry="6" fill={skinColor} />

            {/* Blush */}
            <motion.ellipse
              cx="32"
              cy="52"
              rx="6"
              ry="3"
              fill={blushColor}
              opacity={0.5}
              animate={{ opacity: isHovered ? 0.7 : 0.4 }}
            />
            <motion.ellipse
              cx="68"
              cy="52"
              rx="6"
              ry="3"
              fill={blushColor}
              opacity={0.5}
              animate={{ opacity: isHovered ? 0.7 : 0.4 }}
            />

            {/* Eyes */}
            <motion.g 
              animate={{ scaleY: blinkCount % 3 === 0 ? [1, 0.1, 1] : 1 }} 
              transition={{ duration: 0.12 }}
              style={{ transformOrigin: '50px 42px' }}
            >
              {/* Left Eye */}
              <ellipse cx="38" cy="42" rx="7" ry="9" fill="white" />
              <motion.circle 
                cx="38" 
                cy="44" 
                r="5" 
                fill={eyeColor}
                animate={{ x: isHovered ? 1 : 0 }}
              />
              <circle cx="38" cy="44" r="3" fill="#1E40AF" />
              <circle cx="36" cy="42" r="2" fill="white" />
              <circle cx="40" cy="45" r="1" fill="white" opacity="0.7" />

              {/* Right Eye */}
              <ellipse cx="62" cy="42" rx="7" ry="9" fill="white" />
              <motion.circle 
                cx="62" 
                cy="44" 
                r="5" 
                fill={eyeColor}
                animate={{ x: isHovered ? 1 : 0 }}
              />
              <circle cx="62" cy="44" r="3" fill="#1E40AF" />
              <circle cx="60" cy="42" r="2" fill="white" />
              <circle cx="64" cy="45" r="1" fill="white" opacity="0.7" />
            </motion.g>

            {/* Eyebrows */}
            <motion.path
              d="M30 32 Q38 29 44 33"
              stroke={hairColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              animate={{ d: mood === 'excited' ? 'M30 30 Q38 26 44 30' : 'M30 32 Q38 29 44 33' }}
            />
            <motion.path
              d="M56 33 Q62 29 70 32"
              stroke={hairColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              animate={{ d: mood === 'excited' ? 'M56 30 Q62 26 70 30' : 'M56 33 Q62 29 70 32' }}
            />

            {/* Nose */}
            <path d="M50 48 L48 54 Q50 55 52 54" stroke={skinShadow} strokeWidth="1" fill="none" />

            {/* Mouth */}
            <motion.path
              d={
                mood === 'excited' ? 'M42 60 Q50 70 58 60 Q50 65 42 60' : 
                mood === 'happy' ? 'M44 60 Q50 66 56 60' : 
                'M45 62 Q50 60 55 62'
              }
              stroke="#E57373"
              strokeWidth="2"
              fill={mood === 'excited' ? '#FFCDD2' : 'none'}
              strokeLinecap="round"
            />

            {/* Hair accessories - bows */}
            <g>
              <circle cx="25" cy="28" r="4" fill="#FF69B4" />
              <path d="M20 28 L25 28 M25 23 L25 28" stroke="#FF69B4" strokeWidth="3" />
            </g>
          </motion.g>

          {/* Sparkles when excited */}
          <AnimatePresence>
            {(mood === 'excited' || isHovered) && (
              <>
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0.8, 1.2, 0.8], rotate: [0, 15, 0] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <path d="M8 20 L10 25 L15 25 L11 28 L13 33 L8 30 L3 33 L5 28 L1 25 L6 25 Z" fill="#FFD700" />
                </motion.g>
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0.8, 1.2, 0.8], rotate: [0, -15, 0] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                >
                  <path d="M90 15 L92 20 L97 20 L93 23 L95 28 L90 25 L85 28 L87 23 L83 20 L88 20 Z" fill="#00CED1" />
                </motion.g>
                <motion.circle
                  cx="15"
                  cy="60"
                  r="2"
                  fill="#FF69B4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                />
                <motion.circle
                  cx="85"
                  cy="70"
                  r="2"
                  fill="#87CEEB"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, -15, -30] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.svg>
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
