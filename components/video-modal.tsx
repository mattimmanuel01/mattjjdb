'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, ExternalLink, Calendar } from 'lucide-react';
import { Video } from '@/lib/mongodb';

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onHashtagClick: (hashtag: string) => void;
}

export function VideoModal({ video, isOpen, onClose, onHashtagClick }: VideoModalProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!video) return null;

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string, startTime?: number) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    const timeParam = startTime && startTime > 0 ? `?start=${startTime}` : '';
    return `https://www.youtube.com/embed/${videoId}${timeParam}&autoplay=1&rel=0&modestbranding=1`;
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExternalLink = () => {
    const startTime = video.startingTimestamp > 0 ? `&t=${video.startingTimestamp}s` : '';
    window.open(`${video.videoURL}${startTime}`, '_blank');
  };

  const handleHashtagClick = (hashtag: string) => {
    onHashtagClick(hashtag);
    onClose();
  };

  // Modal sizing - desktop/tablet gets more height for content
  const modalClassName = isDesktop 
    ? "max-w-4xl w-[90vw] max-h-[85vh]" 
    : "max-w-[95vw] w-[95vw] h-[80vh]";

  const embedUrl = getEmbedUrl(video.videoURL, video.startingTimestamp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${modalClassName} p-0 overflow-hidden flex flex-col`}>
        {!isDesktop && (
          <VisuallyHidden>
            <DialogTitle>Video Player</DialogTitle>
          </VisuallyHidden>
        )}
        
        {/* Modal as Big Video Card */}
        <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Video Player Section */}
          <div className="relative bg-black flex-shrink-0" style={{ height: isDesktop ? '400px' : 'auto', aspectRatio: isDesktop ? 'unset' : '16/9' }}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-t-xl"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={`YouTube video player`}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-xl">
                <p className="text-muted-foreground">Unable to load video</p>
              </div>
            )}

            {/* Video overlays - same as video card */}
            {video.startingTimestamp > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(video.startingTimestamp)}
              </div>
            )}

            {video.isResource && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-500/90 text-white border-0"
                >
                  Resource
                </Badge>
              </div>
            )}

            <div className="absolute top-2 right-2">
              <Badge
                variant="outline"
                className="text-xs bg-background/90 flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {video.trendingScore.toFixed(1)}
              </Badge>
            </div>
          </div>

          {/* Content Section - matching video card layout */}
          {isDesktop && (
            <>
              <VisuallyHidden>
                <DialogTitle>Video Player</DialogTitle>
              </VisuallyHidden>
              
              <div className="flex-1 flex flex-col min-h-0">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Note */}
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <p className="whitespace-pre-wrap">{video.note}</p>
                      </div>

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-1">
                        {video.hashtags.map((hashtag) => (
                          <Badge
                            key={hashtag._id}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleHashtagClick(hashtag.tag)}
                          >
                            {hashtag.tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer - matching video card layout */}
                <div className="px-6 py-4 flex items-center justify-between border-t bg-card flex-shrink-0">
                  <div className="text-xs text-muted-foreground">
                    Updated {formatDate(video.updatedAt)}
                  </div>
                  <Button
                    onClick={handleExternalLink}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    YouTube
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}