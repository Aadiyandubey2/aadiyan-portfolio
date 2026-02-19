import Background3D from "./Background3D";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDynamicTranslations } from "@/hooks/useDynamicTranslations";
import profilePhotoFallback from "@/assets/profile-photo.jpg";
import { OptimizedImage } from "@/components/ui/optimized-image";

const About = () => {
  const { content, isLoading } = useSiteContent();
  const { t, language } = useLanguage();
  const { td } = useDynamicTranslations(language);

  const defaultTimeline = [
    {
      year: "Mar-Apr 2025",
      title: t("about.timeline.web_dev_intern"),
      institution: t("about.timeline.codesa"),
      description: t("about.timeline.web_dev_desc"),
      type: "work",
      status: "completed",
      display_order: 1,
    },
    {
      year: "Aug 2024 - Aug 2025",
      title: t("about.timeline.club_secretary"),
      institution: t("about.timeline.nit_nagaland"),
      description: t("about.timeline.club_desc"),
      type: "position",
      status: "completed",
      display_order: 2,
    },
    {
      year: "2023 - Present",
      title: t("about.timeline.btech"),
      institution: t("about.timeline.nit_nagaland"),
      description: t("about.timeline.btech_desc"),
      type: "education",
      status: "current",
      display_order: 3,
    },
    {
      year: "2023",
      title: t("about.timeline.higher_secondary"),
      institution: t("about.timeline.model_school"),
      description: t("about.timeline.higher_secondary_desc"),
      type: "education",
      status: "completed",
      display_order: 4,
    },
  ];

  const defaultStats = [
    { label: t("about.stat.jee_air"), value: "41,149" },
    { label: t("about.stat.cgpa"), value: "8.06" },
    { label: t("about.stat.last_sem"), value: "8.34" },
    { label: t("about.stat.projects"), value: "3" },
  ];

  const profile = content?.profile;
  const about = content?.about;
  const timelineRaw = content?.timeline?.length ? content.timeline : defaultTimeline;
  const timeline = [...timelineRaw]
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const ao = a.item.display_order ?? 999;
      const bo = b.item.display_order ?? 999;
      if (ao !== bo) return ao - bo;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }, sortedIndex) => ({
      ...item,
      // Use dynamic translation if available from DB, with static fallback
      title: td('site_content', `timeline_${sortedIndex}`, 'title', item.title),
      description: td('site_content', `timeline_${sortedIndex}`, 'description', item.description),
      institution: td('site_content', `timeline_${sortedIndex}`, 'institution', item.institution),
    }));
  const stats = about?.stats?.length ? about.stats.map((s, i) => ({
    ...s,
    label: td('site_content', 'about', `stat_label_${i}`, s.label),
  })) : defaultStats;
  const name = profile?.name || "Aadiyan Dubey";
  const roles = profile?.roles?.length
    ? profile.roles.map((r, i) => td('site_content', 'profile', `role_${i}`, r))
    : (profile?.roles?.join(" | ") || "Web Developer | Full Stack Dev");
  const tagline = td('site_content', 'profile', 'tagline', profile?.tagline?.split("|")[0]?.trim() || "B.Tech CSE @ NIT Nagaland");
  const bio = td('site_content', 'about', 'description', about?.description || t("about.default_bio"));
  const profileImage = profile?.profile_image_url || profilePhotoFallback;

  return (
    <section id="about" className="relative py-16 sm:py-24 md:py-32 overflow-hidden" aria-labelledby="about-heading">
      <Background3D variant="minimal" color="#f59e0b" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6">
            {t("about.whoami")}
          </span>
          <h1 id="about-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {t("about.title")} <span className="text-blue-700">{t("about.title_highlight")}</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Profile Card */}
          <div>
            <div className="glass-card rounded-2xl p-6">
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
                <h3 className="text-xl font-heading font-bold mb-1">{isLoading ? t("about.loading") : name}</h3>
                <p className="text-primary font-mono text-sm">{Array.isArray(roles) ? roles.join(" | ") : roles}</p>
                <p className="text-muted-foreground font-mono text-xs mt-1">{tagline}</p>
              </div>

              <p className="text-muted-foreground font-body text-sm text-center mb-5 leading-relaxed">
                {bio.includes("VishwaGuru") ? (
                  <>
                    {bio.split("VishwaGuru")[0]}
                    <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      VishwaGuru.site
                    </a>
                    {bio.includes("VishwaGuru.site") ? bio.split("VishwaGuru.site")[1] : bio.split("VishwaGuru")[1]}
                  </>
                ) : bio}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-2 sm:p-3 rounded-xl bg-muted/30 text-center">
                    <div className="text-sm sm:text-lg font-heading font-bold text-blue-400">{stat.value}</div>
                    <div className="text-[8px] sm:text-[9px] text-muted-foreground font-mono uppercase">{stat.label}</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              {t("about.journey")}
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 rounded-full bg-blue-400" />
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={`${item.year}-${item.title}`} className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center timeline-dot ${item.status === "current" ? "bg-primary/20 border-2 border-primary" : "bg-muted border-2 border-border"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${item.status === "current" ? "bg-primary" : "bg-primary/60"}`} />
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.year}</span>
                        {item.status === "current" && (
                          <span className="text-[10px] font-mono text-green-400">{t("about.current")}</span>
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
