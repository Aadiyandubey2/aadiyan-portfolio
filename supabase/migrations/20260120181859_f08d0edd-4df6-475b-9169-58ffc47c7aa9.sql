-- Create bucket for orbit skill icons
INSERT INTO storage.buckets (id, name, public) VALUES ('orbit-icons', 'orbit-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "orbit icons public read" ON storage.objects FOR SELECT USING (bucket_id = 'orbit-icons');