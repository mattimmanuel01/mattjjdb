"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { Video } from "@/lib/mongodb";

interface VideoCardProps {
  video: Video;
  onHashtagClick: (hashtag: string) => void;
}

export function VideoCard({ video, onHashtagClick }: VideoCardProps) {
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
    const startTime =
      video.startingTimestamp > 0 ? `&t=${video.startingTimestamp}s` : "";
    window.open(`${video.videoURL}${startTime}`, "_blank");
  };

  const thumbnailUrl = getThumbnailUrl(video.videoURL);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <Button
              onClick={handleVideoClick}
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 hover:scale-110 transition-all"
            >
              <Play className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Timestamp overlay */}
        {video.startingTimestamp > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimestamp(video.startingTimestamp)}
          </div>
        )}

        {/* Resource indicator */}
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

        {/* Trending score */}
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

      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {video.note}
          </p>

          <div className="flex flex-wrap gap-1">
            {video.hashtags.slice(0, 6).map((hashtag) => (
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
            {video.hashtags.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{video.hashtags.length - 6}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Updated {formatDate(video.updatedAt)}
        </div>
        <Button
          onClick={handleVideoClick}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Watch
        </Button>
      </CardFooter>
    </Card>
  );
}
