import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PodcastFeed } from "@/types/podcast";
import { apiClient } from "@/lib/axios.config";

type FollowedContextValue = {
  followed: PodcastFeed[];
  isLoading: boolean;
  loadingIds: Record<string, boolean>;
  isFollowed: (podcastId: number | string | undefined) => boolean;
  follow: (podcast: PodcastFeed) => Promise<void>;
  unfollow: (podcastId: number | string | undefined) => Promise<void>;
  toggleFollow: (podcast: PodcastFeed) => Promise<void>;
  refresh: () => Promise<void>;
};

const FollowedContext = createContext<FollowedContextValue | undefined>(
  undefined
);

export const FollowedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [followed, setFollowed] = useState<PodcastFeed[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const setIdLoading = (id: number | string | undefined, loading: boolean) => {
    if (id === undefined || id === null) return;
    setLoadingIds((prev) => ({ ...prev, [String(id)]: loading }));
  };

  const isFollowed = useCallback(
    (podcastId: number | string | undefined) => {
      if (podcastId === undefined || podcastId === null) return false;
      return followed.some((p) => String(p.id) === String(podcastId));
    },
    [followed]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<PodcastFeed[]>(
        "/users/me/subscriptions"
      );
      const list = Array.isArray(data)
        ? data
        : // Some APIs wrap as { items: PodcastFeed[] }
          (data as unknown as { items?: PodcastFeed[] }).items ?? [];
      setFollowed(list);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load subscriptions", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const follow = useCallback(async (podcast: PodcastFeed) => {
    if (!podcast || podcast.id === undefined || podcast.id === null) return;
    const id = String(podcast.id);
    setIdLoading(id, true);
    try {
      await apiClient.post("/users/me/subscriptions", {
        podcastId: podcast.id,
      });
      setFollowed((prev) => {
        if (prev.some((p) => String(p.id) === id)) return prev;
        return [podcast, ...prev];
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to follow podcast", error);
      throw error;
    } finally {
      setIdLoading(id, false);
    }
  }, []);

  const unfollow = useCallback(
    async (podcastId: number | string | undefined) => {
      if (podcastId === undefined || podcastId === null) return;
      const id = String(podcastId);
      setIdLoading(id, true);
      try {
        await apiClient.delete(`/users/me/subscriptions/${id}`);
        setFollowed((prev) => prev.filter((p) => String(p.id) !== id));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to unfollow podcast", error);
        throw error;
      } finally {
        setIdLoading(id, false);
      }
    },
    []
  );

  const toggleFollow = useCallback(
    async (podcast: PodcastFeed) => {
      if (!podcast || podcast.id === undefined || podcast.id === null) return;
      const id = String(podcast.id);
      if (followed.some((p) => String(p.id) === id)) {
        await unfollow(id);
      } else {
        await follow(podcast);
      }
    },
    [followed, follow, unfollow]
  );

  const value = useMemo(
    () => ({
      followed,
      isLoading,
      loadingIds,
      isFollowed,
      follow,
      unfollow,
      toggleFollow,
      refresh,
    }),
    [
      followed,
      isLoading,
      loadingIds,
      isFollowed,
      follow,
      unfollow,
      toggleFollow,
      refresh,
    ]
  );

  return (
    <FollowedContext.Provider value={value}>
      {children}
    </FollowedContext.Provider>
  );
};

export { FollowedContext };
