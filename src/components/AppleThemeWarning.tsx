import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, Cpu, Zap, X } from 'lucide-react';

interface AppleThemeWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const AppleThemeWarning = ({ isOpen, onClose, onContinue }: AppleThemeWarningProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)' }}
        >
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -50, -100],
              }}
              transition={{
                duration: 3,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                boxShadow: '0 0 10px #00d4ff',
              }}
            />
          ))}

          {/* Main modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              delay: 0.1 
            }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.98) 100%)',
              boxShadow: '0 25px 80px -12px rgba(0, 150, 200, 0.4), 0 0 0 1px rgba(255,255,255,0.8) inset',
            }}
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-50"
              style={{
                background: 'linear-gradient(90deg, #00d4ff, #0ea5e9, #06b6d4, #00d4ff)',
                backgroundSize: '300% 100%',
                padding: '2px',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content wrapper */}
            <div className="relative p-8">
              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Icon with glow effect */}
              <motion.div
                className="mx-auto w-20 h-20 mb-6 relative"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                    filter: 'blur(15px)',
                    opacity: 0.6,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div 
                  className="relative w-full h-full rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                    boxShadow: '0 8px 32px rgba(0, 180, 220, 0.4)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title with gradient */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center mb-3"
                style={{
                  background: 'linear-gradient(135deg, #0c4a6e, #0284c7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Premium Experience Ahead
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-600 mb-6 leading-relaxed"
              >
                The Apple Theme features stunning glass effects, fluid animations, and advanced visual enhancements designed for 
                <span className="font-semibold text-sky-600"> high-performance devices</span>.
              </motion.p>

              {/* Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-3 mb-8"
              >
                {[
                  { icon: Cpu, label: 'GPU Intensive' },
                  { icon: Zap, label: 'High FPS' },
                  { icon: Sparkles, label: 'Glass Effects' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1))',
                      border: '1px solid rgba(14, 165, 233, 0.2)',
                      color: '#0284c7',
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </motion.div>
                ))}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-gray-600 transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  Stay on Current
                </motion.button>
                <motion.button
                  onClick={onContinue}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0, 180, 220, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                    boxShadow: '0 8px 32px rgba(0, 180, 220, 0.4)',
                  }}
                >
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                  <span className="relative">Continue Anyway</span>
                </motion.button>
              </motion.div>

              {/* Disclaimer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-center text-gray-400 mt-4"
              >
                Lower-end devices may experience reduced performance
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppleThemeWarning;
