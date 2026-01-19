import { memo } from "react";
import { motion } from "framer-motion";
import { ClementineMood } from "../types";
import { MOOD_EXPRESSIONS } from "../constants";

interface MoodIndicatorProps {
  mood: ClementineMood;
  show: boolean;
}

export const MoodIndicator = memo(({ mood, show }: MoodIndicatorProps) => {
  if (!show) return null;

  const moodInfo = MOOD_EXPRESSIONS[mood];

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-block ml-2 text-xl"
      title={`Mood: ${mood}`}
    >
      {moodInfo.emoji}
    </motion.span>
  );
});

MoodIndicator.displayName = "MoodIndicator";
