import { useState, useEffect, memo, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getCached, setCache } from '@/lib/swr-cache';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  display_order: number;
  media_type: 'video' | 'youtube' | 'vimeo' | 'image' | null;
  external_url: string | null;
}

// Extract video IDs
const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
  return match?.[1] || null;
};

const getVimeoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
};

const YouTubeEmbed = memo(({ url, title }: { url: string; title: string }) => {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full absolute inset-0"
      loading="lazy"
    />
  );
});
YouTubeEmbed.displayName = 'YouTubeEmbed';

const VimeoEmbed = memo(({ url, title }: { url: string; title: string }) => {
  const videoId = getVimeoId(url);
  if (!videoId) return null;
  return (
    <iframe
      src={`https://player.vimeo.com/video/${videoId}`}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className="w-full h-full absolute inset-0"
      loading="lazy"
    />
  );
});
VimeoEmbed.displayName = 'VimeoEmbed';

const VideoPlayer = memo(({ item }: { item: ShowcaseItem }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  }, []);

  const handleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.requestFullscreen?.();
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  }, []);

  const renderMedia = () => {
    const mediaType = item.media_type || 'video';
    const externalUrl = item.external_url;

    if (mediaType === 'youtube' && externalUrl) {
      return <div className="relative aspect-video overflow-hidden"><YouTubeEmbed url={externalUrl} title={item.title} /></div>;
    }

    if (mediaType === 'vimeo' && externalUrl) {
      return <div className="relative aspect-video overflow-hidden"><VimeoEmbed url={externalUrl} title={item.title} /></div>;
    }

    if (mediaType === 'image') {
      const imageUrl = externalUrl || item.video_url || item.thumbnail_url;
      if (!imageUrl) return null;
      return (
        <div className="relative aspect-video overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <OptimizedImage src={imageUrl} alt={item.title} optimizedWidth={800} className="w-full h-full object-cover" />
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-primary" />
            </a>
          )}
        </div>
      );
    }

    if (!item.video_url) {
      return <div className="aspect-video bg-muted flex items-center justify-center"><p className="text-muted-foreground text-sm">No video uploaded</p></div>;
    }

    return (
      <div className="relative aspect-video overflow-hidden">
        <video
          ref={videoRef}
          src={item.video_url}
          poster={item.thumbnail_url || undefined}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={togglePlay}>
          <button onClick={togglePlay} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-primary/90 text-primary-foreground shadow-lg cursor-pointer z-10 hover:scale-110 active:scale-95 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="h-1 bg-muted/50 rounded-full mb-3 cursor-pointer overflow-hidden" onClick={handleSeek}>
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
            
            <div className="flex items-center justify-between">
              <button onClick={toggleMute} className="p-2 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={handleFullscreen} className="p-2 rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {!isPlaying && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-background/50 backdrop-blur-sm group-hover:opacity-0 transition-opacity cursor-pointer" onClick={togglePlay}>
            <Play className="w-8 h-8 text-foreground ml-1" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
      {renderMedia()}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
        {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
      </div>
    </div>
  );
});
VideoPlayer.displayName = 'VideoPlayer';

const Showcase = memo(() => {
  const { t } = useLanguage();
  const [showcases, setShowcases] = useState<ShowcaseItem[]>(
    () => getCached<ShowcaseItem[]>('showcases') ?? []
  );
  const [isLoading, setIsLoading] = useState(
    () => getCached<ShowcaseItem[]>('showcases') === null
  );

  useEffect(() => {
    supabase.from('showcases').select('*').order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setShowcases(data as ShowcaseItem[]);
          setCache('showcases', data);
        }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <section id="showcase" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (showcases.length === 0) return null;

  return (
    <section id="showcase" className="py-20 px-6" aria-labelledby="showcase-heading">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 id="showcase-heading" className="text-3xl text-foreground mb-4 font-serif text-center font-normal md:text-5xl">
            {t("showcase.title")} <span className="text-blue-700">{t("showcase.title_highlight")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("showcase.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {showcases.map(item => <VideoPlayer key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
});

Showcase.displayName = 'Showcase';

export default Showcase;