import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryItemData {
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  image_url: string | null;
  icon: string;
  display_order: number;
}

export const useGalleryItems = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setGalleryItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch gallery items'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  return { galleryItems, isLoading, error };
};
