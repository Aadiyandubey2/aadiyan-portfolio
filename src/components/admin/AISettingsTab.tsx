import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Bot, Sparkles, Info, Key, Eye, EyeOff, CheckCircle2, Loader2, Zap, XCircle, AlertTriangle, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Shield, ExternalLink, Gift, Rocket, Download, Upload, Copy, Search, ToggleLeft, ToggleRight, Database, Layers, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  type ChatCapability, type FallbackAPI, type ModelPreset,
  ALL_CAPABILITIES, CAPABILITY_LABELS, AI_MODELS, CUSTOM_PROVIDERS,
  MODEL_CATALOG, FREE_MODEL_PRESETS, FREE_API_SOURCES,
  detectProviderFromKey, createEmptyFallback,
  TOTAL_PROVIDERS, TOTAL_MODELS, TOTAL_FREE_PRESETS,
  exportConfig, importConfig,
} from './ai-settings-data';

interface AISettingsTabProps {
  secretCode: string;
}

// ─── Sub-components ─────────────────────────────────────────────────────

// Mode filter tabs
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

// Model catalog browser
const ModelCatalogBrowser = ({ onSelectModel, currentProvider }: {
  onSelectModel: (model: ModelPreset) => void;
  currentProvider: string;
}) => {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogProvider, setCatalogProvider] = useState(currentProvider || "all");
  const [catalogCapFilter, setCatalogCapFilter] = useState<string>("all");

  const filteredModels = useMemo(() => {
    const providerKeys = catalogProvider === "all"
      ? Object.keys(MODEL_CATALOG)
      : [catalogProvider].filter(k => k in MODEL_CATALOG);

    return providerKeys.flatMap(pKey =>
      (MODEL_CATALOG[pKey] || []).map(m => ({ ...m, providerKey: pKey }))
    ).filter(m => {
      if (catalogSearch) {
        const q = catalogSearch.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) return false;
      }
      if (catalogCapFilter !== "all" && !m.capabilities.includes(catalogCapFilter as ChatCapability)) return false;
      return true;
    });
  }, [catalogProvider, catalogSearch, catalogCapFilter]);

  const speedColors = { fast: "text-green-500", medium: "text-amber-500", slow: "text-red-400" };
  const qualityColors = { high: "text-primary", medium: "text-muted-foreground", standard: "text-muted-foreground/60" };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={catalogSearch}
            onChange={e => setCatalogSearch(e.target.value)}
            className="h-8 text-xs pl-8"
          />
        </div>
        <Select value={catalogProvider} onValueChange={setCatalogProvider}>
          <SelectTrigger className="h-8 text-xs w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {Object.keys(MODEL_CATALOG).map(p => (
              <SelectItem key={p} value={p}>
                {CUSTOM_PROVIDERS.find(cp => cp.id === p)?.icon} {CUSTOM_PROVIDERS.find(cp => cp.id === p)?.name || p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Capability filter chips */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setCatalogCapFilter("all")}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
            catalogCapFilter === "all" ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground"
          }`}
        >All</button>
        {ALL_CAPABILITIES.map(cap => {
          const c = CAPABILITY_LABELS[cap];
          return (
            <button
              key={cap}
              onClick={() => setCatalogCapFilter(cap)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                catalogCapFilter === cap ? c.color + " font-medium" : "border-border text-muted-foreground"
              }`}
            >{c.icon} {c.label}</button>
          );
        })}
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {filteredModels.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No models found</p>
        ) : (
          filteredModels.map(m => {
            const provInfo = CUSTOM_PROVIDERS.find(p => p.id === m.providerKey);
            return (
              <button
                key={`${m.providerKey}-${m.id}`}
                onClick={() => onSelectModel(m)}
                className="w-full text-left p-2 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">{provInfo?.icon}</span>
                      <span className="text-xs font-medium truncate">{m.name}</span>
                      {m.context && <span className="text-[9px] text-muted-foreground/60 shrink-0">{m.context}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {m.capabilities.slice(0, 4).map(cap => (
                        <span key={cap} className={`text-[8px] px-1 rounded border leading-tight ${CAPABILITY_LABELS[cap].color}`}>
                          {CAPABILITY_LABELS[cap].icon}
                        </span>
                      ))}
                      {m.capabilities.length > 4 && (
                        <span className="text-[8px] text-muted-foreground">+{m.capabilities.length - 4}</span>
                      )}
                      {m.speed && <span className={`text-[8px] ml-1 ${speedColors[m.speed]}`}>⚡{m.speed}</span>}
                      {m.quality && <span className={`text-[8px] ml-1 ${qualityColors[m.quality]}`}>★{m.quality}</span>}
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-mono truncate">{m.id}</p>
              </button>
            );
          })
        )}
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center">
        {filteredModels.length} of {TOTAL_MODELS} models • {TOTAL_PROVIDERS} providers
      </p>
    </div>
  );
};

// Stats dashboard
const ProviderStats = ({ fallbacks }: { fallbacks: FallbackAPI[] }) => {
  const stats = useMemo(() => {
    const total = fallbacks.length;
    const enabled = fallbacks.filter(f => f.enabled).length;
    const withKeys = fallbacks.filter(f => f.savedKeyExists || f.apiKey.trim()).length;
    const providers = new Set(fallbacks.map(f => f.provider)).size;
    const capCoverage = ALL_CAPABILITIES.filter(cap =>
      fallbacks.some(f => f.enabled && f.capabilities.includes(cap))
    ).length;
    return { total, enabled, withKeys, providers, capCoverage };
  }, [fallbacks]);

  const items = [
    { label: "Total APIs", value: stats.total, icon: Database },
    { label: "Active", value: stats.enabled, icon: Zap },
    { label: "With Keys", value: stats.withKeys, icon: Key },
    { label: "Providers", value: stats.providers, icon: Layers },
    { label: "Mode Coverage", value: `${stats.capCoverage}/${ALL_CAPABILITIES.length}`, icon: Star },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map(item => (
        <div key={item.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border/40">
          <item.icon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm font-bold">{item.value}</p>
          <p className="text-[9px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────

const AISettingsTab = ({ secretCode }: AISettingsTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [fallbacks, setFallbacks] = useState<FallbackAPI[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [quickAddKey, setQuickAddKey] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { status: 'success' | 'error'; message: string }>>({});
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogTargetId, setCatalogTargetId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");

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
                  apiKey: "",
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

  // ─── Actions ────────────────────────────────────────────────────────
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
      if (!fallbacks.find(f => f.model === preset.model && f.provider === preset.provider)) {
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
    if (added === 0) { toast.info(`All ${source} presets already added`); return; }
    setFallbacks(prev => [...prev, ...newFallbacks]);
    toast.success(`Added ${added} ${source} model(s)`);
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

  // Bulk operations
  const enableAll = () => setFallbacks(prev => prev.map(f => ({ ...f, enabled: true })));
  const disableAll = () => setFallbacks(prev => prev.map(f => ({ ...f, enabled: false })));
  const removeAllWithoutKeys = () => {
    setFallbacks(prev => prev.filter(f => f.savedKeyExists || f.apiKey.trim()));
    toast.success("Removed APIs without saved keys");
  };
  const duplicateFallback = (fb: FallbackAPI) => {
    const dup: FallbackAPI = { ...fb, id: crypto.randomUUID(), label: `${fb.label} (copy)`, apiKey: "" };
    setFallbacks(prev => [...prev, dup]);
    setExpandedId(dup.id);
  };

  // Import/Export
  const handleExport = () => {
    const json = exportConfig(fallbacks, selectedModel, useCustomApiKey);
    navigator.clipboard.writeText(json);
    toast.success("Configuration copied to clipboard!");
  };
  const handleImport = () => {
    const config = importConfig(importJson);
    if (!config) { toast.error("Invalid configuration format"); return; }
    setFallbacks(config.fallbacks.map(f => ({ ...f, apiKey: "" })));
    setSelectedModel(config.selectedModel);
    setUseCustomApiKey(config.useCustom);
    setShowImport(false);
    setImportJson("");
    toast.success(`Imported ${config.fallbacks.length} API configurations`);
  };

  // Model catalog selection
  const handleCatalogSelect = (model: ModelPreset) => {
    if (catalogTargetId) {
      // Update existing fallback
      const provInfo = CUSTOM_PROVIDERS.find(p => p.id === model.provider);
      updateFallback(catalogTargetId, {
        model: model.id,
        provider: model.provider,
        baseUrl: provInfo?.baseUrl || "",
        label: model.name,
        capabilities: model.capabilities,
      });
      toast.success(`Set model to ${model.name}`);
    } else {
      // Create new fallback
      const provInfo = CUSTOM_PROVIDERS.find(p => p.id === model.provider);
      const newFb: FallbackAPI = {
        id: crypto.randomUUID(),
        label: model.name,
        provider: model.provider,
        baseUrl: provInfo?.baseUrl || "",
        model: model.id,
        apiKey: "",
        savedKeyExists: false,
        enabled: true,
        capabilities: model.capabilities,
      };
      setFallbacks(prev => [...prev, newFb]);
      setExpandedId(newFb.id);
      toast.success(`Added ${model.name} — enter your API key to activate`);
    }
    setShowCatalog(false);
    setCatalogTargetId(null);
  };

  // Test connection
  const testFallback = async (fb: FallbackAPI) => {
    if (!fb.apiKey.trim() && !fb.savedKeyExists) { toast.error('Enter an API key first'); return; }
    if (!fb.model.trim()) { toast.error('Enter a model name'); return; }
    if (!fb.baseUrl.trim()) { toast.error('Enter a base URL'); return; }

    setValidatingId(fb.id);
    setValidationResults(prev => { const n = { ...prev }; delete n[fb.id]; return n; });

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: 'Say "test" only' }],
          language: 'en', testMode: true,
          testConfig: { provider: fb.provider, baseUrl: fb.baseUrl, model: fb.model, apiKey: fb.apiKey.trim() || undefined },
        }
      });
      if (response.error) throw new Error(response.error.message || 'Connection test failed');
      if (response.data && typeof response.data === 'object' && 'error' in response.data) throw new Error(response.data.error as string);
      const reader = response.data?.getReader?.();
      if (reader) {
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        if (text.startsWith('{') && text.includes('"error"')) {
          try { const e = JSON.parse(text); if (e.error) throw new Error(e.error); } catch (e) { if (e instanceof Error && !e.message.includes('Unexpected token')) throw e; }
        }
      }
      setValidationResults(prev => ({ ...prev, [fb.id]: { status: 'success', message: 'Connection successful!' } }));
      toast.success(`${fb.label || 'API'} validated!`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed';
      setValidationResults(prev => ({ ...prev, [fb.id]: { status: 'error', message: msg } }));
      toast.error(`Validation failed: ${msg}`);
    } finally {
      setValidatingId(null);
    }
  };

  // Save
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const fallbackMeta = fallbacks.map(f => ({
        id: f.id, label: f.label, provider: f.provider, baseUrl: f.baseUrl,
        model: f.model, savedKeyExists: f.apiKey.trim() ? true : f.savedKeyExists,
        enabled: f.enabled, capabilities: f.capabilities,
      }));
      for (const fb of fallbacks) {
        if (fb.apiKey.trim()) {
          await supabase.functions.invoke('admin-api', {
            body: { action: 'updateTheme', secretCode, data: { key: `custom_api_key_${fb.id}`, value: fb.apiKey } }
          });
        }
      }
      for (const setting of [
        { key: 'ai_model', value: selectedModel },
        { key: 'custom_api_enabled', value: useCustomApiKey },
        { key: 'custom_api_fallbacks', value: JSON.stringify(fallbackMeta) },
      ]) {
        const { error } = await supabase.functions.invoke('admin-api', { body: { action: 'updateTheme', secretCode, data: setting } });
        if (error) throw error;
      }
      setFallbacks(prev => prev.map(f => ({ ...f, apiKey: "", savedKeyExists: f.apiKey.trim() ? true : f.savedKeyExists })));
      toast.success('AI settings saved!');
    } catch (error) {
      toast.error('Failed to save'); console.error(error);
    } finally { setIsSaving(false); }
  };

  const clearApiKey = async (fb: FallbackAPI) => {
    try {
      await supabase.functions.invoke('admin-api', { body: { action: 'updateTheme', secretCode, data: { key: `custom_api_key_${fb.id}`, value: '' } } });
      updateFallback(fb.id, { savedKeyExists: false, apiKey: '' });
      toast.success('API key removed');
    } catch { toast.error('Failed to remove API key'); }
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

  const filteredFallbacks = modeFilter === "all"
    ? fallbacks
    : fallbacks.filter(f => f.capabilities.includes(modeFilter as ChatCapability));

  return (
    <TabsContent value="ai-settings" className="space-y-6">
      {/* Header with stats */}
      <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold">API Configuration</h2>
              <p className="text-xs text-muted-foreground">
                {TOTAL_PROVIDERS} providers • {TOTAL_MODELS} models • {TOTAL_FREE_PRESETS} free presets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Use Custom API</span>
            <Switch checked={useCustomApiKey} onCheckedChange={setUseCustomApiKey} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!useCustomApiKey && (
            <motion.div key="builtin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-200/80">
                <p className="font-medium">Using Built-in AI Gateway</p>
                <p className="text-xs mt-1 opacity-80">No API key required. Usage is included with your plan.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom API Panel */}
      {useCustomApiKey && (
        <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
          {/* Stats Dashboard */}
          {fallbacks.length > 0 && <ProviderStats fallbacks={fallbacks} />}

          {/* Mode Filter Tabs */}
          <ModeFilterTabs activeFilter={modeFilter} onFilterChange={setModeFilter} fallbacks={fallbacks} />

          {/* Header + Actions */}
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
                    ? "APIs tried in order. Failures cascade to next."
                    : `Showing ${CAPABILITY_LABELS[modeFilter as ChatCapability]?.label} mode APIs`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={addFallback} className="gap-1.5 text-xs h-8">
                <Plus className="w-3.5 h-3.5" /> Add API
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowCatalog(true); setCatalogTargetId(null); }} className="gap-1.5 text-xs h-8">
                <Search className="w-3.5 h-3.5" /> Browse Models
              </Button>
            </div>
          </div>

          {/* Bulk Operations */}
          {fallbacks.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={enableAll} className="text-[10px] px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                <ToggleRight className="w-3 h-3" /> Enable All
              </button>
              <button onClick={disableAll} className="text-[10px] px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                <ToggleLeft className="w-3 h-3" /> Disable All
              </button>
              <button onClick={removeAllWithoutKeys} className="text-[10px] px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Remove Without Keys
              </button>
              <button onClick={handleExport} className="text-[10px] px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> Export Config
              </button>
              <button onClick={() => setShowImport(true)} className="text-[10px] px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                <Upload className="w-3 h-3" /> Import Config
              </button>
            </div>
          )}

          {/* Import Panel */}
          <AnimatePresence>
            {showImport && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                  <p className="text-xs font-medium">Paste exported configuration JSON:</p>
                  <textarea
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)}
                    placeholder='{"version": 2, "fallbacks": [...], ...}'
                    className="w-full h-24 text-xs p-2 rounded-lg border border-border bg-background resize-none font-mono"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleImport} disabled={!importJson.trim()} className="text-xs h-7 gap-1">
                      <Upload className="w-3 h-3" /> Import
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowImport(false); setImportJson(""); }} className="text-xs h-7">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Model Catalog Browser */}
          <AnimatePresence>
            {showCatalog && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-heading font-bold">Model Catalog — {TOTAL_MODELS} Models</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowCatalog(false)} className="text-xs h-7">Close</Button>
                  </div>
                  <ModelCatalogBrowser
                    onSelectModel={handleCatalogSelect}
                    currentProvider={catalogTargetId ? (fallbacks.find(f => f.id === catalogTargetId)?.provider || "all") : "all"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning Banner */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-200/80">
              <p className="font-medium">Using your own API keys</p>
              <p className="text-xs mt-1 opacity-80">
                You'll be charged by your providers. Drag to reorder priority. Built-in gateway is the final fallback.
              </p>
            </div>
          </div>

          {/* Quick Add by API Key */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-heading font-bold">Quick Add — Paste Any API Key</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-detects {TOTAL_PROVIDERS}+ providers: OpenAI, Anthropic, Google, Groq, Mistral, Together, Fireworks, Perplexity, Cohere, DeepSeek, xAI, Replicate, HuggingFace, DeepInfra, Cerebras, SambaNova, Novita, Lepton, Cloudflare, and more.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Paste any API key here..."
                value={quickAddKey}
                onChange={(e) => setQuickAddKey(e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Button
                size="sm"
                disabled={!quickAddKey.trim()}
                onClick={() => {
                  const detected = detectProviderFromKey(quickAddKey);
                  if (!detected) { toast.error("Unknown key format. Try adding manually."); return; }
                  const newFb: FallbackAPI = {
                    id: crypto.randomUUID(), label: detected.label, provider: detected.provider,
                    baseUrl: detected.baseUrl, model: detected.model, apiKey: quickAddKey.trim(),
                    savedKeyExists: false, enabled: true, capabilities: detected.capabilities,
                  };
                  setFallbacks(prev => [...prev, newFb]);
                  setExpandedId(newFb.id);
                  setQuickAddKey("");
                  toast.success(`Auto-detected ${detected.label}! Review and save.`);
                }}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Add
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
                  Unknown format — will be treated as custom OpenAI-compatible
                </div>
              );
            })()}
          </div>

          {/* Free Models Quick Setup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-heading font-bold">Free Models — {TOTAL_FREE_PRESETS} Presets</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CAPABILITIES.map(cap => {
                const c = CAPABILITY_LABELS[cap];
                const count = FREE_MODEL_PRESETS.filter(p => p.capabilities.includes(cap)).length;
                return (
                  <span key={cap} className={`text-[10px] px-2 py-0.5 rounded-full border ${c.color}`}>
                    {c.icon} {c.label} ({count})
                  </span>
                );
              })}
            </div>

            {FREE_API_SOURCES.map(source => {
              const sourcePresets = FREE_MODEL_PRESETS.filter(p => p.source === source.name);
              return (
                <div key={source.name} className="p-3 rounded-xl border border-border bg-card/30 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.limits}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Get Free Key <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => addAllPresetsForSource(source.name)}>
                        <Rocket className="w-3 h-3" /> Add All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {sourcePresets.map(preset => {
                      const alreadyAdded = fallbacks.some(f => f.model === preset.model && f.provider === preset.provider);
                      return (
                        <div key={preset.model} className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => addPreset(preset)}
                            disabled={alreadyAdded}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                              alreadyAdded ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                            }`}
                          >
                            {alreadyAdded ? '✓ ' : '+ '}{preset.label}
                          </button>
                          <div className="flex gap-1 flex-wrap">
                            {preset.capabilities.map(cap => (
                              <span key={cap} className={`text-[9px] px-1.5 py-0.5 rounded border ${CAPABILITY_LABELS[cap].color}`}>
                                {CAPABILITY_LABELS[cap].icon} {CAPABILITY_LABELS[cap].label}
                              </span>
                            ))}
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

          {/* API List */}
          {filteredFallbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{modeFilter === "all" ? "No custom APIs configured yet." : `No APIs for ${CAPABILITY_LABELS[modeFilter as ChatCapability]?.label} mode.`}</p>
              <p className="text-xs mt-1">Add free presets above, browse models, or paste an API key.</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={fallbacks} onReorder={setFallbacks} className="space-y-3">
              {filteredFallbacks.map(fb => {
                const index = fallbacks.indexOf(fb);
                const isExpanded = expandedId === fb.id;
                const validation = validationResults[fb.id];
                const provInfo = CUSTOM_PROVIDERS.find(p => p.id === fb.provider);

                return (
                  <Reorder.Item key={fb.id} value={fb} className="list-none">
                    <motion.div layout className={`rounded-xl border transition-colors ${
                      !fb.enabled ? 'bg-muted/20 border-border/50 opacity-60' :
                      validation?.status === 'success' ? 'bg-green-500/5 border-green-500/30' :
                      validation?.status === 'error' ? 'bg-destructive/5 border-destructive/30' :
                      'bg-card/50 border-border'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">#{index + 1}</span>
                        <span className="text-sm shrink-0">{provInfo?.icon || "🔧"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fb.label || `${provInfo?.name || 'Custom'} - ${fb.model || 'No model'}`}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {fb.capabilities.map(cap => (
                              <span key={cap} className={`text-[8px] px-1 py-0 rounded border leading-tight ${CAPABILITY_LABELS[cap].color}`}>{CAPABILITY_LABELS[cap].icon}</span>
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-1">{fb.model || 'Not configured'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {fb.savedKeyExists && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          <Switch checked={fb.enabled} onCheckedChange={v => updateFallback(fb.id, { enabled: v })} className="scale-75" />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedId(isExpanded ? null : fb.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeFallback(fb.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Config */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-4 space-y-3 border-t border-border/50 pt-3">
                              {/* Label */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Label</label>
                                <Input placeholder="e.g. Primary OpenAI, Backup Groq..." value={fb.label}
                                  onChange={e => updateFallback(fb.id, { label: e.target.value })} className="h-9 text-sm" />
                              </div>

                              {/* Provider */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Provider</label>
                                <Select value={fb.provider} onValueChange={v => handleProviderChange(fb.id, v)}>
                                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {CUSTOM_PROVIDERS.map(p => (
                                      <SelectItem key={p.id} value={p.id}>{p.icon} {p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Base URL */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Base URL</label>
                                <Input type="url" placeholder="https://api.example.com/v1" value={fb.baseUrl}
                                  onChange={e => updateFallback(fb.id, { baseUrl: e.target.value })} className="h-9 text-sm" />
                              </div>

                              {/* Model with Catalog Browser */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium">Model Name</label>
                                  <button onClick={() => { setCatalogTargetId(fb.id); setShowCatalog(true); }}
                                    className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                    <Search className="w-3 h-3" /> Browse catalog
                                  </button>
                                </div>
                                <Input placeholder="Enter model ID" value={fb.model}
                                  onChange={e => updateFallback(fb.id, { model: e.target.value })} className="h-9 text-sm" />
                                {/* Quick model suggestions for current provider */}
                                {MODEL_CATALOG[fb.provider] && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {MODEL_CATALOG[fb.provider].slice(0, 5).map(m => (
                                      <button key={m.id} onClick={() => updateFallback(fb.id, { model: m.id, capabilities: m.capabilities, label: fb.label || m.name })}
                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                          fb.model === m.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground"
                                        }`}>
                                        {m.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Capabilities */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium">Supported Modes</label>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {ALL_CAPABILITIES.map(cap => {
                                    const c = CAPABILITY_LABELS[cap];
                                    const isActive = fb.capabilities.includes(cap);
                                    return (
                                      <button key={cap} type="button"
                                        onClick={() => {
                                          const newCaps = isActive ? fb.capabilities.filter(x => x !== cap) : [...fb.capabilities, cap];
                                          if (newCaps.length === 0) return;
                                          updateFallback(fb.id, { capabilities: newCaps });
                                        }}
                                        className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                          isActive ? c.color + ' font-medium' : 'border-border text-muted-foreground hover:border-foreground/30'
                                        }`}>
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
                                      <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={() => clearApiKey(fb)}>Remove</Button>
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input
                                    type={showApiKeys[fb.id] ? "text" : "password"}
                                    placeholder={fb.savedKeyExists ? "••••••••••••" : "sk-..."}
                                    value={fb.apiKey}
                                    onChange={e => {
                                      const newKey = e.target.value;
                                      updateFallback(fb.id, { apiKey: newKey });
                                      if (newKey.trim() && !fb.model) {
                                        const detected = detectProviderFromKey(newKey);
                                        if (detected) updateFallback(fb.id, { apiKey: newKey, provider: detected.provider, baseUrl: detected.baseUrl, model: detected.model, label: fb.label || detected.label, capabilities: detected.capabilities });
                                      }
                                    }}
                                    className="h-9 text-sm pr-10"
                                  />
                                  <button type="button"
                                    onClick={() => setShowApiKeys(prev => ({ ...prev, [fb.id]: !prev[fb.id] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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

                              {/* Action buttons row */}
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => testFallback(fb)}
                                  disabled={validatingId === fb.id || (!fb.apiKey.trim() && !fb.savedKeyExists) || !fb.model.trim() || !fb.baseUrl.trim()}
                                  className="flex-1">
                                  {validatingId === fb.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Testing...</> : <><Zap className="w-4 h-4 mr-2" />Test Connection</>}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => duplicateFallback(fb)} className="gap-1 text-xs">
                                  <Copy className="w-3.5 h-3.5" /> Duplicate
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}

          {/* Info */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>How fallbacks work:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>APIs are tried in order from #1 to #{fallbacks.length || 'N'}</li>
                <li>Failed APIs (timeout, error, rate limit) cascade to next</li>
                <li>Disabled APIs are skipped</li>
                <li>Built-in gateway is the final safety net</li>
                <li>Mode-specific routing: only capable APIs are used per mode</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Built-in Model Selection */}
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-primary/5 border border-primary/20">
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
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a model" /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Google Models</div>
                {AI_MODELS.filter(m => m.category === "Google").map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenAI Models</div>
                {AI_MODELS.filter(m => m.category === "OpenAI").map(model => (
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

      {/* Save */}
      <Button onClick={saveSettings} disabled={isSaving} className="w-full sm:w-auto" size="lg">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save AI Settings'}
      </Button>
    </TabsContent>
  );
};

export default AISettingsTab;
