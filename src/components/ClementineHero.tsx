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

// Audio visualizer component
const AudioVisualizer = ({ isActive, isListening }: { isActive: boolean; isListening: boolean }) => {
  const bars = 12;
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isListening ? 'bg-green-400' : 'bg-primary'}`}
          animate={isActive ? {
            height: [8, 32 + Math.random() * 24, 8],
            opacity: [0.5, 1, 0.5],
          } : { height: 8, opacity: 0.3 }}
          transition={{
            duration: 0.3 + Math.random() * 0.2,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
};

// Floating particles for background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: '110%',
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{ 
            y: '-10%',
            x: `${Math.random() * 100}%`,
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// Animated ring around avatar
const PulsingRings = ({ isActive }: { isActive: boolean }) => {
  return (
    <>
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={isActive ? {
            scale: [1, 1.5 + ring * 0.3, 1],
            opacity: [0.5, 0, 0.5],
          } : { scale: 1, opacity: 0.2 }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            delay: ring * 0.3,
          }}
        />
      ))}
    </>
  );
};

const ClementineHero = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setCurrentTranscript(transcript);
        
        if (event.results[0].isFinal) {
          handleSend(transcript);
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setCurrentTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      if (!showChat) setShowChat(true);
    }
  }, [isListening, showChat]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Google UK English Female')
      ) || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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

    if (!showChat) setShowChat(true);

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

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith(':') || line.trim() === '') continue;
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
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Speak the response
      if (assistantContent) {
        // Remove emojis and special characters for speech
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
    <section id="clementine" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Background effects */}
      <FloatingParticles />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left side - Clementine Avatar & Voice Interface */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col items-center text-center"
          >
            {/* Main Avatar */}
            <div className="relative mb-8">
              <PulsingRings isActive={isTyping || isSpeaking || isListening} />
              
              <motion.div 
                className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl"
                animate={isSpeaking || isTyping ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: isSpeaking || isTyping ? Infinity : 0 }}
              >
                <img 
                  src={clementineAvatar} 
                  alt="Clementine" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay effects */}
                <AnimatePresence>
                  {(isListening || isSpeaking) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 ${isListening ? 'bg-green-500/20' : 'bg-primary/20'}`}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Status badge */}
              <motion.div
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono border ${
                  isListening 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                    : isSpeaking 
                    ? 'bg-primary/20 border-primary/50 text-primary' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}
                animate={isListening || isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: isListening || isSpeaking ? Infinity : 0 }}
              >
                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : isTyping ? '💭 Thinking...' : '✨ Online'}
              </motion.div>
            </div>

            {/* Name & Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-heading font-bold mb-2"
            >
              <span className="neon-text">Clementine</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg mb-8"
            >
              Aadiyan's AI Assistant with Voice Chat
            </motion.p>

            {/* Audio Visualizer */}
            <div className="mb-8">
              <AudioVisualizer isActive={isListening || isSpeaking} isListening={isListening} />
            </div>

            {/* Voice Control Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <motion.button
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-4 rounded-2xl font-heading font-semibold text-base flex items-center gap-3 transition-all duration-300 ${
                  isListening 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow-cyan'
                }`}
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </motion.svg>
                {isListening ? 'Stop Listening' : 'Start Voice Chat'}
              </motion.button>

              {isSpeaking && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={stopSpeaking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-xl bg-muted border border-border hover:bg-destructive/20 hover:border-destructive/50 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </motion.button>
              )}
            </motion.div>

            {/* Current transcript display */}
            <AnimatePresence>
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 px-6 py-3 rounded-xl bg-muted/50 border border-border/50 max-w-md"
                >
                  <p className="text-sm text-muted-foreground italic">"{currentTranscript}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right side - Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-lg"
          >
            <div 
              className="rounded-3xl overflow-hidden border border-primary/20 shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, hsl(var(--background) / 0.95) 0%, hsl(var(--muted) / 0.5) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Chat Header */}
              <div 
                className="p-5 border-b border-border/50"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.05) 100%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
                    <img src={clementineAvatar} alt="Clementine" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      Chat with Clementine
                      <span className="text-sm">✨</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Ask me anything about Aadiyan!</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[360px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      Hey there! I'm Clementine. Use voice or type to ask me about Aadiyan!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedQuestions.map((question, i) => (
                        <motion.button
                          key={question}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => handleSend(question)}
                          disabled={isTyping}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3 py-1.5 rounded-full text-xs font-mono bg-muted/50 hover:bg-primary/20 hover:text-primary border border-border/30 hover:border-primary/30 transition-colors disabled:opacity-50"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-primary/30">
                        <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-md'
                          : 'bg-muted/80 backdrop-blur-sm rounded-bl-md border border-border/30'
                      }`}
                    >
                      {message.content || (
                        <div className="flex gap-1 py-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-muted/30">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-xl bg-background/80 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-body disabled:opacity-50 placeholder:text-muted-foreground/60"
                  />
                  <motion.button
                    onClick={toggleListening}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl transition-colors ${
                      isListening 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono">Explore Portfolio</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClementineHero;
