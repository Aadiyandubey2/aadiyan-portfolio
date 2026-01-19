import { memo } from "react";
import { motion } from "framer-motion";

interface LevelUpNotificationProps {
  level: number;
  title: string;
}

export const LevelUpNotification = memo(({ level, title }: LevelUpNotificationProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0] 
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-4xl mb-2"
          >
            🎉
          </motion.div>
          <div className="text-2xl font-bold mb-1">Level Up!</div>
          <div className="text-lg opacity-90">Level {level}</div>
          <div className="text-sm opacity-75 mt-1">{title}</div>
        </div>
        
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: 0, 
                x: Math.random() * 200 - 100,
                opacity: 1 
              }}
              animate={{ 
                y: [0, -50, 100],
                opacity: [1, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{ 
                duration: 2,
                delay: Math.random() * 0.5,
              }}
              className="absolute top-1/2 left-1/2 text-xl"
            >
              {["✨", "🌟", "⭐", "💫", "🎊"][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

LevelUpNotification.displayName = "LevelUpNotification";
