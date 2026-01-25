import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Bot, Info, Key, Eye, EyeOff, CheckCircle2, Loader2, Zap, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface AISettingsTabProps {
  secretCode: string;
}

// Custom API provider options
const CUSTOM_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { id: "google", name: "Google AI (Gemini)", baseUrl: "https://generativelanguage.googleapis.com/v1beta" },
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "https://api.anthropic.com/v1" },
  { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { id: "custom", name: "Custom Endpoint", baseUrl: "" },
];

const AISettingsTab = ({ secretCode }: AISettingsTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom API key settings
  const [customApiKey, setCustomApiKey] = useState("");
  const [customProvider, setCustomProvider] = useState("custom");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKeyExists, setSavedApiKeyExists] = useState(false);
  
  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState("");

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from("theme_settings")
          .select("key, value")
          .in("key", ["custom_api_provider", "custom_api_base_url", "custom_api_model", "custom_api_key_set"]);
        
        settings?.forEach(setting => {
          switch (setting.key) {
            case "custom_api_provider":
              if (setting.value) setCustomProvider(setting.value as string);
              break;
            case "custom_api_base_url":
              if (setting.value) setCustomBaseUrl(setting.value as string);
              break;
            case "custom_api_model":
              if (setting.value) setCustomModelName(setting.value as string);
              break;
            case "custom_api_key_set":
              setSavedApiKeyExists(setting.value === true || setting.value === "true");
              break;
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

  // Update base URL when provider changes (only for non-custom providers)
  useEffect(() => {
    const provider = CUSTOM_PROVIDERS.find(p => p.id === customProvider);
    if (provider && provider.id !== "custom" && provider.baseUrl) {
      setCustomBaseUrl(provider.baseUrl);
    }
  }, [customProvider]);

  // Test API key connection
  const testApiConnection = async () => {
    if (!customApiKey.trim() && !savedApiKeyExists) {
      toast.error('Please enter an API key first');
      return false;
    }
    
    if (!customModelName.trim()) {
      toast.error('Please enter a model name');
      return false;
    }

    if (!customBaseUrl.trim()) {
      toast.error('Please enter an API base URL');
      return false;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setValidationMessage("");

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: [{ role: 'user', content: 'Say "test" only' }],
          language: 'en',
          testMode: true,
          testConfig: {
            provider: customProvider,
            baseUrl: customBaseUrl,
            model: customModelName,
            apiKey: customApiKey.trim() || undefined,
          }
        }
      });

      // Check for error in response
      if (response.error) {
        throw new Error(response.error.message || 'Connection test failed');
      }

      // Check if response.data is an error object (JSON response)
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        throw new Error(response.data.error as string);
      }

      // Try to read the streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        
        // Check if response is an error JSON
        if (text.startsWith('{') && text.includes('"error"')) {
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) {
              throw new Error(errorData.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected token') {
              throw e;
            }
          }
        }
      }

      setValidationStatus('success');
      setValidationMessage('Connection successful! API key is valid.');
      toast.success('API key validated successfully!');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection test failed';
      setValidationStatus('error');
      setValidationMessage(errorMsg);
      toast.error(`Validation failed: ${errorMsg}`);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const saveSettings = async () => {
    // Validate required fields
    if (!customModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    if (!customBaseUrl.trim()) {
      toast.error('Please enter an API base URL');
      return;
    }

    if (!savedApiKeyExists && !customApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    // If new key provided, validate first
    if (customApiKey.trim()) {
      const isValid = await testApiConnection();
      if (!isValid) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // Save all settings - always enable custom API
      const settingsToSave: { key: string; value: string | boolean }[] = [
        { key: 'custom_api_enabled', value: true },
        { key: 'custom_api_provider', value: customProvider },
        { key: 'custom_api_base_url', value: customBaseUrl },
        { key: 'custom_api_model', value: customModelName },
      ];

      // If custom API key is provided, save it
      if (customApiKey.trim()) {
        settingsToSave.push({ key: 'custom_api_key', value: customApiKey });
        settingsToSave.push({ key: 'custom_api_key_set', value: true });
      }

      for (const setting of settingsToSave) {
        const { error } = await supabase.functions.invoke('admin-api', {
          body: { 
            action: 'updateTheme', 
            secretCode, 
            data: setting
          }
        });
        if (error) throw error;
      }

      setSavedApiKeyExists(customApiKey.trim() ? true : savedApiKeyExists);
      setCustomApiKey(""); // Clear the input after saving
      setValidationStatus('idle');
      toast.success('AI settings saved! Clementine will use the new configuration.');
    } catch (error) {
      toast.error('Failed to save AI settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearCustomApiKey = async () => {
    try {
      await supabase.functions.invoke('admin-api', {
        body: { 
          action: 'updateTheme', 
          secretCode, 
          data: { key: 'custom_api_key', value: '' }
        }
      });
      await supabase.functions.invoke('admin-api', {
        body: { 
          action: 'updateTheme', 
          secretCode, 
          data: { key: 'custom_api_key_set', value: false }
        }
      });
      setSavedApiKeyExists(false);
      toast.success('API key removed');
    } catch (error) {
      toast.error('Failed to remove API key');
    }
  };

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
      {/* API Configuration */}
      <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold">Clementine AI Configuration</h2>
            <p className="text-sm text-muted-foreground">Configure the AI model for your chatbot assistant</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-primary/80">
            <p className="font-medium">Configure your AI provider</p>
            <p className="text-xs mt-1 opacity-80">Connect your API key from any OpenAI-compatible provider. You'll be charged by your chosen provider.</p>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Select value={customProvider} onValueChange={setCustomProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_PROVIDERS.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Base URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">API Base URL</label>
          <Input
            type="url"
            placeholder="https://api.example.com/v1"
            value={customBaseUrl}
            onChange={(e) => setCustomBaseUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {customProvider === "custom" 
              ? "Enter your custom API base URL (e.g., https://api.example.com/v1)" 
              : "Auto-filled based on provider. You can modify if needed."}
          </p>
        </div>

        {/* Model Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Model Name</label>
          <Input
            placeholder={
              customProvider === "openai" ? "gpt-4o" : 
              customProvider === "anthropic" ? "claude-3-5-sonnet-20241022" : 
              customProvider === "google" ? "gemini-1.5-flash" :
              "Enter model ID"
            }
            value={customModelName}
            onChange={(e) => setCustomModelName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">The exact model ID from your provider</p>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            {savedApiKeyExists && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500">Key saved</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={clearCustomApiKey}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder={savedApiKeyExists ? "••••••••••••••••" : "sk-..."}
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Your API key is stored securely and never exposed to clients</p>
        </div>

        {/* Validation Status */}
        <AnimatePresence>
          {validationStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                validationStatus === 'success' 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-destructive/10 border border-destructive/30'
              }`}
            >
              {validationStatus === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <span className={`text-sm ${validationStatus === 'success' ? 'text-green-200/80' : 'text-destructive/80'}`}>
                {validationMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={testApiConnection}
            disabled={isValidating || (!customApiKey.trim() && !savedApiKeyExists) || !customModelName.trim() || !customBaseUrl.trim()}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={isSaving || !customModelName.trim() || !customBaseUrl.trim() || (!savedApiKeyExists && !customApiKey.trim())}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};

export default AISettingsTab;
