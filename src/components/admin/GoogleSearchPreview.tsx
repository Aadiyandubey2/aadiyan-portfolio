import { memo } from "react";
import { Eye } from "lucide-react";

interface GooglePreviewProps {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
}

/** Live preview of how a page appears in Google search results */
const GoogleSearchPreview = memo(({ title, description, url, ogImage }: GooglePreviewProps) => {
  const truncTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const truncDesc = description.length > 160 ? description.substring(0, 157) + "..." : description;

  // Parse URL for display
  let displayUrl = url;
  try {
    const u = new URL(url);
    displayUrl = `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    // keep raw
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="w-3.5 h-3.5" />
        <span>Google Search Preview</span>
      </div>

      <div className="rounded-xl border border-border bg-white dark:bg-[#202124] p-4 space-y-1 max-w-xl shadow-sm">
        {/* Favicon + URL breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#f1f3f4] dark:bg-[#303134] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#4285f4]">
              {truncTitle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#202124] dark:text-[#bdc1c6] truncate leading-tight">
              {displayUrl.split("/").filter(Boolean)[0] || displayUrl}
            </p>
            <p className="text-[11px] text-[#4d5156] dark:text-[#969ba1] truncate leading-tight">
              {displayUrl}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg leading-snug font-normal text-[#1a0dab] dark:text-[#8ab4f8] cursor-pointer hover:underline line-clamp-2">
          {truncTitle || "Page Title"}
        </h3>

        {/* Description */}
        <p className="text-[13px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] line-clamp-3">
          {truncDesc || "No description set. Add a meta description to improve click-through rate."}
        </p>
      </div>

      {/* OG / Social Card Preview */}
      {ogImage && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Social Share Preview</p>
          <div className="rounded-lg border border-border overflow-hidden max-w-sm bg-card">
            <img
              src={ogImage}
              alt="OG preview"
              className="w-full aspect-[1200/630] object-cover"
              loading="lazy"
            />
            <div className="p-3 space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {displayUrl.split("/").filter(Boolean)[0] || "website"}
              </p>
              <p className="text-sm font-medium text-foreground line-clamp-1">{truncTitle}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{truncDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GoogleSearchPreview.displayName = "GoogleSearchPreview";
export default GoogleSearchPreview;
