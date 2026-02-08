import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
  "Access-Control-Allow-Origin": "*",
};

const DEFAULT_BASE = "https://portfolio.vishwaguru.site";

const PAGES = [
  { route: "/", key: "home", priority: "1.0", changefreq: "weekly" },
  { route: "/about", key: "about", priority: "0.9", changefreq: "monthly" },
  { route: "/skills", key: "skills", priority: "0.8", changefreq: "monthly" },
  { route: "/projects", key: "projects", priority: "0.9", changefreq: "weekly" },
  { route: "/certificates", key: "certificates", priority: "0.7", changefreq: "monthly" },
  { route: "/showcase", key: "showcase", priority: "0.8", changefreq: "weekly" },
  { route: "/contact", key: "contact", priority: "0.8", changefreq: "monthly" },
];

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch SEO settings from DB
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "seo")
      .maybeSingle();

    const seo = data?.value as any;
    const baseUrl = seo?.global?.baseUrl || DEFAULT_BASE;
    const defaultOgImage = seo?.global?.defaultOgImage || "";
    const today = new Date().toISOString().split("T")[0];

    const urls = PAGES
      .filter((page) => {
        const pageSeo = seo?.pages?.[page.key];
        return !pageSeo?.noindex;
      })
      .map((page) => {
        const pageSeo = seo?.pages?.[page.key];
        const ogImage = pageSeo?.ogImage || defaultOgImage;

        let imageTag = "";
        if (ogImage) {
          const title = pageSeo?.title || `${page.key} | Portfolio`;
          imageTag = `
    <image:image>
      <image:loc>${escapeXml(ogImage)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>`;
        }

        return `  <url>
    <loc>${escapeXml(baseUrl + page.route)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageTag}
  </url>`;
      });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return new Response("<error>Failed to generate sitemap</error>", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
