// ─── AI Settings Data: Providers, Models, Presets, Detection ────────────────

export type ChatCapability = "chat" | "code" | "image" | "video" | "search" | "extract" | "slides";

export const ALL_CAPABILITIES: ChatCapability[] = ["chat", "code", "image", "video", "search", "extract", "slides"];

export const CAPABILITY_LABELS: Record<ChatCapability, { label: string; color: string; icon: string }> = {
  chat: { label: "Chat", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", icon: "💬" },
  code: { label: "Code", color: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30", icon: "⌨️" },
  image: { label: "Image", color: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30", icon: "🎨" },
  video: { label: "Video", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30", icon: "🎬" },
  search: { label: "Research", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: "🔍" },
  extract: { label: "Extract", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30", icon: "📊" },
  slides: { label: "Slides", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30", icon: "📽️" },
};

// ─── Built-in Models ───────────────────────────────────────────────────────
export const AI_MODELS = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash (Recommended)", description: "Fast, balanced speed and capability", category: "Google" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Good multimodal + reasoning, lower cost", category: "Google" },
  { id: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", description: "Fastest, best for simple tasks", category: "Google" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Highest quality, complex reasoning", category: "Google" },
  { id: "google/gemini-3-pro-preview", name: "Gemini 3 Pro Preview", description: "Next-gen, advanced capabilities", category: "Google" },
  { id: "openai/gpt-5-nano", name: "GPT-5 Nano", description: "Fast and cost-effective", category: "OpenAI" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", description: "Balanced performance and cost", category: "OpenAI" },
  { id: "openai/gpt-5", name: "GPT-5", description: "Powerful, excellent reasoning", category: "OpenAI" },
  { id: "openai/gpt-5.2", name: "GPT-5.2", description: "Latest, enhanced reasoning", category: "OpenAI" },
];

// ─── Custom Providers ──────────────────────────────────────────────────────
export const CUSTOM_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", icon: "🟢" },
  { id: "google", name: "Google AI (Gemini)", baseUrl: "https://generativelanguage.googleapis.com/v1beta", icon: "🔵" },
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "https://api.anthropic.com/v1", icon: "🟤" },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", icon: "🟣" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", icon: "🟠" },
  { id: "mistral", name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", icon: "🔷" },
  { id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", icon: "🔶" },
  { id: "fireworks", name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", icon: "🔥" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai", icon: "🧭" },
  { id: "cohere", name: "Cohere", baseUrl: "https://api.cohere.com/v2", icon: "🌊" },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", icon: "🔍" },
  { id: "xai", name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", icon: "✖️" },
  { id: "replicate", name: "Replicate", baseUrl: "https://api.replicate.com/v1", icon: "🔄" },
  { id: "huggingface", name: "Hugging Face", baseUrl: "https://api-inference.huggingface.co/v1", icon: "🤗" },
  { id: "deepinfra", name: "DeepInfra", baseUrl: "https://api.deepinfra.com/v1/openai", icon: "⚡" },
  { id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", icon: "🧠" },
  { id: "sambanova", name: "SambaNova", baseUrl: "https://api.sambanova.ai/v1", icon: "⚙️" },
  { id: "novita", name: "Novita AI", baseUrl: "https://api.novita.ai/v3/openai", icon: "✨" },
  { id: "lepton", name: "Lepton AI", baseUrl: "https://api.lepton.ai/v1", icon: "⚛️" },
  { id: "ai21", name: "AI21 Labs", baseUrl: "https://api.ai21.com/studio/v1", icon: "🔬" },
  { id: "stability", name: "Stability AI", baseUrl: "https://api.stability.ai/v1", icon: "🎨" },
  { id: "azure", name: "Azure OpenAI", baseUrl: "", icon: "☁️" },
  { id: "aws", name: "AWS Bedrock", baseUrl: "", icon: "📦" },
  { id: "cloudflare", name: "Cloudflare AI", baseUrl: "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1", icon: "🌐" },
  { id: "custom", name: "Custom Endpoint", baseUrl: "", icon: "🔧" },
];

// ─── Comprehensive Model Catalog ───────────────────────────────────────────
// Each provider's popular models for quick selection
export interface ModelPreset {
  id: string;
  name: string;
  provider: string;
  capabilities: ChatCapability[];
  context?: string;
  speed?: "fast" | "medium" | "slow";
  quality?: "high" | "medium" | "standard";
}

export const MODEL_CATALOG: Record<string, ModelPreset[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o", provider: "openai", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "medium" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", capabilities: ["chat", "code", "search"], context: "16K", speed: "fast", quality: "standard" },
    { id: "o1", name: "o1", provider: "openai", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "slow", quality: "high" },
    { id: "o1-mini", name: "o1 Mini", provider: "openai", capabilities: ["chat", "code", "search"], context: "128K", speed: "medium", quality: "high" },
    { id: "o3-mini", name: "o3 Mini", provider: "openai", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "medium", quality: "high" },
    { id: "dall-e-3", name: "DALL·E 3", provider: "openai", capabilities: ["image"], speed: "slow", quality: "high" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", capabilities: ["chat", "code", "search", "extract", "slides"], context: "200K", speed: "medium", quality: "high" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", capabilities: ["chat", "code", "search", "extract", "slides"], context: "200K", speed: "medium", quality: "high" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic", capabilities: ["chat", "code", "search", "extract"], context: "200K", speed: "fast", quality: "medium" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic", capabilities: ["chat", "code", "search", "extract", "slides"], context: "200K", speed: "slow", quality: "high" },
  ],
  google: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "1M", speed: "fast", quality: "medium" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "google", capabilities: ["chat", "code", "search"], context: "1M", speed: "fast", quality: "standard" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "2M", speed: "medium", quality: "high" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", capabilities: ["chat", "code", "image", "search", "extract"], context: "1M", speed: "fast", quality: "medium" },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "llama3-70b-8192", name: "Llama 3 70B", provider: "groq", capabilities: ["chat", "code", "search", "extract", "slides"], context: "8K", speed: "fast", quality: "high" },
    { id: "llama3-8b-8192", name: "Llama 3 8B", provider: "groq", capabilities: ["chat", "code"], context: "8K", speed: "fast", quality: "standard" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq", capabilities: ["chat", "code", "slides"], context: "32K", speed: "fast", quality: "medium" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B", provider: "groq", capabilities: ["chat", "code"], context: "8K", speed: "fast", quality: "standard" },
    { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B", provider: "groq", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "fast", quality: "high" },
  ],
  mistral: [
    { id: "mistral-large-latest", name: "Mistral Large", provider: "mistral", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "mistral-medium-latest", name: "Mistral Medium", provider: "mistral", capabilities: ["chat", "code", "search", "extract"], context: "32K", speed: "medium", quality: "medium" },
    { id: "mistral-small-latest", name: "Mistral Small", provider: "mistral", capabilities: ["chat", "code"], context: "32K", speed: "fast", quality: "standard" },
    { id: "codestral-latest", name: "Codestral", provider: "mistral", capabilities: ["code", "chat"], context: "32K", speed: "fast", quality: "high" },
    { id: "pixtral-large-latest", name: "Pixtral Large", provider: "mistral", capabilities: ["chat", "image", "code"], context: "128K", speed: "medium", quality: "high" },
  ],
  together: [
    { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", provider: "together", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", name: "Llama 3.1 405B Turbo", provider: "together", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B Turbo", provider: "together", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "fast", quality: "high" },
    { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "together", capabilities: ["chat", "code", "search", "extract"], context: "64K", speed: "medium", quality: "high" },
    { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1 Schnell", provider: "together", capabilities: ["image"], speed: "fast", quality: "high" },
    { id: "black-forest-labs/FLUX.1.1-pro", name: "FLUX 1.1 Pro", provider: "together", capabilities: ["image"], speed: "medium", quality: "high" },
  ],
  fireworks: [
    { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", name: "Llama 3.3 70B", provider: "fireworks", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "accounts/fireworks/models/qwen2p5-72b-instruct", name: "Qwen 2.5 72B", provider: "fireworks", capabilities: ["chat", "code", "search", "extract"], context: "32K", speed: "fast", quality: "high" },
    { id: "accounts/fireworks/models/deepseek-r1", name: "DeepSeek R1", provider: "fireworks", capabilities: ["chat", "code", "search"], context: "64K", speed: "medium", quality: "high" },
  ],
  perplexity: [
    { id: "sonar-pro", name: "Sonar Pro", provider: "perplexity", capabilities: ["chat", "search", "extract"], context: "200K", speed: "medium", quality: "high" },
    { id: "sonar", name: "Sonar", provider: "perplexity", capabilities: ["chat", "search"], context: "128K", speed: "fast", quality: "medium" },
    { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", provider: "perplexity", capabilities: ["chat", "search", "extract"], context: "128K", speed: "slow", quality: "high" },
    { id: "sonar-reasoning", name: "Sonar Reasoning", provider: "perplexity", capabilities: ["chat", "search"], context: "128K", speed: "medium", quality: "medium" },
  ],
  cohere: [
    { id: "command-r-plus", name: "Command R+", provider: "cohere", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "command-r", name: "Command R", provider: "cohere", capabilities: ["chat", "code", "search"], context: "128K", speed: "fast", quality: "medium" },
    { id: "command-light", name: "Command Light", provider: "cohere", capabilities: ["chat"], context: "4K", speed: "fast", quality: "standard" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek Chat (V3)", provider: "deepseek", capabilities: ["chat", "code", "search", "extract", "slides"], context: "64K", speed: "medium", quality: "high" },
    { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)", provider: "deepseek", capabilities: ["chat", "code", "search", "extract"], context: "64K", speed: "slow", quality: "high" },
    { id: "deepseek-coder", name: "DeepSeek Coder", provider: "deepseek", capabilities: ["code", "chat"], context: "128K", speed: "fast", quality: "high" },
  ],
  xai: [
    { id: "grok-3", name: "Grok 3", provider: "xai", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "grok-3-mini", name: "Grok 3 Mini", provider: "xai", capabilities: ["chat", "code", "search"], context: "128K", speed: "fast", quality: "medium" },
    { id: "grok-2", name: "Grok 2", provider: "xai", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "medium", quality: "high" },
    { id: "grok-2-vision", name: "Grok 2 Vision", provider: "xai", capabilities: ["chat", "image", "code"], context: "32K", speed: "medium", quality: "high" },
  ],
  replicate: [
    { id: "meta/llama-3-70b-instruct", name: "Llama 3 70B", provider: "replicate", capabilities: ["chat", "code"], context: "8K", speed: "medium", quality: "high" },
    { id: "stability-ai/sdxl", name: "SDXL", provider: "replicate", capabilities: ["image"], speed: "medium", quality: "high" },
    { id: "stability-ai/stable-video-diffusion", name: "Stable Video Diffusion", provider: "replicate", capabilities: ["video"], speed: "slow", quality: "high" },
    { id: "black-forest-labs/flux-schnell", name: "FLUX Schnell", provider: "replicate", capabilities: ["image"], speed: "fast", quality: "high" },
    { id: "black-forest-labs/flux-1.1-pro", name: "FLUX 1.1 Pro", provider: "replicate", capabilities: ["image"], speed: "medium", quality: "high" },
  ],
  huggingface: [
    { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", provider: "huggingface", capabilities: ["chat", "code", "search"], context: "128K", speed: "medium", quality: "high" },
    { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "huggingface", capabilities: ["chat", "code", "search"], context: "128K", speed: "medium", quality: "high" },
    { id: "mistralai/Mixtral-8x22B-Instruct-v0.1", name: "Mixtral 8x22B", provider: "huggingface", capabilities: ["chat", "code"], context: "64K", speed: "medium", quality: "high" },
    { id: "black-forest-labs/FLUX.1-dev", name: "FLUX.1 Dev", provider: "huggingface", capabilities: ["image"], speed: "medium", quality: "high" },
  ],
  deepinfra: [
    { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", provider: "deepinfra", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "deepinfra", capabilities: ["chat", "code", "search", "extract"], context: "128K", speed: "fast", quality: "high" },
    { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "deepinfra", capabilities: ["chat", "code", "search", "extract"], context: "64K", speed: "medium", quality: "high" },
    { id: "black-forest-labs/FLUX-1-schnell", name: "FLUX Schnell", provider: "deepinfra", capabilities: ["image"], speed: "fast", quality: "high" },
  ],
  cerebras: [
    { id: "llama3.1-70b", name: "Llama 3.1 70B", provider: "cerebras", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "llama3.1-8b", name: "Llama 3.1 8B", provider: "cerebras", capabilities: ["chat", "code"], context: "128K", speed: "fast", quality: "standard" },
  ],
  openrouter: [
    { id: "openrouter/auto", name: "Auto (Best Available)", provider: "openrouter", capabilities: ALL_CAPABILITIES, speed: "medium", quality: "high" },
    { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "openrouter", capabilities: ["chat", "code", "search", "extract", "slides"], context: "200K", speed: "medium", quality: "high" },
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "openrouter", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "128K", speed: "medium", quality: "high" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", provider: "openrouter", capabilities: ["chat", "code", "image", "search", "extract", "slides"], context: "1M", speed: "fast", quality: "medium" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", provider: "openrouter", capabilities: ["chat", "code", "search", "extract", "slides"], context: "128K", speed: "fast", quality: "high" },
    { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen3 80B (Free)", provider: "openrouter", capabilities: ["chat", "code", "search", "extract", "slides"], context: "262K", speed: "medium", quality: "high" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)", provider: "openrouter", capabilities: ["chat", "code", "search", "extract"], context: "64K", speed: "medium", quality: "high" },
    { id: "black-forest-labs/flux-schnell:free", name: "FLUX Schnell (Free)", provider: "openrouter", capabilities: ["image"], speed: "fast", quality: "high" },
  ],
};

// ─── Free Model Presets ────────────────────────────────────────────────────
export const FREE_MODEL_PRESETS = [
  // OpenRouter Free
  { provider: "openrouter", label: "Free Models Router (Auto)", model: "openrouter/free", baseUrl: "https://openrouter.ai/api/v1", description: "Auto-routes to best free model", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "Llama 3.3 70B (Free)", model: "meta-llama/llama-3.3-70b-instruct:free", baseUrl: "https://openrouter.ai/api/v1", description: "Meta's powerful 70B model, free tier", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "Qwen3 80B (Free)", model: "qwen/qwen3-next-80b-a3b-instruct:free", baseUrl: "https://openrouter.ai/api/v1", description: "Powerful MoE model, 262K context", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "Gemma 3 27B (Free)", model: "google/gemma-3-27b-it:free", baseUrl: "https://openrouter.ai/api/v1", description: "Google's open model with vision", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "image", "search", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "Mistral Small 3.1 24B (Free)", model: "mistralai/mistral-small-3.1-24b-instruct:free", baseUrl: "https://openrouter.ai/api/v1", description: "Vision + tools, 128K context", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "DeepSeek R1 (Free)", model: "deepseek/deepseek-r1:free", baseUrl: "https://openrouter.ai/api/v1", description: "Advanced reasoning, free tier", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "search", "extract"] as ChatCapability[] },
  { provider: "openrouter", label: "Gemini Flash 2.0 (Free)", model: "google/gemini-2.0-flash-exp:free", baseUrl: "https://openrouter.ai/api/v1", description: "Google's multimodal model", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["chat", "code", "image", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "openrouter", label: "FLUX Schnell (Free Image)", model: "black-forest-labs/flux-schnell:free", baseUrl: "https://openrouter.ai/api/v1", description: "Fast image generation model", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["image"] as ChatCapability[] },
  { provider: "openrouter", label: "Playground v2.5 (Free Image)", model: "playgroundai/playground-v2.5-1024px-aesthetic:free", baseUrl: "https://openrouter.ai/api/v1", description: "High quality aesthetic images", source: "OpenRouter", signupUrl: "https://openrouter.ai/keys", capabilities: ["image"] as ChatCapability[] },
  // Groq Free
  { provider: "groq", label: "Llama 3.3 70B (Groq)", model: "llama-3.3-70b-versatile", baseUrl: "https://api.groq.com/openai/v1", description: "Ultra-fast inference, free tier", source: "Groq", signupUrl: "https://console.groq.com/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "groq", label: "Llama 3 70B (Groq)", model: "llama3-70b-8192", baseUrl: "https://api.groq.com/openai/v1", description: "Fast inference, generous free tier", source: "Groq", signupUrl: "https://console.groq.com/keys", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "groq", label: "Mixtral 8x7B (Groq)", model: "mixtral-8x7b-32768", baseUrl: "https://api.groq.com/openai/v1", description: "MoE model, 32K context", source: "Groq", signupUrl: "https://console.groq.com/keys", capabilities: ["chat", "code", "slides"] as ChatCapability[] },
  { provider: "groq", label: "DeepSeek R1 70B (Groq)", model: "deepseek-r1-distill-llama-70b", baseUrl: "https://api.groq.com/openai/v1", description: "Advanced reasoning model", source: "Groq", signupUrl: "https://console.groq.com/keys", capabilities: ["chat", "code", "search", "extract"] as ChatCapability[] },
  // Google Free
  { provider: "google", label: "Gemini 2.0 Flash (Google)", model: "gemini-2.0-flash", baseUrl: "https://generativelanguage.googleapis.com/v1beta", description: "Google's free tier, 15 RPM", source: "Google AI Studio", signupUrl: "https://aistudio.google.com/apikey", capabilities: ["chat", "code", "image", "search", "extract", "slides"] as ChatCapability[] },
  { provider: "google", label: "Gemini 1.5 Flash (Google)", model: "gemini-1.5-flash", baseUrl: "https://generativelanguage.googleapis.com/v1beta", description: "1M context, free tier", source: "Google AI Studio", signupUrl: "https://aistudio.google.com/apikey", capabilities: ["chat", "code", "image", "search", "extract", "slides"] as ChatCapability[] },
  // Cerebras Free
  { provider: "cerebras", label: "Llama 3.1 70B (Cerebras)", model: "llama3.1-70b", baseUrl: "https://api.cerebras.ai/v1", description: "Fastest inference available", source: "Cerebras", signupUrl: "https://cloud.cerebras.ai/", capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[] },
  // SambaNova Free
  { provider: "sambanova", label: "Llama 3 70B (SambaNova)", model: "Meta-Llama-3-70B-Instruct", baseUrl: "https://api.sambanova.ai/v1", description: "Enterprise-grade free tier", source: "SambaNova", signupUrl: "https://cloud.sambanova.ai/", capabilities: ["chat", "code"] as ChatCapability[] },
];

// ─── Free API Sources Guide ───────────────────────────────────────────────
export const FREE_API_SOURCES = [
  {
    name: "OpenRouter",
    url: "https://openrouter.ai/keys",
    freeModels: "15+ free models including Llama 3.3, DeepSeek R1, Gemma 3, Qwen3, FLUX",
    limits: "Free models have no cost. Rate limited per model.",
    steps: "1. Sign up → 2. Go to Keys → 3. Create key → 4. Paste below",
    keyPrefix: "sk-or-",
  },
  {
    name: "Groq",
    url: "https://console.groq.com/keys",
    freeModels: "Llama 3.3 70B, DeepSeek R1, Mixtral 8x7B, Gemma 2",
    limits: "Free: ~30 req/min, 14.4K tokens/min",
    steps: "1. Sign up → 2. Create API key → 3. Paste below",
    keyPrefix: "gsk_",
  },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com/apikey",
    freeModels: "Gemini 2.0 Flash, Gemini 1.5 Flash/Pro",
    limits: "Free: 15 requests/min, 1M tokens/day",
    steps: "1. Sign in with Google → 2. Create API key → 3. Paste below",
    keyPrefix: "AIza",
  },
  {
    name: "Cerebras",
    url: "https://cloud.cerebras.ai/",
    freeModels: "Llama 3.1 70B & 8B — fastest inference in the world",
    limits: "Free tier with generous limits",
    steps: "1. Sign up → 2. Get API key → 3. Paste below",
    keyPrefix: "csk-",
  },
  {
    name: "SambaNova",
    url: "https://cloud.sambanova.ai/",
    freeModels: "Llama 3 70B — enterprise-grade inference",
    limits: "Free community tier available",
    steps: "1. Sign up → 2. Create API key → 3. Paste below",
    keyPrefix: "sn-",
  },
];

// ─── Fallback API Type ────────────────────────────────────────────────────
export interface FallbackAPI {
  id: string;
  label: string;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  savedKeyExists: boolean;
  enabled: boolean;
  capabilities: ChatCapability[];
}

// ─── Auto-Detect Provider from API Key ────────────────────────────────────
export interface DetectedProvider {
  provider: string;
  baseUrl: string;
  label: string;
  model: string;
  capabilities: ChatCapability[];
}

export const detectProviderFromKey = (apiKey: string): DetectedProvider | null => {
  const key = apiKey.trim();

  // OpenRouter
  if (key.startsWith("sk-or-"))
    return { provider: "openrouter", baseUrl: "https://openrouter.ai/api/v1", label: "OpenRouter", model: "openrouter/auto", capabilities: ALL_CAPABILITIES };

  // Anthropic
  if (key.startsWith("sk-ant-"))
    return { provider: "anthropic", baseUrl: "https://api.anthropic.com/v1", label: "Anthropic (Claude)", model: "claude-sonnet-4-20250514", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Mistral
  if (key.startsWith("MISTr") || key.startsWith("mistr"))
    return { provider: "mistral", baseUrl: "https://api.mistral.ai/v1", label: "Mistral AI", model: "mistral-large-latest", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Together AI
  if (key.startsWith("tog-") || key.startsWith("together-"))
    return { provider: "together", baseUrl: "https://api.together.xyz/v1", label: "Together AI", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };

  // Fireworks AI
  if (key.startsWith("fw_"))
    return { provider: "fireworks", baseUrl: "https://api.fireworks.ai/inference/v1", label: "Fireworks AI", model: "accounts/fireworks/models/llama-v3p3-70b-instruct", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Perplexity
  if (key.startsWith("pplx-"))
    return { provider: "perplexity", baseUrl: "https://api.perplexity.ai", label: "Perplexity", model: "sonar-pro", capabilities: ["chat", "search", "extract"] };

  // Cohere
  if (key.startsWith("co-") || key.startsWith("cohere-"))
    return { provider: "cohere", baseUrl: "https://api.cohere.com/v2", label: "Cohere", model: "command-r-plus", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // DeepSeek
  if (key.startsWith("sk-") && key.length > 40 && key.includes("deep"))
    return { provider: "deepseek", baseUrl: "https://api.deepseek.com/v1", label: "DeepSeek", model: "deepseek-chat", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Replicate
  if (key.startsWith("r8_"))
    return { provider: "replicate", baseUrl: "https://api.replicate.com/v1", label: "Replicate", model: "meta/llama-3-70b-instruct", capabilities: ["chat", "code", "image", "video"] };

  // Hugging Face
  if (key.startsWith("hf_"))
    return { provider: "huggingface", baseUrl: "https://api-inference.huggingface.co/v1", label: "Hugging Face", model: "meta-llama/Llama-3.3-70B-Instruct", capabilities: ["chat", "code", "image"] };

  // Stability AI
  if (key.startsWith("sk-") && key.length > 40 && key.includes("stab"))
    return { provider: "stability", baseUrl: "https://api.stability.ai/v1", label: "Stability AI", model: "stable-diffusion-xl-1024-v1-0", capabilities: ["image"] };

  // AI21
  if (key.startsWith("ai21-") || key.startsWith("j2-"))
    return { provider: "ai21", baseUrl: "https://api.ai21.com/studio/v1", label: "AI21 Labs", model: "jamba-1.5-large", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Cerebras
  if (key.startsWith("csk-"))
    return { provider: "cerebras", baseUrl: "https://api.cerebras.ai/v1", label: "Cerebras", model: "llama3.1-70b", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // SambaNova
  if (key.startsWith("sn-"))
    return { provider: "sambanova", baseUrl: "https://api.sambanova.ai/v1", label: "SambaNova", model: "Meta-Llama-3-70B-Instruct", capabilities: ["chat", "code"] };

  // Novita AI
  if (key.startsWith("nvt-"))
    return { provider: "novita", baseUrl: "https://api.novita.ai/v3/openai", label: "Novita AI", model: "meta-llama/llama-3.1-70b-instruct", capabilities: ["chat", "code", "image"] };

  // Lepton AI
  if (key.startsWith("lep-"))
    return { provider: "lepton", baseUrl: "https://api.lepton.ai/v1", label: "Lepton AI", model: "llama3-70b", capabilities: ["chat", "code"] };

  // Groq
  if (key.startsWith("gsk_"))
    return { provider: "groq", baseUrl: "https://api.groq.com/openai/v1", label: "Groq", model: "llama-3.3-70b-versatile", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // Google AI / Gemini
  if (key.startsWith("AIza"))
    return { provider: "google", baseUrl: "https://generativelanguage.googleapis.com/v1beta", label: "Google AI (Gemini)", model: "gemini-2.0-flash", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };

  // xAI / Grok
  if (key.startsWith("xai-"))
    return { provider: "xai", baseUrl: "https://api.x.ai/v1", label: "xAI (Grok)", model: "grok-3", capabilities: ["chat", "code", "search", "extract", "slides"] };

  // DeepInfra
  if (key.startsWith("di-") || key.startsWith("deepinfra-"))
    return { provider: "deepinfra", baseUrl: "https://api.deepinfra.com/v1/openai", label: "DeepInfra", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };

  // Cloudflare
  if (key.startsWith("cf-") || key.startsWith("cloudflare-"))
    return { provider: "cloudflare", baseUrl: "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1", label: "Cloudflare AI", model: "@cf/meta/llama-3-8b-instruct", capabilities: ["chat", "code"] };

  // OpenAI (catch-all for sk- prefix — must be after more specific sk- checks)
  if (key.startsWith("sk-proj-") || key.startsWith("sk-"))
    return { provider: "openai", baseUrl: "https://api.openai.com/v1", label: "OpenAI", model: "gpt-4o", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };

  // Fallback: any long key = generic OpenAI-compatible
  if (key.length >= 20)
    return { provider: "custom", baseUrl: "", label: "Custom Provider", model: "", capabilities: ["chat"] };

  return null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────
export const createEmptyFallback = (): FallbackAPI => ({
  id: crypto.randomUUID(),
  label: "",
  provider: "openai",
  baseUrl: "https://api.openai.com/v1",
  model: "",
  apiKey: "",
  savedKeyExists: false,
  enabled: true,
  capabilities: ["chat", "code"],
});

// Count total unique supported providers
export const TOTAL_PROVIDERS = CUSTOM_PROVIDERS.length;
// Count total models across all catalogs
export const TOTAL_MODELS = Object.values(MODEL_CATALOG).reduce((sum, models) => sum + models.length, 0);
// Count free presets
export const TOTAL_FREE_PRESETS = FREE_MODEL_PRESETS.length;

// Export/Import config
export interface ExportedConfig {
  version: 2;
  timestamp: string;
  fallbacks: Omit<FallbackAPI, "apiKey">[];
  selectedModel: string;
  useCustom: boolean;
}

export const exportConfig = (fallbacks: FallbackAPI[], selectedModel: string, useCustom: boolean): string => {
  const config: ExportedConfig = {
    version: 2,
    timestamp: new Date().toISOString(),
    fallbacks: fallbacks.map(({ apiKey, ...rest }) => rest),
    selectedModel,
    useCustom,
  };
  return JSON.stringify(config, null, 2);
};

export const importConfig = (json: string): ExportedConfig | null => {
  try {
    const parsed = JSON.parse(json);
    if (parsed.version && Array.isArray(parsed.fallbacks)) {
      return parsed as ExportedConfig;
    }
  } catch { /* ignore */ }
  return null;
};
