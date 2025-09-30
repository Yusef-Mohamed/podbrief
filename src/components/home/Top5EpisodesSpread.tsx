import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode } from "@/types/podcast";
import TopEpisodePickCard from "./TopEpisodePickCard";
import { cn } from "@/lib/utils";

type Top5EpisodesSpreadProps = {
  selectedCategory?: string;
  pageSize?: number;
  title?: string;
  gridClassName?: string;
};

const Top5EpisodesSpread: React.FC<Top5EpisodesSpreadProps> = ({
  selectedCategory = "all",
  pageSize = 5,
  title = "Top 5 Picks",
  gridClassName,
}) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchTopEpisodes() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch recent episodes - we'll use this as our "top picks" for now
        // In a real app, you might have a dedicated endpoint for trending/popular episodes
        const response = await apiClient.get(`/episodes/recent?page=1`);
        const responseData = response.data;

        if (mounted) {
          // Get the first pageSize episodes
          const recentEpisodes =
            (responseData?.items as PodcastEpisode[]) || [];
          setEpisodes(recentEpisodes.slice(0, pageSize));
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load episodes.");
          console.error("Error fetching episodes:", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTopEpisodes();

    return () => {
      mounted = false;
    };
  }, [selectedCategory, pageSize]);

  return (
    <section className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {isLoading ? (
        <div className={cn("grid gap-4", gridClassName ?? "grid-cols-1")}>
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm animate-pulse"
            >
              <div className="h-36 w-full bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-4/5" />
                <div className="h-3 bg-muted-foreground/15 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          {error}
        </div>
      ) : (
        <div className={cn("grid gap-4", gridClassName ?? "grid-cols-1")}>
          {episodes.map((episode) => (
            <TopEpisodePickCard key={episode.id} episode={episode} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Top5EpisodesSpread;
