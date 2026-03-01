import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Bot, Sparkles, Info, Key, Eye, EyeOff, CheckCircle2, Loader2, Zap, XCircle, AlertTriangle, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Shield, ExternalLink, Gift, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface AISettingsTabProps {
  secretCode: string;
}

// Available AI models (built-in)
const AI_MODELS = [
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

const CUSTOM_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { id: "google", name: "Google AI (Gemini)", baseUrl: "https://generativelanguage.googleapis.com/v1beta" },
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "https://api.anthropic.com/v1" },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { id: "custom", name: "Custom Endpoint", baseUrl: "" },
];

// Mode capability types
type ChatCapability = "chat" | "code" | "image" | "video" | "search" | "extract" | "slides";

const CAPABILITY_LABELS: Record<ChatCapability, { label: string; color: string; icon: string }> = {
  chat: { label: "Chat", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", icon: "💬" },
  code: { label: "Code", color: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30", icon: "⌨️" },
  image: { label: "Image", color: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30", icon: "🎨" },
  video: { label: "Video", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30", icon: "🎬" },
  search: { label: "Research", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: "🔍" },
  extract: { label: "Extract", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30", icon: "📊" },
  slides: { label: "Slides", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30", icon: "📽️" },
};

// Free model presets - these are legitimately free models on various platforms
const FREE_MODEL_PRESETS = [
  {
    provider: "openrouter",
    label: "Free Models Router (Auto)",
    model: "openrouter/free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Auto-routes to best free model available",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "Llama 3.3 70B (Free)",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Meta's powerful 70B model, free tier",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "Qwen3 80B (Free)",
    model: "qwen/qwen3-next-80b-a3b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Powerful MoE model, 262K context",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "Gemma 3 27B (Free)",
    model: "google/gemma-3-27b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Google's open model with vision, free",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["chat", "code", "image", "search", "slides"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "Mistral Small 3.1 24B (Free)",
    model: "mistralai/mistral-small-3.1-24b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Vision + tools, 128K context, free",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "FLUX Schnell (Free Image)",
    model: "black-forest-labs/flux-schnell:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "Fast image generation model",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["image"] as ChatCapability[],
  },
  {
    provider: "openrouter",
    label: "Playground v2.5 (Free Image)",
    model: "playgroundai/playground-v2.5-1024px-aesthetic:free",
    baseUrl: "https://openrouter.ai/api/v1",
    description: "High quality aesthetic images",
    source: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    capabilities: ["image"] as ChatCapability[],
  },
  {
    provider: "groq",
    label: "Llama 3 70B (Groq Free)",
    model: "llama3-70b-8192",
    baseUrl: "https://api.groq.com/openai/v1",
    description: "Ultra-fast inference, generous free tier",
    source: "Groq",
    signupUrl: "https://console.groq.com/keys",
    capabilities: ["chat", "code", "search", "extract", "slides"] as ChatCapability[],
  },
  {
    provider: "groq",
    label: "Mixtral 8x7B (Groq Free)",
    model: "mixtral-8x7b-32768",
    baseUrl: "https://api.groq.com/openai/v1",
    description: "MoE model, free tier with 32K context",
    source: "Groq",
    signupUrl: "https://console.groq.com/keys",
    capabilities: ["chat", "code", "slides"] as ChatCapability[],
  },
  {
    provider: "google",
    label: "Gemini 2.0 Flash (Google Free)",
    model: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    description: "Google's free tier, 15 RPM",
    source: "Google AI Studio",
    signupUrl: "https://aistudio.google.com/apikey",
    capabilities: ["chat", "code", "image", "search", "extract", "slides"] as ChatCapability[],
  },
];

// Free API key sources guide
const FREE_API_SOURCES = [
  {
    name: "OpenRouter",
    url: "https://openrouter.ai/keys",
    freeModels: "10+ free models including Llama 3.1, Gemma 2, Mistral",
    limits: "Free models have no cost. Rate limited.",
    steps: "1. Sign up → 2. Go to Keys → 3. Create key → 4. Paste below",
  },
  {
    name: "Groq",
    url: "https://console.groq.com/keys",
    freeModels: "Llama 3 70B, Mixtral 8x7B, Gemma 7B",
    limits: "Free: ~30 req/min, 14.4K tokens/min",
    steps: "1. Sign up → 2. Create API key → 3. Paste below",
  },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com/apikey",
    freeModels: "Gemini 2.0 Flash, Gemini 1.5 Flash",
    limits: "Free: 15 requests/min, 1M tokens/day",
    steps: "1. Sign in with Google → 2. Create API key → 3. Paste below",
  },
];

interface FallbackAPI {
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

const ALL_CAPABILITIES: ChatCapability[] = ["chat", "code", "image", "video", "search", "extract", "slides"];
// Auto-detect provider from API key format
const detectProviderFromKey = (apiKey: string): { provider: string; baseUrl: string; label: string; model: string; capabilities: ChatCapability[] } | null => {
  const key = apiKey.trim();
  if (key.startsWith("sk-or-")) {
    return { provider: "openrouter", baseUrl: "https://openrouter.ai/api/v1", label: "OpenRouter", model: "openrouter/auto", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };
  }
  if (key.startsWith("sk-ant-")) {
    return { provider: "anthropic", baseUrl: "https://api.anthropic.com/v1", label: "Anthropic (Claude)", model: "claude-sonnet-4-20250514", capabilities: ["chat", "code", "search", "extract", "slides"] };
  }
  if (key.startsWith("sk-proj-") || key.startsWith("sk-")) {
    return { provider: "openai", baseUrl: "https://api.openai.com/v1", label: "OpenAI", model: "gpt-4o", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };
  }
  if (key.startsWith("gsk_")) {
    return { provider: "groq", baseUrl: "https://api.groq.com/openai/v1", label: "Groq", model: "llama3-70b-8192", capabilities: ["chat", "code", "search", "extract", "slides"] };
  }
  if (key.startsWith("AIza")) {
    return { provider: "google", baseUrl: "https://generativelanguage.googleapis.com/v1beta", label: "Google AI (Gemini)", model: "gemini-2.0-flash", capabilities: ["chat", "code", "image", "search", "extract", "slides"] };
  }
  if (key.startsWith("xai-")) {
    return { provider: "custom", baseUrl: "https://api.x.ai/v1", label: "xAI (Grok)", model: "grok-3", capabilities: ["chat", "code", "search", "extract", "slides"] };
  }
  return null;
};

const createEmptyFallback = (): FallbackAPI => ({
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

// Mode filter tabs component
const ModeFilterTabs = ({ activeFilter, onFilterChange, fallbacks }: {
  activeFilter: string;
  onFilterChange: (f: string) => void;
  fallbacks: FallbackAPI[];
}) => {
  const tabs = [
    { id: "all", label: "All", icon: "📋", count: fallbacks.length },
    ...ALL_CAPABILITIES.map(cap => ({
      id: cap,
      label: CAPABILITY_LABELS[cap].label,
      icon: CAPABILITY_LABELS[cap].icon,
      count: fallbacks.filter(f => f.capabilities.includes(cap)).length,
    })),
  ];
  return (
    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
            activeFilter === tab.id
              ? "bg-primary/15 border-primary/40 text-primary"
              : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          {tab.icon} {tab.label}
          <span className={`ml-1 text-[10px] ${activeFilter === tab.id ? "text-primary/70" : "text-muted-foreground/50"}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const AISettingsTab = ({ secretCode }: AISettingsTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");

  // Custom API toggle
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);

  // Multiple fallback APIs
  const [fallbacks, setFallbacks] = useState<FallbackAPI[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [quickAddKey, setQuickAddKey] = useState("");

  // Validation
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { status: 'success' | 'error'; message: string }>>({});

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from("theme_settings")
          .select("key, value")
          .in("key", ["ai_model", "custom_api_enabled", "custom_api_fallbacks"]);

        settings?.forEach(setting => {
          switch (setting.key) {
            case "ai_model":
              setSelectedModel(setting.value as string);
              break;
            case "custom_api_enabled":
              setUseCustomApiKey(setting.value === true || setting.value === "true");
              break;
            case "custom_api_fallbacks": {
              const saved = setting.value as unknown;
              if (Array.isArray(saved) && saved.length > 0) {
                setFallbacks(saved.map((f: Record<string, unknown>) => ({
                  id: (f.id as string) || crypto.randomUUID(),
                  label: (f.label as string) || "",
                  provider: (f.provider as string) || "openai",
                  baseUrl: (f.baseUrl as string) || "",
                  model: (f.model as string) || "",
                  apiKey: "", // never loaded back
                  savedKeyExists: (f.savedKeyExists as boolean) || false,
                  enabled: f.enabled !== false,
                  capabilities: (Array.isArray(f.capabilities) ? f.capabilities : ["chat", "code"]) as ChatCapability[],
                })));
              }
              break;
            }
          }
        });
      } catch (error) {
        console.log("Error loading AI settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const addFallback = () => {
    const newFb = createEmptyFallback();
    newFb.label = `API ${fallbacks.length + 1}`;
    setFallbacks(prev => [...prev, newFb]);
    setExpandedId(newFb.id);
  };

  const addPreset = (preset: typeof FREE_MODEL_PRESETS[0]) => {
    const existing = fallbacks.find(f => f.model === preset.model && f.provider === preset.provider);
    if (existing) {
      toast.info(`${preset.label} is already in your fallback chain`);
      setExpandedId(existing.id);
      return;
    }
    const newFb: FallbackAPI = {
      id: crypto.randomUUID(),
      label: preset.label,
      provider: preset.provider,
      baseUrl: preset.baseUrl,
      model: preset.model,
      apiKey: "",
      savedKeyExists: false,
      enabled: true,
      capabilities: preset.capabilities,
    };
    setFallbacks(prev => [...prev, newFb]);
    setExpandedId(newFb.id);
    toast.success(`Added ${preset.label} — now paste your ${preset.source} API key`);
  };

  const addAllPresetsForSource = (source: string) => {
    const presets = FREE_MODEL_PRESETS.filter(p => p.source === source);
    let added = 0;
    const newFallbacks: FallbackAPI[] = [];
    for (const preset of presets) {
      const existing = fallbacks.find(f => f.model === preset.model && f.provider === preset.provider);
      if (!existing) {
        newFallbacks.push({
          id: crypto.randomUUID(),
          label: preset.label,
          provider: preset.provider,
          baseUrl: preset.baseUrl,
          model: preset.model,
          apiKey: "",
          savedKeyExists: false,
          enabled: true,
          capabilities: preset.capabilities,
        });
        added++;
      }
    }
    if (added === 0) {
      toast.info(`All ${source} presets already added`);
      return;
    }
    setFallbacks(prev => [...prev, ...newFallbacks]);
    toast.success(`Added ${added} ${source} model(s) — paste your API key to activate`);
  };

  const removeFallback = (id: string) => {
    setFallbacks(prev => prev.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateFallback = (id: string, updates: Partial<FallbackAPI>) => {
    setFallbacks(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleProviderChange = (id: string, providerId: string) => {
    const provider = CUSTOM_PROVIDERS.find(p => p.id === providerId);
    updateFallback(id, {
      provider: providerId,
      baseUrl: provider?.id !== "custom" ? provider?.baseUrl || "" : "",
    });
  };

  const testFallback = async (fb: FallbackAPI) => {
    if (!fb.apiKey.trim() && !fb.savedKeyExists) {
      toast.error('Please enter an API key first');
      return;
    }
    if (!fb.model.trim()) {
      toast.error('Please enter a model name');
      return;
    }
    if (!fb.baseUrl.trim()) {
      toast.error('Please enter an API base URL');
      return;
    }

    setValidatingId(fb.id);
    setValidationResults(prev => { const n = { ...prev }; delete n[fb.id]; return n; });

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: 'Say "test" only' }],
          language: 'en',
          testMode: true,
          testConfig: {
            provider: fb.provider,
            baseUrl: fb.baseUrl,
            model: fb.model,
            apiKey: fb.apiKey.trim() || undefined,
          }
        }
      });

      if (response.error) throw new Error(response.error.message || 'Connection test failed');
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        throw new Error(response.data.error as string);
      }

      const reader = response.data?.getReader?.();
      if (reader) {
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        if (text.startsWith('{') && text.includes('"error"')) {
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) throw new Error(errorData.error);
          } catch (e) {
            if (e instanceof Error && !e.message.includes('Unexpected token')) throw e;
          }
        }
      }

      setValidationResults(prev => ({ ...prev, [fb.id]: { status: 'success', message: 'Connection successful!' } }));
      toast.success(`${fb.label || 'API'} validated successfully!`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Connection test failed';
      setValidationResults(prev => ({ ...prev, [fb.id]: { status: 'error', message: msg } }));
      toast.error(`Validation failed: ${msg}`);
    } finally {
      setValidatingId(null);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Prepare fallback data for storage (strip apiKeys from metadata, store separately)
      const fallbackMeta = fallbacks.map(f => ({
        id: f.id,
        label: f.label,
        provider: f.provider,
        baseUrl: f.baseUrl,
        model: f.model,
        savedKeyExists: f.apiKey.trim() ? true : f.savedKeyExists,
        enabled: f.enabled,
        capabilities: f.capabilities,
      }));

      // Save fallback API keys individually
      for (const fb of fallbacks) {
        if (fb.apiKey.trim()) {
          await supabase.functions.invoke('admin-api', {
            body: {
              action: 'updateTheme',
              secretCode,
              data: { key: `custom_api_key_${fb.id}`, value: fb.apiKey }
            }
          });
        }
      }

      // Save all settings
      const settingsToSave = [
        { key: 'ai_model', value: selectedModel },
        { key: 'custom_api_enabled', value: useCustomApiKey },
        { key: 'custom_api_fallbacks', value: JSON.stringify(fallbackMeta) },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase.functions.invoke('admin-api', {
          body: { action: 'updateTheme', secretCode, data: setting }
        });
        if (error) throw error;
      }

      // Clear entered API keys from state
      setFallbacks(prev => prev.map(f => ({
        ...f,
        apiKey: "",
        savedKeyExists: f.apiKey.trim() ? true : f.savedKeyExists,
      })));

      toast.success('AI settings saved! Clementine will use the new configuration.');
    } catch (error) {
      toast.error('Failed to save AI settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearApiKey = async (fb: FallbackAPI) => {
    try {
      await supabase.functions.invoke('admin-api', {
        body: {
          action: 'updateTheme',
          secretCode,
          data: { key: `custom_api_key_${fb.id}`, value: '' }
        }
      });
      updateFallback(fb.id, { savedKeyExists: false, apiKey: '' });
      toast.success('API key removed');
    } catch {
      toast.error('Failed to remove API key');
    }
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel);

  if (isLoading) {
    return (
      <TabsContent value="ai-settings" className="space-y-6">
        <div className="glass-card rounded-xl p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading AI settings...</div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="ai-settings" className="space-y-6">
      {/* API Source Toggle */}
      <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold">API Configuration</h2>
              <p className="text-sm text-muted-foreground">Built-in AI or your own custom APIs with fallbacks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Use Custom API</span>
            <Switch checked={useCustomApiKey} onCheckedChange={setUseCustomApiKey} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!useCustomApiKey && (
            <motion.div
              key="builtin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-200/80">
                <p className="font-medium">Using Built-in AI Gateway</p>
                <p className="text-xs mt-1 opacity-80">No API key required. Usage is included with your plan.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom API Fallback Chain */}
      {useCustomApiKey && (
        <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
          {/* Mode Filter Tabs */}
          <ModeFilterTabs
            activeFilter={modeFilter}
            onFilterChange={setModeFilter}
            fallbacks={fallbacks}
          />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold">
                  {modeFilter === "all" ? "All Custom APIs" : `${CAPABILITY_LABELS[modeFilter as ChatCapability]?.icon} ${CAPABILITY_LABELS[modeFilter as ChatCapability]?.label} APIs`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modeFilter === "all"
                    ? "APIs are tried in order. If one fails, the next is used."
                    : `Showing APIs that support ${CAPABILITY_LABELS[modeFilter as ChatCapability]?.label} mode`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addFallback} className="gap-2">
              <Plus className="w-4 h-4" />
              Add API
            </Button>
          </div>

          {/* Warning Banner */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-200/80">
              <p className="font-medium">Using your own API keys</p>
              <p className="text-xs mt-1 opacity-80">
                You'll be charged by your providers. Drag to reorder priority. If all custom APIs fail, the built-in gateway is used as final fallback.
              </p>
            </div>
          </div>

          {/* Quick Add by API Key */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-heading font-bold">Quick Add — Just Paste Your API Key</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste any API key and we'll auto-detect the provider, base URL, and default model. Supports OpenAI, Anthropic, Google, Groq, OpenRouter, and xAI.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Paste API key here (sk-..., AIza..., gsk_..., xai-...)"
                value={quickAddKey}
                onChange={(e) => setQuickAddKey(e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Button
                size="sm"
                disabled={!quickAddKey.trim()}
                onClick={() => {
                  const detected = detectProviderFromKey(quickAddKey);
                  if (!detected) {
                    toast.error("Could not detect provider from this API key format. Try adding manually.");
                    return;
                  }
                  const newFb: FallbackAPI = {
                    id: crypto.randomUUID(),
                    label: detected.label,
                    provider: detected.provider,
                    baseUrl: detected.baseUrl,
                    model: detected.model,
                    apiKey: quickAddKey.trim(),
                    savedKeyExists: false,
                    enabled: true,
                    capabilities: detected.capabilities,
                  };
                  setFallbacks(prev => [...prev, newFb]);
                  setExpandedId(newFb.id);
                  setQuickAddKey("");
                  toast.success(`Auto-detected ${detected.label}! Review settings and save.`);
                }}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Add
              </Button>
            </div>
            {quickAddKey.trim() && (() => {
              const detected = detectProviderFromKey(quickAddKey);
              return detected ? (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Detected: <strong>{detected.label}</strong> → {detected.model}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Unknown key format — try adding manually
                </div>
              );
            })()}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-heading font-bold">Quick Setup — Free Models by Mode</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Models are tagged by capability. Not all models support every mode (e.g. video, image gen).
            </p>

            {/* Mode filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_CAPABILITIES.map((cap) => {
                const c = CAPABILITY_LABELS[cap];
                const count = FREE_MODEL_PRESETS.filter(p => p.capabilities.includes(cap)).length;
                return (
                  <span key={cap} className={`text-[10px] px-2 py-0.5 rounded-full border ${c.color}`}>
                    {c.icon} {c.label} ({count})
                  </span>
                );
              })}
            </div>

            {/* Source Groups */}
            {FREE_API_SOURCES.map((source) => {
              const sourcePresets = FREE_MODEL_PRESETS.filter(p => p.source === source.name);
              return (
                <div key={source.name} className="p-3 rounded-xl border border-border bg-card/30 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.limits}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Get Free Key <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={() => addAllPresetsForSource(source.name)}
                      >
                        <Rocket className="w-3 h-3" />
                        Add All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {sourcePresets.map((preset) => {
                      const alreadyAdded = fallbacks.some(f => f.model === preset.model && f.provider === preset.provider);
                      return (
                        <div key={preset.model} className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => addPreset(preset)}
                            disabled={alreadyAdded}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                              alreadyAdded
                                ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                            }`}
                          >
                            {alreadyAdded ? '✓ ' : '+ '}{preset.label}
                          </button>
                          <div className="flex gap-1 flex-wrap">
                            {preset.capabilities.map(cap => {
                              const c = CAPABILITY_LABELS[cap];
                              return (
                                <span key={cap} className={`text-[9px] px-1.5 py-0.5 rounded border ${c.color}`}>
                                  {c.icon} {c.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">{source.steps}</p>
                </div>
              );
            })}
          </div>

          {(() => {
            const filteredFallbacks = modeFilter === "all"
              ? fallbacks
              : fallbacks.filter(f => f.capabilities.includes(modeFilter as ChatCapability));
            return filteredFallbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{modeFilter === "all" ? "No custom APIs configured yet." : `No APIs configured for ${CAPABILITY_LABELS[modeFilter as ChatCapability]?.label} mode.`}</p>
              <p className="text-xs mt-1">Add free presets above or click "Add API" for custom setup.</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={fallbacks} onReorder={setFallbacks} className="space-y-3">
              {filteredFallbacks.map((fb) => {
                const index = fallbacks.indexOf(fb);
                const isExpanded = expandedId === fb.id;
                const validation = validationResults[fb.id];
                return (
                  <Reorder.Item key={fb.id} value={fb} className="list-none">
                    <motion.div
                      layout
                      className={`rounded-xl border transition-colors ${
                        !fb.enabled ? 'bg-muted/20 border-border/50 opacity-60' :
                        validation?.status === 'success' ? 'bg-green-500/5 border-green-500/30' :
                        validation?.status === 'error' ? 'bg-destructive/5 border-destructive/30' :
                        'bg-card/50 border-border'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fb.label || `${CUSTOM_PROVIDERS.find(p => p.id === fb.provider)?.name || 'Custom'} - ${fb.model || 'No model'}`}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {fb.capabilities.map(cap => {
                              const c = CAPABILITY_LABELS[cap];
                              return (
                                <span key={cap} className={`text-[8px] px-1 py-0 rounded border leading-tight ${c.color}`}>
                                  {c.icon}
                                </span>
                              );
                            })}
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {fb.model || 'Not configured'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {fb.savedKeyExists && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          <Switch
                            checked={fb.enabled}
                            onCheckedChange={(v) => updateFallback(fb.id, { enabled: v })}
                            className="scale-75"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeFallback(fb.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Config */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-4 space-y-3 border-t border-border/50 pt-3">
                              {/* Label */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Label</label>
                                <Input
                                  placeholder="e.g. Primary OpenAI, Backup Groq..."
                                  value={fb.label}
                                  onChange={(e) => updateFallback(fb.id, { label: e.target.value })}
                                  className="h-9 text-sm"
                                />
                              </div>

                              {/* Provider */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Provider</label>
                                <Select value={fb.provider} onValueChange={(v) => handleProviderChange(fb.id, v)}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CUSTOM_PROVIDERS.map(p => (
                                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Base URL */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Base URL</label>
                                <Input
                                  type="url"
                                  placeholder="https://api.example.com/v1"
                                  value={fb.baseUrl}
                                  onChange={(e) => updateFallback(fb.id, { baseUrl: e.target.value })}
                                  className="h-9 text-sm"
                                />
                              </div>

                              {/* Model */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Model Name</label>
                                <Input
                                  placeholder={
                                    fb.provider === "openai" ? "gpt-4o" :
                                    fb.provider === "anthropic" ? "claude-3-5-sonnet-20241022" :
                                    fb.provider === "google" ? "gemini-1.5-flash" :
                                    "Enter model ID"
                                  }
                                  value={fb.model}
                                  onChange={(e) => updateFallback(fb.id, { model: e.target.value })}
                                  className="h-9 text-sm"
                                />
                              </div>

                              {/* Capabilities */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Supported Modes</label>
                                <p className="text-[10px] text-muted-foreground">Select what this API can handle</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {ALL_CAPABILITIES.map(cap => {
                                    const c = CAPABILITY_LABELS[cap];
                                    const isActive = fb.capabilities.includes(cap);
                                    return (
                                      <button
                                        key={cap}
                                        type="button"
                                        onClick={() => {
                                          const newCaps = isActive
                                            ? fb.capabilities.filter(x => x !== cap)
                                            : [...fb.capabilities, cap];
                                          if (newCaps.length === 0) return; // must have at least one
                                          updateFallback(fb.id, { capabilities: newCaps });
                                        }}
                                        className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                          isActive ? c.color + ' font-medium' : 'border-border text-muted-foreground hover:border-foreground/30'
                                        }`}
                                      >
                                        {c.icon} {c.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* API Key */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium">API Key</label>
                                  {fb.savedKeyExists && (
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                      <span className="text-xs text-green-500">Saved</span>
                                      <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={() => clearApiKey(fb)}>
                                        Remove
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input
                                    type={showApiKeys[fb.id] ? "text" : "password"}
                                    placeholder={fb.savedKeyExists ? "••••••••••••" : "sk-..."}
                                    value={fb.apiKey}
                                    onChange={(e) => {
                                      const newKey = e.target.value;
                                      updateFallback(fb.id, { apiKey: newKey });
                                      // Auto-detect and fill provider details if fields are empty
                                      if (newKey.trim() && !fb.model) {
                                        const detected = detectProviderFromKey(newKey);
                                        if (detected) {
                                          updateFallback(fb.id, {
                                            apiKey: newKey,
                                            provider: detected.provider,
                                            baseUrl: detected.baseUrl,
                                            model: detected.model,
                                            label: fb.label || detected.label,
                                            capabilities: detected.capabilities,
                                          });
                                        }
                                      }
                                    }}
                                    className="h-9 text-sm pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowApiKeys(prev => ({ ...prev, [fb.id]: !prev[fb.id] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showApiKeys[fb.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {/* Validation Result */}
                              {validation && (
                                <div className={`p-2 rounded-lg flex items-center gap-2 text-xs ${
                                  validation.status === 'success'
                                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300'
                                    : 'bg-destructive/10 border border-destructive/30 text-destructive'
                                }`}>
                                  {validation.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                  {validation.message}
                                </div>
                              )}

                              {/* Test Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testFallback(fb)}
                                disabled={validatingId === fb.id || (!fb.apiKey.trim() && !fb.savedKeyExists) || !fb.model.trim() || !fb.baseUrl.trim()}
                                className="w-full"
                              >
                                {validatingId === fb.id ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Testing...</>
                                ) : (
                                  <><Zap className="w-4 h-4 mr-2" />Test Connection</>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          );
          })()}

          {/* Info about fallback */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>How fallbacks work:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>APIs are tried in order from #1 to #{fallbacks.length || 'N'}</li>
                <li>If an API fails (timeout, error, rate limit), the next one is tried</li>
                <li>Disabled APIs are skipped</li>
                <li>If all custom APIs fail, the built-in gateway is used as final safety net</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Built-in AI Model Selection (only show if not using custom) */}
      {!useCustomApiKey && (
        <div className="glass-card rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold">Clementine AI Model</h2>
              <p className="text-sm text-muted-foreground">Choose the AI model for your assistant</p>
            </div>
          </div>

          {currentModel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Currently Active: {currentModel.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{currentModel.description}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium">Select AI Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Google Models</div>
                {AI_MODELS.filter(m => m.category === "Google").map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenAI Models</div>
                {AI_MODELS.filter(m => m.category === "OpenAI").map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Tip:</strong> Different models offer different experiences:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li><strong>Flash models</strong> - Faster responses, good for casual chat</li>
                <li><strong>Pro models</strong> - More detailed, nuanced responses</li>
                <li><strong>GPT models</strong> - Different style, excellent reasoning</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={saveSettings}
        disabled={isSaving}
        className="w-full sm:w-auto"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save AI Settings'}
      </Button>
    </TabsContent>
  );
};

export default AISettingsTab;
