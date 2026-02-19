
-- Create translations table for auto-generated Hindi translations
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_table TEXT NOT NULL,
  record_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi',
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_table, record_id, field_name, language)
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read translations"
ON public.translations
FOR SELECT
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_translations_lookup ON public.translations (source_table, record_id, field_name, language);
CREATE INDEX idx_translations_table ON public.translations (source_table, language);
