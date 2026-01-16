import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseSpeechRecognitionProps {
  language: "en" | "hi";
  onFinalTranscript: (transcript: string) => void;
}

export const useSpeechRecognition = ({ language, onFinalTranscript }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setCurrentTranscript(transcript);

        if (event.results[0].isFinal) {
          onFinalTranscript(transcript);
          setCurrentTranscript("");
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied");
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onFinalTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setCurrentTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    currentTranscript,
    toggleListening,
    stopListening,
  };
};
