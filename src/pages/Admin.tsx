import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Lock,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
  User,
  Code,
  Briefcase,
  FileText,
  Upload,
  Image,
  Award,
  Film,
  Video,
  Palette,
  Type,
  Bot,
  Orbit,
  GalleryHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ThemeSettingsTab from "@/components/admin/ThemeSettingsTab";
import AISettingsTab from "@/components/admin/AISettingsTab";
import OrbitSkillsTab from "@/components/admin/OrbitSkillsTab";
import { GallerySettingsTab } from "@/components/admin/GallerySettingsTab";
import SEOSettingsTab from "@/components/admin/SEOSettingsTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableIcons } from "@/components/ui/orbiting-skills";

interface SiteContent {
  profile: {
    name: string;
    tagline: string;
    roles: string[];
    bio: string;
    email: string;
    phone: string;
    location: string;
    profile_image_url?: string;
  };
  about: {
    description: string;
    stats: { label: string; value: string }[];
  };
  timeline: {
    year: string;
    title: string;
    institution: string;
    description: string;
    type: string;
    status: string;
    display_order?: number;
  }[];
  currently_building: string[];
}

interface Skill {
  id: string;
  category: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
  display_order: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  tech_stack: string[];
  features: { icon: string; color: string; title: string; desc: string }[];
  is_featured: boolean;
  display_order: number;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  image_url: string | null;
  display_order: number;
}

interface Showcase {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  display_order: number;
  media_type: "video" | "youtube" | "vimeo" | "image" | null;
  external_url: string | null;
}

interface OrbitSkill {
  id: string;
  name: string;
  icon: string;
  color: string;
  orbit_index: number;
  display_order: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [orbitSkills, setOrbitSkills] = useState<OrbitSkill[]>([]);
  const [newCode, setNewCode] = useState("");
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingCertId, setUploadingCertId] = useState<string | null>(null);
  const [uploadingShowcaseId, setUploadingShowcaseId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const certImageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const showcaseVideoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const showcaseThumbnailInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { action: "verify", secretCode },
      });

      if (error) throw error;
      if (data?.valid) {
        setIsAuthenticated(true);
        localStorage.setItem("adminCode", secretCode);
        loadData();
        toast.success("Access granted!");
      } else {
        toast.error("Invalid secret code");
      }
    } catch (error) {
      toast.error("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load site content
      const { data: contentData } = await supabase.from("site_content").select("key, value");

      if (contentData) {
        const contentObj: Record<string, unknown> = {};
        contentData.forEach((item) => {
          contentObj[item.key] = item.value;
        });
        setContent(contentObj as unknown as SiteContent);
      }

      // Load skills
      const { data: skillsData } = await supabase.from("skills").select("*").order("display_order");
      if (skillsData) setSkills(skillsData);

      // Load projects
      const { data: projectsData } = await supabase.from("projects").select("*").order("display_order");
      if (projectsData) setProjects(projectsData as unknown as Project[]);

      // Load certificates
      const { data: certData } = await supabase.from("certificates").select("*").order("display_order");
      if (certData) setCertificates(certData as unknown as Certificate[]);

      // Load showcases
      const { data: showcaseData } = await supabase.from("showcases").select("*").order("display_order");
      if (showcaseData) setShowcases(showcaseData as unknown as Showcase[]);

      // Load orbit skills
      const { data: orbitData } = await supabase.from("orbit_skills").select("*").order("orbit_index").order("display_order");
      if (orbitData) setOrbitSkills(orbitData as unknown as OrbitSkill[]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveContent = async (key: string, value: unknown) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "updateContent", secretCode, data: { key, value } },
      });
      if (error) throw error;
      toast.success("Content updated!");
    } catch (error) {
      toast.error("Failed to update content");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSkill = async (skill: Skill) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "updateSkill", secretCode, data: skill },
      });
      if (error) throw error;
      toast.success("Skill updated!");
      loadData();
    } catch (error) {
      toast.error("Failed to update skill");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("Delete this skill category?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "deleteSkill", secretCode, data: { id } },
      });
      if (error) throw error;
      toast.success("Skill deleted!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete skill");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (project: Project) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "updateProject", secretCode, data: project },
      });
      if (error) throw error;
      toast.success("Project updated!");
      loadData();
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "deleteProject", secretCode, data: { id } },
      });
      if (error) throw error;
      toast.success("Project deleted!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const changeSecretCode = async () => {
    if (!newCode || newCode.length < 6) {
      toast.error("New code must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "changeCode", secretCode, data: { newCode } },
      });
      if (error) throw error;
      setSecretCode(newCode);
      localStorage.setItem("adminCode", newCode);
      toast.success("Secret code changed!");
      setNewCode("");
    } catch (error) {
      toast.error("Failed to change code");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProjectImage = async (projectId: string, file: File) => {
    setUploadingProjectId(projectId);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        const { data, error } = await supabase.functions.invoke("admin-api", {
          body: {
            action: "uploadImage",
            secretCode,
            data: {
              fileName: file.name,
              fileData: base64,
              contentType: file.type,
            },
          },
        });

        if (error) throw error;

        if (data?.url) {
          // Update project with new image URL
          const newProjects = projects.map((p) => (p.id === projectId ? { ...p, image_url: data.url } : p));
          setProjects(newProjects);

          // Save project
          const project = newProjects.find((p) => p.id === projectId);
          if (project) {
            await saveProject(project);
          }
          toast.success("Image uploaded!");
        }
        setUploadingProjectId(null);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploadingProjectId(null);
      };
    } catch (error) {
      toast.error("Failed to upload image");
      setUploadingProjectId(null);
    }
  };

  const uploadProfileImage = async (file: File) => {
    setUploadingProfileImage(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        const { data, error } = await supabase.functions.invoke("admin-api", {
          body: {
            action: "uploadImage",
            secretCode,
            data: {
              fileName: `profile-${Date.now()}-${file.name}`,
              fileData: base64,
              contentType: file.type,
              folder: "profile",
            },
          },
        });

        if (error) throw error;

        if (data?.url && content) {
          const updatedProfile = { ...content.profile, profile_image_url: data.url };
          setContent({ ...content, profile: updatedProfile });

          // Save to database
          await saveContent("profile", updatedProfile);
          toast.success("Profile image uploaded!");
        }
        setUploadingProfileImage(false);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploadingProfileImage(false);
      };
    } catch (error) {
      toast.error("Failed to upload profile image");
      setUploadingProfileImage(false);
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem("adminCode");
    if (savedCode) {
      setSecretCode(savedCode);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100svh] bg-background flex items-center justify-center p-4 overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-center mb-2">Admin Access</h1>
            <p className="text-muted-foreground text-center text-sm mb-6">
              Enter your secret code to manage your portfolio
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                className="text-center text-lg tracking-widest"
              />
              <Button onClick={verifyCode} disabled={isLoading || !secretCode} className="w-full">
                {isLoading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center"
            >
              ← Back to Portfolio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-[100svh] bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-heading font-bold">Admin Panel</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("adminCode");
              setIsAuthenticated(false);
              setSecretCode("");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Certs</span>
            </TabsTrigger>
            <TabsTrigger
              value="showcase"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Film className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger
              value="theme"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger
              value="orbit-skills"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Orbit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Orbit</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai-settings"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <GalleryHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[70px] sm:min-w-0 sm:flex-none"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Image Upload */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-heading font-bold">Profile Photo</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {content?.profile?.profile_image_url ? (
                    <img
                      src={content.profile.profile_image_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload a profile photo. Recommended: Square image, at least 200x200 pixels.
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadProfileImage(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => profileImageInputRef.current?.click()}
                      disabled={uploadingProfileImage}
                    >
                      {uploadingProfileImage ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    {content?.profile?.profile_image_url && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (content) {
                            const updatedProfile = { ...content.profile, profile_image_url: undefined };
                            setContent({ ...content, profile: updatedProfile });
                            saveContent("profile", updatedProfile);
                            toast.success("Profile image removed");
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {content?.profile && (
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-heading font-bold">Profile Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <Input
                      value={content.profile.name}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tagline</label>
                    <Input
                      value={content.profile.tagline}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, tagline: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Roles (comma-separated)</label>
                    <Input
                      value={content.profile.roles.join(", ")}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, roles: e.target.value.split(",").map((s) => s.trim()) },
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Bio</label>
                    <Textarea
                      value={content.profile.bio}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, bio: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input
                      value={content.profile.email}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <Input
                      value={content.profile.phone}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <Input
                      value={content.profile.location}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          profile: { ...content.profile, location: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={() => saveContent("profile", content.profile)} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            )}

            {content?.about && (
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-heading font-bold">About Section</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <Textarea
                    value={content.about.description}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        about: { ...content.about, description: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Stats</label>
                  <div className="grid gap-2">
                    {content.about.stats.map((stat, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...content.about.stats];
                            newStats[index] = { ...stat, label: e.target.value };
                            setContent({ ...content, about: { ...content.about, stats: newStats } });
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...content.about.stats];
                            newStats[index] = { ...stat, value: e.target.value };
                            setContent({ ...content, about: { ...content.about, stats: newStats } });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newStats = content.about.stats.filter((_, i) => i !== index);
                            setContent({ ...content, about: { ...content.about, stats: newStats } });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setContent({
                          ...content,
                          about: { ...content.about, stats: [...content.about.stats, { label: "", value: "" }] },
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stat
                    </Button>
                  </div>
                </div>
                <Button onClick={() => saveContent("about", content.about)} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save About
                </Button>
              </div>
            )}

            {/* Journey/Timeline Section */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-heading font-bold">Journey / Timeline</h2>
              <p className="text-sm text-muted-foreground">
                Manage your education, work experience, and positions timeline. Use position numbers to arrange items (lower numbers appear first).
              </p>
              <div className="space-y-4">
                {(content?.timeline || [])
                  .map((item, originalIndex) => ({ ...item, originalIndex }))
                  .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
                  .map((item) => {
                    const index = item.originalIndex;
                    return (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">Position:</span>
                          <Input
                            type="number"
                            min="1"
                            value={item.display_order ?? index + 1}
                            onChange={(e) => {
                              const newTimeline = [...(content?.timeline || [])];
                              newTimeline[index] = { ...newTimeline[index], display_order: parseInt(e.target.value) || 1 };
                              setContent({ ...content!, timeline: newTimeline });
                            }}
                            className="w-20 h-8 text-center"
                          />
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                          {item.type}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTimeline = content?.timeline?.filter((_, i) => i !== index) || [];
                          setContent({ ...content!, timeline: newTimeline });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm text-muted-foreground">Year/Period</label>
                        <Input
                          value={item.year}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], year: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          placeholder="e.g., 2023 - Present"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Title</label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], title: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          placeholder="e.g., B.Tech CSE"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Institution/Company</label>
                        <Input
                          value={item.institution}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], institution: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          placeholder="e.g., NIT Nagaland"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Type</label>
                        <select
                          value={item.type}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], type: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="education">Education</option>
                          <option value="work">Work</option>
                          <option value="position">Position</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Status</label>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], status: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="current">Current</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-muted-foreground">Description</label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newTimeline = [...(content?.timeline || [])];
                            newTimeline[index] = { ...newTimeline[index], description: e.target.value };
                            setContent({ ...content!, timeline: newTimeline });
                          }}
                          placeholder="Brief description..."
                        />
                      </div>
                    </div>
                  </div>
                    );
                  })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const maxOrder = Math.max(0, ...(content?.timeline || []).map(t => t.display_order ?? 0));
                    const newItem = {
                      year: "",
                      title: "",
                      institution: "",
                      description: "",
                      type: "education",
                      status: "current",
                      display_order: maxOrder + 1,
                    };
                    setContent({
                      ...content!,
                      timeline: [...(content?.timeline || []), newItem],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Timeline Item
                </Button>
              </div>
              <Button onClick={() => saveContent("timeline", content?.timeline || [])} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Timeline
              </Button>
            </div>

            {content?.currently_building && (
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-heading font-bold">Currently Building With</h2>
                <Input
                  value={content.currently_building.join(", ")}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      currently_building: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="React, Node.js, Supabase..."
                />
                <Button
                  onClick={() => saveContent("currently_building", content.currently_building)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold" style={{ color: skill.color }}>
                    {skill.title}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => deleteSkill(skill.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Title</label>
                    <Input
                      value={skill.title}
                      onChange={(e) => {
                        const newSkills = skills.map((s) => (s.id === skill.id ? { ...s, title: e.target.value } : s));
                        setSkills(newSkills);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Color (hex)</label>
                    <Input
                      value={skill.color}
                      onChange={(e) => {
                        const newSkills = skills.map((s) => (s.id === skill.id ? { ...s, color: e.target.value } : s));
                        setSkills(newSkills);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Icon</label>
                    <Select
                      value={skill.icon}
                      onValueChange={(value) => {
                        const newSkills = skills.map((s) => (s.id === skill.id ? { ...s, icon: value } : s));
                        setSkills(newSkills);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map((iconOption) => (
                          <SelectItem key={iconOption.value} value={iconOption.value}>
                            {iconOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Skills (comma-separated)</label>
                  <Input
                    value={skill.skills.join(", ")}
                    onChange={(e) => {
                      const newSkills = skills.map((s) =>
                        s.id === skill.id 
                          ? { ...s, skills: e.target.value.split(",").map((str) => str.trim()).filter((str) => str.length > 0) } 
                          : s,
                      );
                      setSkills(newSkills);
                    }}
                  />
                </div>
                <Button onClick={() => saveSkill(skill)} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newSkill: Skill = {
                  id: "",
                  category: "new",
                  title: "New Category",
                  color: "#00d4ff",
                  icon: "code",
                  skills: [],
                  display_order: skills.length + 1,
                };
                saveSkill(newSkill);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill Category
            </Button>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">{project.title}</h3>
                  <Button variant="ghost" size="icon" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Title</label>
                    <Input
                      value={project.title}
                      onChange={(e) => {
                        const newProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, title: e.target.value } : p,
                        );
                        setProjects(newProjects);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">URL</label>
                    <Input
                      value={project.url}
                      onChange={(e) => {
                        const newProjects = projects.map((p) =>
                          p.id === project.id ? { ...p, url: e.target.value } : p,
                        );
                        setProjects(newProjects);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = projects.map((p) =>
                        p.id === project.id ? { ...p, description: e.target.value } : p,
                      );
                      setProjects(newProjects);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tech Stack (comma-separated)</label>
                  <Input
                    value={project.tech_stack.join(", ")}
                    onChange={(e) => {
                      const newProjects = projects.map((p) =>
                        p.id === project.id ? { ...p, tech_stack: e.target.value.split(",").map((s) => s.trim()) } : p,
                      );
                      setProjects(newProjects);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Project Image</label>
                  <div className="mt-2 space-y-3">
                    {project.image_url && (
                      <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-border">
                        <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[project.id] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadProjectImage(project.id, file);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current[project.id]?.click()}
                        disabled={uploadingProjectId === project.id}
                        className="flex-1"
                      >
                        {uploadingProjectId === project.id ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            {project.image_url ? "Change Image" : "Upload Image"}
                          </>
                        )}
                      </Button>
                      {project.image_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newProjects = projects.map((p) =>
                              p.id === project.id ? { ...p, image_url: "" } : p,
                            );
                            setProjects(newProjects);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={() => saveProject(project)} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newProject: Project = {
                  id: "",
                  title: "New Project",
                  description: "",
                  url: "",
                  image_url: "",
                  tech_stack: [],
                  features: [],
                  is_featured: false,
                  display_order: projects.length + 1,
                };
                saveProject(newProject);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            {certificates.map((cert, index) => (
              <div key={cert.id || index} className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">{cert.title || "New Certificate"}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Delete this certificate?")) return;
                      setIsLoading(true);
                      try {
                        const { error } = await supabase.functions.invoke("admin-api", {
                          body: { action: "deleteCertificate", secretCode, data: { id: cert.id } },
                        });
                        if (error) throw error;
                        toast.success("Certificate deleted!");
                        loadData();
                      } catch {
                        toast.error("Failed to delete certificate");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Title</label>
                    <Input
                      value={cert.title}
                      onChange={(e) => {
                        const newCerts = [...certificates];
                        newCerts[index] = { ...cert, title: e.target.value };
                        setCertificates(newCerts);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Issuer</label>
                    <Input
                      value={cert.issuer || ""}
                      onChange={(e) => {
                        const newCerts = [...certificates];
                        newCerts[index] = { ...cert, issuer: e.target.value };
                        setCertificates(newCerts);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Issue Date</label>
                    <Input
                      type="date"
                      value={cert.issue_date || ""}
                      onChange={(e) => {
                        const newCerts = [...certificates];
                        newCerts[index] = { ...cert, issue_date: e.target.value };
                        setCertificates(newCerts);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Display Order</label>
                    <Input
                      type="number"
                      value={cert.display_order}
                      onChange={(e) => {
                        const newCerts = [...certificates];
                        newCerts[index] = { ...cert, display_order: parseInt(e.target.value) || 0 };
                        setCertificates(newCerts);
                      }}
                    />
                  </div>
                </div>

                {/* Certificate Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Certificate Image</label>
                  {cert.image_url && (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={(el) => {
                        certImageInputRefs.current[cert.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCertId(cert.id);
                        try {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            const { data, error } = await supabase.functions.invoke("admin-api", {
                              body: {
                                action: "uploadFile",
                                secretCode,
                                data: {
                                  fileName: file.name,
                                  fileData: base64,
                                  contentType: file.type,
                                  bucket: "certificates",
                                },
                              },
                            });
                            if (error) throw error;
                            if (data?.url) {
                              const newCerts = certificates.map((c) =>
                                c.id === cert.id ? { ...c, image_url: data.url } : c,
                              );
                              setCertificates(newCerts);
                              toast.success("Image uploaded!");
                            }
                            setUploadingCertId(null);
                          };
                        } catch {
                          toast.error("Failed to upload image");
                          setUploadingCertId(null);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => certImageInputRefs.current[cert.id]?.click()}
                      disabled={uploadingCertId === cert.id}
                    >
                      {uploadingCertId === cert.id ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const payload = {
                        ...cert,
                        issuer: cert.issuer?.trim() || null,
                        issue_date: cert.issue_date || null,
                        image_url: cert.image_url || null,
                      };

                      const { error } = await supabase.functions.invoke("admin-api", {
                        body: { action: "updateCertificate", secretCode, data: payload },
                      });
                      if (error) throw error;
                      toast.success("Certificate saved!");
                      loadData();
                    } catch {
                      toast.error("Failed to save certificate");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            ))}
            <Button
              onClick={async () => {
                const newCert: Partial<Certificate> = {
                  title: "New Certificate",
                  issuer: null,
                  issue_date: null,
                  image_url: null,
                  display_order: certificates.length,
                };
                setIsLoading(true);
                try {
                  const { error } = await supabase.functions.invoke("admin-api", {
                    body: { action: "updateCertificate", secretCode, data: newCert },
                  });
                  if (error) throw error;
                  toast.success("Certificate added!");
                  loadData();
                } catch {
                  toast.error("Failed to add certificate");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </TabsContent>

          {/* Showcase Tab */}
          <TabsContent value="showcase" className="space-y-6">
            {showcases.map((item, index) => (
              <div key={item.id || index} className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">{item.title || "New Showcase"}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Delete this showcase?")) return;
                      setIsLoading(true);
                      try {
                        const { error } = await supabase.functions.invoke("admin-api", {
                          body: { action: "deleteShowcase", secretCode, data: { id: item.id } },
                        });
                        if (error) throw error;
                        toast.success("Showcase deleted!");
                        loadData();
                      } catch {
                        toast.error("Failed to delete showcase");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Title</label>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const newShowcases = [...showcases];
                        newShowcases[index] = { ...item, title: e.target.value };
                        setShowcases(newShowcases);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Display Order</label>
                    <Input
                      type="number"
                      value={item.display_order}
                      onChange={(e) => {
                        const newShowcases = [...showcases];
                        newShowcases[index] = { ...item, display_order: parseInt(e.target.value) || 0 };
                        setShowcases(newShowcases);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Media Type</label>
                    <select
                      value={item.media_type || "video"}
                      onChange={(e) => {
                        const newShowcases = [...showcases];
                        newShowcases[index] = { ...item, media_type: e.target.value as Showcase["media_type"] };
                        setShowcases(newShowcases);
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="video">Uploaded Video</option>
                      <option value="youtube">YouTube Link</option>
                      <option value="vimeo">Vimeo Link</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">External URL (YouTube/Vimeo/Image URL)</label>
                    <Input
                      placeholder="https://youtube.com/watch?v=... or image URL"
                      value={item.external_url || ""}
                      onChange={(e) => {
                        const newShowcases = [...showcases];
                        newShowcases[index] = { ...item, external_url: e.target.value };
                        setShowcases(newShowcases);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <Textarea
                    value={item.description || ""}
                    onChange={(e) => {
                      const newShowcases = [...showcases];
                      newShowcases[index] = { ...item, description: e.target.value };
                      setShowcases(newShowcases);
                    }}
                    rows={2}
                  />
                </div>

                {/* Video Upload */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Video File</label>
                  {item.video_url && (
                    <video src={item.video_url} controls className="w-full max-w-md h-48 object-cover rounded-lg" />
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={(el) => {
                        showcaseVideoInputRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error("Video must be under 50MB");
                          return;
                        }
                        setUploadingShowcaseId(item.id);
                        try {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            const { data, error } = await supabase.functions.invoke("admin-api", {
                              body: {
                                action: "uploadFile",
                                secretCode,
                                data: {
                                  fileName: file.name,
                                  fileData: base64,
                                  contentType: file.type,
                                  bucket: "showcases",
                                },
                              },
                            });
                            if (error) throw error;
                            if (data?.url) {
                              const newShowcases = showcases.map((s) =>
                                s.id === item.id ? { ...s, video_url: data.url } : s,
                              );
                              setShowcases(newShowcases);
                              toast.success("Video uploaded!");
                            }
                            setUploadingShowcaseId(null);
                          };
                        } catch {
                          toast.error("Failed to upload video");
                          setUploadingShowcaseId(null);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => showcaseVideoInputRefs.current[item.id]?.click()}
                      disabled={uploadingShowcaseId === item.id}
                    >
                      {uploadingShowcaseId === item.id ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Thumbnail (Optional)</label>
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full max-w-xs h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={(el) => {
                        showcaseThumbnailInputRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            const { data, error } = await supabase.functions.invoke("admin-api", {
                              body: {
                                action: "uploadFile",
                                secretCode,
                                data: {
                                  fileName: file.name,
                                  fileData: base64,
                                  contentType: file.type,
                                  bucket: "showcases",
                                },
                              },
                            });
                            if (error) throw error;
                            if (data?.url) {
                              const newShowcases = showcases.map((s) =>
                                s.id === item.id ? { ...s, thumbnail_url: data.url } : s,
                              );
                              setShowcases(newShowcases);
                              toast.success("Thumbnail uploaded!");
                            }
                          };
                        } catch {
                          toast.error("Failed to upload thumbnail");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showcaseThumbnailInputRefs.current[item.id]?.click()}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Upload Thumbnail
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const payload = {
                        ...item,
                        description: item.description?.trim() || null,
                        video_url: item.video_url || null,
                        thumbnail_url: item.thumbnail_url || null,
                        media_type: item.media_type || "video",
                        external_url: item.external_url?.trim() || null,
                      };

                      const { error } = await supabase.functions.invoke("admin-api", {
                        body: { action: "updateShowcase", secretCode, data: payload },
                      });
                      if (error) throw error;
                      toast.success("Showcase saved!");
                      loadData();
                    } catch {
                      toast.error("Failed to save showcase");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            ))}
            <Button
              onClick={async () => {
                const newItem: Partial<Showcase> = {
                  title: "New Showcase",
                  description: null,
                  video_url: null,
                  thumbnail_url: null,
                  display_order: showcases.length,
                  media_type: "video",
                  external_url: null,
                };
                setIsLoading(true);
                try {
                  const { error } = await supabase.functions.invoke("admin-api", {
                    body: { action: "updateShowcase", secretCode, data: newItem },
                  });
                  if (error) throw error;
                  toast.success("Showcase added!");
                  loadData();
                } catch {
                  toast.error("Failed to add showcase");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Showcase
            </Button>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-heading font-bold">Resume / CV</h2>
              <p className="text-sm text-muted-foreground">
                Upload your resume to a file hosting service (like Google Drive, Dropbox, or your own server) and paste
                the direct link here.
              </p>
              <div>
                <label className="text-sm text-muted-foreground">Resume URL</label>
                <Input placeholder="https://example.com/resume.pdf" id="resumeUrl" />
              </div>
              <Button
                onClick={async () => {
                  const url = (document.getElementById("resumeUrl") as HTMLInputElement).value;
                  if (!url) {
                    toast.error("Please enter a URL");
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const { error } = await supabase.functions.invoke("admin-api", {
                      body: { action: "updateResume", secretCode, data: { file_url: url, file_name: "resume.pdf" } },
                    });
                    if (error) throw error;
                    toast.success("Resume updated!");
                  } catch (error) {
                    toast.error("Failed to update resume");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Resume URL
              </Button>
            </div>
          </TabsContent>

          {/* Theme & Typography Tab */}
          <ThemeSettingsTab secretCode={secretCode} />

          {/* AI Settings Tab */}
          <AISettingsTab secretCode={secretCode} />

          {/* Orbit Skills Tab */}
          <TabsContent value="orbit-skills">
            <OrbitSkillsTab
              orbitSkills={orbitSkills}
              setOrbitSkills={setOrbitSkills}
              secretCode={secretCode}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              loadData={loadData}
            />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="glass-card rounded-xl p-6">
              <GallerySettingsTab secretCode={secretCode} />
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <SEOSettingsTab secretCode={secretCode} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-heading font-bold">Change Secret Code</h2>
              <p className="text-sm text-muted-foreground">
                Change your admin access code. Make sure to remember the new code!
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter new secret code (min 6 characters)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <Button onClick={changeSecretCode} disabled={isLoading || newCode.length < 6}>
                  Update Code
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
