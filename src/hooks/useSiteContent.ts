import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value');

        if (error) throw error;

        const contentObj: SiteContent = {};
        data?.forEach((item) => {
          (contentObj as Record<string, unknown>)[item.key] = item.value;
        });

        setContent(contentObj);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, isLoading, error };
};

export const useSkills = () => {
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('display_order');

        if (error) throw error;
        setSkills(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch skills'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return { skills, isLoading, error };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order');

        if (error) throw error;
        
        // Transform the data to match our interface
        const transformedProjects = (data || []).map(project => ({
          ...project,
          features: Array.isArray(project.features) ? project.features as unknown as ProjectFeature[] : []
        }));
        
        setProjects(transformedProjects as Project[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, isLoading, error };
};

export const useResume = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data, error } = await supabase
          .from('resume')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setResume(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch resume'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  return { resume, isLoading, error };
};
