import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AdminFloatingButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/admin")}
      className="fixed bottom-6 left-6 z-50 group"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Soft glow ring (no gradient) */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Button container */}
      <div className="relative px-4 py-2 rounded-full glass-card border border-border overflow-hidden">
        {/* Subtle animated background */}
        <motion.div
          className="absolute inset-0 bg-muted"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Text */}
        <span className="relative font-mono text-xs sm:text-sm font-bold text-foreground tracking-wider">
          isyouaadi
        </span>

        {/* Subtle sparkles */}
        <motion.div
          className="absolute top-1 right-2 w-1 h-1 rounded-full bg-foreground/50"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1 left-3 w-0.5 h-0.5 rounded-full bg-foreground/40"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
      </div>
    </motion.button>
  );
};

export default AdminFloatingButton;
