import { useCallback } from "react";

interface ChatMessage {
  role: string;
  content: string;
  images?: string[];
}

export const useChatApi = () => {
  const streamChat = useCallback(
    async (messages: ChatMessage[], language: "en" | "hi", model?: string): Promise<Response> => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages, language, ...(model ? { userModel: model } : {}) }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 429) {
          const retryAfter = error.retryAfter || 60;
          throw new Error(`Too many messages! Please wait ${retryAfter} seconds before trying again.`);
        }
        
        throw new Error(error.error || "Failed to get response");
      }

      return response;
    },
    []
  );

  const parseStream = useCallback(
    async (
      response: Response,
      onChunk: (content: string) => void
    ): Promise<string> => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk(fullContent);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      return fullContent;
    },
    []
  );

  return { streamChat, parseStream };
};
