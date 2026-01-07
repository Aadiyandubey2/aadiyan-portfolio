-- Create theme_settings table for storing theme and font preferences
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for theme settings
CREATE POLICY "Theme settings are publicly readable"
ON public.theme_settings
FOR SELECT
USING (true);

-- Insert default theme settings
INSERT INTO public.theme_settings (key, value) VALUES 
  ('active_theme', '"space"'::jsonb),
  ('fonts', '{
    "heading": "Orbitron",
    "body": "Inter",
    "mono": "JetBrains Mono"
  }'::jsonb);

-- Add comment
COMMENT ON TABLE public.theme_settings IS 'Stores theme and typography settings for the portfolio';