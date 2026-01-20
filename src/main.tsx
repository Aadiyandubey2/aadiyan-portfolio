import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fonts are now preloaded in index.html for optimal LCP
createRoot(document.getElementById("root")!).render(<App />);
