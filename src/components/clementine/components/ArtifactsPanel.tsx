import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Artifact } from "../types";
import ReactMarkdown from "react-markdown";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  isOpen: boolean;
  onClose: () => void;
}

/* ===== ICONS ===== */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
    <path d="M205 51a8 8 0 0 1 0 11L139 128l66 66a8 8 0 0 1-11 11l-66-66-66 66a8 8 0 0 1-11-11l66-66-66-66a8 8 0 0 1 11-11l66 66 66-66a8 8 0 0 1 11 0Z" />
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

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M168 48v160a8 8 0 0 1-13 6l-80-80a8 8 0 0 1 0-12l80-80a8 8 0 0 1 13 6Z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M88 48v160a8 8 0 0 0 13 6l80-80a8 8 0 0 0 0-12l-80-80a8 8 0 0 0-13 6Z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216 48v48a8 8 0 0 1-16 0V67.3l-58.3 58.4a8 8 0 0 1-11.4-11.4L188.7 56H160a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8ZM98.3 141.7 40 200v-40a8 8 0 0 0-16 0v48a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16H51.3l58.4-58.3a8 8 0 0 0-11.4-11.4Z" />
  </svg>
);

/* ===== SLIDE VIEWER ===== */
const SlideViewer = memo(({ content }: { content: string }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse markdown slides separated by ---
  const slides = content.split(/\n---\n/).map((s) => s.trim()).filter(Boolean);
  const totalSlides = slides.length;

  const prev = () => setCurrentSlide((c) => Math.max(0, c - 1));
  const next = () => setCurrentSlide((c) => Math.min(totalSlides - 1, c + 1));

  if (totalSlides === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Slide viewport */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-2xl aspect-[16/9] bg-card rounded-xl border border-border shadow-lg p-6 sm:p-10 overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none
            prose-headings:font-heading prose-headings:text-foreground
            prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-0
            prose-h3:text-lg prose-h3:mb-3
            prose-p:text-sm prose-p:leading-relaxed
            prose-li:text-sm prose-li:leading-relaxed
            prose-ul:my-2 prose-ol:my-2
            prose-strong:text-foreground">
            <ReactMarkdown>{slides[currentSlide]}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Slide navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background/80">
        <button
          onClick={prev}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon />
        </button>

        {/* Slide indicators */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {currentSlide + 1} / {totalSlides}
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={next}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
});
SlideViewer.displayName = "SlideViewer";

/* ===== CODE VIEWER ===== */
const CodeViewer = memo(({ content, language }: { content: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Code header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          {language || "code"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] 
              text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <CopyIcon />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto p-4 bg-muted/20">
        <pre className="text-xs sm:text-sm font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
});
CodeViewer.displayName = "CodeViewer";

/* ===== IMAGE VIEWER ===== */
const ImageViewer = memo(({ content, title }: { content: string; title: string }) => {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = content;
    a.download = `${title || "image"}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/10">
        <img
          src={content}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      <div className="flex items-center justify-end px-4 py-2 border-t border-border">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
            text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <DownloadIcon /> Download
        </button>
      </div>
    </div>
  );
});
ImageViewer.displayName = "ImageViewer";

/* ===== MAIN CANVAS PANEL ===== */
export const ArtifactsPanel = memo(({ artifacts, isOpen, onClose }: ArtifactsPanelProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = useCallback(() => {
    const artifact = artifacts[activeIndex];
    if (!artifact) return;
    if (artifact.type === "image") {
      const a = document.createElement("a");
      a.href = artifact.content;
      a.download = `${artifact.title}.png`;
      a.click();
    } else {
      const ext = artifact.language || "txt";
      const blob = new Blob([artifact.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artifact.title}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [artifacts, activeIndex]);

  if (artifacts.length === 0) return null;

  const safeIndex = Math.min(activeIndex, artifacts.length - 1);
  const activeArtifact = artifacts[safeIndex];

  const renderContent = () => {
    if (!activeArtifact) return null;

    switch (activeArtifact.type) {
      case "document":
        return <SlideViewer content={activeArtifact.content} />;
      case "image":
        return <ImageViewer content={activeArtifact.content} title={activeArtifact.title} />;
      case "code":
      default:
        return <CodeViewer content={activeArtifact.content} language={activeArtifact.language} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Canvas panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`
              fixed z-50 bg-background border-l border-border shadow-2xl
              flex flex-col
              ${isFullscreen
                ? "inset-0"
                : "top-0 right-0 bottom-0 w-full sm:w-[420px] lg:w-[500px] xl:w-[560px]"
              }
            `}
          >
            {/* Canvas header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Canvas indicator */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Canvas
                  </span>
                </div>

                {/* Artifact title */}
                {activeArtifact && (
                  <span className="text-xs font-medium text-foreground/80 truncate">
                    {activeArtifact.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Download"
                >
                  <DownloadIcon />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:flex"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  <FullscreenIcon />
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Tab bar when multiple artifacts */}
            {artifacts.length > 1 && (
              <div className="flex gap-0.5 px-3 py-1.5 border-b border-border/50 overflow-x-auto flex-shrink-0 bg-background">
                {artifacts.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveIndex(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                      i === safeIndex
                        ? "bg-primary/10 text-primary border border-primary/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {a.type === "document" ? "Slides" : a.type === "image" ? "Image" : a.language || "Code"}
                    {artifacts.length > 3 ? "" : ` - ${a.title}`}
                  </button>
                ))}
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

ArtifactsPanel.displayName = "ArtifactsPanel";
