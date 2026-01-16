import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Zap, Brain, Code, Globe } from "lucide-react";
import clementineAvatar from "@/assets/clementine-avatar.png";

interface EmptyStateProps {
  language: "en" | "hi";
  suggestedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  disabled: boolean;
}

const features = [
  { icon: Brain, label: "Smart Responses", labelHi: "स्मार्ट जवाब" },
  { icon: Globe, label: "Bilingual", labelHi: "द्विभाषी" },
  { icon: Zap, label: "Instant", labelHi: "तुरंत" },
  { icon: Code, label: "Tech Expert", labelHi: "टेक एक्सपर्ट" },
];

export const EmptyState = ({
  language,
  suggestedQuestions,
  onSelectQuestion,
  disabled,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Avatar with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/40 shadow-xl">
          <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
        </div>
        <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircle className="w-3 h-3 text-white" />
        </motion.div>
      </motion.div>

      {/* Welcome text */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h3 className="text-lg sm:text-xl font-heading font-bold mb-2">
          {language === "hi" ? "नमस्ते! मैं Clementine हूं" : "Hi! I'm Clementine"}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
          {language === "hi"
            ? "Aadiyan की AI assistant। मुझसे उनके projects, skills, या कुछ भी पूछें!"
            : "Aadiyan's AI assistant. Ask me about his projects, skills, or anything!"}
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 mb-6"
      >
        {features.map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30 text-xs"
          >
            <feature.icon className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">
              {language === "hi" ? feature.labelHi : feature.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Suggested questions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl"
      >
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          {language === "hi" ? "सुझाए गए सवाल" : "Suggested questions"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedQuestions.map((q, i) => (
            <motion.button
              key={q}
              onClick={() => onSelectQuestion(q)}
              disabled={disabled}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs
                bg-gradient-to-br from-muted/80 to-muted/40
                hover:from-primary/20 hover:to-primary/10 hover:text-primary
                border border-border/30 hover:border-primary/30
                transition-all disabled:opacity-50 shadow-sm"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
