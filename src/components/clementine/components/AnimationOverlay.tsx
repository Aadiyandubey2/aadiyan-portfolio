import { memo } from "react";
import { motion } from "framer-motion";

interface AnimationOverlayProps {
  animation: string;
}

export const AnimationOverlay = memo(({ animation }: AnimationOverlayProps) => {
  switch (animation) {
    case "confetti":
      return <ConfettiAnimation />;
    case "hearts":
      return <HeartsAnimation />;
    case "matrix":
      return <MatrixAnimation />;
    case "shake":
      return <ShakeAnimation />;
    case "dance":
      return <DanceAnimation />;
    case "bounce":
      return <BounceAnimation />;
    case "wiggle":
      return <WiggleAnimation />;
    case "party":
      return <PartyAnimation />;
    default:
      return null;
  }
});

AnimationOverlay.displayName = "AnimationOverlay";

const ConfettiAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40"
  >
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          y: -20,
          x: Math.random() * window.innerWidth,
          rotate: 0,
          opacity: 1,
        }}
        animate={{ 
          y: window.innerHeight + 50,
          rotate: Math.random() * 720,
          opacity: [1, 1, 0],
        }}
        transition={{ 
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 0.5,
        }}
        className="absolute text-2xl"
      >
        {["🎉", "🎊", "✨", "🌟", "💫", "🎈", "🎁"][Math.floor(Math.random() * 7)]}
      </motion.div>
    ))}
  </motion.div>
);

const HeartsAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40"
  >
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          y: window.innerHeight,
          x: Math.random() * window.innerWidth,
          scale: 0.5 + Math.random() * 0.5,
          opacity: 0.8,
        }}
        animate={{ 
          y: -50,
          opacity: [0.8, 1, 0],
        }}
        transition={{ 
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 0.5,
        }}
        className="absolute text-3xl"
      >
        {["❤️", "💕", "💗", "💖", "💝", "💓"][Math.floor(Math.random() * 6)]}
      </motion.div>
    ))}
  </motion.div>
);

const MatrixAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.3 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40 bg-black"
  >
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -100 }}
        animate={{ y: window.innerHeight + 100 }}
        transition={{ 
          duration: 2 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
        className="absolute text-green-400 font-mono text-sm opacity-70"
        style={{ left: `${i * 5}%` }}
      >
        {[...Array(20)].map((_, j) => (
          <div key={j}>{String.fromCharCode(33 + Math.floor(Math.random() * 94))}</div>
        ))}
      </motion.div>
    ))}
  </motion.div>
);

const ShakeAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40"
  >
    <motion.div
      animate={{
        x: [-5, 5, -5, 5, 0],
        y: [-2, 2, -2, 2, 0],
      }}
      transition={{ duration: 0.5, repeat: 3 }}
      className="w-full h-full"
    />
  </motion.div>
);

const DanceAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
  >
    {["🕺", "💃", "🎵", "🎶"].map((emoji, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 0.5,
          repeat: 4,
          delay: i * 0.1,
        }}
        className="text-6xl mx-4"
      >
        {emoji}
      </motion.div>
    ))}
  </motion.div>
);

const BounceAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
  >
    {["🔊", "🎤", "🎧"].map((emoji, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ 
          duration: 0.3,
          repeat: 6,
          delay: i * 0.1,
        }}
        className="text-5xl mx-2"
      >
        {emoji}
      </motion.div>
    ))}
  </motion.div>
);

const WiggleAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
  >
    <motion.div
      animate={{
        rotate: [-5, 5, -5, 5, 0],
        scale: [1, 1.1, 1, 1.1, 1],
      }}
      transition={{ duration: 1, repeat: 2 }}
      className="text-8xl"
    >
      (◕‿◕)
    </motion.div>
  </motion.div>
);

const PartyAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 pointer-events-none z-40"
  >
    {/* Disco lights */}
    <motion.div
      animate={{
        background: [
          "radial-gradient(circle, rgba(255,0,0,0.1) 0%, transparent 70%)",
          "radial-gradient(circle, rgba(0,255,0,0.1) 0%, transparent 70%)",
          "radial-gradient(circle, rgba(0,0,255,0.1) 0%, transparent 70%)",
          "radial-gradient(circle, rgba(255,255,0,0.1) 0%, transparent 70%)",
        ],
      }}
      transition={{ duration: 1, repeat: 3 }}
      className="absolute inset-0"
    />
    {/* Party emojis */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          y: Math.random() * window.innerHeight,
          x: Math.random() * window.innerWidth,
          scale: 0,
        }}
        animate={{ 
          scale: [0, 1.5, 0],
          rotate: [0, 360],
        }}
        transition={{ 
          duration: 1,
          delay: Math.random() * 2,
        }}
        className="absolute text-3xl"
      >
        {["🎉", "🎊", "🥳", "🪩", "🎈", "✨"][Math.floor(Math.random() * 6)]}
      </motion.div>
    ))}
  </motion.div>
);
