import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  PodcastFeed,
  SubscriptionsResponse,
  UserSubscription,
} from "@/types/podcast";
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
  subscriptions?: UserSubscription[];
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
  const [subscriptions, setSubscriptions] = useState<
    UserSubscription[] | undefined
  >(undefined);

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
      const { data } = await apiClient.get<
        SubscriptionsResponse | PodcastFeed[] | { items?: PodcastFeed[] }
      >("/users/me/subscriptions");
      if ((data as SubscriptionsResponse).subscriptions) {
        const resp = data as SubscriptionsResponse;
        setSubscriptions(resp.subscriptions);
        // Map to PodcastFeed-like objects for backward compatibility where possible
        const mapped: PodcastFeed[] = resp.subscriptions.map((s) => ({
          id: s.podcastId,
          title: s.title,
          url: "",
          originalUrl: "",
          link: "",
          description: s.description,
          author: s.author,
          ownerName: s.author,
          image: s.imageUrl,
          artwork: s.imageUrl,
          lastUpdateTime: 0,
          lastCrawlTime: 0,
          lastParseTime: 0,
          inPollingQueue: 0,
          priority: 0,
          lastGoodHttpStatusTime: 0,
          lastHttpStatus: 0,
          contentType: "",
          language: "",
          type: 0,
          dead: 0,
          crawlErrors: 0,
          parseErrors: 0,
          categories: {},
          locked: 0,
          explicit: false,
          podcastGuid: "",
          medium: "podcast",
          episodeCount: 0,
        }));
        setFollowed(mapped);
      } else {
        const list = Array.isArray(data)
          ? (data as PodcastFeed[])
          : (data as { items?: PodcastFeed[] }).items ?? [];
        setFollowed(list);
        setSubscriptions(undefined);
      }
    } catch (error) {
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
      subscriptions,
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
      subscriptions,
    ]
  );

  return (
    <FollowedContext.Provider value={value}>
      {children}
    </FollowedContext.Provider>
  );
};

export { FollowedContext };
