import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const projects = [
  {
    id: 1,
    title: 'AI-Powered Code Assistant',
    description: 'An intelligent code assistant that helps developers write better code with AI-powered suggestions and real-time error detection.',
    longDescription: 'Built with modern AI technologies, this assistant provides context-aware code completions, explains complex code segments, and suggests optimizations. Features include multi-language support, integration with popular IDEs, and a custom fine-tuned model.',
    image: '/placeholder.svg',
    techStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'PostgreSQL'],
    category: 'AI/ML',
    github: 'https://github.com',
    demo: 'https://demo.com',
    featured: true,
  },
  {
    id: 2,
    title: 'Real-Time Collaboration Platform',
    description: 'A feature-rich platform enabling teams to collaborate in real-time with shared documents, video calls, and project management.',
    longDescription: 'Complete collaboration suite with real-time document editing, video conferencing, task management, and team chat. Supports up to 100 concurrent users with sub-100ms latency.',
    image: '/placeholder.svg',
    techStack: ['Next.js', 'TypeScript', 'WebRTC', 'Socket.io', 'Redis'],
    category: 'Web App',
    github: 'https://github.com',
    demo: 'https://demo.com',
    featured: true,
  },
  {
    id: 3,
    title: 'Blockchain Voting System',
    description: 'A secure and transparent voting system built on blockchain technology ensuring tamper-proof elections.',
    longDescription: 'Decentralized voting platform using smart contracts for vote integrity. Features include voter verification, anonymous voting, real-time results, and complete audit trails.',
    image: '/placeholder.svg',
    techStack: ['Solidity', 'Ethereum', 'React', 'Web3.js', 'IPFS'],
    category: 'Blockchain',
    github: 'https://github.com',
    demo: 'https://demo.com',
    featured: false,
  },
  {
    id: 4,
    title: 'Smart Home IoT Dashboard',
    description: 'Comprehensive IoT dashboard for monitoring and controlling smart home devices with automation capabilities.',
    longDescription: 'Unified control center for all smart home devices. Supports custom automation rules, energy monitoring, voice control integration, and mobile notifications.',
    image: '/placeholder.svg',
    techStack: ['React', 'Node.js', 'MQTT', 'InfluxDB', 'Raspberry Pi'],
    category: 'IoT',
    github: 'https://github.com',
    demo: null,
    featured: false,
  },
  {
    id: 5,
    title: 'ML-Powered Health Monitor',
    description: 'Health monitoring application using machine learning to predict potential health issues from user data.',
    longDescription: 'Analyzes health metrics using ML models to provide personalized health insights and early warning detection. Integrates with wearable devices and provides detailed health reports.',
    image: '/placeholder.svg',
    techStack: ['Python', 'PyTorch', 'Flask', 'React Native', 'MongoDB'],
    category: 'AI/ML',
    github: 'https://github.com',
    demo: 'https://demo.com',
    featured: true,
  },
  {
    id: 6,
    title: 'E-Commerce Microservices',
    description: 'Scalable e-commerce platform built with microservices architecture for high availability and performance.',
    longDescription: 'Complete e-commerce solution with separate services for inventory, payments, orders, and user management. Includes automated scaling, load balancing, and comprehensive monitoring.',
    image: '/placeholder.svg',
    techStack: ['Go', 'gRPC', 'Kubernetes', 'PostgreSQL', 'RabbitMQ'],
    category: 'Backend',
    github: 'https://github.com',
    demo: null,
    featured: false,
  },
];

const categories = ['All', 'AI/ML', 'Web App', 'Blockchain', 'IoT', 'Backend'];

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
                <span className="text-6xl opacity-20">{project.category === 'AI/ML' ? '🤖' : project.category === 'Web App' ? '🌐' : project.category === 'Blockchain' ? '⛓️' : project.category === 'IoT' ? '📡' : '⚙️'}</span>
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
            A collection of projects that showcase my skills in various domains of software development.
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
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-foreground border border-border hover:border-primary hover:text-primary transition-all duration-300"
          >
            View All Projects on GitHub
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
