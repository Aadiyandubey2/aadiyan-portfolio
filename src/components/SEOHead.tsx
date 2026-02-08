import { useEffect } from 'react';
import { useSEOSettings, getPageSEO } from '@/hooks/useSEOSettings';

interface SEOHeadProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackDescription: string;
  canonical: string;
  type?: 'website' | 'article' | 'profile';
  fallbackKeywords?: string;
  noindex?: boolean;
  jsonLd?: object;
}

/**
 * SEOHead component — reads from database SEO settings, falls back to props.
 */
const SEOHead = ({
  pageKey,
  fallbackTitle,
  fallbackDescription,
  canonical,
  type = 'website',
  fallbackKeywords,
  noindex: fallbackNoindex = false,
  jsonLd,
}: SEOHeadProps) => {
  const { data: seoSettings } = useSEOSettings();
  const pageSEO = getPageSEO(seoSettings, pageKey);

  const title = pageSEO?.title || fallbackTitle;
  const description = pageSEO?.description || fallbackDescription;
  const keywords = pageSEO?.keywords || fallbackKeywords || '';
  const image = pageSEO?.image || seoSettings?.global?.defaultOgImage || 'https://portfolio.vishwaguru.site/og-image.png';
  const noindex = pageSEO?.noindex ?? fallbackNoindex;
  const authorName = seoSettings?.global?.authorName || 'Aadiyan Dubey';
  const baseUrl = seoSettings?.global?.baseUrl || 'https://portfolio.vishwaguru.site';
  const twitterHandle = seoSettings?.global?.twitterHandle || '@aadiyanhere';

  useEffect(() => {
    // Build full title with branding
    const fullTitle = title.includes(authorName) ? title : `${title} | ${authorName}`;
    document.title = fullTitle.length > 60 ? fullTitle.substring(0, 57) + '...' : fullTitle;

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

    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

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

    const truncatedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;

    // Primary meta tags
    setMetaTag('description', truncatedDescription);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    if (keywords) setMetaTag('keywords', keywords);
    setMetaTag('author', authorName);

    // Open Graph
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', `${baseUrl}${canonical}`, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', truncatedDescription, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:image:alt', `${authorName} - ${title}`, true);
    setMetaTag('og:site_name', seoSettings?.global?.siteTitle || `${authorName} Portfolio`, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', twitterHandle);
    setMetaTag('twitter:url', `${baseUrl}${canonical}`);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', truncatedDescription);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:image:alt', `${authorName} Portfolio`);
    setMetaTag('twitter:creator', twitterHandle);

    // Canonical
    setLinkTag('canonical', `${baseUrl}${canonical}`);

    // JSON-LD: Page-specific
    if (jsonLd) setJsonLd('page-specific', jsonLd);

    // JSON-LD: Person schema (global)
    setJsonLd('person', {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": authorName,
      "url": baseUrl,
      "image": image,
      "sameAs": [
        `https://twitter.com/${twitterHandle.replace('@', '')}`,
      ].filter(Boolean),
      "jobTitle": "Full Stack Developer",
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "NIT Nagaland",
      },
      "knowsAbout": keywords ? keywords.split(',').map(k => k.trim()).slice(0, 10) : [],
    });

    // JSON-LD: WebSite schema (global)
    setJsonLd('website', {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": seoSettings?.global?.siteTitle || `${authorName} Portfolio`,
      "url": baseUrl,
      "description": truncatedDescription,
      "author": { "@type": "Person", "name": authorName },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    // JSON-LD: Breadcrumb (non-home pages)
    if (canonical !== '/') {
      const pageName = canonical.replace('/', '').replace(/-/g, ' ');
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      setJsonLd('breadcrumb', {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": formattedPageName, "item": `${baseUrl}${canonical}` },
        ],
      });
    }

    return () => {
      const pageSpecificScript = document.querySelector('script[data-jsonld="page-specific"]');
      if (pageSpecificScript) pageSpecificScript.remove();
    };
  }, [title, description, canonical, type, image, keywords, noindex, jsonLd, authorName, baseUrl, twitterHandle, seoSettings]);

  return null;
};

export default SEOHead;
