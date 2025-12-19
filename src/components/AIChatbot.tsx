import { useState, useRef, useEffect } from 'react';
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

// Animated avatar component with expressions
const ClementineAvatar = ({ isTyping, isOpen }: { isTyping: boolean; isOpen: boolean }) => {
  return (
    <motion.div 
      className="relative"
      animate={isTyping ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg relative">
        <img 
          src={clementineAvatar} 
          alt="Clementine" 
          className="w-full h-full object-cover"
        />
        {/* Glow effect when typing */}
        {isTyping && (
          <motion.div
            className="absolute inset-0 bg-primary/20"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
        animate={isTyping ? { scale: [1, 1.2, 1], backgroundColor: ['#22c55e', '#00d4ff', '#22c55e'] } : {}}
        transition={{ duration: 0.8, repeat: isTyping ? Infinity : 0 }}
      />
    </motion.div>
  );
};

// Floating particles animation
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '100%',
            opacity: 0 
          }}
          animate={{ 
            y: '-20%',
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// Typing indicator with Clementine-style animation
const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground italic">Clementine is thinking</span>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ 
            y: [0, -4, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  </div>
);

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! ✨ I'm Clementine, Aadiyan's AI assistant! I'd love to tell you about his skills, projects, or help you get in touch. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]' || !jsonStr) continue;
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
            // Ignore
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
      
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: "Oops! I encountered an error (╥﹏╥) Please try again in a moment!" }
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
    <>
      {/* Chat Button - Clementine Avatar */}
      <motion.button
        id="chatbot"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <div className="relative">
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Avatar container */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-primary shadow-glow-cyan">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                >
                  <svg className="w-7 h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>
              ) : (
                <motion.img
                  key="avatar"
                  src={clementineAvatar}
                  alt="Clementine"
                  className="w-full h-full object-cover"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* "Chat with me" tooltip */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="px-3 py-1.5 rounded-lg bg-muted/90 backdrop-blur-sm text-xs font-mono text-foreground border border-border/50 shadow-lg">
                Chat with Clementine ✨
              </div>
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-primary/20"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.5) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Floating particles background */}
            <FloatingParticles />
            
            {/* Header */}
            <motion.div 
              className="relative p-4 border-b border-border/50"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--secondary) / 0.1) 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <ClementineAvatar isTyping={isTyping} isOpen={isOpen} />
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-base flex items-center gap-2">
                    Clementine
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                      className="text-sm"
                    >
                      ✨
                    </motion.span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isTyping ? <TypingIndicator /> : "Aadiyan's AI Assistant"}
                  </p>
                </div>
                {/* Animated decorative element */}
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-primary/30">
                      <img src={clementineAvatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-md shadow-lg'
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
                  </motion.div>
                </motion.div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <AnimatePresence>
              {messages.length <= 2 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2"
                >
                  <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <motion.button
                        key={question}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSend(question)}
                        disabled={isTyping}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-full text-xs font-mono bg-muted/50 hover:bg-primary/20 hover:text-primary border border-border/30 hover:border-primary/30 transition-colors disabled:opacity-50"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <div className="flex gap-2">
                <motion.input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Clementine anything..."
                  disabled={isTyping}
                  whileFocus={{ scale: 1.01 }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background/80 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-body disabled:opacity-50 placeholder:text-muted-foreground/60"
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={isTyping ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isTyping ? Infinity : 0, ease: 'linear' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </motion.svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;