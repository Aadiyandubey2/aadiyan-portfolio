import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatSettings, ChatStatus } from "../types";
import { ClementineSprite } from "./ClementineSprite";

interface MinimalChatHeaderProps {
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
      <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49Zm40-120a8 8 0 0 1 14-6 72 72 0 0 1 0 82 8 8 0 0 1-14-6 56 56 0 0 0 0-70Zm22-38a8 8 0 0 1 14-7 120 120 0 0 1 0 160 8 8 0 0 1-14-7 104 104 0 0 0 0-146Z" />
    ) : (
      <path d="M165 26a8 8 0 0 0-8 1l-70 59H40a16 16 0 0 0-16 16v52a16 16 0 0 0 16 16h47l70 59a8 8 0 0 0 5 2 8 8 0 0 0 8-8V32a8 8 0 0 0-5-6Zm-11 187-59-49a8 8 0 0 0-5-2H48v-52h42a8 8 0 0 0 5-2l59-49ZM227 93l-27 27 27 27a8 8 0 0 1-11 11l-27-27-27 27a8 8 0 0 1-11-11l27-27-27-27a8 8 0 0 1 11-11l27 27 27-27a8 8 0 0 1 11 11Z" />
    )}
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 16a48 48 0 0 0-48 48v64a48 48 0 0 0 96 0V64a48 48 0 0 0-48-48Zm32 112a32 32 0 0 1-64 0V64a32 32 0 0 1 64 0Zm40 0a8 8 0 0 1 16 0 88 88 0 0 1-80 88v24a8 8 0 0 1-16 0v-24a88 88 0 0 1-80-88 8 8 0 0 1 16 0 72 72 0 0 0 144 0Z" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 160H56V56h144Z" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M112 60a16 16 0 1 1 16 16 16 16 0 0 1-16-16Zm16 52a16 16 0 1 0 16 16 16 16 0 0 0-16-16Zm0 68a16 16 0 1 0 16 16 16 16 0 0 0-16-16Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16Zm-120-8a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M240 128v72a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-72a8 8 0 0 1 16 0v72h192v-72a8 8 0 0 1 16 0Zm-109 3 40-40a8 8 0 0 0-11-11l-32 32V24a8 8 0 0 0-16 0v88l-32-32a8 8 0 0 0-11 11l40 40a8 8 0 0 0 5 2 8 8 0 0 0 6-2Z" />
  </svg>
);

const StatusBadge = memo(({ status, language }: { status: ChatStatus; language: "en" | "hi" }) => {
  const config = {
    idle: { label: language === "hi" ? "ऑनलाइन" : "Online", className: "text-green-500" },
    listening: { label: language === "hi" ? "सुन रही" : "Listening", className: "text-blue-500" },
    thinking: { label: language === "hi" ? "सोच रही" : "Thinking", className: "text-amber-500" },
    speaking: { label: language === "hi" ? "बोल रही" : "Speaking", className: "text-primary" },
  }[status];

  return (
    <span className={`text-[10px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

export const MinimalChatHeader = memo(({
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
}: MinimalChatHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const isListening = status === "listening";
  const isSpeaking = status === "speaking";

  return (
    <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border/30 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-2.5">
          <ClementineSprite status={status} size="md" />
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Clementine</h3>
              <StatusBadge status={status} language={settings.language} />
            </div>
            <p className="text-[10px] text-muted-foreground">AI Assistant</p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {/* Language Toggle */}
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-md bg-muted/50 border border-border/30">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                settings.language === "en"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                settings.language === "hi"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हि
            </button>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-md transition-colors ${
              settings.voiceEnabled
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={settings.voiceEnabled ? "Voice on" : "Voice off"}
          >
            <VolumeIcon on={settings.voiceEnabled} />
          </button>

          {/* Mic Button */}
          <button
            onClick={onToggleListening}
            className={`p-2 rounded-md transition-colors ${
              isListening
                ? "bg-blue-500 text-white"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <MicIcon />
          </button>

          {/* Stop Speaking */}
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onStopSpeaking}
              className="p-2 rounded-md bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <StopIcon />
            </motion.button>
          )}

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <MoreIcon />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg overflow-hidden min-w-[130px]"
                  >
                    {/* Mobile language toggle */}
                    <div className="sm:hidden px-3 py-2 border-b border-border/50">
                      <p className="text-[10px] text-muted-foreground mb-1.5">Language</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { onLanguageChange("en"); setShowMenu(false); }}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            settings.language === "en" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => { onLanguageChange("hi"); setShowMenu(false); }}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            settings.language === "hi" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          हि
                        </button>
                      </div>
                    </div>

                    {messageCount > 0 && (
                      <>
                        <button
                          onClick={() => { onClearChat(); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <TrashIcon /> Clear chat
                        </button>
                        <button
                          onClick={() => { onExportChat(); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <DownloadIcon /> Export
                        </button>
                      </>
                    )}

                    {messageCount === 0 && (
                      <p className="px-3 py-2.5 text-xs text-muted-foreground">No messages</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-muted-foreground bg-blue-500/10 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="italic truncate">"{currentTranscript}"</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MinimalChatHeader.displayName = "MinimalChatHeader";
