import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, preloadCriticalAssets } from "./utils/serviceWorker";

// Preload critical assets immediately
preloadCriticalAssets();

// Register service worker after initial render
createRoot(document.getElementById("root")!).render(<App />);

// Register service worker in production
registerServiceWorker();
