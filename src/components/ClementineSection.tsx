import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Message, Artifact, ChatSettings, ChatStatus } from "./clementine/types";
import { SUGGESTED_QUESTIONS_EN, SUGGESTED_QUESTIONS_HI } from "./clementine/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChatMode } from "./clementine/components/ChatInput";

import { useSpeechRecognition } from "./clementine/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./clementine/hooks/useSpeechSynthesis";
import { useChatApi } from "./clementine/hooks/useChatApi";
import { useSuggestions } from "./clementine/hooks/useSuggestions";

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

  const getModePrefix = (mode: ChatMode): string => {
    switch (mode) {
      case "code":
        return "[CODE MODE] The user wants you to write code. Provide well-structured, production-ready code with clear explanations. Always use markdown code blocks with language tags (```tsx, ```python, etc). Write complete, working code.\n\n";
      case "image":
        return "[IMAGE GENERATION MODE] Generate an image based on the user's description.\n\n";
      case "slides":
        return `[SLIDES MODE] Create a professional presentation. IMPORTANT FORMATTING RULES:
- Separate each slide with a line containing only "---"
- Start each slide with ## for the title
- Use bullet points for content
- Include 5-8 slides minimum
- Include a title slide first and a summary/thank you slide last
- Make content concise and presentation-ready
- Use ### for subtitles within slides

Example format:
## Presentation Title
### Subtitle or tagline

---

## Introduction
- Key point 1
- Key point 2

---

## Topic Details
- Detail A
- Detail B
- Detail C

---

## Thank You
- Questions?
- Contact info

`;
      case "search":
        return "[SEARCH MODE] Provide well-researched, factual, structured answers. Use headings, bullet points, and clear organization.\n\n";
      default:
        return "";
    }
  };

  const parseResponse = (content: string) => {
    let thinking = "";
    let cleanContent = content;
    const artifacts: Artifact[] = [];

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
      if (code.length > 80) {
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

  // Detect if response is a slide deck
  const isSlideContent = (content: string) => {
    const hasSeparators = (content.match(/\n---\n/g) || []).length >= 1;
    const hasHeadings = /^##\s/m.test(content);
    return hasSeparators && hasHeadings;
  };

  const handleSend = async (text: string, images?: string[], mode: ChatMode = "chat") => {
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

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isTyping: true },
    ]);

    try {
      if (mode === "image") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, thinking: "Generating image from your description...", isThinkingComplete: false }
              : m
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
                  content: data.text || "Here is your generated image.",
                  images: generatedImages,
                  artifacts: imageArtifacts,
                  isTyping: false,
                  thinking: "Image generated successfully.",
                  isThinkingComplete: true,
                }
              : m
          )
        );

        if (imageArtifacts.length > 0) {
          setAllArtifacts((prev) => [...prev, ...imageArtifacts]);
          setArtifactsPanelOpen(true);
        }
      } else {
        const modePrefix = getModePrefix(mode);
        const apiMessages = [...messages, userMessage].map((m) => {
          const baseMsg: { role: string; content: string; images?: string[] } = { role: m.role, content: m.content };
          if (m.images && m.images.length > 0) baseMsg.images = m.images.map((img) => img.url);
          return baseMsg;
        });

        if (modePrefix && apiMessages.length > 0) {
          const lastMsg = apiMessages[apiMessages.length - 1];
          lastMsg.content = modePrefix + lastMsg.content;
        }

        const response = await streamChat(apiMessages, settings.language);
        const fullContent = await parseStream(response, (content) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content, isTyping: true } : m))
          );
        });

        const { thinking, cleanContent, artifacts } = parseResponse(fullContent);

        // Check if the response is a slide deck
        const finalContent = cleanContent || fullContent;
        if (mode === "slides" || isSlideContent(finalContent)) {
          const slideArtifact: Artifact = {
            id: `slides-${Date.now()}`,
            type: "document",
            title: "Presentation",
            content: finalContent,
          };
          artifacts.push(slideArtifact);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: finalContent,
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
          // Auto-open canvas for code, slides, and images
          if (mode === "slides" || mode === "code" || artifacts.some((a) => a.type === "code" && a.content.length > 200)) {
            setArtifactsPanelOpen(true);
          }
        }

        const updatedMessages = [
          ...messages,
          userMessage,
          { id: assistantId, role: "assistant" as const, content: finalContent, timestamp: new Date() },
        ];
        fetchSuggestions(updatedMessages, settings.language);

        if (settings.voiceEnabled && finalContent) {
          setSpeakingMessageId(assistantId);
          speak(finalContent, (charIndex) => setCurrentSpeakingIndex(charIndex));
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

  const handleOpenArtifact = () => {
    setArtifactsPanelOpen(true);
  };

  const lastAssistantIndex = messages.reduce((acc, msg, idx) => (msg.role === "assistant" ? idx : acc), -1);

  return (
    <section id="clementine" className="py-12 sm:py-16 px-3 sm:px-4 bg-background">
      <div className={`mx-auto transition-all duration-300 ${artifactsPanelOpen ? "max-w-6xl" : "max-w-3xl"}`}>
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-5xl lg:text-7xl mb-2 font-heading font-bold">
            {t("clementine.title")} <span className="text-primary">Clementine</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
            {settings.language === "hi"
              ? "AI असिस्टेंट — चैट, कोड, इमेज, स्लाइड, खोज"
              : "AI assistant — chat, code, image, slides, search"}
          </p>
        </div>

        {/* Chat + Canvas Layout */}
        <div className={`flex rounded-2xl overflow-hidden border border-border shadow-lg bg-background/95 backdrop-blur-sm ${artifactsPanelOpen ? "flex-col sm:flex-row" : ""}`}>
          {/* Chat side */}
          <div className={`flex flex-col min-w-0 transition-all duration-300 ${artifactsPanelOpen ? "sm:w-1/2 sm:border-r sm:border-border" : "w-full"} ${artifactsPanelOpen ? "hidden sm:flex" : "flex"}`}>
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
                messages.length === 0 ? "" : "min-h-[200px] sm:min-h-[300px] max-h-[300px] sm:max-h-[400px] overflow-y-auto"
              } p-3 sm:p-4 space-y-3 sm:space-y-4 bg-muted/20 flex-1`}
            >
              {messages.length === 0 ? (
                <MinimalEmptyState
                  language={settings.language}
                  suggestedQuestions={suggestedQuestions}
                  onSelectQuestion={(text, images, mode) => handleSend(text, images, mode)}
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

          {/* Canvas side — inline */}
          {artifactsPanelOpen && (
            <ArtifactsPanel
              artifacts={allArtifacts}
              isOpen={artifactsPanelOpen}
              onClose={() => setArtifactsPanelOpen(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ClementineSection;
