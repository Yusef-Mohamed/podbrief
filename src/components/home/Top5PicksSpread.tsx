import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/axios.config";
import type { PodcastFeed } from "@/types/podcast";
import TopPickCard from "./TopPickCard";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type Top5PicksSpreadProps = {
  selectedCategory: string;
  showPagination?: boolean;
  pageSize?: number;
  title?: string;
  gridClassName?: string;
};

const Top5PicksSpread: React.FC<Top5PicksSpreadProps> = ({
  selectedCategory,
  showPagination = true,
  pageSize = 5,
  title = "Top 5 Picks",
  gridClassName,
}) => {
  const [trending, setTrending] = useState<PodcastFeed[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Page size (default 5)
  const PAGE_SIZE = pageSize;

  const seedQueries = useMemo(
    () => ["startup", "tech", "science", "design", "health"],
    []
  );

  useEffect(() => {
    // Reset page when category changes
    setPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    async function fetchTrending() {
      try {
        setIsLoading(true);
        setError(null);
        if (selectedCategory && selectedCategory !== "all") {
          const q = selectedCategory;
          const res = await apiClient.get("/podcasts/search", {
            params: { q, page },
          });
          const feeds = (res.data?.feeds as PodcastFeed[]) || [];
          if (mounted) {
            setTrending(feeds);
            const tp = res.data?.pagination?.total_pages ?? 1;
            setTotalPages(tp > 0 ? tp : 1);
          }
        } else {
          // Merge distinct feeds for "All", then paginate client-side with PAGE_SIZE
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
            const mergedArr = Array.from(merged.values());
            const total = Math.max(1, Math.ceil(mergedArr.length / PAGE_SIZE));
            setTotalPages(total);
            const startIdx = (page - 1) * PAGE_SIZE;
            const endIdx = startIdx + PAGE_SIZE;
            setTrending(mergedArr.slice(startIdx, endIdx));
          }
        }
      } catch {
        if (mounted) setError("Failed to load podcasts.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchTrending();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, seedQueries, page, PAGE_SIZE]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {isLoading ? (
        <div
          className={cn(
            "grid gap-4",
            gridClassName ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          )}
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
        <>
          <div
            className={cn(
              "grid gap-4",
              gridClassName ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
            )}
          >
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
          {showPagination && totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={page <= 1}
                    onClick={() => page > 1 && setPage(page - 1)}
                    href="#"
                  />
                </PaginationItem>
                {(() => {
                  const windowSize = 5;
                  const start = Math.max(1, page - Math.floor(windowSize / 2));
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
  );
};

export default Top5PicksSpread;
