import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Globe, FileText, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SEOSettings, PageSEO, SEOGlobal } from "@/hooks/useSEOSettings";

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
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Default OG Image URL</label>
            <Input value={global.defaultOgImage} onChange={(e) => setGlobal({ ...global, defaultOgImage: e.target.value })} />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Custom OG Image (leave empty for default)</label>
                    <Input
                      value={page.ogImage}
                      onChange={(e) => updatePage(pageKey, "ogImage", e.target.value)}
                      placeholder={global.defaultOgImage}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={page.noindex}
                      onCheckedChange={(v) => updatePage(pageKey, "noindex", v)}
                    />
                    <label className="text-sm text-muted-foreground">
                      No-index (hide from search engines)
                    </label>
                  </div>
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
