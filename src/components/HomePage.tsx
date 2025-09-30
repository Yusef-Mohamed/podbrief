import React, { useEffect, useState } from "react";
import MainLayout from "./layout/MainLayout";
import LatestEpisodesSpread from "./home/LatestEpisodesSpread";
import TopPickCard from "./home/TopPickCard";
import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode } from "@/types/podcast";

const HomePage: React.FC = () => {
  const [topEpisodes, setTopEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get("/episodes/recent?page=1&limit=3");
        const items: PodcastEpisode[] = response.data?.items || [];
        console.log(items);
        if (mounted) {
          setTopEpisodes(items.slice(0, 3));
        }
      } catch {
        if (mounted) {
          setError("Failed to load episodes.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchLatest();
    return () => {
      mounted = false;
    };
  }, []);
  const formatSubtitle = (episode: PodcastEpisode) => {
    return episode.feedTitle || "";
  };

  const formatDateTime = (episode: PodcastEpisode) => {
    if (!episode.duration) return "";
    const minutes = Math.max(1, Math.floor(episode.duration / 60));
    return ` • ${minutes} min`;
  };
  return (
    <MainLayout>
      <div className="flex gap-8">
        <div className="flex-1">
          <LatestEpisodesSpread />
        </div>

        <div className="space-y-4 w-64 ">
          <h3 className="text-xl font-bold">Latest 3 Episodes</h3>
          {isLoading && (
            <>
              {[...Array(3)].map((_, i) => (
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
            </>
          )}
          {!isLoading && error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              {error}
            </div>
          )}
          {!isLoading &&
            !error &&
            topEpisodes.map((ep) => (
              <TopPickCard
                key={ep.id as React.Key}
                title={ep.title || "Untitled episode"}
                subtitle={formatSubtitle(ep)}
                imageUrl={ep.image || ep.feedImage}
                dateTimeText={formatDateTime(ep)}
                href={ep.id ? `/episode/${ep.id}` : undefined}
              />
            ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
