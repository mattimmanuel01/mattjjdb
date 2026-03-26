"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { VideoCard } from "@/components/video-card";
import { VideoModal } from "@/components/video-modal";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video } from "@/lib/mongodb";
import {
  Filter,
  X,
  Loader2,
  Database,
  Brain,
  TrendingUp,
  Search,
  ArrowDown,
} from "lucide-react";

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
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    hashtag: "",
    isResource: null as boolean | null,
  });

  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      if (filters.search) params.append("search", filters.search);
      if (filters.hashtag) params.append("hashtag", filters.hashtag);
      if (filters.isResource !== null)
        params.append("isResource", filters.isResource.toString());

      const response = await fetch(`/api/videos?${params}`);
      const data: VideoResponse = await response.json();

      setVideos(data.videos);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleHashtagSelect = (hashtag: string) => {
    setFilters((prev) => ({ ...prev, hashtag }));
    setPagination((prev) => ({ ...prev, page: 1 }));

    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags((prev) => [...prev, hashtag]);
    }
  };

  const removeHashtagFilter = (hashtagToRemove: string) => {
    setSelectedHashtags((prev) =>
      prev.filter((tag) => tag !== hashtagToRemove)
    );
    if (filters.hashtag === hashtagToRemove) {
      setFilters((prev) => ({ ...prev, hashtag: "" }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleResourceFilter = (isResource: boolean | null) => {
    setFilters((prev) => ({ ...prev, isResource }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setFilters({ search: "", hashtag: "", isResource: null });
    setSelectedHashtags([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const hasActiveFilters =
    filters.search || filters.hashtag || filters.isResource !== null;

  const scrollToExplorer = () => {
    document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border/60 text-xs font-medium text-muted-foreground mb-6">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              23,000+ techniques indexed
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Matty Jits
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              A full-stack platform for discovering and exploring BJJ techniques.
              Built with Next.js, MongoDB, and machine learning&mdash;powered trend
              analysis to surface the most relevant grappling content.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Button onClick={scrollToExplorer} size="lg" className="gap-2">
                Explore Techniques
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About / Feature Highlights */}
      <section className="border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-2">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Data Pipeline</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Custom ETL pipeline ingests and normalizes video metadata, timestamps,
                and hashtag taxonomies from 23,000+ BJJ instructional clips stored in MongoDB.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 mb-2">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">ML Trend Scoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A trending score algorithm analyzes technique frequency, recency,
                and cross-reference density to surface emerging grappling concepts in real time.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-2">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Full-Text Search</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MongoDB Atlas text indexes with autocomplete suggestions enable instant search
                across notes, hashtags, and technique descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="border-b border-border/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-2">Built with</span>
            {["Next.js 15", "React 19", "TypeScript", "MongoDB Atlas", "Tailwind CSS", "Vercel"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium rounded-full border border-border/60 bg-background text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Explorer Section */}
      <div id="explorer" className="container mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Technique Explorer</h2>
          <p className="text-muted-foreground">
            Browse, search, and filter across the full video database
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
            variant={
              filters.isResource === null
                ? "outline"
                : filters.isResource
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              handleResourceFilter(filters.isResource === true ? null : true)
            }
          >
            Resources
          </Button>

          <Button
            variant={filters.isResource === false ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleResourceFilter(filters.isResource === false ? null : false)
            }
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
            <span className="ml-2 text-muted-foreground">
              Loading videos...
            </span>
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
                  onVideoClick={handleVideoClick}
                />
              ))}
            </div>

            {/* Results info */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total.toLocaleString()} videos
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
            <p className="text-lg text-muted-foreground mb-2">
              No videos found
            </p>
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

        {/* Video Modal */}
        <VideoModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onHashtagClick={handleHashtagSelect}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Matty Jits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Full-stack BJJ technique database &middot; A portfolio project by Matt
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Next.js + MongoDB + ML</span>
              <span className="hidden md:inline">&middot;</span>
              <span>{pagination.total.toLocaleString()} videos indexed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
