import { useState, useRef } from "react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled: boolean;
  language: "en" | "hi";
}

/* ===== INLINE SVG ICONS ===== */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224 128 32 48l48 80-48 80Z" opacity="0.25" />
    <path d="M229 121 37 41a8 8 0 0 0-10 10l44 77-44 77a8 8 0 0 0 10 10l192-80a8 8 0 0 0 0-14ZM57 189l30-53h59l-59-53-30-53 150 63Z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 16v102l-28-28a16 16 0 0 0-23 0L92 203l-28-28a16 16 0 0 0-23 0L40 176V56ZM40 200v-3l41-41 51 51H40Zm176 0h-28l-56-56 39-39 45 45ZM96 120a24 24 0 1 0-24-24 24 24 0 0 0 24 24Z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M208 144a15.8 15.8 0 0 1-10 14.8l-30.1 12.5-12.5 30.1a16 16 0 0 1-29.6 0l-12.5-30.1-30.1-12.5a16 16 0 0 1 0-29.6l30.1-12.5 12.5-30.1a16 16 0 0 1 29.6 0l12.5 30.1 30.1 12.5A15.8 15.8 0 0 1 208 144Zm-128-44a8 8 0 0 0 7.4-5l8.6-20.6 20.6-8.6a8 8 0 0 0 0-14.8L96 42.4 87.4 21.8a8 8 0 0 0-14.8 0L64 42.4 43.4 51a8 8 0 0 0 0 14.8L64 74.4l8.6 20.6a8 8 0 0 0 7.4 5ZM64 184a8 8 0 0 0 7.4-5l4.6-11 11-4.6a8 8 0 0 0 0-14.8L76 144l-4.6-11a8 8 0 0 0-14.8 0L52 144l-11 4.6a8 8 0 0 0 0 14.8L52 168l4.6 11a8 8 0 0 0 7.4 5Z" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
    <path d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-42 138a8 8 0 0 1-11 11L128 154l-27 27a8 8 0 0 1-11-11l27-27-27-27a8 8 0 0 1 11-11l27 27 27-27a8 8 0 0 1 11 11l-27 27Z" />
  </svg>
);

export const ChatInput = ({ onSend, disabled, language }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if ((trimmed || attachedImages.length > 0) && !disabled) {
      onSend(trimmed, attachedImages.length > 0 ? attachedImages : undefined);
      setInputValue("");
      setAttachedImages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are supported");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAttachedImages((prev) => {
          if (prev.length >= 3) {
            toast.error("Maximum 3 images per message");
            return prev;
          }
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isImageGenPrompt = /^(generate|create|draw|make|design)\s+(an?\s+)?(image|picture|photo|illustration|art)/i.test(inputValue.trim());

  return (
    <div className="p-2.5 sm:p-4 border-t border-border bg-background/60 backdrop-blur-sm">
      {/* Attached images preview */}
      {attachedImages.length > 0 && (
        <div className="flex gap-2 mb-2 max-w-4xl mx-auto">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Attachment ${i + 1}`}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <CloseSmIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image gen hint */}
      {isImageGenPrompt && (
        <div className="flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 max-w-4xl mx-auto animate-[fadeSlideUp_0.15s_ease-out]">
          <SparkleIcon />
          <span className="text-[11px] text-primary font-medium">
            {language === "hi" ? "AI इमेज जनरेट करेगा ✨" : "AI will generate an image ✨"}
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 max-w-4xl mx-auto">
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-2.5 py-2.5 rounded-xl 
            bg-muted/50 border border-border/50
            hover:bg-muted hover:border-primary/30
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all text-muted-foreground hover:text-foreground"
          title={language === "hi" ? "इमेज अपलोड करें" : "Upload image"}
        >
          <ImageIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyPress}
            placeholder={language === "hi" ? "संदेश लिखें या 'generate image...' टाइप करें" : "Type a message or 'generate image of...'"}
            disabled={disabled}
            className="w-full px-3 sm:px-4 py-2.5 rounded-xl 
              bg-background/80 border border-border/50 
              focus:border-primary focus:ring-1 focus:ring-primary/20
              outline-none text-xs sm:text-sm disabled:opacity-50
              transition-all placeholder:text-muted-foreground/60 font-body"
          />

          {inputValue.length > 0 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] ${
              inputValue.length > 450 ? "text-orange-400" : "text-muted-foreground/60"
            }`}>
              {inputValue.length}/500
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={(!inputValue.trim() && attachedImages.length === 0) || disabled}
          className="px-3 sm:px-5 py-2.5 rounded-xl 
            bg-primary text-primary-foreground font-medium
            hover:shadow-lg hover:shadow-primary/20
            hover:scale-[1.03] active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all flex items-center gap-1.5"
        >
          {isImageGenPrompt ? <SparkleIcon /> : <SendIcon />}
          <span className="hidden sm:inline text-sm">{isImageGenPrompt ? "Generate" : "Send"}</span>
        </button>
      </div>
    </div>
  );
};
