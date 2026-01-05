-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showcases table
CREATE TABLE public.showcases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcases ENABLE ROW LEVEL SECURITY;

-- Create read policies (public read access)
CREATE POLICY "Anyone can read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Anyone can read showcases" ON public.showcases FOR SELECT USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('showcases', 'showcases', true);

-- Storage policies for certificates
CREATE POLICY "Public certificate access" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can update certificates" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can delete certificates" ON storage.objects FOR DELETE USING (bucket_id = 'certificates');

-- Storage policies for showcases
CREATE POLICY "Public showcase access" ON storage.objects FOR SELECT USING (bucket_id = 'showcases');
CREATE POLICY "Authenticated users can upload showcases" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'showcases');
CREATE POLICY "Authenticated users can update showcases" ON storage.objects FOR UPDATE USING (bucket_id = 'showcases');
CREATE POLICY "Authenticated users can delete showcases" ON storage.objects FOR DELETE USING (bucket_id = 'showcases');