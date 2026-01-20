-- Create table for orbit visualization settings
CREATE TABLE public.orbit_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'sparkle',
  color TEXT NOT NULL DEFAULT '#00d4ff',
  orbit_index INTEGER NOT NULL DEFAULT 0, -- 0 = inner orbit, 1 = outer orbit
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orbit_skills ENABLE ROW LEVEL SECURITY;

-- Anyone can read orbit skills (public portfolio)
CREATE POLICY "Anyone can read orbit_skills" 
ON public.orbit_skills 
FOR SELECT 
USING (true);

-- Insert default orbit skills for demonstration
INSERT INTO public.orbit_skills (name, icon, color, orbit_index, display_order) VALUES
('React', 'react', '#61DAFB', 0, 0),
('TypeScript', 'code', '#3178C6', 0, 1),
('Tailwind', 'design', '#06B6D4', 0, 2),
('Node.js', 'server', '#339933', 1, 0),
('Supabase', 'database', '#3ECF8E', 1, 1),
('PostgreSQL', 'database', '#4169E1', 1, 2);