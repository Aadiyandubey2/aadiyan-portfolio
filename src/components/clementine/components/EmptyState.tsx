import { memo } from "react";
import { motion } from "framer-motion";
import clementineAvatar from "@/assets/clementine-avatar.png";

interface EmptyStateProps {
  language: "en" | "hi";
  suggestedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  disabled: boolean;
  isReturningUser?: boolean;
  userName?: string;
}

/* ===== INLINE SVG ICONS ===== */
const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M184 96a40 40 0 0 0-72-24 40 40 0 0 0-40 40v48a40 40 0 0 0 40 40h64a40 40 0 0 0 40-40V112a40 40 0 0 0-32-16Z" opacity="0.25" />
    <path d="M184 88a48 48 0 0 0-72-32 48 48 0 0 0-48 48v48a48 48 0 0 0 48 48h64a48 48 0 0 0 48-48v-48a48 48 0 0 0-40-16Zm24 64a32 32 0 0 1-32 32h-64a32 32 0 0 1-32-32v-48a32 32 0 0 1 32-32 16 16 0 0 1 16 16h16a32 32 0 0 1 32-32 32 32 0 0 1 32 32Z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 24a104 104 0 1 0 104 104A104 104 0 0 0 128 24Z" opacity="0.25" />
    <path d="M128 16a112 112 0 1 0 112 112A112 112 0 0 0 128 16Zm72 112a72 72 0 0 1-72 72 72 72 0 0 1-72-72 72 72 0 0 1 72-72 72 72 0 0 1 72 72Z" />
  </svg>
);

const LightningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M144 16 48 144h64l-16 96 96-128h-64Z" opacity="0.25" />
    <path d="M152 8a8 8 0 0 0-7 4L40 140a8 8 0 0 0 7 12h55l-14 84a8 8 0 0 0 14 6l104-136a8 8 0 0 0-7-12h-55l14-84a8 8 0 0 0-6-2Z" />
  </svg>
);

const VoiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M168 64v64a40 40 0 0 1-80 0V64a40 40 0 0 1 80 0Z" opacity="0.25" />
    <path d="M128 16a48 48 0 0 0-48 48v64a48 48 0 0 0 96 0V64a48 48 0 0 0-48-48Zm32 112a32 32 0 0 1-64 0V64a32 32 0 0 1 64 0Zm40 0a8 8 0 0 1 16 0 88 88 0 0 1-80 88v24a8 8 0 0 1-16 0v-24a88 88 0 0 1-80-88 8 8 0 0 1 16 0 72 72 0 0 0 144 0Z" />
  </svg>
);

const features = [
  { icon: BrainIcon, label: "Smart AI", labelHi: "स्मार्ट AI" },
  { icon: GlobeIcon, label: "Bilingual", labelHi: "द्विभाषी" },
  { icon: LightningIcon, label: "Fast", labelHi: "तेज़" },
  { icon: VoiceIcon, label: "Voice", labelHi: "आवाज़" },
];

export const EmptyState = memo(({ language, suggestedQuestions, onSelectQuestion, disabled }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-3">
      {/* Avatar */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative mb-5"
      >
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl scale-150" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-primary/30 shadow-lg">
          <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center"
        >
          <span className="w-2 h-2 rounded-full bg-white" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <h3 className="text-base sm:text-lg font-bold mb-1.5">
        {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
      </h3>
      <p className="text-muted-foreground text-[11px] sm:text-xs text-center max-w-sm mb-4 px-2">
        {language === "hi"
          ? "Aadiyan की AI assistant। उनके बारे में कुछ भी पूछो!"
          : "Aadiyan's AI assistant. Ask me anything about him!"}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/40 border border-border/20 text-[10px] text-muted-foreground"
          >
            <span className="text-primary/70"><f.icon /></span>
            {language === "hi" ? f.labelHi : f.label}
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      <p className="text-[9px] text-muted-foreground/70 mb-2.5">
        {language === "hi" ? "ये सवाल पूछें" : "Try asking"}
      </p>

      <div className="flex flex-wrap justify-center gap-1.5 max-w-xl">
        {suggestedQuestions.slice(0, 4).map((q, i) => (
          <motion.button
            key={q}
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px]
              bg-muted/50 border border-border/20
              hover:border-primary/30 hover:text-primary hover:bg-primary/5
              transition-colors disabled:opacity-40 disabled:pointer-events-none
              max-w-[180px] truncate"
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
