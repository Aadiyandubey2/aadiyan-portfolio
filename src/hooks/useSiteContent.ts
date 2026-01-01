import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

const STALE_TIME_MS = 5 * 60 * 1000;

const fetchSiteContent = async (): Promise<SiteContent> => {
  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error) throw error;

  const contentObj: SiteContent = {};
  data?.forEach((item) => {
    (contentObj as Record<string, unknown>)[item.key] = item.value;
  });

  return contentObj;
};

const fetchSkills = async (): Promise<SkillCategory[]> => {
  const { data, error } = await supabase.from('skills').select('*').order('display_order');
  if (error) throw error;
  return (data || []) as SkillCategory[];
};

const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from('projects').select('*').order('display_order');
  if (error) throw error;

  const transformed = (data || []).map((project: any) => ({
    ...project,
    features: Array.isArray(project.features) ? (project.features as ProjectFeature[]) : [],
  }));

  return transformed as Project[];
};

const fetchResume = async (): Promise<Resume | null> => {
  const { data, error } = await supabase
    .from('resume')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();

  // no rows
  if (error && (error as any).code === 'PGRST116') return null;
  if (error) throw error;

  return (data || null) as Resume | null;
};

export const useSiteContent = () => {
  const query = useQuery({
    queryKey: ['site_content'],
    queryFn: fetchSiteContent,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    content: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
};

export const useSkills = () => {
  const query = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    skills: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
};

export const useProjects = () => {
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
};

export const useResume = () => {
  const query = useQuery({
    queryKey: ['resume'],
    queryFn: fetchResume,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    resume: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
};

