import { memo } from "react";
import { motion } from "framer-motion";
import { Achievement } from "../types";

interface AchievementNotificationProps {
  achievement: Achievement;
}

const rarityColors = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 via-orange-500 to-red-500",
};

const rarityGlow = {
  common: "shadow-gray-500/30",
  rare: "shadow-blue-500/40",
  epic: "shadow-purple-500/50",
  legendary: "shadow-yellow-500/60",
};

export const AchievementNotification = memo(({ achievement }: AchievementNotificationProps) => {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed top-24 right-4 z-50"
    >
      <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white px-6 py-4 rounded-xl shadow-2xl ${rarityGlow[achievement.rarity]} min-w-[280px]`}>
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0] 
            }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="text-4xl"
          >
            {achievement.icon}
          </motion.div>
          <div>
            <div className="text-xs uppercase tracking-wider opacity-75 mb-0.5">
              Achievement Unlocked!
            </div>
            <div className="text-lg font-bold">{achievement.name}</div>
            <div className="text-sm opacity-90">{achievement.description}</div>
            <div className="text-xs mt-1 opacity-75 capitalize">
              {achievement.rarity} Achievement
            </div>
          </div>
        </div>
        
        {/* Sparkle effects for legendary */}
        {achievement.rarity === "legendary" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                className="absolute text-yellow-200"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

AchievementNotification.displayName = "AchievementNotification";
