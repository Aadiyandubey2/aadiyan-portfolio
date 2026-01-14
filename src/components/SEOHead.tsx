import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: object;
}

const BASE_URL = 'https://portfolio.vishwaguru.site';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const AUTHOR_NAME = 'Aadiyan Dubey';

// Core keywords that should appear on every page
const CORE_KEYWORDS = [
  'Aadiyan Dubey',
  'Aadiyan Dubey portfolio',
  'Aadiyan Dubey developer',
  'Full Stack Developer',
  'React Developer India',
  'NIT Nagaland',
];

/**
 * SEOHead component for dynamic page-specific meta tags
 * Updates document head with SEO-optimized meta tags for each page
 */
const SEOHead = ({
  title,
  description,
  canonical,
  type = 'website',
  image = DEFAULT_IMAGE,
  keywords,
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  useEffect(() => {
    // Build full title with branding
    const fullTitle = title.includes(AUTHOR_NAME) 
      ? title 
      : `${title} | ${AUTHOR_NAME}`;
    
    // Update document title (under 60 chars recommended)
    document.title = fullTitle.length > 60 ? fullTitle.substring(0, 57) + '...' : fullTitle;

    // Helper function to update or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper function to update or create link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Helper to add JSON-LD script
    const setJsonLd = (id: string, data: object) => {
      let script = document.querySelector(`script[data-jsonld="${id}"]`) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-jsonld', id);
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    // Truncate description to 160 chars (SEO best practice)
    const truncatedDescription = description.length > 160 
      ? description.substring(0, 157) + '...' 
      : description;

    // Combine core keywords with page-specific keywords
    const allKeywords = keywords 
      ? [...CORE_KEYWORDS, ...keywords.split(',').map(k => k.trim())].join(', ')
      : CORE_KEYWORDS.join(', ');

    // Primary meta tags
    setMetaTag('description', truncatedDescription);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setMetaTag('keywords', allKeywords);
    setMetaTag('author', AUTHOR_NAME);

    // Open Graph tags
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', `${BASE_URL}${canonical}`, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', truncatedDescription, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:image:alt', `${AUTHOR_NAME} - ${title}`, true);
    setMetaTag('og:site_name', `${AUTHOR_NAME} Portfolio`, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@aadiyanhere');
    setMetaTag('twitter:url', `${BASE_URL}${canonical}`);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', truncatedDescription);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:image:alt', `${AUTHOR_NAME} Portfolio`);
    setMetaTag('twitter:creator', '@aadiyanhere');

    // Canonical URL
    setLinkTag('canonical', `${BASE_URL}${canonical}`);

    // Add page-specific JSON-LD if provided
    if (jsonLd) {
      setJsonLd('page-specific', jsonLd);
    }

    // Add BreadcrumbList JSON-LD for non-home pages
    if (canonical !== '/') {
      const pageName = canonical.replace('/', '').replace(/-/g, ' ');
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      
      const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": formattedPageName,
            "item": `${BASE_URL}${canonical}`
          }
        ]
      };
      setJsonLd('breadcrumb', breadcrumbLd);
    }

    // Cleanup function
    return () => {
      // Clean up page-specific JSON-LD on unmount
      const pageSpecificScript = document.querySelector('script[data-jsonld="page-specific"]');
      if (pageSpecificScript) {
        pageSpecificScript.remove();
      }
    };
  }, [title, description, canonical, type, image, keywords, noindex, jsonLd]);

  return null; // This component only manages document.head
};

export default SEOHead;
