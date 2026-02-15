import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCached, setCache } from '@/lib/swr-cache';

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
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(
    () => getCached<GalleryItemData[]>('gallery_items') ?? []
  );
  const [isLoading, setIsLoading] = useState(
    () => getCached<GalleryItemData[]>('gallery_items') === null
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        const items = data || [];
        setGalleryItems(items);
        setCache('gallery_items', items);
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
