import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "./layout/MainLayout";
import { Link } from "react-router-dom";
import type { PodcastEpisode, PodcastFeed } from "@/types/podcast";

type SavedState = {
  episodes: PodcastEpisode[];
  podcasts: PodcastFeed[];
};

const STORAGE_KEY = "podbreaf_library";

const LibraryPage: React.FC = () => {
  const [saved, setSaved] = useState<SavedState>({
    episodes: [],
    podcasts: [],
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState;
        setSaved({
          episodes: Array.isArray(parsed.episodes) ? parsed.episodes : [],
          podcasts: Array.isArray(parsed.podcasts) ? parsed.podcasts : [],
        });
      }
    } catch {
      // ignore invalid localStorage
    }
  }, []);

  const prettyDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
  };

  const followed = useMemo(() => saved.podcasts.slice(0, 12), [saved]);

  return (
    <MainLayout>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold">Your Library</h1>

        {/* Saved Episodes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Episodes</h2>
          <div className="space-y-4">
            {saved.episodes.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                You have no saved episodes yet.
              </div>
            ) : (
              saved.episodes.map((ep) => (
                <div
                  key={ep.id as React.Key}
                  className="rounded-2xl bg-card border px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={ep.image || ep.feedImage}
                    alt="cover"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-muted flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={ep.id ? `/episode/${ep.id}` : "#"}
                      className="block text-sm sm:text-base font-medium hover:underline truncate"
                    >
                      {ep.title || "Untitled episode"}
                    </Link>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {ep.feedTitle || "Unknown podcast"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {prettyDuration(ep.duration)}
                    </div>
                  </div>
                  <Link
                    to={ep.id ? `/episode/${ep.id}` : "#"}
                    className="ml-auto inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                    aria-label="Play episode"
                  >
                    ▶
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Followed Podcasts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Followed Podcasts</h2>
          {followed.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You are not following any podcasts yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {followed.map((feed) => (
                <Link
                  key={feed.id}
                  to={`/podcast/${feed.id}`}
                  className="group block rounded-2xl bg-card border p-4 text-center hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={feed.image}
                    alt="art"
                    className="w-28 h-28 mx-auto rounded-xl object-cover bg-muted shadow-sm"
                  />
                  <div className="mt-3 text-sm font-medium truncate group-hover:underline">
                    {feed.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {feed.author || feed.ownerName}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default LibraryPage;
