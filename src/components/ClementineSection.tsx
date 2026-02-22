import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Types and constants
import { Message, Artifact, ChatSettings, ChatStatus } from "./clementine/types";
import { SUGGESTED_QUESTIONS_EN, SUGGESTED_QUESTIONS_HI } from "./clementine/constants";
import { useLanguage } from "@/contexts/LanguageContext";

// Hooks
import { useSpeechRecognition } from "./clementine/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./clementine/hooks/useSpeechSynthesis";
import { useChatApi } from "./clementine/hooks/useChatApi";
import { useSuggestions } from "./clementine/hooks/useSuggestions";

// Components
import { MinimalChatHeader } from "./clementine/components/MinimalChatHeader";
import { MessageCard } from "./clementine/components/MessageCard";
import { ChatInput } from "./clementine/components/ChatInput";
import { MinimalEmptyState } from "./clementine/components/MinimalEmptyState";
import { DynamicSuggestions } from "./clementine/components/DynamicSuggestions";
import { ArtifactsPanel } from "./clementine/components/ArtifactsPanel";

const ClementineSection = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    voiceEnabled: false,
    language: "en",
    autoScroll: true,
    showTimestamps: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(-1);
  const [allArtifacts, setAllArtifacts] = useState<Artifact[]>([]);
  const [artifactsPanelOpen, setArtifactsPanelOpen] = useState(false);

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>("");

  const { streamChat, parseStream } = useChatApi();
  const { suggestions, isLoading: suggestionsLoading, fetchSuggestions } = useSuggestions();
  const { isSpeaking, currentWordIndex, speak, stop: stopSpeaking } = useSpeechSynthesis({ language: settings.language });

  const handleVoiceMessage = useCallback((transcript: string) => {
    if (transcript.trim()) handleSend(transcript);
  }, []);

  const { isListening, currentTranscript, toggleListening } = useSpeechRecognition({
    language: settings.language,
    onFinalTranscript: handleVoiceMessage,
  });

  const status: ChatStatus = isListening ? "listening" : isProcessing ? "thinking" : isSpeaking ? "speaking" : "idle";
  const suggestedQuestions = settings.language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll && messagesScrollRef.current) {
      requestAnimationFrame(() => {
        messagesScrollRef.current!.scrollTop = messagesScrollRef.current!.scrollHeight;
      });
    }
  }, [settings.autoScroll]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { setCurrentSpeakingIndex(currentWordIndex); }, [currentWordIndex]);
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
      setCurrentSpeakingIndex(-1);
    }
  }, [isSpeaking]);

  // Detect image generation intent
  const isImageGenRequest = (text: string) => {
    return /^(generate|create|draw|make|design)\s+(an?\s+)?(image|picture|photo|illustration|art)/i.test(text.trim());
  };

  // Parse thinking and artifacts from AI response
  const parseResponse = (content: string) => {
    let thinking = "";
    let cleanContent = content;
    const artifacts: Artifact[] = [];

    // Extract <think> blocks
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      cleanContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }

    // Extract code blocks as artifacts
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let artifactIndex = 0;
    while ((match = codeBlockRegex.exec(cleanContent)) !== null) {
      const lang = match[1] || "text";
      const code = match[2].trim();
      if (code.length > 100) { // Only make artifacts from substantial code blocks
        artifacts.push({
          id: `artifact-${Date.now()}-${artifactIndex++}`,
          type: "code",
          title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Code`,
          content: code,
          language: lang,
        });
      }
    }

    return { thinking, cleanContent, artifacts };
  };

  const handleSend = async (text: string, images?: string[]) => {
    if ((!text.trim() && (!images || images.length === 0)) || isProcessing) return;
    lastUserMessageRef.current = text;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
      images: images?.map((url) => ({ url })),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    const assistantId = (Date.now() + 1).toString();
    const isImgGen = isImageGenRequest(text);

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
        thinking: isImgGen ? "" : undefined,
      },
    ]);

    try {
      if (isImgGen) {
        // Image generation mode
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, thinking: "Generating image based on your prompt...", isThinkingComplete: false } : m
          )
        );

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
            language: settings.language,
            mode: "image-gen",
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Image generation failed");
        }

        const data = await response.json();
        const generatedImages = data.images?.map((url: string) => ({ url, alt: text })) || [];
        const imageArtifacts: Artifact[] = generatedImages.map((img: { url: string }, i: number) => ({
          id: `img-${Date.now()}-${i}`,
          type: "image" as const,
          title: `Generated Image ${i + 1}`,
          content: img.url,
        }));

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: data.text || (settings.language === "hi" ? "यहाँ आपकी जनरेट की गई इमेज है!" : "Here's your generated image!"),
                  images: generatedImages,
                  artifacts: imageArtifacts,
                  isTyping: false,
                  thinking: "Generated image using AI model",
                  isThinkingComplete: true,
                }
              : m
          )
        );

        if (imageArtifacts.length > 0) {
          setAllArtifacts((prev) => [...prev, ...imageArtifacts]);
        }
      } else {
        // Regular chat mode (with optional image context)
        const apiMessages = [...messages, userMessage].map((m) => {
          if (m.images && m.images.length > 0) {
            return {
              role: m.role,
              content: m.content,
              images: m.images.map((img) => img.url),
            };
          }
          return { role: m.role, content: m.content };
        });

        const response = await streamChat(apiMessages, settings.language);
        const fullContent = await parseStream(response, (content) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content, isTyping: true } : m))
          );
        });

        // Parse response for thinking and artifacts
        const { thinking, cleanContent, artifacts } = parseResponse(fullContent);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: cleanContent || fullContent,
                  isTyping: false,
                  thinking: thinking || undefined,
                  isThinkingComplete: true,
                  artifacts: artifacts.length > 0 ? artifacts : undefined,
                }
              : m
          )
        );

        if (artifacts.length > 0) {
          setAllArtifacts((prev) => [...prev, ...artifacts]);
        }

        const updatedMessages = [
          ...messages,
          userMessage,
          { id: assistantId, role: "assistant" as const, content: cleanContent || fullContent, timestamp: new Date() },
        ];
        fetchSuggestions(updatedMessages, settings.language);

        if (settings.voiceEnabled && (cleanContent || fullContent)) {
          setSpeakingMessageId(assistantId);
          speak(cleanContent || fullContent, (charIndex) => setCurrentSpeakingIndex(charIndex));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: t("chat.error_response"), isTyping: false } : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeak = (text: string, messageId?: string) => {
    if (messageId) setSpeakingMessageId(messageId);
    speak(text, (charIndex) => setCurrentSpeakingIndex(charIndex));
  };

  const handleRegenerate = () => {
    if (lastUserMessageRef.current && !isProcessing) {
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessageRef.current);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setAllArtifacts([]);
    lastUserMessageRef.current = "";
    stopSpeaking();
    setArtifactsPanelOpen(false);
    toast.success(t("chat.cleared"));
  };

  const handleExportChat = () => {
    const exportData = messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clementine-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("chat.exported"));
  };

  const toggleVoice = () => {
    const newState = !settings.voiceEnabled;
    setSettings((prev) => ({ ...prev, voiceEnabled: newState }));
    if (!newState) stopSpeaking();
    toast.success(newState ? t("chat.voice_enabled") : t("chat.voice_disabled"));
  };

  const handleLanguageChange = (lang: "en" | "hi") => {
    setSettings((prev) => ({ ...prev, language: lang }));
    stopSpeaking();
  };

  const handleOpenArtifact = (artifactId: string) => {
    setArtifactsPanelOpen(true);
    // Scroll to artifact if needed
  };

  const lastAssistantIndex = messages.reduce((acc, msg, idx) => (msg.role === "assistant" ? idx : acc), -1);

  return (
    <section id="clementine" className="py-12 sm:py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-7xl mb-2 font-heading font-bold">
            {t("clementine.title")} <span className="text-primary">Clementine</span>
          </h2>
          <p className="text-muted-foreground text-sm">{t("clementine.subtitle_en")}</p>
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {[
              { icon: "🖼️", label: "Image Upload" },
              { icon: "✨", label: "AI Image Gen" },
              { icon: "🧠", label: "Thinking" },
              { icon: "📋", label: "Artifacts" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Chat Interface with Artifacts Panel */}
        <div className="w-full flex gap-0">
          {/* Main Chat */}
          <div className={`flex-1 transition-all duration-300 ${artifactsPanelOpen ? "max-w-[60%]" : "max-w-3xl mx-auto"}`}>
            <div className="rounded-2xl overflow-hidden border border-border shadow-xl bg-background/95 backdrop-blur-sm">
              <MinimalChatHeader
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

              <div
                ref={messagesScrollRef}
                className={`${
                  messages.length === 0 ? "" : "min-h-[300px] sm:min-h-[400px] max-h-[400px] sm:max-h-[500px] overflow-y-auto"
                } p-4 space-y-4 bg-muted/30`}
              >
                {messages.length === 0 ? (
                  <MinimalEmptyState
                    language={settings.language}
                    suggestedQuestions={suggestedQuestions}
                    onSelectQuestion={handleSend}
                    disabled={isProcessing}
                  />
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageCard
                        key={message.id}
                        message={message}
                        showTimestamp={settings.showTimestamps}
                        onSpeak={(text) => handleSpeak(text, message.id)}
                        onRegenerate={handleRegenerate}
                        isLatestAssistant={index === lastAssistantIndex}
                        voiceEnabled={settings.voiceEnabled}
                        currentSpeakingIndex={speakingMessageId === message.id ? currentSpeakingIndex : -1}
                        status={speakingMessageId === message.id ? status : "idle"}
                        onOpenArtifact={handleOpenArtifact}
                      />
                    ))}

                    {messages.length >= 2 && !isProcessing && (
                      <DynamicSuggestions
                        suggestions={suggestions}
                        isLoading={suggestionsLoading}
                        language={settings.language}
                        onSelect={handleSend}
                        disabled={isProcessing}
                      />
                    )}
                  </>
                )}
              </div>

              <ChatInput onSend={handleSend} disabled={isProcessing} language={settings.language} />
            </div>
          </div>

          {/* Artifacts Panel */}
          <ArtifactsPanel
            artifacts={allArtifacts}
            isOpen={artifactsPanelOpen}
            onClose={() => setArtifactsPanelOpen(false)}
          />
        </div>
      </div>
    </section>
  );
};

export default ClementineSection;
