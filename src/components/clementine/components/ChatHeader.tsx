import { motion, AnimatePresence } from "framer-motion";
import clementineAvatar from "@/assets/clementine-avatar.png";
import { ChatSettings, ChatStatus } from "../types";
import { useState } from "react";

interface ChatHeaderProps {
  status: ChatStatus;
  settings: ChatSettings;
  onToggleVoice: () => void;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onLanguageChange: (lang: "en" | "hi") => void;
  messageCount: number;
  currentTranscript: string;
}

/* ===== INLINE SVG ICONS ===== */
const VolumeIcon = ({ on }: { on: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    {on ? (
      <>
        <path d="M160 32v192L88 160H40a8 8 0 0 1-8-8V104a8 8 0 0 1 8-8h48Z" opacity="0.25" />
        <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49Zm40-120a8 8 0 0 1 14-6 72 72 0 0 1 0 82 8 8 0 0 1-14-6 56 56 0 0 0 0-70Zm22-38a8 8 0 0 1 14-7 120 120 0 0 1 0 160 8 8 0 0 1-14-7 104 104 0 0 0 0-146Z" />
      </>
    ) : (
      <>
        <path d="M160 32v192L88 160H40a8 8 0 0 1-8-8V104a8 8 0 0 1 8-8h48Z" opacity="0.25" />
        <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49ZM227 93l-27 27 27 27a8 8 0 0 1-11 11l-27-27-27 27a8 8 0 0 1-11-11l27-27-27-27a8 8 0 0 1 11-11l27 27 27-27a8 8 0 0 1 11 11Z" />
      </>
    )}
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M168 64v64a40 40 0 0 1-80 0V64a40 40 0 0 1 80 0Z" opacity="0.25" />
    <path d="M128 16a48 48 0 0 0-48 48v64a48 48 0 0 0 96 0V64a48 48 0 0 0-48-48Zm32 112a32 32 0 0 1-64 0V64a32 32 0 0 1 64 0Zm40 0a8 8 0 0 1 16 0 88 88 0 0 1-80 88v24a8 8 0 0 1-16 0v-24a88 88 0 0 1-80-88 8 8 0 0 1 16 0 72 72 0 0 0 144 0Z" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <rect x="48" y="48" width="160" height="160" rx="8" opacity="0.25" />
    <path d="M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 160H56V56h144Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M200 56v152a8 8 0 0 1-8 8H64a8 8 0 0 1-8-8V56Z" opacity="0.25" />
    <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16Zm-120-8a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M232 136v64a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8v-64Z" opacity="0.25" />
    <path d="M240 128v72a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-72a8 8 0 0 1 16 0v72h192v-72a8 8 0 0 1 16 0Zm-109 3 40-40a8 8 0 0 0-11-11l-32 32V24a8 8 0 0 0-16 0v88l-32-32a8 8 0 0 0-11 11l40 40a8 8 0 0 0 5 2 8 8 0 0 0 6-2Z" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <circle cx="128" cy="128" r="96" opacity="0.25" />
    <path d="M128 24a104 104 0 1 0 104 104A104 104 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88 88 0 0 1-88 88Zm-28-88a12 12 0 1 1-12-12 12 12 0 0 1 12 12Zm40 0a12 12 0 1 1-12-12 12 12 0 0 1 12 12Zm40 0a12 12 0 1 1-12-12 12 12 0 0 1 12 12Z" />
  </svg>
);

/* ===== COMPONENTS ===== */

const AudioVisualizer = ({ isActive, isListening }: { isActive: boolean; isListening: boolean }) => (
  <div className="flex items-center justify-center gap-0.5 h-5">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-0.5 rounded-full ${isListening ? "bg-green-400" : "bg-primary"}`}
        animate={
          isActive
            ? { height: [3, 10 + Math.random() * 6, 3], opacity: [0.5, 1, 0.5] }
            : { height: 3, opacity: 0.3 }
        }
        transition={{
          duration: 0.2 + Math.random() * 0.1,
          repeat: isActive ? Infinity : 0,
          delay: i * 0.03,
        }}
      />
    ))}
  </div>
);

const SpeakingIndicator = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <AnimatePresence>
    {isSpeaking && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {[1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ scale: [1, 1.15 + ring * 0.05], opacity: [0.4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: ring * 0.15 }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const StatusBadge = ({ status, language }: { status: ChatStatus; language: "en" | "hi" }) => {
  const statusConfig = {
    idle: { label: language === "hi" ? "ऑनलाइन" : "Online", color: "bg-green-500/20 text-green-400" },
    listening: { label: language === "hi" ? "सुन रही" : "Listening", color: "bg-blue-500/20 text-blue-400" },
    thinking: { label: language === "hi" ? "सोच रही" : "Thinking", color: "bg-yellow-500/20 text-yellow-400" },
    speaking: { label: language === "hi" ? "बोल रही" : "Speaking", color: "bg-primary/20 text-primary" },
  };

  const config = statusConfig[status];

  return (
    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export const ChatHeader = ({
  status,
  settings,
  onToggleVoice,
  onToggleListening,
  onStopSpeaking,
  onClearChat,
  onExportChat,
  onLanguageChange,
  messageCount,
  currentTranscript,
}: ChatHeaderProps) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const isListening = status === "listening";
  const isSpeaking = status === "speaking";

  return (
    <div className="p-2.5 sm:p-4 border-b border-border/50 bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        {/* Avatar & Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <SpeakingIndicator isSpeaking={isSpeaking} />
            <motion.div
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg"
              animate={isSpeaking ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
            >
              <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                isListening ? "bg-blue-500" : isSpeaking ? "bg-primary" : "bg-green-500"
              }`}
              animate={isListening || isSpeaking ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4, repeat: isListening || isSpeaking ? Infinity : 0 }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-heading font-bold text-sm sm:text-base">Clementine</h3>
              <StatusBadge status={status} language={settings.language} />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="hidden xs:inline">AI Assistant</span>
              {messageCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-muted/60">{messageCount} msgs</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Toggle - Always visible */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/40">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all ${
                settings.language === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all ${
                settings.language === "hi"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हि
            </button>
          </div>

          {/* Voice Toggle */}
          <motion.button
            onClick={onToggleVoice}
            whileTap={{ scale: 0.95 }}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              settings.voiceEnabled
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground border border-border/40 hover:text-foreground"
            }`}
            title={settings.voiceEnabled ? "Voice on" : "Voice off"}
          >
            <VolumeIcon on={settings.voiceEnabled} />
          </motion.button>

          {/* Audio Visualizer - Hidden on very small screens */}
          <div className="hidden sm:block">
            <AudioVisualizer isActive={isListening || isSpeaking} isListening={isListening} />
          </div>

          {/* Mic Button */}
          <motion.button
            onClick={onToggleListening}
            whileTap={{ scale: 0.95 }}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              isListening
                ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <MicIcon />
          </motion.button>

          {/* Stop Speaking */}
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onStopSpeaking}
              className="p-1.5 sm:p-2 rounded-lg bg-muted border border-border hover:bg-destructive/20"
            >
              <StopIcon />
            </motion.button>
          )}

          {/* More Menu (Mobile) */}
          {messageCount > 0 && (
            <div className="relative sm:hidden">
              <motion.button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground border border-border/40"
              >
                <MoreIcon />
              </motion.button>
              
              <AnimatePresence>
                {showMobileMenu && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMobileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                      className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                    >
                      <button
                        onClick={() => { onClearChat(); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                      >
                        <TrashIcon /> Clear
                      </button>
                      <button
                        onClick={() => { onExportChat(); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <DownloadIcon /> Export
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Desktop Actions */}
          {messageCount > 0 && (
            <>
              <motion.button
                onClick={onClearChat}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-destructive border border-border/40"
                title="Clear"
              >
                <TrashIcon />
              </motion.button>
              <motion.button
                onClick={onExportChat}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground border border-border/40"
                title="Export"
              >
                <DownloadIcon />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="italic truncate">"{currentTranscript}"</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
