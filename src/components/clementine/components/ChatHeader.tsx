import { motion, AnimatePresence } from "framer-motion";
import clementineAvatar from "@/assets/clementine-avatar.png";
import { ChatSettings, ChatStatus } from "../types";
import { Volume2, VolumeX, Mic, Square, Trash2, Download, Settings } from "lucide-react";

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

const AudioVisualizer = ({ isActive, isListening }: { isActive: boolean; isListening: boolean }) => (
  <div className="flex items-center justify-center gap-0.5 h-6">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-0.5 rounded-full ${isListening ? "bg-green-400" : "bg-primary"}`}
        animate={
          isActive
            ? { height: [3, 12 + Math.random() * 8, 3], opacity: [0.5, 1, 0.5] }
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
    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-normal ${config.color}`}>
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
  const isListening = status === "listening";
  const isSpeaking = status === "speaking";

  return (
    <div className="p-3 sm:p-4 border-b border-border/50 bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        {/* Avatar & Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <SpeakingIndicator isSpeaking={isSpeaking} />
            <motion.div
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg"
              animate={isSpeaking ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
            >
              <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-background ${
                isListening ? "bg-blue-500" : isSpeaking ? "bg-primary" : "bg-green-500"
              }`}
              animate={isListening || isSpeaking ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4, repeat: isListening || isSpeaking ? Infinity : 0 }}
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-heading font-bold text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
              <span>Clementine</span>
              <StatusBadge status={status} language={settings.language} />
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>AI Assistant</span>
              {messageCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-muted">{messageCount} messages</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Language Toggle */}
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/50">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                settings.language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                settings.language === "hi"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हि
            </button>
          </div>

          {/* Voice Toggle */}
          <motion.button
            onClick={onToggleVoice}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-all ${
              settings.voiceEnabled
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground"
            }`}
            title={settings.voiceEnabled ? "Voice replies on" : "Voice replies off"}
          >
            {settings.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          {/* Audio Visualizer */}
          <div className="hidden sm:block">
            <AudioVisualizer isActive={isListening || isSpeaking} isListening={isListening} />
          </div>

          {/* Mic Button */}
          <motion.button
            onClick={onToggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-all ${
              isListening
                ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                : "bg-primary text-primary-foreground hover:shadow-lg"
            }`}
          >
            <Mic className="w-4 h-4" />
          </motion.button>

          {/* Stop Speaking */}
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onStopSpeaking}
              className="p-2 rounded-lg bg-muted border border-border hover:bg-destructive/20"
            >
              <Square className="w-4 h-4" />
            </motion.button>
          )}

          {/* Clear Chat */}
          {messageCount > 0 && (
            <motion.button
              onClick={onClearChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-destructive border border-border/50"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}

          {/* Export */}
          {messageCount > 0 && (
            <motion.button
              onClick={onExportChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
              title="Export chat"
            >
              <Download className="w-4 h-4" />
            </motion.button>
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
            className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <Mic className="w-3 h-3 text-green-400" />
            <span className="italic">"{currentTranscript}"</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
