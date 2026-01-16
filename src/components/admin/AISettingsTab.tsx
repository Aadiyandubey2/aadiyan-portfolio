import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Bot, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface AISettingsTabProps {
  secretCode: string;
}

// Available models from Lovable AI
const AVAILABLE_MODELS = [
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash (Recommended)",
    description: "Fast, balanced speed and capability",
    category: "Google",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Good multimodal + reasoning, lower cost",
    category: "Google",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    description: "Fastest, best for simple tasks",
    category: "Google",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Highest quality, complex reasoning",
    category: "Google",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    description: "Next-gen, advanced capabilities",
    category: "Google",
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    description: "Fast and cost-effective",
    category: "OpenAI",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Balanced performance and cost",
    category: "OpenAI",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "Powerful, excellent reasoning",
    category: "OpenAI",
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    description: "Latest, enhanced reasoning",
    category: "OpenAI",
  },
];

const AISettingsTab = ({ secretCode }: AISettingsTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from("theme_settings")
          .select("value")
          .eq("key", "ai_model")
          .single();
        
        if (data?.value) {
          setSelectedModel(data.value as string);
        }
      } catch (error) {
        console.log("No AI model setting found, using default");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { 
          action: 'updateTheme', 
          secretCode, 
          data: { key: 'ai_model', value: selectedModel } 
        }
      });
      
      if (error) throw error;
      toast.success('AI settings saved! Clementine will use the new model.');
    } catch (error) {
      toast.error('Failed to save AI settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);

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
      {/* AI Model Selection */}
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

        {/* Current Model Info */}
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

        {/* Model Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select AI Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Google Models</div>
              {AVAILABLE_MODELS.filter(m => m.category === "Google").map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenAI Models</div>
              {AVAILABLE_MODELS.filter(m => m.category === "OpenAI").map((model) => (
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

        {/* Info Box */}
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
