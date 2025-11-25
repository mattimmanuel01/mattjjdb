'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoCard } from '@/components/video-card';
import { VideoModal } from '@/components/video-modal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Video } from '@/lib/mongodb';

export default function SharePage() {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  useEffect(() => {
    const checkDevice = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      // Auto-open modal on desktop
      if (desktop && video) {
        setShowModal(true);
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [video]);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }
      
      setVideo(data.video);
      
      // Auto-open modal on desktop
      if (window.innerWidth >= 768) {
        setShowModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    // Redirect to main dashboard with hashtag filter
    router.push(`/dashboard?hashtag=${encodeURIComponent(hashtag)}`);
  };

  const handleVideoClick = (video: Video) => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Don't redirect, just close modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading video...</span>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The video you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shared Video</h1>
            <p className="text-muted-foreground">
              {video.isResource ? 'Resource' : 'Footage'} • Trending Score: {video.trendingScore?.toFixed(1) ?? '0.0'}
            </p>
          </div>
        </div>

        {/* Video Display */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <VideoCard
              video={video}
              onHashtagClick={handleHashtagClick}
              onVideoClick={handleVideoClick}
            />
          </div>
        </div>

        {/* Share Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-card rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold mb-2">Share this video</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Copy this URL to share with others:
            </p>
            <div className="bg-muted rounded px-3 py-2 text-sm font-mono break-all">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                  // You could add a toast notification here
                }
              }}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for Desktop */}
      {isDesktop && (
        <VideoModal
          video={video}
          isOpen={showModal}
          onClose={handleCloseModal}
          onHashtagClick={handleHashtagClick}
        />
      )}
    </div>
  );
}