import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  noindex: boolean;
}

export interface SEOGlobal {
  siteTitle: string;
  baseUrl: string;
  authorName: string;
  twitterHandle: string;
  defaultOgImage: string;
  coreKeywords: string;
}

export interface SEOSettings {
  global: SEOGlobal;
  pages: Record<string, PageSEO>;
}

const DEFAULT_SEO: SEOSettings = {
  global: {
    siteTitle: "Aadiyan Dubey Portfolio",
    baseUrl: "https://portfolio.vishwaguru.site",
    authorName: "Aadiyan Dubey",
    twitterHandle: "@aadiyanhere",
    defaultOgImage: "https://portfolio.vishwaguru.site/og-image.png",
    coreKeywords: "Aadiyan Dubey, Full Stack Developer, React Developer India, NIT Nagaland",
  },
  pages: {
    home: {
      title: "Aadiyan Dubey | Full Stack Developer & React Expert Portfolio",
      description: "Aadiyan Dubey is a Full Stack Developer from NIT Nagaland specializing in React, TypeScript, Node.js & AI integration.",
      keywords: "portfolio, web developer, JavaScript, TypeScript",
      ogImage: "",
      noindex: false,
    },
    about: {
      title: "About Aadiyan Dubey | Full Stack Developer at NIT Nagaland",
      description: "Learn about Aadiyan Dubey - B.Tech CSE student at NIT Nagaland, Full Stack Developer with expertise in React, Node.js, and modern web development.",
      keywords: "about, education, experience, NIT Nagaland",
      ogImage: "",
      noindex: false,
    },
    projects: {
      title: "Projects | Aadiyan Dubey - Web Developer Portfolio",
      description: "Explore web development projects by Aadiyan Dubey including VishwaGuru.site. Full stack applications built with React, Node.js, and modern technologies.",
      keywords: "projects, web apps, React projects, portfolio projects",
      ogImage: "",
      noindex: false,
    },
    skills: {
      title: "Skills & Technologies | Aadiyan Dubey - Full Stack Developer",
      description: "Technical skills and expertise of Aadiyan Dubey. Proficient in React, TypeScript, Node.js, Express, Supabase, and modern frontend development.",
      keywords: "skills, technologies, React, TypeScript, Node.js",
      ogImage: "",
      noindex: false,
    },
    certificates: {
      title: "Certificates & Achievements | Aadiyan Dubey",
      description: "Professional certifications and achievements of Aadiyan Dubey. View verified certificates in web development, programming, and software engineering.",
      keywords: "certificates, achievements, certifications",
      ogImage: "",
      noindex: false,
    },
    showcase: {
      title: "Showcase | Aadiyan Dubey - Creative Work & Demos",
      description: "Creative showcase and demonstrations by Aadiyan Dubey. Explore interactive demos, design work, and innovative web development experiments.",
      keywords: "showcase, demos, creative work",
      ogImage: "",
      noindex: false,
    },
    contact: {
      title: "Contact Aadiyan Dubey | Hire Full Stack Developer",
      description: "Get in touch with Aadiyan Dubey for web development projects, collaborations, or job opportunities.",
      keywords: "contact, hire developer, freelance",
      ogImage: "",
      noindex: false,
    },
  },
};

export const useSEOSettings = () => {
  return useQuery({
    queryKey: ["seo-settings"],
    queryFn: async (): Promise<SEOSettings> => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "seo")
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        // Merge with defaults to ensure all fields exist
        const stored = data.value as unknown as SEOSettings;
        return {
          global: { ...DEFAULT_SEO.global, ...stored.global },
          pages: {
            ...DEFAULT_SEO.pages,
            ...Object.fromEntries(
              Object.entries(DEFAULT_SEO.pages).map(([key, defaults]) => [
                key,
                { ...defaults, ...(stored.pages?.[key] || {}) },
              ])
            ),
          },
        };
      }
      return DEFAULT_SEO;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const getPageSEO = (settings: SEOSettings | undefined, pageKey: string) => {
  if (!settings) return undefined;
  const page = settings.pages[pageKey];
  if (!page) return undefined;
  return {
    title: page.title,
    description: page.description,
    keywords: [settings.global.coreKeywords, page.keywords].filter(Boolean).join(", "),
    image: page.ogImage || settings.global.defaultOgImage,
    noindex: page.noindex,
  };
};
