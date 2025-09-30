import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "./layout/MainLayout";
import { apiClient } from "@/lib/axios.config";
import type { PodcastFeed } from "@/types/podcast";
import TopPickCard from "./home/TopPickCard";
import LatestEpisodesSpread from "./home/LatestEpisodesSpread";

type Category = {
  key: string;
  label: string;
  emoji?: string;
};

const CATEGORIES: Category[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "comedy", label: "Comedy", emoji: "🎤" },
  { key: "news", label: "News", emoji: "🗞️" },
  { key: "technology", label: "Technology", emoji: "💻" },
  { key: "business", label: "Business", emoji: "💼" },
  { key: "health", label: "Health", emoji: "🫀" },
  { key: "science", label: "Science", emoji: "🧪" },
];

const ExplorePage: React.FC = () => {
  const [trending, setTrending] = useState<PodcastFeed[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pick a few seed queries to simulate "trending" using search API
  const seedQueries = useMemo(
    () => ["startup", "tech", "science", "design", "health"],
    []
  );

  useEffect(() => {
    let mounted = true;
    async function fetchTrending() {
      try {
        setIsLoading(true);
        setError(null);
        if (selectedCategory && selectedCategory !== "all") {
          const q = selectedCategory;
          const res = await apiClient.get("/podcasts/search", {
            params: { q, page: 1 },
          });
          const feeds = (res.data?.feeds as PodcastFeed[]) || [];
          if (mounted) setTrending(feeds.slice(0, 8));
        } else {
          // Fire a few searches and merge distinct feeds for "All"
          const results = await Promise.all(
            seedQueries.map((q) =>
              apiClient
                .get("/podcasts/search", { params: { q, page: 1 } })
                .then((r) => (r.data?.feeds as PodcastFeed[]) || [])
                .catch(() => [])
            )
          );
          const merged = new Map<number, PodcastFeed>();
          results.flat().forEach((feed) => {
            if (feed?.id) merged.set(feed.id, feed);
          });
          if (mounted) {
            setTrending(Array.from(merged.values()).slice(0, 8));
          }
        }
      } catch {
        if (mounted) setError("Failed to load trending podcasts.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchTrending();
    return () => {
      mounted = false;
    };
  }, [seedQueries, selectedCategory]);

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Search header already in layout header */}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const active = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-xl border px-4 py-2 transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="font-medium">{c.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Trending Podcasts</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map((feed) => (
                <TopPickCard
                  key={feed.id}
                  title={feed.title}
                  subtitle={feed.author || feed.ownerName}
                  imageUrl={feed.image}
                  href={`/podcast/${feed.id}`}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Trending Episodes</h2>
          <LatestEpisodesSpread />
        </section>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;
