import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AppleThemeWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

// Professional 3D Chip Icon Component
const ChipIcon3D = () => {
  return (
    <div className="relative w-24 h-24 perspective-1000">
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-2 rounded-2xl opacity-30"
        style={{ background: '#0ea5e9', filter: 'blur(20px)' }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Main chip body */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: [0, 10, -10, 0],
          rotateX: [0, -5, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Chip base */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        
        {/* Inner circuit pattern */}
        <div className="absolute inset-3 rounded-xl overflow-hidden">
          {/* Grid lines */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
            }}
          />
          
          {/* Center processor core */}
          <motion.div
            className="absolute inset-4 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #1e3a5f, #0c1929)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Core indicator */}
            <motion.div
              className="w-6 h-6 rounded-md"
              style={{
                background: '#0ea5e9',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.6)',
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  '0 0 10px rgba(14, 165, 233, 0.4)',
                  '0 0 25px rgba(14, 165, 233, 0.8)',
                  '0 0 10px rgba(14, 165, 233, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Corner pins */}
        {[
          { top: '4px', left: '4px' },
          { top: '4px', right: '4px' },
          { bottom: '4px', left: '4px' },
          { bottom: '4px', right: '4px' },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              ...pos,
              background: '#475569',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* Side pins - left */}
        {[0, 1, 2].map((i) => (
          <div
            key={`left-${i}`}
            className="absolute w-1 h-3 -left-1 rounded-l-sm"
            style={{
              top: `${28 + i * 16}%`,
              background: 'linear-gradient(90deg, #64748b, #475569)',
            }}
          />
        ))}
        
        {/* Side pins - right */}
        {[0, 1, 2].map((i) => (
          <div
            key={`right-${i}`}
            className="absolute w-1 h-3 -right-1 rounded-r-sm"
            style={{
              top: `${28 + i * 16}%`,
              background: 'linear-gradient(90deg, #475569, #64748b)',
            }}
          />
        ))}

        {/* Side pins - top */}
        {[0, 1, 2].map((i) => (
          <div
            key={`top-${i}`}
            className="absolute h-1 w-3 -top-1 rounded-t-sm"
            style={{
              left: `${28 + i * 16}%`,
              background: 'linear-gradient(180deg, #64748b, #475569)',
            }}
          />
        ))}

        {/* Side pins - bottom */}
        {[0, 1, 2].map((i) => (
          <div
            key={`bottom-${i}`}
            className="absolute h-1 w-3 -bottom-1 rounded-b-sm"
            style={{
              left: `${28 + i * 16}%`,
              background: 'linear-gradient(180deg, #475569, #64748b)',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

const AppleThemeWarning = ({ isOpen, onClose, onContinue }: AppleThemeWarningProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
        >
          {/* Main modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl"
            style={{
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Content wrapper */}
            <div className="relative p-8">
              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* 3D Chip Icon */}
              <div className="flex justify-center mb-6">
                <ChipIcon3D />
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-center mb-2 text-slate-900"
              >
                High Performance Mode
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center text-slate-500 mb-6 text-sm leading-relaxed"
              >
                This theme uses advanced visual effects optimized for devices with dedicated graphics.
              </motion.p>

              {/* Specs row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-6 mb-8"
              >
                {[
                  { label: 'GPU', value: 'Required' },
                  { label: 'FPS', value: '60+' },
                  { label: 'Effects', value: 'Advanced' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-sm font-medium text-slate-700">{item.value}</div>
                  </div>
                ))}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3"
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-5 rounded-xl font-medium text-slate-600 transition-all"
                  style={{
                    background: '#f1f5f9',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onContinue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-5 rounded-xl font-medium text-white transition-all"
                  style={{
                    background: '#0f172a',
                  }}
                >
                  Continue
                </motion.button>
              </motion.div>

              {/* Disclaimer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-xs text-center text-slate-400 mt-4"
              >
                Performance may vary on older devices
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppleThemeWarning;
