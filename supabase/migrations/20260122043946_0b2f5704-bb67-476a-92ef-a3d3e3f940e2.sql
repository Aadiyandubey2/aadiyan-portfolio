-- Create gallery_items table for "Explore My Portfolio" section
CREATE TABLE public.gallery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  href TEXT NOT NULL,
  image_url TEXT,
  icon TEXT NOT NULL DEFAULT 'layers',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read gallery_items" 
ON public.gallery_items 
FOR SELECT 
USING (true);

-- Insert default gallery items
INSERT INTO public.gallery_items (title, subtitle, href, image_url, icon, display_order) VALUES
('About Me', 'My journey & background', '/about', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60', 'user', 0),
('Skills', 'Tech stack & expertise', '/skills', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', 'cpu', 1),
('Projects', 'Featured applications', '/projects', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60', 'layers', 2),
('Certificates', 'Achievements & awards', '/certificates', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60', 'graduation-cap', 3),
('Showcase', 'Visual portfolio', '/showcase', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=60', 'palette', 4),
('Contact', 'Get in touch', '/contact', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop&q=60', 'send', 5);