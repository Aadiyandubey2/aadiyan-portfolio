import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Globe, FileText, Search, Upload, X, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SEOSettings, PageSEO, SEOGlobal } from "@/hooks/useSEOSettings";
import GoogleSearchPreview from "./GoogleSearchPreview";

interface SEOSettingsTabProps {
  secretCode: string;
}

const PAGE_LABELS: Record<string, { label: string; route: string }> = {
  home: { label: "Home", route: "/" },
  about: { label: "About", route: "/about" },
  projects: { label: "Projects", route: "/projects" },
  skills: { label: "Skills", route: "/skills" },
  certificates: { label: "Certificates", route: "/certificates" },
  showcase: { label: "Showcase", route: "/showcase" },
  contact: { label: "Contact", route: "/contact" },
};

const DEFAULT_GLOBAL: SEOGlobal = {
  siteTitle: "Aadiyan Dubey Portfolio",
  baseUrl: "https://portfolio.vishwaguru.site",
  authorName: "Aadiyan Dubey",
  twitterHandle: "@aadiyanhere",
  defaultOgImage: "https://portfolio.vishwaguru.site/og-image.png",
  coreKeywords: "Aadiyan Dubey, Full Stack Developer, React Developer India, NIT Nagaland",
};

const DEFAULT_PAGE: PageSEO = {
  title: "",
  description: "",
  keywords: "",
  ogImage: "",
  noindex: false,
};

/** Reusable OG image uploader with preview */
const OGImageUploader = ({
  value,
  onChange,
  placeholder,
  secretCode,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  secretCode: string;
  label: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
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
              fileName: `og-${file.name}`,
              fileData: base64,
              contentType: file.type,
              folder: "seo",
            },
          },
        });
        if (error) throw error;
        if (data?.url) {
          onChange(data.url);
          toast.success("OG image uploaded!");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };
    } catch {
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {value && (
        <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-border">
          <img src={value} alt="OG Preview" className="w-full h-auto aspect-[1200/630] object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive/80 text-foreground hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://... or upload an image"}
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          title="Upload image"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Recommended: 1200×630px. Max 5MB.</p>
    </div>
  );
};

const SEOSettingsTab = ({ secretCode }: SEOSettingsTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [global, setGlobal] = useState<SEOGlobal>(DEFAULT_GLOBAL);
  const [pages, setPages] = useState<Record<string, PageSEO>>({});

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "seo")
        .maybeSingle();

      if (data?.value) {
        const stored = data.value as unknown as SEOSettings;
        setGlobal({ ...DEFAULT_GLOBAL, ...stored.global });
        setPages(stored.pages || {});
      }
    } catch (err) {
      console.error("Failed to fetch SEO settings:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const save = async () => {
    setIsLoading(true);
    try {
      const seoData: SEOSettings = { global, pages };
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "updateContent", secretCode, data: { key: "seo", value: seoData } },
      });
      if (error) throw error;
      toast.success("SEO settings saved!");
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePage = (pageKey: string, field: keyof PageSEO, value: string | boolean) => {
    setPages((prev) => ({
      ...prev,
      [pageKey]: { ...DEFAULT_PAGE, ...prev[pageKey], [field]: value },
    }));
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global SEO Settings */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold">Global SEO Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Site Title</label>
            <Input value={global.siteTitle} onChange={(e) => setGlobal({ ...global, siteTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Base URL</label>
            <Input value={global.baseUrl} onChange={(e) => setGlobal({ ...global, baseUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Author Name</label>
            <Input value={global.authorName} onChange={(e) => setGlobal({ ...global, authorName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Twitter Handle</label>
            <Input value={global.twitterHandle} onChange={(e) => setGlobal({ ...global, twitterHandle: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <OGImageUploader
              value={global.defaultOgImage}
              onChange={(url) => setGlobal({ ...global, defaultOgImage: url })}
              placeholder="https://portfolio.vishwaguru.site/og-image.png"
              secretCode={secretCode}
              label="Default OG Image"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Core Keywords (comma-separated)</label>
            <Textarea
              value={global.coreKeywords}
              onChange={(e) => setGlobal({ ...global, coreKeywords: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Per-Page SEO Settings */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold">Page-Level SEO</h2>
        </div>

        <Tabs defaultValue="home">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
            {Object.entries(PAGE_LABELS).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(PAGE_LABELS).map(([pageKey, { label, route }]) => {
            const page = { ...DEFAULT_PAGE, ...pages[pageKey] };
            return (
              <TabsContent key={pageKey} value={pageKey} className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="w-3.5 h-3.5" />
                  <span>Route: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{route}</code></span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Page Title <span className="text-xs opacity-60">({page.title.length}/60 chars)</span>
                    </label>
                    <Input
                      value={page.title}
                      onChange={(e) => updatePage(pageKey, "title", e.target.value)}
                      placeholder={`${label} | ${global.authorName}`}
                    />
                    {page.title.length > 60 && (
                      <p className="text-xs text-destructive">Title exceeds 60 characters – may be truncated in search results.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Meta Description <span className="text-xs opacity-60">({page.description.length}/160 chars)</span>
                    </label>
                    <Textarea
                      value={page.description}
                      onChange={(e) => updatePage(pageKey, "description", e.target.value)}
                      rows={3}
                      placeholder="Brief description for search engine results..."
                    />
                    {page.description.length > 160 && (
                      <p className="text-xs text-destructive">Description exceeds 160 characters – may be truncated.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Page Keywords (comma-separated)</label>
                    <Input
                      value={page.keywords}
                      onChange={(e) => updatePage(pageKey, "keywords", e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <OGImageUploader
                    value={page.ogImage}
                    onChange={(url) => updatePage(pageKey, "ogImage", url)}
                    placeholder={global.defaultOgImage}
                    secretCode={secretCode}
                    label="Custom OG Image (leave empty for default)"
                  />

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={page.noindex}
                      onCheckedChange={(v) => updatePage(pageKey, "noindex", v)}
                    />
                    <label className="text-sm text-muted-foreground">
                      No-index (hide from search engines)
                    </label>
                  </div>

                  {/* Live Google Search Preview */}
                  <GoogleSearchPreview
                    title={page.title || `${label} | ${global.authorName}`}
                    description={page.description}
                    url={`${global.baseUrl}${route}`}
                    ogImage={page.ogImage || global.defaultOgImage}
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={isLoading} className="gap-2">
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save SEO Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SEOSettingsTab;
