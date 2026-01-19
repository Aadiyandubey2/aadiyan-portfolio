import { memo } from "react";
import { motion } from "framer-motion";

interface XPBarProps {
  progress: number;
  required: number;
  percentage: number;
  level: number;
  streak: number;
}

export const XPBar = memo(({ progress, required, percentage, level, streak }: XPBarProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="font-medium">Level {level}</span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-orange-500">
              🔥 {streak}
            </span>
          )}
        </span>
        <span>{progress} / {required} XP</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full"
        />
      </div>
    </div>
  );
});

XPBar.displayName = "XPBar";
