-- Create admin settings table for secret code
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin code (you'll change this)
INSERT INTO admin_settings (secret_code) VALUES ('aadiyan2024');

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- No direct access - only through edge function
CREATE POLICY "No direct access to admin_settings"
ON public.admin_settings FOR SELECT
USING (false);

-- Create profile content table
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (public portfolio)
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
USING (true);

-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects"
ON public.projects FOR SELECT
USING (true);

-- Create skills table
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  color TEXT DEFAULT '#00d4ff',
  icon TEXT DEFAULT 'code',
  skills TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read skills"
ON public.skills FOR SELECT
USING (true);

-- Create resume table
CREATE TABLE public.resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resume"
ON public.resume FOR SELECT
USING (true);

-- Insert default profile content
INSERT INTO site_content (key, value) VALUES 
('profile', '{"name": "Aadiyan Dubey", "tagline": "Hello World", "roles": ["Web Developer", "Full Stack Dev", "SEO Expert"], "bio": "B.Tech CSE @ NIT Nagaland | Creator of VishwaGuru.site", "email": "aadiyandubey@gmail.com", "phone": "+91 7477257790", "location": "NIT Nagaland, India"}'),
('about', '{"description": "Creator of VishwaGuru.site — a numerology predictions platform in English & Hindi.", "stats": [{"label": "JEE AIR", "value": "41,149"}, {"label": "CGPA", "value": "8.06"}, {"label": "Last Sem", "value": "8.34"}, {"label": "Projects", "value": "1"}]}'),
('timeline', '[{"year": "Mar-Apr 2025", "title": "Web Developer Intern", "institution": "CodeSA", "description": "Part-time Web Developer - UI/UX design, frontend development, and performance optimization.", "type": "work", "status": "completed"}, {"year": "Aug 2024 - Aug 2025", "title": "Literary & Arts Club Asst. Secretary", "institution": "NIT Nagaland", "description": "Coordinating cultural, literary, and artistic events.", "type": "position", "status": "completed"}, {"year": "2023 - Present", "title": "B.Tech CSE (CGPA: 8.06)", "institution": "NIT Nagaland", "description": "JEE Mains AIR 41,149. Last Semester CGPA: 8.34.", "type": "education", "status": "current"}, {"year": "2023", "title": "Higher Secondary (12th)", "institution": "Model High School, Jabalpur", "description": "Strong foundation in Mathematics and Computer Science.", "type": "education", "status": "completed"}]'),
('currently_building', '["React", "Node.js", "Supabase", "Tailwind CSS", "SEO"]');

-- Insert default skills
INSERT INTO skills (category, title, color, icon, skills, display_order) VALUES
('frontend', 'Frontend', '#00d4ff', 'code', ARRAY['React.js', 'HTML5/CSS3', 'Tailwind CSS', 'JavaScript', 'TypeScript'], 1),
('backend', 'Backend', '#8b5cf6', 'server', ARRAY['Node.js', 'Express.js', 'Supabase', 'REST APIs', 'JWT Auth'], 2),
('database', 'Database & Tools', '#3b82f6', 'database', ARRAY['MySQL', 'PostgreSQL', 'Git/GitHub', 'VS Code', 'Postman'], 3),
('other', 'Other', '#10b981', 'sparkle', ARRAY['SEO Optimization', 'UI/UX Design', 'Java (DSA)', 'Video Editing', 'Performance'], 4);

-- Insert default project
INSERT INTO projects (title, description, url, tech_stack, features, is_featured, display_order) VALUES
('VishwaGuru.site', 'A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.', 'https://vishwaguru.site', ARRAY['React', 'Node.js', 'Express.js', 'Supabase', 'JWT', 'Tailwind CSS'], '[{"icon": "globe", "color": "#00d4ff", "title": "Multi-language", "desc": "English & Hindi"}, {"icon": "crystal", "color": "#8b5cf6", "title": "Numerology", "desc": "Birth predictions"}, {"icon": "shield", "color": "#10b981", "title": "JWT Auth", "desc": "Secure auth"}, {"icon": "chart", "color": "#f59e0b", "title": "SEO", "desc": "Optimized"}, {"icon": "bolt", "color": "#ef4444", "title": "Fast", "desc": "Performance"}, {"icon": "devices", "color": "#3b82f6", "title": "Responsive", "desc": "All devices"}]', true, 1);