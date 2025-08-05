"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Clock, TrendingUp, X } from "lucide-react";
import { Video } from "@/lib/mongodb";

interface VideoCardProps {
  video: Video;
  onHashtagClick: (hashtag: string) => void;
  onVideoClick: (video: Video) => void;
}

export function VideoCard({ video, onHashtagClick, onVideoClick }: VideoCardProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  
  // Check if note is long enough to need expansion
  const isNoteLong = video.note.length > 200;
  
  const isMobile = () => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleVideoClick = () => {
    if (isMobile()) {
      // On mobile, play inline instead of opening modal
      setIsPlayingInline(true);
    } else {
      // On desktop, open modal
      onVideoClick(video);
    }
  };

  const handleCloseInlinePlayer = () => {
    setIsPlayingInline(false);
  };

  const toggleNoteExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNoteExpanded(!isNoteExpanded);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startTime =
      video.startingTimestamp > 0 ? `&t=${video.startingTimestamp}s` : "";
    window.open(`${video.videoURL}${startTime}`, "_blank");
  };

  const thumbnailUrl = getThumbnailUrl(video.videoURL);
  const embedUrl = getEmbedUrl(video.videoURL, video.startingTimestamp);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      onClick={handleVideoClick}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        {/* Inline Video Player for Mobile */}
        {isPlayingInline && isMobile() && embedUrl ? (
          <div className="relative w-full h-full">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="YouTube video player"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseInlinePlayer();
              }}
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/80 hover:bg-black text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Thumbnail view
          <>
            {thumbnailUrl ? (
              <>
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all pointer-events-none">
                  <div className="bg-white/90 dark:bg-black/90 rounded-full p-3 shadow-lg">
                    <Play className="h-6 w-6 text-black dark:text-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </>
        )}

        {/* Timestamp overlay - hide when playing inline */}
        {video.startingTimestamp > 0 && !(isPlayingInline && isMobile()) && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimestamp(video.startingTimestamp)}
          </div>
        )}

        {/* Resource indicator - hide when playing inline */}
        {video.isResource && !(isPlayingInline && isMobile()) && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="text-xs bg-blue-500/90 text-white border-0"
            >
              Resource
            </Badge>
          </div>
        )}

        {/* Trending score - hide when playing inline */}
        {!(isPlayingInline && isMobile()) && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className="text-xs bg-background/90 flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              {video.trendingScore.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className={isNoteExpanded ? "" : "line-clamp-3"}>
              {video.note}
            </p>
            {isNoteLong && (
              <button
                onClick={toggleNoteExpansion}
                className="text-primary hover:text-primary/80 text-xs font-medium mt-1 transition-colors"
              >
                {isNoteExpanded ? "Show less" : "...more"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {video.hashtags.map((hashtag) => (
              <Badge
                key={hashtag._id}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onHashtagClick(hashtag.tag);
                }}
              >
                {hashtag.tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Updated {formatDate(video.updatedAt)}
        </div>
        <Button
          onClick={handleExternalClick}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          YouTube
        </Button>
      </CardFooter>
    </Card>
  );
}
