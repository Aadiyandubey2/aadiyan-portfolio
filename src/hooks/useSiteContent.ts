import { useState, useEffect } from 'react';
import { getCached, setCache } from '@/lib/swr-cache';

export interface ProfileContent {
  name: string;
  tagline: string;
  roles: string[];
  bio: string;
  email: string;
  phone: string;
  location: string;
  profile_image_url?: string;
}

export interface AboutContent {
  description: string;
  stats: { label: string; value: string }[];
}

export interface TimelineItem {
  year: string;
  title: string;
  institution: string;
  description: string;
  type: string;
  status: string;
  display_order?: number;
}

export interface SkillCategory {
  id: string;
  category: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
  display_order: number;
}

export interface ProjectFeature {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  tech_stack: string[];
  features: ProjectFeature[];
  is_featured: boolean;
  display_order: number;
}

export interface OrbitSkill {
  id: string;
  name: string;
  icon: string;
  icon_url?: string | null;
  color: string;
  orbit_index: number;
  display_order: number;
}

export interface Resume {
  id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface SiteContent {
  profile?: ProfileContent;
  about?: AboutContent;
  timeline?: TimelineItem[];
  currently_building?: string[];
}

// Lazy load supabase client to reduce initial bundle
const getSupabase = () => import('@/integrations/supabase/client').then(m => m.supabase);

/** Generic SWR hook: returns cached data instantly, revalidates in background */
function useSWR<T>(cacheKey: string, fetcher: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(() => getCached<T>(cacheKey) ?? fallback);
  const [isLoading, setIsLoading] = useState(() => getCached<T>(cacheKey) === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((fresh) => {
        if (cancelled) return;
        setData(fresh);
        setCache(cacheKey, fresh);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [cacheKey]);

  return { data, isLoading, error };
}

export const useSiteContent = () => {
  const { data: content, isLoading, error } = useSWR<SiteContent | null>(
    'site_content',
    async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('site_content').select('key, value');
      if (error) throw error;
      const obj: SiteContent = {};
      data?.forEach((item) => {
        (obj as Record<string, unknown>)[item.key] = item.value;
      });
      return obj;
    },
    null
  );
  return { content, isLoading, error };
};

export const useSkills = () => {
  const { data: skills, isLoading, error } = useSWR<SkillCategory[]>(
    'skills',
    async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('skills').select('*').order('display_order');
      if (error) throw error;
      return data || [];
    },
    []
  );
  return { skills, isLoading, error };
};

export const useProjects = () => {
  const { data: projects, isLoading, error } = useSWR<Project[]>(
    'projects',
    async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('projects').select('*').order('display_order');
      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features as unknown as ProjectFeature[] : []
      })) as Project[];
    },
    []
  );
  return { projects, isLoading, error };
};

export const useResume = () => {
  const { data: resume, isLoading, error } = useSWR<Resume | null>(
    'resume',
    async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('resume')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    null
  );
  return { resume, isLoading, error };
};

export const useOrbitSkills = () => {
  const { data: orbitSkills, isLoading, error } = useSWR<OrbitSkill[]>(
    'orbit_skills',
    async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('orbit_skills')
        .select('*')
        .order('orbit_index')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    []
  );
  return { orbitSkills, isLoading, error };
};
