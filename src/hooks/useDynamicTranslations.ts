import { useState, useEffect } from 'react';
import { getCached, setCache } from '@/lib/swr-cache';

export interface Translation {
  source_table: string;
  record_id: string;
  field_name: string;
  language: string;
  translated_text: string;
}

const CACHE_KEY = 'dynamic_translations_hi';

const getSupabase = () => import('@/integrations/supabase/client').then(m => m.supabase);

/**
 * Hook that fetches all Hindi translations from the database.
 * Returns a lookup function: td(table, recordId, fieldName, fallback) => translated or fallback
 */
export function useDynamicTranslations(language: string) {
  const [translations, setTranslations] = useState<Map<string, string>>(
    () => {
      const cached = getCached<Record<string, string>>(CACHE_KEY);
      return cached ? new Map(Object.entries(cached)) : new Map();
    }
  );

  useEffect(() => {
    if (language !== 'hi') return;

    let cancelled = false;

    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('translations')
          .select('source_table, record_id, field_name, translated_text')
          .eq('language', 'hi');

        if (error || !data || cancelled) return;

        const map = new Map<string, string>();
        const obj: Record<string, string> = {};
        data.forEach((t: Translation) => {
          const key = `${t.source_table}.${t.record_id}.${t.field_name}`;
          map.set(key, t.translated_text);
          obj[key] = t.translated_text;
        });

        setTranslations(map);
        setCache(CACHE_KEY, obj);
      } catch (e) {
        console.error('Failed to fetch translations:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [language]);

  /**
   * Get a dynamic translation.
   * @param table - source table name (e.g., 'projects')
   * @param recordId - record identifier
   * @param field - field name (e.g., 'title')
   * @param fallback - original English text
   */
  const td = (table: string, recordId: string, field: string, fallback: string): string => {
    if (language !== 'hi') return fallback;
    return translations.get(`${table}.${recordId}.${field}`) || fallback;
  };

  return { td, translations };
}
