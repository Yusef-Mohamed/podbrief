import React from "react";
import EpisodeCard from "./EpisodeCard";
import type { PodcastEpisode } from "@/types/podcast";
import { apiClient } from "@/lib/axios.config";
import { useInfinitePagination } from "@/hooks/useInfinitePagination";

const LatestEpisodesSpread: React.FC = () => {
  const {
    items: episodes,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMoreRef,
    retry,
  } = useInfinitePagination<PodcastEpisode>({
    fetchFunction: async (page: number) => {
      const response = await apiClient.get(`/episodes/recent?page=${page}`);
      return response.data;
    },
  });
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Latest Episodes</h2>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted-foreground/20 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted-foreground/20 rounded w-4/5"></div>
                    <div className="h-4 bg-muted-foreground/15 rounded w-2/3"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted-foreground/15 rounded w-full"></div>
                    <div className="h-3 bg-muted-foreground/15 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/15 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="h-3 bg-muted-foreground/15 rounded w-16"></div>
                    <div className="h-3 bg-muted-foreground/15 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Latest Episodes</h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-destructive">
              Failed to Load Episodes
            </h3>
          </div>
          <p className="text-destructive/80 mb-4">{error}</p>
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Latest Episodes</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Episodes Found
          </h3>
          <p className="text-muted-foreground">
            There are no recent episodes available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Latest Episodes</h2>
      </div>

      <div className="space-y-4">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-4">
          {isLoadingMore && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted-foreground/20 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="space-y-2">
                          <div className="h-5 bg-muted-foreground/20 rounded w-4/5"></div>
                          <div className="h-4 bg-muted-foreground/15 rounded w-2/3"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted-foreground/15 rounded w-full"></div>
                          <div className="h-3 bg-muted-foreground/15 rounded w-3/4"></div>
                          <div className="h-3 bg-muted-foreground/15 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="h-3 bg-muted-foreground/15 rounded w-16"></div>
                          <div className="h-3 bg-muted-foreground/15 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LatestEpisodesSpread;
