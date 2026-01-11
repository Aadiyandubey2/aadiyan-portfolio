import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Load fonts asynchronously to improve LCP
const loadFonts = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
};

// Load fonts after initial render
if (document.readyState === 'complete') {
  loadFonts();
} else {
  window.addEventListener('load', loadFonts);
}

createRoot(document.getElementById("root")!).render(<App />);
