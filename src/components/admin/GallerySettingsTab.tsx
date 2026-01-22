import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Image, Upload, Loader2, ExternalLink } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  image_url: string | null;
  icon: string;
  display_order: number;
}

interface GallerySettingsTabProps {
  secretCode: string;
}

export const GallerySettingsTab = ({ secretCode }: GallerySettingsTabProps) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Load gallery items
  const loadGalleryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      toast.error("Failed to load gallery items");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadGalleryItems();
  }, []);

  const handleImageUpload = async (itemId: string, file: File) => {
    if (!file) return;

    setUploadingId(itemId);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const response = await supabase.functions.invoke('admin-api', {
          body: {
            action: 'uploadFile',
            secretCode,
            data: {
              fileName: file.name,
              fileData: base64,
              contentType: file.type,
              bucket: 'portfolio-images',
            },
          },
        });

        if (response.error) throw new Error(response.error.message);

        const imageUrl = response.data.url;

        // Update gallery item with new image URL
        await updateGalleryItem(itemId, { image_url: imageUrl });
        
        toast.success("Image uploaded successfully!");
        loadGalleryItems();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingId(null);
    }
  };

  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>) => {
    try {
      const response = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'updateGalleryItem',
          secretCode,
          data: { id, ...updates },
        },
      });

      if (response.error) throw new Error(response.error.message);
      return true;
    } catch (error) {
      toast.error("Failed to update gallery item");
      return false;
    }
  };

  const handleFieldUpdate = async (id: string, field: keyof GalleryItem, value: string) => {
    const success = await updateGalleryItem(id, { [field]: value });
    if (success) {
      setGalleryItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
      toast.success("Updated successfully!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gallery Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage images for the "Explore My Portfolio" section
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => (fileInputRefs.current[item.id] = el)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(item.id, file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRefs.current[item.id]?.click()}
                disabled={uploadingId === item.id}
              >
                {uploadingId === item.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>

              {/* Subtitle Field */}
              <div className="space-y-1.5">
                <Label htmlFor={`subtitle-${item.id}`} className="text-xs">
                  Subtitle
                </Label>
                <Input
                  id={`subtitle-${item.id}`}
                  value={item.subtitle || ""}
                  onChange={(e) => {
                    setGalleryItems(prev =>
                      prev.map(i =>
                        i.id === item.id ? { ...i, subtitle: e.target.value } : i
                      )
                    );
                  }}
                  onBlur={(e) => handleFieldUpdate(item.id, "subtitle", e.target.value)}
                  placeholder="Enter subtitle..."
                  className="h-8 text-sm"
                />
              </div>

              {/* Link/href - read only */}
              <div className="text-xs text-muted-foreground">
                Link: <code className="bg-muted px-1 py-0.5 rounded">{item.href}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
