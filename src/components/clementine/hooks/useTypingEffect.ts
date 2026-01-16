import { useState, useEffect, useRef } from "react";
import { TYPING_SPEED_MS } from "../constants";

interface UseTypingEffectProps {
  text: string;
  isActive: boolean;
  onComplete?: () => void;
}

export const useTypingEffect = ({ text, isActive, onComplete }: UseTypingEffectProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText(text);
      return;
    }

    setIsTyping(true);
    indexRef.current = 0;
    setDisplayedText("");

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsTyping(false);
        onComplete?.();
      }
    }, TYPING_SPEED_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, isActive, onComplete]);

  return { displayedText, isTyping };
};
