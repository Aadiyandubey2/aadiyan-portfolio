import { useState, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  language: "en" | "hi";
}

export const useSpeechSynthesis = ({ language }: UseSpeechSynthesisProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Comprehensive text cleaning for voice output
  const cleanTextForVoice = (text: string): string => {
    return text
      // Remove all emoji unicode ranges
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[\u{1F000}-\u{1F02F}]/gu, "")
      .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, "")
      .replace(/[\u{1F100}-\u{1F1FF}]/gu, "")
      .replace(/[\u{1F200}-\u{1F2FF}]/gu, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{1F700}-\u{1F77F}]/gu, "")
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, "")
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/[\u{231A}-\u{231B}]/gu, "")
      .replace(/[\u{23E9}-\u{23F3}]/gu, "")
      .replace(/[\u{23F8}-\u{23FA}]/gu, "")
      .replace(/[\u{25AA}-\u{25AB}]/gu, "")
      .replace(/[\u{25B6}]/gu, "")
      .replace(/[\u{25C0}]/gu, "")
      .replace(/[\u{25FB}-\u{25FE}]/gu, "")
      .replace(/[\u{2614}-\u{2615}]/gu, "")
      .replace(/[\u{2648}-\u{2653}]/gu, "")
      .replace(/[\u{267F}]/gu, "")
      .replace(/[\u{2693}]/gu, "")
      .replace(/[\u{26A1}]/gu, "")
      .replace(/[\u{26AA}-\u{26AB}]/gu, "")
      .replace(/[\u{26BD}-\u{26BE}]/gu, "")
      .replace(/[\u{26C4}-\u{26C5}]/gu, "")
      .replace(/[\u{26CE}]/gu, "")
      .replace(/[\u{26D4}]/gu, "")
      .replace(/[\u{26EA}]/gu, "")
      .replace(/[\u{26F2}-\u{26F3}]/gu, "")
      .replace(/[\u{26F5}]/gu, "")
      .replace(/[\u{26FA}]/gu, "")
      .replace(/[\u{26FD}]/gu, "")
      // Remove common decorative special characters
      .replace(/[≧◡≦★✨🎯💡🔥⭐✓✔✗✘→←↑↓↔↕⇒⇐⇑⇓⬆⬇⬅➡️♠♣♥♦●○◆◇■□▲△▼▽◀▶►◄★☆♪♫♬♩♭♮♯]/g, "")
      // Remove markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
      .replace(/\*([^*]+)\*/g, "$1") // Italic
      .replace(/__([^_]+)__/g, "$1") // Bold underscores
      .replace(/_([^_]+)_/g, "$1") // Italic underscores
      .replace(/~~([^~]+)~~/g, "$1") // Strikethrough
      .replace(/`([^`]+)`/g, "$1") // Inline code
      .replace(/```[\s\S]*?```/g, "") // Code blocks
      .replace(/^#+\s*/gm, "") // Headers
      .replace(/^>\s*/gm, "") // Blockquotes
      .replace(/^[-*+]\s*/gm, "") // Unordered lists
      .replace(/^\d+\.\s*/gm, "") // Ordered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // Images
      // Remove mathematical notations
      .replace(/[≈≠≤≥±∞∑∏∫∂√∛∜∈∉∋∌⊂⊃⊆⊇∪∩∧∨¬⊕⊗⊙⊥∥∦∠∡∢°′″‴⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/g, "")
      // Remove brackets and special punctuation that sounds odd
      .replace(/[{}[\]<>|\\]/g, "")
      .replace(/[~^]/g, "")
      // Clean up extra whitespace
      .replace(/\s+/g, " ")
      .replace(/\n+/g, ". ")
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
    (text: string, onWordBoundary?: (charIndex: number) => void) => {
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const cleanedText = cleanTextForVoice(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = getVoice(voices);

      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = language === "hi" ? 0.9 : 0.92;
      utterance.pitch = language === "hi" ? 1.1 : 1.08;
      utterance.volume = 1.0;

      // Word boundary event for syncing text highlight
      utterance.onboundary = (event) => {
        if (event.name === "word" && onWordBoundary) {
          setCurrentWordIndex(event.charIndex);
          onWordBoundary(event.charIndex);
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentWordIndex(0);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  }, []);

  return { isSpeaking, currentWordIndex, speak, stop };
};
