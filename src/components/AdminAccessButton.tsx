import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AdminAccessButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/admin")}
      className="fixed bottom-6 left-6 z-50 group"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-50 blur-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Button container */}
      <div className="relative px-4 py-2 rounded-full glass-card border border-primary/30 overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-white/5"
          animate={{ x: ["-20%", "20%", "-20%"] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Text with typing effect */}
        <span className="relative font-mono text-xs sm:text-sm font-bold">
          <motion.span
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            isyouaadi
          </motion.span>
        </span>

        {/* Sparkle effects */}
        <motion.div
          className="absolute top-0 right-1 w-1 h-1 rounded-full bg-primary"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-secondary"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1 left-1/2 w-0.5 h-0.5 rounded-full bg-accent"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </div>
    </motion.button>
  );
};

export default AdminAccessButton;
