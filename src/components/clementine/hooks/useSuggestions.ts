import { useState, useCallback } from "react";
import { Message } from "../types";

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (messages: Message[], language: "en" | "hi") => {
    if (messages.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mode: "suggest",
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            language,
          }),
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { suggestions, isLoading, fetchSuggestions };
};
