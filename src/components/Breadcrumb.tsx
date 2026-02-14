import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

const pageNames: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/skills': 'Skills',
  '/projects': 'Projects',
  '/certificates': 'Certificates',
  '/showcase': 'Showcase',
  '/contact': 'Contact',
  '/admin': 'Admin',
};

const Breadcrumb = () => {
  const location = useLocation();
  
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    return pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSegments.length - 1;
      const pageName = pageNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      return { path, isLast, pageName };
    });
  }, [location.pathname]);

  if (location.pathname === '/') return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm font-body mb-4 animate-[fadeSlideIn_0.3s_ease-out]"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center gap-2 list-none p-0 m-0">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            aria-label="Go to homepage"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        
        {breadcrumbItems.map(({ path, isLast, pageName }) => (
          <li key={path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" aria-hidden="true" />
            {isLast ? (
              <span 
                className="text-primary font-medium"
                aria-current="page"
              >
                {pageName}
              </span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              >
                {pageName}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
