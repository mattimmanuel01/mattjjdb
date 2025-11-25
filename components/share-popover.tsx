'use client';

import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Send,
  Mail,
  Link2
} from 'lucide-react';
import { Video } from '@/lib/mongodb';

interface SharePopoverProps {
  video: Video;
  children?: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SharePopover({ 
  video, 
  children, 
  variant = 'ghost', 
  size = 'sm',
  className = 'text-xs'
}: SharePopoverProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${video._id}` 
    : '';

  const shareText = `Check out this BJJ technique: ${video.note.substring(0, 100)}${video.note.length > 100 ? '...' : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BJJ Video: ${video.note.substring(0, 50)}...`,
          text: shareText,
          url: shareUrl,
        });
        setOpen(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`BJJ Video: ${video.note.substring(0, 50)}...`)}&body=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant={variant}
            size={size}
            className={className}
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Share this video</h4>
            <div className="flex flex-wrap gap-1">
              {video.isResource && (
                <Badge variant="secondary" className="text-xs">
                  Resource
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                Score: {video.trendingScore?.toFixed(1) ?? '0.0'}
              </Badge>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Copy link</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate">
                {shareUrl}
              </div>
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Native Share (Mobile) */}
          {typeof window !== 'undefined' && navigator.share && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </Button>
          )}

          {/* Social Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share to</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('telegram')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Send className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Telegram</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('email')}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>

          {/* URL Preview */}
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium truncate">
                {video.note.substring(0, 60)}
                {video.note.length > 60 ? '...' : ''}
              </p>
              <div className="flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                <span className="truncate">
                  {shareUrl.replace('https://', '').replace('http://', '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}