import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Artifact } from "../types";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-42 138a8 8 0 0 1-11 11L128 154l-27 27a8 8 0 0 1-11-11l27-27-27-27a8 8 0 0 1 11-11l27 27 27-27a8 8 0 0 1 11 11l-27 27Z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M184 64H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8Zm-8 144H48V80h128Zm40-176v144a8 8 0 0 1-16 0V40H72a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M240 128v72a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-72a8 8 0 0 1 16 0v72h192v-72a8 8 0 0 1 16 0Zm-109 3 40-40a8 8 0 0 0-11-11l-32 32V24a8 8 0 0 0-16 0v88l-32-32a8 8 0 0 0-11 11l40 40a8 8 0 0 0 5 2 8 8 0 0 0 6-2Z" />
  </svg>
);

const ArtifactView = memo(({ artifact }: { artifact: Artifact }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (artifact.type === "image") {
      const a = document.createElement("a");
      a.href = artifact.content;
      a.download = `${artifact.title || "image"}.png`;
      a.click();
    } else {
      const ext = artifact.language || "txt";
      const blob = new Blob([artifact.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artifact.title || "artifact"}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (artifact.type === "image") {
    return (
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden border border-border bg-black/20">
          <img
            src={artifact.content}
            alt={artifact.title}
            className="w-full h-auto max-h-[60vh] object-contain"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={handleDownload} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 text-muted-foreground">
            <DownloadIcon /> Download
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Code header */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-muted/80 border border-border border-b-0">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {artifact.language || artifact.type}
        </span>
        <div className="flex gap-1">
          <button onClick={handleCopy} className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors">
            <CopyIcon />
          </button>
          <button onClick={handleDownload} className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors">
            <DownloadIcon />
          </button>
        </div>
      </div>
      {/* Code content */}
      <pre className="px-3 py-3 rounded-b-lg bg-muted/50 border border-border border-t-0 overflow-x-auto text-xs font-mono leading-relaxed text-foreground/90 max-h-[60vh]">
        <code>{artifact.content}</code>
      </pre>
      {copied && <span className="text-[10px] text-green-500">Copied!</span>}
    </div>
  );
});

ArtifactView.displayName = "ArtifactView";

export const ArtifactsPanel = memo(({ artifacts, isOpen, onClose }: ArtifactsPanelProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (artifacts.length === 0) return null;

  const activeArtifact = artifacts[Math.min(activeIndex, artifacts.length - 1)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="border-l border-border bg-background/95 backdrop-blur-sm overflow-hidden flex flex-col max-w-lg"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h4 className="text-xs font-semibold">Artifacts</h4>
              <span className="text-[10px] text-muted-foreground">({artifacts.length})</span>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <CloseIcon />
            </button>
          </div>

          {/* Tab bar for multiple artifacts */}
          {artifacts.length > 1 && (
            <div className="flex gap-0.5 px-2 py-1.5 border-b border-border/50 overflow-x-auto">
              {artifacts.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setActiveIndex(i)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    i === activeIndex
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {a.title || `Artifact ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeArtifact && (
              <div>
                <h3 className="text-sm font-semibold mb-3">{activeArtifact.title}</h3>
                <ArtifactView artifact={activeArtifact} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ArtifactsPanel.displayName = "ArtifactsPanel";
