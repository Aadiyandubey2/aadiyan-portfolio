import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const timelineData = [
  {
    year: '2024',
    title: 'B.Tech CSE',
    institution: 'NIT Nagaland',
    description: 'Currently pursuing Computer Science Engineering with focus on software development and emerging technologies.',
    status: 'current',
  },
  {
    year: '2023',
    title: 'Higher Secondary',
    institution: 'Previous School',
    description: 'Completed 12th grade with strong foundation in Mathematics and Computer Science.',
    status: 'completed',
  },
  {
    year: '2021',
    title: 'Secondary Education',
    institution: 'Previous School',
    description: 'Built initial programming skills and discovered passion for technology.',
    status: 'completed',
  },
];

const stats = [
  { label: 'Projects Completed', value: '15+' },
  { label: 'Technologies', value: '20+' },
  { label: 'Lines of Code', value: '50K+' },
  { label: 'Cups of Coffee', value: '∞' },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-4">
            About Me
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Get to Know <span className="neon-text">Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">
            A passionate computer science student driven by curiosity and the desire to create meaningful technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-500">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl opacity-30 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
              
              <div className="relative">
                {/* Profile Image Placeholder */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-5xl font-heading font-bold neon-text">AD</span>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-bold mb-2">Aadiyan Dubey</h3>
                  <p className="text-primary font-mono text-sm">B.Tech CSE @ NIT Nagaland</p>
                </div>

                <p className="text-muted-foreground font-body leading-relaxed mb-6">
                  I'm a Computer Science Engineering student at the National Institute of Technology, Nagaland, 
                  with a deep passion for building innovative software solutions. My journey in tech started 
                  with curiosity about how things work, and has evolved into a commitment to creating 
                  technology that makes a difference.
                </p>

                <p className="text-muted-foreground font-body leading-relaxed">
                  When I'm not coding, you'll find me exploring new technologies, contributing to open-source 
                  projects, or diving into competitive programming challenges. I believe in continuous learning 
                  and pushing the boundaries of what's possible.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="text-center p-4 rounded-xl bg-muted/50 border border-border/50"
                    >
                      <div className="text-2xl font-heading font-bold text-gradient">{stat.value}</div>
                      <div className="text-xs text-muted-foreground font-mono">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-heading font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              Education Journey
            </h3>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

              <div className="space-y-8">
                {timelineData.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                    className="relative pl-12"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'current' 
                        ? 'border-primary bg-primary/20 animate-glow-pulse' 
                        : 'border-muted-foreground/50 bg-muted'
                    }`}>
                      {item.status === 'current' ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="glass-card p-5 rounded-xl hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-primary">{item.year}</span>
                        {item.status === 'current' && (
                          <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-primary/20 text-primary">
                            Current
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-heading font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-secondary font-medium mb-2">{item.institution}</p>
                      <p className="text-sm text-muted-foreground font-body">{item.description}</p>
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
