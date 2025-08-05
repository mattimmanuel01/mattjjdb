'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/search-bar';
import { VideoCard } from '@/components/video-card';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video } from '@/lib/mongodb';
import { Filter, X, Loader2 } from 'lucide-react';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface VideoResponse {
  videos: Video[];
  pagination: PaginationData;
}

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    hashtag: '',
    isResource: null as boolean | null,
  });

  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  useEffect(() => {
    fetchVideos();
  }, [pagination.page, filters]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.hashtag) params.append('hashtag', filters.hashtag);
      if (filters.isResource !== null) params.append('isResource', filters.isResource.toString());

      const response = await fetch(`/api/videos?${params}`);
      const data: VideoResponse = await response.json();
      
      setVideos(data.videos);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleHashtagSelect = (hashtag: string) => {
    setFilters(prev => ({ ...prev, hashtag }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(prev => [...prev, hashtag]);
    }
  };

  const removeHashtagFilter = (hashtagToRemove: string) => {
    setSelectedHashtags(prev => prev.filter(tag => tag !== hashtagToRemove));
    if (filters.hashtag === hashtagToRemove) {
      setFilters(prev => ({ ...prev, hashtag: '' }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleResourceFilter = (isResource: boolean | null) => {
    setFilters(prev => ({ ...prev, isResource }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({ search: '', hashtag: '', isResource: null });
    setSelectedHashtags([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.search || filters.hashtag || filters.isResource !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">BJJ Video Library</h1>
          <p className="text-muted-foreground text-lg">
            Discover and explore Brazilian Jiu-Jitsu techniques and concepts
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-6">
          <SearchBar
            onSearch={handleSearch}
            onHashtagSelect={handleHashtagSelect}
            placeholder="Search videos, notes, or hashtags..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Button
            variant={filters.isResource === null ? "outline" : filters.isResource ? "default" : "outline"}
            size="sm"
            onClick={() => handleResourceFilter(filters.isResource === true ? null : true)}
          >
            Resources
          </Button>

          <Button
            variant={filters.isResource === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleResourceFilter(filters.isResource === false ? null : false)}
          >
            Footage
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Active hashtag filters */}
        {selectedHashtags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {selectedHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {hashtag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeHashtagFilter(hashtag)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading videos...</span>
          </div>
        )}

        {/* Videos grid */}
        {!loading && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onHashtagClick={handleHashtagSelect}
                />
              ))}
            </div>

            {/* Results info */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} videos
              </p>
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">No videos found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}