import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Droplets, Rocket, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { useTheme, availableFonts, ThemeType, FontSettings } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface ThemeSettingsTabProps {
  secretCode: string;
}

const ThemeSettingsTab = ({ secretCode }: ThemeSettingsTabProps) => {
  const { theme, fonts, setTheme, setFonts } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [localTheme, setLocalTheme] = useState<ThemeType>(theme);
  const [localFonts, setLocalFonts] = useState<FontSettings>(fonts);

  const saveThemeSettings = async () => {
    setIsSaving(true);
    try {
      // Update theme
      const { error: themeError } = await supabase.functions.invoke('admin-api', {
        body: { action: 'updateTheme', secretCode, data: { key: 'active_theme', value: localTheme } }
      });
      if (themeError) throw themeError;

      // Update fonts
      const { error: fontError } = await supabase.functions.invoke('admin-api', {
        body: { action: 'updateTheme', secretCode, data: { key: 'fonts', value: localFonts } }
      });
      if (fontError) throw fontError;

      // Apply changes
      setTheme(localTheme);
      setFonts(localFonts);
      toast.success('Theme settings saved!');
    } catch (error) {
      toast.error('Failed to save theme settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TabsContent value="theme" className="space-y-6">
      {/* Theme Selection */}
      <div className="glass-card rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold">Theme Selection</h2>
            <p className="text-sm text-muted-foreground">Choose your portfolio's visual style</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Space Theme Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocalTheme('space')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              localTheme === 'space'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="absolute top-3 right-3">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="font-heading font-bold">Space Theme</h3>
              <p className="text-xs text-muted-foreground">
                Dark cosmic design with neon accents, perfect for a futuristic tech portfolio
              </p>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(222,47%,4%)] border border-border" title="Background" />
                <div className="w-6 h-6 rounded-full bg-[hsl(187,100%,50%)]" title="Primary" />
                <div className="w-6 h-6 rounded-full bg-[hsl(263,70%,50%)]" title="Secondary" />
                <div className="w-6 h-6 rounded-full bg-[hsl(217,91%,60%)]" title="Accent" />
              </div>
            </div>
            {localTheme === 'space' && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary"
              />
            )}
          </motion.button>

          {/* Water Theme Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocalTheme('water')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              localTheme === 'water'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="absolute top-3 right-3">
              <Droplets className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="space-y-3">
              <h3 className="font-heading font-bold">Apple Water Glass</h3>
              <p className="text-xs text-muted-foreground">
                Liquid glass UI with soft transparency, blur effects, and water-like animations
              </p>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(200,30%,98%)] border border-gray-200" title="Background" />
                <div className="w-6 h-6 rounded-full bg-[hsl(199,89%,48%)]" title="Primary" />
                <div className="w-6 h-6 rounded-full bg-[hsl(187,70%,75%)]" title="Accent" />
                <div className="w-6 h-6 rounded-full bg-[hsl(210,40%,90%)]" title="Secondary" />
              </div>
            </div>
            {localTheme === 'water' && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary"
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Typography Settings */}
      <div className="glass-card rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold">Typography</h2>
            <p className="text-sm text-muted-foreground">Customize fonts across your portfolio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Heading Font */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Heading Font</label>
            <Select 
              value={localFonts.heading} 
              onValueChange={(value) => setLocalFonts({ ...localFonts, heading: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {availableFonts.heading.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for titles and headings</p>
          </div>

          {/* Body Font */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Body Font</label>
            <Select 
              value={localFonts.body} 
              onValueChange={(value) => setLocalFonts({ ...localFonts, body: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {availableFonts.body.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for paragraphs and content</p>
          </div>

          {/* Mono Font */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Monospace Font</label>
            <Select 
              value={localFonts.mono} 
              onValueChange={(value) => setLocalFonts({ ...localFonts, mono: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {availableFonts.mono.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for code and technical text</p>
          </div>
        </div>

        {/* Font Preview */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
          <div className="space-y-2">
            <p style={{ fontFamily: `'${localFonts.heading}', sans-serif` }} className="text-xl font-bold">
              Heading Font Preview - {localFonts.heading}
            </p>
            <p style={{ fontFamily: `'${localFonts.body}', sans-serif` }} className="text-base">
              Body font preview - This is how your paragraph text will look. {localFonts.body}
            </p>
            <p style={{ fontFamily: `'${localFonts.mono}', monospace` }} className="text-sm text-muted-foreground">
              const code = "Monospace preview - {localFonts.mono}";
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={saveThemeSettings}
        disabled={isSaving}
        className="w-full sm:w-auto"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Theme Settings'}
      </Button>
    </TabsContent>
  );
};

export default ThemeSettingsTab;
