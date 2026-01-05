-- Make image_url nullable for certificates (to allow creating before uploading)
ALTER TABLE public.certificates ALTER COLUMN image_url DROP NOT NULL;

-- Make video_url nullable for showcases (to allow creating before uploading)
ALTER TABLE public.showcases ALTER COLUMN video_url DROP NOT NULL;