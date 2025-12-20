-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to portfolio images
CREATE POLICY "Anyone can view portfolio images" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-images');

-- Allow admin to upload images (via edge function with service role)
CREATE POLICY "Service role can manage portfolio images" ON storage.objects
FOR ALL USING (bucket_id = 'portfolio-images' AND auth.role() = 'service_role');

-- Add profile_image_url to site_content if needed (already using JSON so no schema change needed)