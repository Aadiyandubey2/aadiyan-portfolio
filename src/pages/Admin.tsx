import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Save, Plus, Trash2, ArrowLeft, Settings, User, Code, Briefcase, FileText, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface SiteContent {
  profile: {
    name: string;
    tagline: string;
    roles: string[];
    bio: string;
    email: string;
    phone: string;
    location: string;
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

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newCode, setNewCode] = useState('');
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'verify', secretCode }
      });
      
      if (error) throw error;
      if (data?.valid) {
        setIsAuthenticated(true);
        localStorage.setItem('adminCode', secretCode);
        loadData();
        toast.success('Access granted!');
      } else {
        toast.error('Invalid secret code');
      }
    } catch (error) {
      toast.error('Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load site content
      const { data: contentData } = await supabase
        .from('site_content')
        .select('key, value');
      
      if (contentData) {
        const contentObj: Record<string, unknown> = {};
        contentData.forEach(item => {
          contentObj[item.key] = item.value;
        });
        setContent(contentObj as unknown as SiteContent);
      }

      // Load skills
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('display_order');
      if (skillsData) setSkills(skillsData);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('display_order');
      if (projectsData) setProjects(projectsData as unknown as Project[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveContent = async (key: string, value: unknown) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'updateContent', secretCode, data: { key, value } }
      });
      if (error) throw error;
      toast.success('Content updated!');
    } catch (error) {
      toast.error('Failed to update content');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSkill = async (skill: Skill) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'updateSkill', secretCode, data: skill }
      });
      if (error) throw error;
      toast.success('Skill updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update skill');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm('Delete this skill category?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'deleteSkill', secretCode, data: { id } }
      });
      if (error) throw error;
      toast.success('Skill deleted!');
      loadData();
    } catch (error) {
      toast.error('Failed to delete skill');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (project: Project) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'updateProject', secretCode, data: project }
      });
      if (error) throw error;
      toast.success('Project updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'deleteProject', secretCode, data: { id } }
      });
      if (error) throw error;
      toast.success('Project deleted!');
      loadData();
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const changeSecretCode = async () => {
    if (!newCode || newCode.length < 6) {
      toast.error('New code must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'changeCode', secretCode, data: { newCode } }
      });
      if (error) throw error;
      setSecretCode(newCode);
      localStorage.setItem('adminCode', newCode);
      toast.success('Secret code changed!');
      setNewCode('');
    } catch (error) {
      toast.error('Failed to change code');
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
        const base64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('admin-api', {
          body: {
            action: 'uploadImage',
            secretCode,
            data: {
              fileName: file.name,
              fileData: base64,
              contentType: file.type
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          // Update project with new image URL
          const newProjects = projects.map(p =>
            p.id === projectId ? { ...p, image_url: data.url } : p
          );
          setProjects(newProjects);
          
          // Save project
          const project = newProjects.find(p => p.id === projectId);
          if (project) {
            await saveProject(project);
          }
          toast.success('Image uploaded!');
        }
        setUploadingProjectId(null);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadingProjectId(null);
      };
    } catch (error) {
      toast.error('Failed to upload image');
      setUploadingProjectId(null);
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem('adminCode');
    if (savedCode) {
      setSecretCode(savedCode);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
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
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                className="text-center text-lg tracking-widest"
              />
              <Button 
                onClick={verifyCode} 
                disabled={isLoading || !secretCode}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Access Admin Panel'}
              </Button>
            </div>
            <button
              onClick={() => navigate('/')}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
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
              localStorage.removeItem('adminCode');
              setIsAuthenticated(false);
              setSecretCode('');
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {content?.profile && (
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-heading font-bold">Profile Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <Input
                      value={content.profile.name}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tagline</label>
                    <Input
                      value={content.profile.tagline}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, tagline: e.target.value }
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Roles (comma-separated)</label>
                    <Input
                      value={content.profile.roles.join(', ')}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, roles: e.target.value.split(',').map(s => s.trim()) }
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Bio</label>
                    <Textarea
                      value={content.profile.bio}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, bio: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input
                      value={content.profile.email}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, email: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <Input
                      value={content.profile.phone}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <Input
                      value={content.profile.location}
                      onChange={(e) => setContent({
                        ...content,
                        profile: { ...content.profile, location: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <Button onClick={() => saveContent('profile', content.profile)} disabled={isLoading}>
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
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, description: e.target.value }
                    })}
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
                          about: { ...content.about, stats: [...content.about.stats, { label: '', value: '' }] }
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stat
                    </Button>
                  </div>
                </div>
                <Button onClick={() => saveContent('about', content.about)} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save About
                </Button>
              </div>
            )}

            {content?.currently_building && (
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-heading font-bold">Currently Building With</h2>
                <Input
                  value={content.currently_building.join(', ')}
                  onChange={(e) => setContent({
                    ...content,
                    currently_building: e.target.value.split(',').map(s => s.trim())
                  })}
                  placeholder="React, Node.js, Supabase..."
                />
                <Button onClick={() => saveContent('currently_building', content.currently_building)} disabled={isLoading}>
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
                  <h3 className="font-heading font-bold" style={{ color: skill.color }}>{skill.title}</h3>
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
                        const newSkills = skills.map(s => s.id === skill.id ? { ...s, title: e.target.value } : s);
                        setSkills(newSkills);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Color (hex)</label>
                    <Input
                      value={skill.color}
                      onChange={(e) => {
                        const newSkills = skills.map(s => s.id === skill.id ? { ...s, color: e.target.value } : s);
                        setSkills(newSkills);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Icon (code/server/database/sparkle)</label>
                    <Input
                      value={skill.icon}
                      onChange={(e) => {
                        const newSkills = skills.map(s => s.id === skill.id ? { ...s, icon: e.target.value } : s);
                        setSkills(newSkills);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Skills (comma-separated)</label>
                  <Input
                    value={skill.skills.join(', ')}
                    onChange={(e) => {
                      const newSkills = skills.map(s => 
                        s.id === skill.id ? { ...s, skills: e.target.value.split(',').map(str => str.trim()) } : s
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
                  id: '',
                  category: 'new',
                  title: 'New Category',
                  color: '#00d4ff',
                  icon: 'code',
                  skills: [],
                  display_order: skills.length + 1
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
                        const newProjects = projects.map(p => p.id === project.id ? { ...p, title: e.target.value } : p);
                        setProjects(newProjects);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">URL</label>
                    <Input
                      value={project.url}
                      onChange={(e) => {
                        const newProjects = projects.map(p => p.id === project.id ? { ...p, url: e.target.value } : p);
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
                      const newProjects = projects.map(p => p.id === project.id ? { ...p, description: e.target.value } : p);
                      setProjects(newProjects);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tech Stack (comma-separated)</label>
                  <Input
                    value={project.tech_stack.join(', ')}
                    onChange={(e) => {
                      const newProjects = projects.map(p => 
                        p.id === project.id ? { ...p, tech_stack: e.target.value.split(',').map(s => s.trim()) } : p
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
                        <img 
                          src={project.image_url} 
                          alt={project.title} 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[project.id] = el; }}
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
                            {project.image_url ? 'Change Image' : 'Upload Image'}
                          </>
                        )}
                      </Button>
                      {project.image_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newProjects = projects.map(p => 
                              p.id === project.id ? { ...p, image_url: '' } : p
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
                  id: '',
                  title: 'New Project',
                  description: '',
                  url: '',
                  image_url: '',
                  tech_stack: [],
                  features: [],
                  is_featured: false,
                  display_order: projects.length + 1
                };
                saveProject(newProject);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-heading font-bold">Resume / CV</h2>
              <p className="text-sm text-muted-foreground">
                Upload your resume to a file hosting service (like Google Drive, Dropbox, or your own server) and paste the direct link here.
              </p>
              <div>
                <label className="text-sm text-muted-foreground">Resume URL</label>
                <Input
                  placeholder="https://example.com/resume.pdf"
                  id="resumeUrl"
                />
              </div>
              <Button 
                onClick={async () => {
                  const url = (document.getElementById('resumeUrl') as HTMLInputElement).value;
                  if (!url) {
                    toast.error('Please enter a URL');
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const { error } = await supabase.functions.invoke('admin-api', {
                      body: { action: 'updateResume', secretCode, data: { file_url: url, file_name: 'resume.pdf' } }
                    });
                    if (error) throw error;
                    toast.success('Resume updated!');
                  } catch (error) {
                    toast.error('Failed to update resume');
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
