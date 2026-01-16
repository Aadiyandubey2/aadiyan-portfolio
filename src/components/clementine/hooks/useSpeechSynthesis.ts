import { useState, useCallback } from "react";

interface UseSpeechSynthesisProps {
  language: "en" | "hi";
}

export const useSpeechSynthesis = ({ language }: UseSpeechSynthesisProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cleanText = (text: string): string => {
    return text
      .replace(/\*+/g, "")
      .replace(/[#_~`>|]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[≧◡≦★✨🎯💡🔥]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
    if (language === "hi") {
      return (
        voices.find(
          (v) =>
            v.name.includes("Google हिन्दी") ||
            v.name.includes("Lekha") ||
            (v.lang === "hi-IN" && v.name.toLowerCase().includes("female"))
        ) || voices.find((v) => v.lang.includes("hi") || v.lang === "hi-IN")
      );
    }

    const femaleVoicePriority = [
      "Samantha", "Karen", "Moira", "Fiona",
      "Google UK English Female", "Google US English",
      "Microsoft Zira", "Microsoft Aria", "Neerja", "Veena",
    ];

    for (const voiceName of femaleVoicePriority) {
      const voice = voices.find((v) => v.name.includes(voiceName));
      if (voice) return voice;
    }

    return (
      voices.find(
        (v) =>
          v.lang.includes("en") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.includes("Woman") ||
            v.name.includes("girl"))
      ) || voices.find((v) => v.lang.includes("en"))
    );
  };

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const cleanedText = cleanText(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = getVoice(voices);

      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = language === "hi" ? 0.9 : 0.92;
      utterance.pitch = language === "hi" ? 1.1 : 1.08;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
};
