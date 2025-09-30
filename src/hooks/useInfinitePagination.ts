import { useState, useEffect, useRef, useCallback } from "react";

interface PaginationInfo {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  returned_count: number;
}

interface UseInfinitePaginationOptions<T> {
  fetchFunction: (page: number) => Promise<{
    items: T[];
    pagination?: PaginationInfo;
    status?: string;
  }>;
  initialPage?: number;
}

interface UseInfinitePaginationReturn<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  refresh: () => void;
  retry: () => void;
  loadMore: () => Promise<void>;
}

export function useInfinitePagination<T>({
  fetchFunction,
  initialPage = 1,
}: UseInfinitePaginationOptions<T>): UseInfinitePaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update the ref when fetchFunction changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const fetchData = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setError(null);
        }

        const response = await fetchFunctionRef.current(page);

        if (response.status === "true" || !response.status) {
          const newItems = response.items || [];

          if (append) {
            setItems((prev) => [...prev, ...newItems]);
          } else {
            setItems(newItems);
          }

          if (response.pagination) {
            setPagination(response.pagination);
            setHasNextPage(response.pagination.has_next);
          }
        } else {
          if (!append) {
            setError("Failed to fetch data");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (!append) {
          setError("Failed to load data. Please try again later.");
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [] // No dependencies since we use the ref
  );

  const loadMore = useCallback(async () => {
    if (!pagination || !hasNextPage || isLoadingMore) return;

    const nextPage = pagination.page + 1;
    await fetchData(nextPage, true);
  }, [pagination, hasNextPage, isLoadingMore, fetchData]);

  const refresh = useCallback(() => {
    fetchData(initialPage);
  }, [initialPage, fetchData]);

  const retry = useCallback(() => {
    fetchData(pagination?.page || initialPage);
  }, [pagination?.page, initialPage, fetchData]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasNextPage, isLoadingMore]);

  // Initial load
  useEffect(() => {
    fetchData(initialPage);
  }, [initialPage, fetchData]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    hasNextPage,
    loadMoreRef,
    refresh,
    retry,
    loadMore,
  };
}
