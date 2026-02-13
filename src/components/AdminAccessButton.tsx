import { useNavigate } from "react-router-dom";

const AdminFloatingButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/admin")}
      className="fixed bottom-6 left-6 z-50 group"
    >
      {/* Soft glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse" />

      {/* Button container */}
      <div className="relative px-4 py-2 rounded-full glass-card border border-border overflow-hidden hover:scale-105 active:scale-95 transition-transform">
        <div className="absolute inset-0 bg-muted opacity-50" />
        <span className="relative font-mono text-xs sm:text-sm font-bold text-foreground tracking-wider">
          isyouaadi
        </span>
      </div>
    </button>
  );
};

export default AdminFloatingButton;
