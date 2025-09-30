import React, { useEffect, useState } from "react";
import MainLayout from "./layout/MainLayout";
import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode, PodcastEpisodesResponse } from "@/types/podcast";
// Top picks handled via Top5PicksSpread
import EpisodeCard from "./home/EpisodeCard";
import Top5PicksSpread from "./home/Top5PicksSpread";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Trending podcasts state moved to Top5PicksSpread
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Episodes with numbered pagination (no infinite scroll)
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [epLoading, setEpLoading] = useState<boolean>(true);
  const [epError, setEpError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Pick a few seed queries to simulate "trending" using search API
  // no local podcast fetch logic here anymore

  // Trending podcasts are handled in Top5PicksSpread now; keep seedQueries for category UI

  // Fetch recent episodes for the current page
  useEffect(() => {
    let mounted = true;
    async function fetchEpisodes(currentPage: number) {
      try {
        setEpLoading(true);
        setEpError(null);
        const res = await apiClient.get(`/episodes/recent`, {
          params: { page: currentPage },
        });
        const data = res.data as PodcastEpisodesResponse;
        if (!mounted) return;
        setEpisodes(data.items ?? []);
        const tp = data.pagination?.total_pages ?? 1;
        setTotalPages(tp > 0 ? tp : 1);
      } catch {
        if (!mounted) return;
        setEpError("Failed to load episodes.");
      } finally {
        if (mounted) setEpLoading(false);
      }
    }
    fetchEpisodes(page);
    return () => {
      mounted = false;
    };
  }, [page]);

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

        <Top5PicksSpread
          selectedCategory={selectedCategory}
          showPagination
          pageSize={15}
          title="Trending Podcasts"
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Trending Episodes</h2>
          {epLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : epError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center"></div>
                <h3 className="text-lg font-semibold text-destructive">
                  Failed to Load Episodes
                </h3>
              </div>
              <p className="text-destructive/80">{epError}</p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"></div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Episodes Found
              </h3>
              <p className="text-muted-foreground">
                There are no recent episodes available at the moment.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {episodes.map((ep) => (
                  <EpisodeCard key={ep.id} episode={ep} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        aria-disabled={page <= 1}
                        onClick={() => page > 1 && setPage(page - 1)}
                        href="#"
                      />
                    </PaginationItem>

                    {/* Simple windowed page numbers */}
                    {(() => {
                      const windowSize = 5;
                      const start = Math.max(
                        1,
                        page - Math.floor(windowSize / 2)
                      );
                      const end = Math.min(totalPages, start + windowSize - 1);
                      const pages: number[] = [];
                      for (let p = start; p <= end; p += 1) pages.push(p);
                      const showStartEllipsis = start > 1;
                      const showEndEllipsis = end < totalPages;
                      return (
                        <>
                          {showStartEllipsis && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  isActive={page === 1}
                                  href="#"
                                  onClick={() => setPage(1)}
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {start > 2 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                            </>
                          )}
                          {pages.map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink
                                isActive={p === page}
                                href="#"
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          {showEndEllipsis && (
                            <>
                              {end < totalPages - 1 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  isActive={page === totalPages}
                                  href="#"
                                  onClick={() => setPage(totalPages)}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                        </>
                      );
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        aria-disabled={page >= totalPages}
                        onClick={() => page < totalPages && setPage(page + 1)}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;
