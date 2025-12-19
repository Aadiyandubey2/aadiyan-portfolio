import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const projects = [
  {
    id: 1,
    title: 'VishwaGuru',
    description: 'A comprehensive numerology predictions platform supporting both English and Hindi, built with modern web technologies.',
    longDescription: 'Built VishwaGuru website for numerology predictions in English and Hindi. Features JWT authentication, enhanced SEO, and expanding dataset with example screenshots.',
    image: '/placeholder.svg',
    techStack: ['React', 'Node.js', 'Express.js', 'Supabase', 'JWT Auth'],
    category: 'Full Stack',
    github: null,
    demo: 'https://vishwaguru.site',
    featured: true,
  },
  {
    id: 2,
    title: 'Portfolio Website',
    description: 'A modern, responsive portfolio website with 3D animations, AI chatbot integration, and contact form functionality.',
    longDescription: 'Personal portfolio showcasing skills, projects, and experience with interactive 3D elements, smooth animations, and AI-powered chatbot.',
    image: '/placeholder.svg',
    techStack: ['React', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'Supabase'],
    category: 'Web App',
    github: null,
    demo: '#',
    featured: true,
  },
  {
    id: 3,
    title: 'UI/UX Projects',
    description: 'Collection of frontend development and UI/UX design projects completed during internship at CodeSA.',
    longDescription: 'Specializing in UI/UX design, frontend development, and performance optimization for various client projects.',
    image: '/placeholder.svg',
    techStack: ['React', 'Tailwind CSS', 'Figma', 'JavaScript'],
    category: 'Web App',
    github: null,
    demo: null,
    featured: false,
  },
  {
    id: 4,
    title: 'SEO Optimization Projects',
    description: 'SEO optimization implementations for web applications, improving search visibility and performance.',
    longDescription: 'Implemented SEO best practices, meta tags, structured data, and performance optimizations to improve search engine rankings.',
    image: '/placeholder.svg',
    techStack: ['SEO', 'HTML', 'JavaScript', 'Analytics'],
    category: 'SEO',
    github: null,
    demo: 'https://vishwaguru.site',
    featured: false,
  },
];

const categories = ['All', 'Full Stack', 'Web App', 'SEO'];

const ProjectCard = ({ project, index, isInView }: { project: typeof projects[0]; index: number; isInView: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group ${project.featured ? 'md:col-span-2' : ''}`}
    >
      <div className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-500 hover:scale-[1.02]">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-accent/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
        
        <div className="relative h-full flex flex-col">
          {/* Project Image/Preview */}
          <div className="relative h-48 md:h-56 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">{project.category === 'Full Stack' ? '🚀' : project.category === 'Web App' ? '🌐' : '📈'}</span>
              </div>
            </div>
            
            {/* Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center gap-4"
            >
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </motion.div>

            {/* Featured Badge */}
            {project.featured && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-mono font-semibold">
                Featured
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-muted/90 backdrop-blur-sm text-xs font-mono">
              {project.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-muted-foreground font-body text-sm mb-4 flex-1">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 rounded-md text-xs font-mono bg-muted text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="px-2 py-1 rounded-md text-xs font-mono bg-muted text-muted-foreground">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-4">
            My Projects
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Featured <span className="neon-text">Work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">
            A collection of projects that showcase my skills in web development, SEO, and full-stack applications.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full font-mono text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-glow-cyan'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
                isInView={isInView} 
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://vishwaguru.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-foreground border border-border hover:border-primary hover:text-primary transition-all duration-300"
          >
            Visit VishwaGuru.site
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;