import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
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

  // Don't show breadcrumb on home page
  if (location.pathname === '/') return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-2 text-sm font-body"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {breadcrumbItems.map(({ path, isLast, pageName }) => (
        <span key={path} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {isLast ? (
            <span className="text-primary font-medium">{pageName}</span>
          ) : (
            <Link
              to={path}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {pageName}
            </Link>
          )}
        </span>
      ))}
    </motion.nav>
  );
};

export default Breadcrumb;
