import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PodcastEpisode, PodcastFeed } from "@/types/podcast";
import { useAuth } from "@/hooks/useAuth";

type SavedState = {
  episodes: PodcastEpisode[];
  podcasts: PodcastFeed[];
};

type SavedContextValue = {
  episodes: PodcastEpisode[];
  podcasts: PodcastFeed[];
  isEpisodeSaved: (episodeId: number | string | undefined) => boolean;
  saveEpisode: (episode: PodcastEpisode) => void;
  removeEpisode: (episodeId: number | string | undefined) => void;
  toggleEpisode: (episode: PodcastEpisode) => void;
};

const STORAGE_KEY = "podbreaf_library";

const SavedContext = createContext<SavedContextValue | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastFeed[]>([]);
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [storageKey, setStorageKey] = useState<string>(STORAGE_KEY);
  const didHydrateRef = useRef(false);

  // Compute storage key from current user email
  useEffect(() => {
    const key = email ? `${STORAGE_KEY}:${email.toLowerCase()}` : STORAGE_KEY;
    setStorageKey(key);
  }, [email]);

  // Hydrate from localStorage whenever storageKey changes (on first load and when user switches)
  useEffect(() => {
    didHydrateRef.current = false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState;
        setEpisodes(Array.isArray(parsed.episodes) ? parsed.episodes : []);
        setPodcasts(Array.isArray(parsed.podcasts) ? parsed.podcasts : []);
      } else {
        setEpisodes([]);
        setPodcasts([]);
      }
    } catch {
      // ignore invalid localStorage
      setEpisodes([]);
      setPodcasts([]);
    } finally {
      didHydrateRef.current = true;
    }
  }, [storageKey]);

  // Persist to localStorage when either list changes post-hydration
  useEffect(() => {
    if (!didHydrateRef.current) return;
    const nextState: SavedState = { episodes, podcasts };
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch {
      // ignore quota or access errors
    }
  }, [episodes, podcasts, storageKey]);

  const isEpisodeSaved = useCallback(
    (episodeId: number | string | undefined) => {
      if (episodeId === undefined || episodeId === null) return false;
      return episodes.some((e) => String(e.id) === String(episodeId));
    },
    [episodes]
  );

  const saveEpisode = useCallback((episode: PodcastEpisode) => {
    if (!episode || episode.id === undefined || episode.id === null) return;
    setEpisodes((prev) => {
      if (prev.some((e) => String(e.id) === String(episode.id))) return prev;
      return [episode, ...prev];
    });
  }, []);

  const removeEpisode = useCallback(
    (episodeId: number | string | undefined) => {
      if (episodeId === undefined || episodeId === null) return;
      setEpisodes((prev) =>
        prev.filter((e) => String(e.id) !== String(episodeId))
      );
    },
    []
  );

  const toggleEpisode = useCallback((episode: PodcastEpisode) => {
    if (!episode || episode.id === undefined || episode.id === null) return;
    setEpisodes((prev) => {
      const exists = prev.some((e) => String(e.id) === String(episode.id));
      return exists
        ? prev.filter((e) => String(e.id) !== String(episode.id))
        : [episode, ...prev];
    });
  }, []);

  const value = useMemo(
    () => ({
      episodes,
      podcasts,
      isEpisodeSaved,
      saveEpisode,
      removeEpisode,
      toggleEpisode,
    }),
    [
      episodes,
      podcasts,
      isEpisodeSaved,
      saveEpisode,
      removeEpisode,
      toggleEpisode,
    ]
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
