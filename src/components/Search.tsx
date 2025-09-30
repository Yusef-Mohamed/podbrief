import React, { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/axios.config";
import type { PodcastFeed, PodcastSearchResponse } from "@/types/podcast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useInfinitePagination } from "@/hooks/useInfinitePagination";

const Search: React.FC<{ className?: string }> = ({ className }) => {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Create a ref to store the current query
  const queryRef = useRef(debouncedQuery);

  // Update the ref when debouncedQuery changes
  useEffect(() => {
    queryRef.current = debouncedQuery;
  }, [debouncedQuery]);

  // Create a stable fetch function
  const fetchSearchResults = useCallback(async (page: number) => {
    if (!queryRef.current) {
      return { items: [], pagination: undefined, status: "true" };
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const response = await apiClient.get<PodcastSearchResponse>(
      "/podcasts/search",
      {
        params: { q: queryRef.current, page },
        signal: abortRef.current.signal as never,
      }
    );

    return {
      items: response.data.feeds || [],
      pagination: response.data.pagination,
      status: response.data.status,
    };
  }, []); // No dependencies since we use the ref

  const {
    items: results,
    isLoading: isSearching,
    isLoadingMore,
    hasNextPage,
    loadMoreRef,
    refresh,
  } = useInfinitePagination<PodcastFeed>({
    fetchFunction: fetchSearchResults,
  });

  // Handle query changes
  useEffect(() => {
    if (debouncedQuery) {
      setOpen(true);
      refresh(); // Reset to page 1 when query changes
    } else {
      setOpen(false);
    }
  }, [debouncedQuery, refresh]);

  return (
    <div className={cn("relative flex-1", className)}>
      <Input
        placeholder="Search…"
        className="pl-3 pr-3"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        aria-label="Search podcasts"
        onFocus={() => results.length && setOpen(true)}
      />
      {open ? (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul className="max-h-80 overflow-auto py-2">
            {isSearching
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={`s-${i}`}
                    className="px-3 py-2 flex items-center gap-3"
                  >
                    <Skeleton className="w-8 h-8 rounded" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </li>
                ))
              : results.map((feed) => (
                  <li key={feed.id} className="px-0">
                    <Link
                      to={`/podcast/${feed.id}`}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-3"
                    >
                      <img
                        src={feed.image}
                        alt="logo"
                        className="w-8 h-8 rounded object-cover bg-muted"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {feed.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {feed.author || feed.ownerName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}

            {/* Load More Skeleton */}
            {isLoadingMore && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={`load-more-${i}`}
                    className="px-3 py-2 flex items-center gap-3"
                  >
                    <Skeleton className="w-8 h-8 rounded" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </li>
                ))}
              </>
            )}

            {/* Load More Trigger */}
            {hasNextPage && !isSearching && !isLoadingMore && (
              <li
                ref={loadMoreRef as unknown as React.RefObject<HTMLLIElement>}
                className="px-3 py-2 text-center"
              ></li>
            )}

            {!isSearching && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No results found
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Search;
