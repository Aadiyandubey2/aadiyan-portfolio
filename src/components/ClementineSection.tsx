import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Types and constants
import { Message, ChatSettings, ChatStatus } from "./clementine/types";
import { SUGGESTED_QUESTIONS_EN, SUGGESTED_QUESTIONS_HI } from "./clementine/constants";

// Hooks
import { useSpeechRecognition } from "./clementine/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./clementine/hooks/useSpeechSynthesis";
import { useChatApi } from "./clementine/hooks/useChatApi";

// Components
import { ChatHeader } from "./clementine/components/ChatHeader";
import { MessageBubble } from "./clementine/components/MessageBubble";
import { ChatInput } from "./clementine/components/ChatInput";
import { EmptyState } from "./clementine/components/EmptyState";

const ClementineSection = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    voiceEnabled: false,
    language: "en",
    autoScroll: true,
    showTimestamps: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>("");

  // Hooks
  const { streamChat, parseStream } = useChatApi();
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis({
    language: settings.language,
  });

  const handleVoiceMessage = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleSend(transcript);
    }
  }, []);

  const { isListening, currentTranscript, toggleListening } = useSpeechRecognition({
    language: settings.language,
    onFinalTranscript: handleVoiceMessage,
  });

  // Derived state
  const status: ChatStatus = isListening
    ? "listening"
    : isProcessing
      ? "thinking"
      : isSpeaking
        ? "speaking"
        : "idle";

  const suggestedQuestions =
    settings.language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll && messagesScrollRef.current) {
      requestAnimationFrame(() => {
        messagesScrollRef.current!.scrollTop = messagesScrollRef.current!.scrollHeight;
      });
    }
  }, [settings.autoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handlers
  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    lastUserMessageRef.current = text;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      },
    ]);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await streamChat(apiMessages, settings.language);

      const fullContent = await parseStream(response, (content) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content, isTyping: true } : m
          )
        );
      });

      // Mark typing as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fullContent, isTyping: false } : m
        )
      );

      // Speak if voice is enabled
      if (settings.voiceEnabled && fullContent) {
        speak(fullContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Oops! I encountered an error. Please try again!", isTyping: false }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = () => {
    if (lastUserMessageRef.current && !isProcessing) {
      // Remove last assistant message
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessageRef.current);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    lastUserMessageRef.current = "";
    toast.success("Chat cleared");
  };

  const handleExportChat = () => {
    const exportData = messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clementine-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  };

  const toggleVoice = () => {
    setSettings((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
    toast.success(settings.voiceEnabled ? "Voice replies disabled" : "Voice replies enabled");
  };

  const handleLanguageChange = (lang: "en" | "hi") => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  // Find last assistant message index
  const lastAssistantIndex = messages.reduce(
    (acc, msg, idx) => (msg.role === "assistant" ? idx : acc),
    -1
  );

  return (
    <section
      id="clementine"
      className="py-12 sm:py-16 px-4 bg-gradient-to-b from-background via-muted/10 to-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/15 backdrop-blur-md text-primary text-[10px] sm:text-xs font-mono mb-4">
            AI Assistant
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2 text-foreground">
            <span>Meet</span> <span className="text-primary">Clementine</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm px-2">
            {settings.language === "hi"
              ? "मेरी AI assistant जो text और voice chat दोनों support करती है"
              : "My AI assistant with text and optional voice chat support"}
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-xl bg-background/80 backdrop-blur-sm">
            {/* Header */}
            <ChatHeader
              status={status}
              settings={settings}
              onToggleVoice={toggleVoice}
              onToggleListening={toggleListening}
              onStopSpeaking={stopSpeaking}
              onClearChat={handleClearChat}
              onExportChat={handleExportChat}
              onLanguageChange={handleLanguageChange}
              messageCount={messages.length}
              currentTranscript={currentTranscript}
            />

            {/* Messages */}
            <div
              ref={messagesScrollRef}
              className="min-h-[300px] sm:min-h-[400px] max-h-[400px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3"
            >
              {messages.length === 0 ? (
                <EmptyState
                  language={settings.language}
                  suggestedQuestions={suggestedQuestions}
                  onSelectQuestion={handleSend}
                  disabled={isProcessing}
                />
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showTimestamp={settings.showTimestamps}
                    onSpeak={speak}
                    onRegenerate={handleRegenerate}
                    isLatestAssistant={index === lastAssistantIndex}
                    voiceEnabled={settings.voiceEnabled}
                  />
                ))
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSend={handleSend}
              disabled={isProcessing}
              language={settings.language}
              suggestedQuestions={suggestedQuestions}
              showSuggestions={messages.length > 0 && messages.length < 4}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClementineSection;
