import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import clementineAvatar from '@/assets/clementine-avatar.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestionsEN = [
  "What are Aadiyan's skills?",
  "Tell me about VishwaGuru",
  "What's his education?",
  "How can I contact him?",
];

const suggestedQuestionsHI = [
  "Aadiyan ke skills kya hain?",
  "VishwaGuru ke baare mein batao",
  "Uski education kya hai?",
  "Main unse kaise contact karun?",
];

// Compact audio visualizer
const AudioVisualizer = ({ isActive, isListening }: { isActive: boolean; isListening: boolean }) => (
  <div className="flex items-center justify-center gap-0.5 h-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-0.5 rounded-full ${isListening ? 'bg-green-400' : 'bg-primary'}`}
        animate={isActive ? {
          height: [4, 16 + Math.random() * 12, 4],
          opacity: [0.5, 1, 0.5],
        } : { height: 4, opacity: 0.3 }}
        transition={{
          duration: 0.25 + Math.random() * 0.15,
          repeat: isActive ? Infinity : 0,
          delay: i * 0.04,
        }}
      />
    ))}
  </div>
);

// Lip sync animation overlay
const LipSyncOverlay = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <AnimatePresence>
    {isSpeaking && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Sound wave rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.2 + ring * 0.1], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: ring * 0.2 }}
          />
        ))}
        
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 60%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

const ClementineSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedQuestions = language === 'hi' ? suggestedQuestionsHI : suggestedQuestionsEN;

  const scrollToBottom = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    // Important: don't use scrollIntoView here, it can scroll the whole page.
    requestAnimationFrame(scrollToBottom);
  }, [messages.length, scrollToBottom]);

  // Initialize speech recognition with language support
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setCurrentTranscript(transcript);
        
        if (event.results[0].isFinal) {
          handleSend(transcript);
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setCurrentTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Clean text: remove markdown symbols, asterisks, and special characters
      const cleanedText = text
        .replace(/\*+/g, '') // Remove asterisks
        .replace(/[#_~`>|]/g, '') // Remove markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/[≧◡≦★✨🎯💡🔥]/g, '') // Remove special decorative chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (!cleanedText) return;
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice;
      
      if (language === 'hi') {
        // Hindi female voices - prioritize natural sounding ones
        selectedVoice = voices.find(v => 
          v.name.includes('Google हिन्दी') ||
          v.name.includes('Lekha') || // iOS Hindi
          (v.lang === 'hi-IN' && v.name.toLowerCase().includes('female'))
        ) || voices.find(v => 
          v.lang.includes('hi') || v.lang === 'hi-IN'
        );
        
        // Natural Hindi voice settings
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
      } else {
        // English female voices - prioritize most natural ones
        const femaleVoicePriority = [
          'Samantha', // macOS - very natural
          'Karen', // macOS Australian
          'Moira', // macOS Irish
          'Fiona', // macOS Scottish
          'Google UK English Female',
          'Google US English',
          'Microsoft Zira',
          'Microsoft Aria',
          'Neerja', // iOS
          'Veena', // iOS Indian English
        ];
        
        for (const voiceName of femaleVoicePriority) {
          selectedVoice = voices.find(v => v.name.includes(voiceName));
          if (selectedVoice) break;
        }
        
        // Fallback to any English female voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v => 
            v.lang.includes('en') && 
            (v.name.toLowerCase().includes('female') || 
             v.name.includes('Woman') ||
             v.name.includes('girl'))
          ) || voices.find(v => v.lang.includes('en'));
        }
        
        // Natural English voice settings
        utterance.rate = 0.92;
        utterance.pitch = 1.08;
      }
      
      utterance.volume = 1.0;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }
    return response;
  };

  const handleSend = async (message?: string) => {
    const text = message || inputValue.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const apiMessages = [...messages, userMessage]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const response = await streamChat(apiMessages);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {}
        }
      }

      if (assistantContent) {
        speakText(assistantContent);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: "Oops! I encountered an error. Please try again!" }
          : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="clementine" className="py-12 sm:py-16 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Mobile optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-mono">
              AI Assistant
            </span>
            {/* Language Toggle */}
            <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full bg-muted border border-border">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  language === 'hi' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-2">
            Meet <span className="neon-text">Clementine</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm px-2">
            {language === 'hi' 
              ? "Meri AI assistant jo voice chat ke saath hai. Kuch bhi poocho!"
              : "My AI assistant with voice chat. Ask anything!"
            }
          </p>
        </div>

        {/* Full Width Chat Interface */}
        <div className="w-full">
          <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-xl bg-background/80 backdrop-blur-sm">
            {/* Chat Header with Avatar - Mobile optimized */}
            <div className="p-3 sm:p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <LipSyncOverlay isSpeaking={isSpeaking} />
                    <motion.div 
                      className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg"
                      animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0 }}
        >
                      <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-background ${
                        isListening ? 'bg-green-500' : isSpeaking ? 'bg-primary' : 'bg-green-500'
                      }`}
                      animate={isListening || isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isListening || isSpeaking ? Infinity : 0 }}
                    />
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-sm sm:text-base flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span>Clementine</span>
                      <span className="text-xs sm:text-sm">✨</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-normal whitespace-nowrap">
                        {isListening ? (language === 'hi' ? 'सुन रही' : 'Listening') : 
                         isSpeaking ? (language === 'hi' ? 'बोल रही' : 'Speaking') : 
                         isTyping ? (language === 'hi' ? 'सोच रही' : 'Thinking') : 
                         (language === 'hi' ? 'ऑनलाइन' : 'Online')}
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {language === 'hi' ? "AI assistant" : "AI assistant"}
                    </p>
                  </div>
                </div>

                {/* Voice Controls - Compact on mobile */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <div className="hidden sm:block">
                    <AudioVisualizer isActive={isListening || isSpeaking} isListening={isListening} />
                  </div>
                  
                  <motion.button
                    onClick={toggleListening}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 sm:p-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                      isListening 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow-cyan'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>

                  {isSpeaking && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={stopSpeaking}
                      className="p-2 sm:p-2.5 rounded-xl bg-muted border border-border hover:bg-destructive/20"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Transcript */}
              <AnimatePresence>
                {currentTranscript && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-xs text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2"
                  >
                    🎤 "{currentTranscript}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Messages - Mobile optimized height */}
            <div ref={messagesScrollRef} className="min-h-[300px] sm:min-h-[400px] max-h-[400px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
              {messages.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                    {language === 'hi' 
                      ? "Hey! Mujhse Aadiyan ke baare mein kuch bhi poocho 👋"
                      : "Hey! Ask me anything about Aadiyan 👋"
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto px-2">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        disabled={isTyping}
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm bg-muted/50 hover:bg-primary/20 hover:text-primary border border-border/30 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 animate-fade-in`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 border border-primary/30">
                        <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-sm'
                          : 'bg-muted/80 rounded-bl-sm border border-border/30'
                      }`}
                    >
                      {message.content || (
                        <div className="flex gap-1 py-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input - Mobile optimized */}
            <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20">
              <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'hi' ? "Message..." : "Message..."}
                  disabled={isTyping}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background/80 border border-border/50 focus:border-primary outline-none text-xs sm:text-sm disabled:opacity-50"
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground disabled:opacity-50 font-medium"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClementineSection;
