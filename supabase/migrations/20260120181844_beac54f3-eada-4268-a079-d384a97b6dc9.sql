-- Add icon_url column for custom uploaded icons
ALTER TABLE public.orbit_skills ADD COLUMN IF NOT EXISTS icon_url TEXT;