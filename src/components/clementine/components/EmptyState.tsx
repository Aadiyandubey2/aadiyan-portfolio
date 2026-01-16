import { motion } from "framer-motion";
import clementineAvatar from "@/assets/clementine-avatar.png";

interface EmptyStateProps {
  language: "en" | "hi";
  suggestedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  disabled: boolean;
}

/* ===== INLINE SVG ICONS (Lovable safe) ===== */

const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path
      d="M184 96a40 40 0 0 0-72-24 40 40 0 0 0-40 40v48a40 40 0 0 0 40 40h64a40 40 0 0 0 40-40V112a40 40 0 0 0-32-16Z"
      opacity="0.25"
    />
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

const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M88 64 24 128l64 64M168 64l64 64-64 64" opacity="0.25" />
    <path d="M93 56a8 8 0 0 1 0 11L40 120l53 53a8 8 0 1 1-11 11L24 126a8 8 0 0 1 0-12l58-58a8 8 0 0 1 11 0Zm70 0a8 8 0 0 1 11 0l58 58a8 8 0 0 1 0 12l-58 58a8 8 0 1 1-11-11l53-53-53-53a8 8 0 0 1 0-11Z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 24 156 100l76 28-76 28-28 76-28-76-76-28 76-28Z" opacity="0.25" />
    <path d="M128 16a8 8 0 0 1 8 6l26 70 70 26a8 8 0 0 1 0 14l-70 26-26 70a8 8 0 0 1-14 0l-26-70-70-26a8 8 0 0 1 0-14l70-26 26-70a8 8 0 0 1 6-6Z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M32 128a96 96 0 1 0 96-96 96 96 0 0 0-96 96Z" opacity="0.25" />
    <path d="M128 24A104 104 0 0 0 40 176l-16 48a8 8 0 0 0 10 10l48-16A104 104 0 1 0 128 24Zm0 192a88 88 0 0 1-42-11 8 8 0 0 0-6-1l-26 9 9-26a8 8 0 0 0-1-6A88 88 0 1 1 128 216Z" />
  </svg>
);

/* ===== FEATURES ===== */

const features = [
  { icon: BrainIcon, label: "Smart Responses", labelHi: "स्मार्ट जवाब" },
  { icon: GlobeIcon, label: "Bilingual", labelHi: "द्विभाषी" },
  { icon: LightningIcon, label: "Instant", labelHi: "तुरंत" },
  { icon: CodeIcon, label: "Tech Expert", labelHi: "टेक एक्सपर्ट" },
];

export const EmptyState = ({ language, suggestedQuestions, onSelectQuestion, disabled }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Avatar */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-primary/40 shadow-xl">
          <img src={clementineAvatar} className="w-full h-full object-cover" />
        </div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border border-background flex items-center justify-center text-white"
        >
          <ChatIcon />
        </motion.div>
      </motion.div>

      {/* Text */}
      <h3 className="text-lg font-bold mb-2">
        {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
      </h3>
      <p className="text-muted-foreground text-xs text-center max-w-md mb-6">
        {language === "hi"
          ? "Aadiyan की AI assistant। मुझसे उनके projects या skills पूछें!"
          : "Aadiyan's AI assistant. Ask me about his projects or skills!"}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 backdrop-blur-md border border-border/30 text-xs text-muted-foreground"
          >
            <span className="text-primary opacity-80">{<f.icon />}</span>
            {language === "hi" ? f.labelHi : f.label}
          </div>
        ))}
      </div>

      {/* Suggested */}
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
        <SparkleIcon />
        {language === "hi" ? "सुझाए गए सवाल" : "Suggested questions"}
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {suggestedQuestions.map((q, i) => (
          <motion.button
            key={q}
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-[10px]
              bg-muted/40 backdrop-blur-md border border-border/30
              hover:border-primary/40 hover:text-primary
              transition-all disabled:opacity-50"
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
