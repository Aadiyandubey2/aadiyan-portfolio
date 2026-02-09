/**
 * Transforms Supabase Storage URLs to use the image transformation API
 * for automatic WebP conversion and resizing.
 * 
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function optimizeStorageImage(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  const { width = 800, quality = 75 } = options;

  // Only transform Supabase Storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  // Convert /object/public/ to /render/image/public/ and append params
  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const separator = transformed.includes('?') ? '&' : '?';
  return `${transformed}${separator}width=${width}&quality=${quality}&format=origin`;
}
