import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Background3D from './Background3D';
import { useSiteContent } from '@/hooks/useSiteContent';
import profilePhotoFallback from '@/assets/profile-photo.jpg';

// Fallback data
const defaultTimeline = [
  {
    year: 'Mar-Apr 2025',
    title: 'Web Developer Intern',
    institution: 'CodeSA',
    description: 'Part-time Web Developer - UI/UX design, frontend development, and performance optimization.',
    type: 'work',
    status: 'completed',
  },
  {
    year: 'Aug 2024 - Aug 2025',
    title: 'Literary & Arts Club Asst. Secretary',
    institution: 'NIT Nagaland',
    description: 'Coordinating cultural, literary, and artistic events. Event planning and promotions.',
    type: 'position',
    status: 'completed',
  },
  {
    year: '2023 - Present',
    title: 'B.Tech CSE (CGPA: 8.06)',
    institution: 'NIT Nagaland',
    description: 'JEE Mains AIR 41,149. Last Semester CGPA: 8.34.',
    type: 'education',
    status: 'current',
  },
  {
    year: '2023',
    title: 'Higher Secondary (12th)',
    institution: 'Model High School, Jabalpur',
    description: 'Strong foundation in Mathematics and Computer Science.',
    type: 'education',
    status: 'completed',
  },
];

const defaultStats = [
  { label: 'JEE AIR', value: '41,149' },
  { label: 'CGPA', value: '8.06' },
  { label: 'Last Sem', value: '8.34' },
  { label: 'Projects', value: '1' },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { content, isLoading } = useSiteContent();

  const profile = content?.profile;
  const about = content?.about;
  const timeline = content?.timeline?.length ? content.timeline : defaultTimeline;
  const stats = about?.stats?.length ? about.stats : defaultStats;
  
  const name = profile?.name || 'Aadiyan Dubey';
  const roles = profile?.roles?.join(' | ') || 'Web Developer | Full Stack Dev';
  const tagline = profile?.tagline?.split('|')[0]?.trim() || 'B.Tech CSE @ NIT Nagaland';
  const bio = about?.description || 'Creator of VishwaGuru.site — a numerology predictions platform in English & Hindi.';
  const profileImage = profile?.profile_image_url || profilePhotoFallback;

  return (
    <section id="about" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      {/* 3D Background */}
      <Background3D variant="minimal" color="#f59e0b" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6">
            whoami
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            About <span className="neon-text">Me</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-card rounded-2xl p-6">
              {/* Profile Photo with Animation */}
              <motion.div 
                className="w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg relative"
                whileHover={{ scale: 1.05, rotateY: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                <img 
                  src={profileImage} 
                  alt={name} 
                  className="w-full h-full object-cover relative z-10"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent z-20" />
              </motion.div>

              <div className="text-center mb-5">
                <h3 className="text-xl font-heading font-bold mb-1">{isLoading ? 'Loading...' : name}</h3>
                <p className="text-primary font-mono text-sm">{roles}</p>
                <p className="text-muted-foreground font-mono text-xs mt-1">{tagline}</p>
              </div>

              <p className="text-muted-foreground font-body text-sm text-center mb-5 leading-relaxed">
                {bio.includes('VishwaGuru') ? (
                  <>
                    {bio.split('VishwaGuru')[0]}
                    <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">VishwaGuru.site</a>
                    {bio.includes('VishwaGuru.site') ? bio.split('VishwaGuru.site')[1] : bio.split('VishwaGuru')[1]}
                  </>
                ) : bio}
              </p>

              {/* Stats - 2x2 grid on mobile, 4 columns on larger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className="p-2 sm:p-3 rounded-xl bg-muted/30 text-center"
                  >
                    <div className="text-sm sm:text-lg font-heading font-bold text-gradient">{stat.value}</div>
                    <div className="text-[8px] sm:text-[9px] text-muted-foreground font-mono uppercase">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              Journey
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent rounded-full" />

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <motion.div
                    key={`${item.year}-${item.title}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="relative pl-12"
                  >
                    <div className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.status === 'current' ? 'bg-primary/20 border border-primary/50' : 'bg-muted border border-border/50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${item.status === 'current' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.year}</span>
                        {item.status === 'current' && (
                          <span className="text-[10px] font-mono text-green-400">Current</span>
                        )}
                      </div>
                      <h4 className="text-sm font-heading font-semibold">{item.title}</h4>
                      <p className="text-xs text-primary/80">{item.institution}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
