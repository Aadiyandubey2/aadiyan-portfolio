import { useSiteContent } from "@/hooks/useSiteContent";
import profilePhotoFallback from "@/assets/profile-photo.jpg";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Fallback data
const defaultTimeline = [
  {
    year: "Mar-Apr 2025",
    title: "Web Developer Intern",
    institution: "CodeSA",
    description: "Part-time Web Developer - UI/UX design, frontend development, and performance optimization.",
    type: "work",
    status: "completed",
    display_order: 1,
  },
  {
    year: "Aug 2024 - Aug 2025",
    title: "Literary & Arts Club Asst. Secretary",
    institution: "NIT Nagaland",
    description: "Coordinating cultural, literary, and artistic events. Event planning and promotions.",
    type: "position",
    status: "completed",
    display_order: 2,
  },
  {
    year: "2023 - Present",
    title: "B.Tech CSE (CGPA: 8.06)",
    institution: "NIT Nagaland",
    description: "JEE Mains AIR 41,149. Last Semester CGPA: 8.34.",
    type: "education",
    status: "current",
    display_order: 3,
  },
  {
    year: "2023",
    title: "Higher Secondary (12th)",
    institution: "Model High School, Jabalpur",
    description: "Strong foundation in Mathematics and Computer Science.",
    type: "education",
    status: "completed",
    display_order: 4,
  },
];
const defaultStats = [
  {
    label: "JEE AIR",
    value: "41,149",
  },
  {
    label: "CGPA",
    value: "8.06",
  },
  {
    label: "Last Sem",
    value: "8.34",
  },
  {
    label: "Projects",
    value: "3",
  },
];
const About = () => {
  const { content, isLoading } = useSiteContent();
  const profile = content?.profile;
  const about = content?.about;
  const timelineRaw = content?.timeline?.length ? content.timeline : defaultTimeline;
  // Ensure consistent ordering using admin-defined position numbers (lower comes first)
  // with a stable fallback to original order.
  const timeline = [...timelineRaw]
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const ao = a.item.display_order ?? 999;
      const bo = b.item.display_order ?? 999;
      if (ao !== bo) return ao - bo;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
  const stats = about?.stats?.length ? about.stats : defaultStats;
  const name = profile?.name || "Aadiyan Dubey";
  const roles = profile?.roles?.join(" | ") || "Web Developer | Full Stack Dev";
  const tagline = profile?.tagline?.split("|")[0]?.trim() || "B.Tech CSE @ NIT Nagaland";
  const bio =
    about?.description || "Creator of VishwaGuru.site — a numerology predictions platform in English & Hindi.";
  const profileImage = profile?.profile_image_url || profilePhotoFallback;
  return (
    <section id="about" className="relative py-16 sm:py-24 md:py-32 overflow-hidden" aria-labelledby="about-heading">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6">
            whoami
          </span>
          <h1 id="about-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4">
            About <span className="text-blue-700">Me</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Profile Card */}
          <div>
            <div className="glass-card rounded-2xl p-6">
              {/* Profile Photo */}
              <div className="w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                <OptimizedImage
                  src={profileImage}
                  alt={name}
                  optimizedWidth={224}
                  className="w-full h-full object-cover relative z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent z-20" />
              </div>

              <div className="text-center mb-5">
                <h3 className="text-xl font-heading font-bold mb-1">{isLoading ? "Loading..." : name}</h3>
                <p className="text-primary font-mono text-sm">{roles}</p>
                <p className="text-muted-foreground font-mono text-xs mt-1">{tagline}</p>
              </div>

              <p className="text-muted-foreground font-body text-sm text-center mb-5 leading-relaxed">
                {bio.includes("VishwaGuru") ? (
                  <>
                    {bio.split("VishwaGuru")[0]}
                    <a
                      href="https://vishwaguru.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      VishwaGuru.site
                    </a>
                    {bio.includes("VishwaGuru.site") ? bio.split("VishwaGuru.site")[1] : bio.split("VishwaGuru")[1]}
                  </>
                ) : (
                  bio
                )}
              </p>

              {/* Stats - 2x2 grid on mobile, 4 columns on larger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-2 sm:p-3 rounded-xl bg-muted/30 text-center"
                  >
                    <div className="text-sm sm:text-lg font-heading font-bold text-blue-400">{stat.value}</div>
                    <div className="text-[8px] sm:text-[9px] text-muted-foreground font-mono uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </span>
              Journey
            </h3>

            <div className="relative">
              <div
                className="
  absolute left-4 top-2 bottom-2 w-0.5 rounded-full
  bg-blue-400
"
              />

              <div className="space-y-4">
                {timeline.map((item) => (
                  <div
                    key={`${item.year}-${item.title}`}
                    className="relative pl-12"
                  >
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center timeline-dot ${item.status === "current" ? "bg-primary/20 border-2 border-primary" : "bg-muted border-2 border-border"}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${item.status === "current" ? "bg-primary" : "bg-primary/60"}`}
                      />
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {item.year}
                        </span>
                        {item.status === "current" && (
                          <span className="text-[10px] font-mono text-green-400">Current</span>
                        )}
                      </div>
                      <h4 className="text-sm font-heading font-semibold">{item.title}</h4>
                      <p className="text-xs text-primary/80">{item.institution}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;
