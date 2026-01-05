-- Add media_type column to showcases to support video links and images
ALTER TABLE public.showcases ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'video';
-- Can be: 'video', 'youtube', 'vimeo', 'image'

-- Add external_url column for YouTube/Vimeo links
ALTER TABLE public.showcases ADD COLUMN IF NOT EXISTS external_url TEXT;