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

const suggestedQuestions = [
  "What are Aadiyan's skills?",
  "Tell me about VishwaGuru",
  "What's his education?",
  "How can I contact him?",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

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
  }, []);

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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
      body: JSON.stringify({ messages: userMessages }),
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
        const cleanText = assistantContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[~≧◡≦★✨]/g, '');
        speakText(cleanText);
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
    <section id="clementine" className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-4">
            AI Assistant
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
            Meet <span className="neon-text">Clementine</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            My AI companion with voice chat. Ask anything about my skills, projects, or experience!
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left - Avatar & Voice Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            {/* Avatar */}
            <div className="relative mb-6">
              <LipSyncOverlay isSpeaking={isSpeaking} />
              
              <motion.div 
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-3 border-primary/40 shadow-xl"
                animate={isSpeaking ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0 }}
              >
                <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
                
                {/* Speaking overlay */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-primary/10"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Status */}
              <motion.div
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono border ${
                  isListening 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                    : isSpeaking 
                    ? 'bg-primary/20 border-primary/50 text-primary' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {isListening ? '🎤 Listening' : isSpeaking ? '🔊 Speaking' : isTyping ? '💭 Thinking' : '✨ Online'}
              </motion.div>
            </div>

            {/* Audio Visualizer */}
            <div className="mb-4">
              <AudioVisualizer isActive={isListening || isSpeaking} isListening={isListening} />
            </div>

            {/* Voice Button */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                  isListening 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow-cyan'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening ? 'Stop' : 'Voice Chat'}
              </motion.button>

              {isSpeaking && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={stopSpeaking}
                  className="p-2.5 rounded-xl bg-muted border border-border hover:bg-destructive/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Transcript */}
            <AnimatePresence>
              {currentTranscript && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-xs text-muted-foreground italic max-w-[200px] text-center"
                >
                  "{currentTranscript}"
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-xl"
          >
            <div 
              className="rounded-2xl overflow-hidden border border-primary/20 shadow-xl bg-background/80 backdrop-blur-sm"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/40">
                    <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm">Chat with Clementine ✨</h3>
                    <p className="text-[10px] text-muted-foreground">Ask about Aadiyan's portfolio</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[300px] overflow-y-auto p-4 space-y-3 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm mb-4">
                      Hey! Ask me anything about Aadiyan 👋
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          disabled={isTyping}
                          className="px-3 py-1.5 rounded-full text-xs bg-muted/50 hover:bg-primary/20 hover:text-primary border border-border/30 transition-colors disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
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
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-primary/30">
                          <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
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
                                className="w-1.5 h-1.5 bg-primary rounded-full"
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
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 bg-muted/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={isTyping}
                    className="flex-1 px-3 py-2 rounded-lg bg-background/80 border border-border/50 focus:border-primary outline-none text-sm disabled:opacity-50"
                  />
                  <motion.button
                    onClick={toggleListening}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening ? 'bg-green-500 text-white' : 'bg-muted hover:bg-primary/20'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClementineSection;
