import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  keywords?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://portfolio.vishwaguru.site';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

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
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title (under 60 chars recommended)
    document.title = title.length > 60 ? title.substring(0, 57) + '...' : title;

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

    // Truncate description to 160 chars (SEO best practice)
    const truncatedDescription = description.length > 160 
      ? description.substring(0, 157) + '...' 
      : description;

    // Primary meta tags
    setMetaTag('description', truncatedDescription);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Open Graph tags
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', `${BASE_URL}${canonical}`, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', truncatedDescription, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:site_name', 'Aadiyan Dubey Portfolio', true);

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', `${BASE_URL}${canonical}`);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', truncatedDescription);
    setMetaTag('twitter:image', image);

    // Canonical URL
    setLinkTag('canonical', `${BASE_URL}${canonical}`);

    // Cleanup function to restore defaults when component unmounts
    return () => {
      // Keep the meta tags as they are - they'll be updated by next page
    };
  }, [title, description, canonical, type, image, keywords, noindex]);

  return null; // This component only manages document.head
};

export default SEOHead;
