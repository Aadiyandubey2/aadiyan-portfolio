import { useState, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  language: "en" | "hi";
}

export const useSpeechSynthesis = ({ language }: UseSpeechSynthesisProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const wordsRef = useRef<{ start: number; end: number }[]>([]);
  const originalTextRef = useRef<string>("");

  // Estimate word timings based on text length and speaking rate
  const estimateWordTimings = (text: string): { start: number; end: number }[] => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgCharsPerSecond = language === "hi" ? 10 : 12; // Adjust based on language
    const timings: { start: number; end: number }[] = [];
    let currentTime = 0;

    for (const word of words) {
      const duration = (word.length / avgCharsPerSecond) + 0.1; // Add small gap
      timings.push({ start: currentTime, end: currentTime + duration });
      currentTime += duration + 0.05; // Small gap between words
    }

    return timings;
  };

  // Find word index in original text based on current time
  const updateWordHighlight = useCallback(() => {
    if (!audioRef.current || !isSpeaking) return;

    const currentTime = audioRef.current.currentTime;
    const timings = wordsRef.current;
    const text = originalTextRef.current;

    // Find which word we're currently on
    let wordIdx = 0;
    for (let i = 0; i < timings.length; i++) {
      if (currentTime >= timings[i].start && currentTime < timings[i].end) {
        wordIdx = i;
        break;
      } else if (currentTime >= timings[i].end) {
        wordIdx = i + 1;
      }
    }

    // Convert word index to character position in original text
    const words = text.split(/\s+/).filter(w => w.length > 0);
    let charPos = 0;
    for (let i = 0; i < Math.min(wordIdx, words.length); i++) {
      charPos = text.indexOf(words[i], charPos);
      if (i < wordIdx) {
        charPos += words[i].length;
        // Skip whitespace
        while (charPos < text.length && /\s/.test(text[charPos])) {
          charPos++;
        }
      }
    }

    if (wordIdx < words.length) {
      const actualPos = text.indexOf(words[wordIdx], charPos > 0 ? charPos : 0);
      if (actualPos !== -1) {
        setCurrentWordIndex(actualPos);
      }
    }

    // Continue animation loop
    if (isSpeaking && audioRef.current && !audioRef.current.paused) {
      animationFrameRef.current = requestAnimationFrame(updateWordHighlight);
    }
  }, [isSpeaking, language]);

  // Browser TTS fallback
  const browserSpeak = useCallback((text: string, onWordBoundary?: (charIndex: number) => void) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    
    const cleanedText = cleanTextForVoice(text);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    const voices = window.speechSynthesis.getVoices();
    const voice = getVoice(voices, language);
    if (voice) utterance.voice = voice;

    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = language === "hi" ? 0.9 : 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    // Build character mapping for word boundaries
    const mapping = buildCharMapping(text, cleanedText);

    utterance.onboundary = (event) => {
      if (event.name === "word" && onWordBoundary) {
        const originalPos = findOriginalPosition(event.charIndex, mapping, text);
        setCurrentWordIndex(originalPos);
        onWordBoundary(originalPos);
      }
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentWordIndex(0);
      if (onWordBoundary) onWordBoundary(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      if (onWordBoundary) onWordBoundary(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  }, [language]);

  // Main speak function - tries ElevenLabs first, falls back to browser
  const speak = useCallback(
    async (text: string, onWordBoundary?: (charIndex: number) => void) => {
      // Stop any current playback
      stop();

      originalTextRef.current = text;
      wordsRef.current = estimateWordTimings(text);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, language }),
          }
        );

        // Check if we got audio or a fallback response
        const contentType = response.headers.get("content-type");
        
        if (contentType?.includes("audio")) {
          // Got audio from ElevenLabs
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            setCurrentWordIndex(0);
            startTimeRef.current = Date.now();
            if (onWordBoundary) onWordBoundary(0);
            // Start word tracking animation
            animationFrameRef.current = requestAnimationFrame(updateWordHighlight);
          };

          audio.onended = () => {
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            if (onWordBoundary) onWordBoundary(-1);
            URL.revokeObjectURL(audioUrl);
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
          };

          audio.onerror = () => {
            console.warn("Audio playback error, falling back to browser TTS");
            URL.revokeObjectURL(audioUrl);
            browserSpeak(text, onWordBoundary);
          };

          await audio.play();
        } else {
          // Got JSON response (fallback needed)
          console.log("ElevenLabs fallback, using browser TTS");
          browserSpeak(text, onWordBoundary);
        }
      } catch (error) {
        console.warn("ElevenLabs error, falling back to browser TTS:", error);
        browserSpeak(text, onWordBoundary);
      }
    },
    [language, browserSpeak, updateWordHighlight]
  );

  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop browser TTS
    window.speechSynthesis?.cancel();

    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  }, []);

  return { isSpeaking, currentWordIndex, speak, stop };
};

// Helper functions
const cleanTextForVoice = (text: string): string => {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*+]\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[{}[\]<>|\\~^]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getVoice = (voices: SpeechSynthesisVoice[], language: "en" | "hi"): SpeechSynthesisVoice | undefined => {
  if (language === "hi") {
    return voices.find(v => v.lang.includes("hi")) || voices.find(v => v.lang === "hi-IN");
  }
  
  const preferred = ["Samantha", "Karen", "Google UK English Female", "Microsoft Zira"];
  for (const name of preferred) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) return voice;
  }
  
  return voices.find(v => v.lang.includes("en") && v.name.toLowerCase().includes("female")) ||
         voices.find(v => v.lang.includes("en"));
};

const buildCharMapping = (original: string, cleaned: string): Map<number, number> => {
  const mapping = new Map<number, number>();
  let cleanedIdx = 0;
  let originalIdx = 0;
  
  while (cleanedIdx < cleaned.length && originalIdx < original.length) {
    if (original[originalIdx] === cleaned[cleanedIdx]) {
      mapping.set(cleanedIdx, originalIdx);
      cleanedIdx++;
    }
    originalIdx++;
  }
  
  return mapping;
};

const findOriginalPosition = (cleanedIdx: number, mapping: Map<number, number>, original: string): number => {
  let pos = mapping.get(cleanedIdx);
  if (pos !== undefined) return pos;
  
  // Find closest mapped position
  let closest = 0;
  for (const key of mapping.keys()) {
    if (key <= cleanedIdx) closest = key;
    else break;
  }
  
  pos = (mapping.get(closest) || 0) + (cleanedIdx - closest);
  return Math.min(Math.max(0, pos), original.length - 1);
};
