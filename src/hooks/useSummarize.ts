import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode } from "@/types/podcast";

type ProcessingResponse = {
  message: string;
  status: "PROCESSING";
  episode_id: number;
  episode_title: string;
  podcast_id: number;
  processing_started_at: number;
};

type CompletedResponse = {
  episode_id: number;
  podcast_id: number;
  status: "COMPLETED";
  summary: string;
  category?: string;
  completed_at: number;
};

const SUMMARY_CACHE_KEY = "podbreaf_summaries";

function loadSummaryFromCache(
  episodeId: number | string | undefined
): string | null {
  if (episodeId === undefined || episodeId === null) return null;
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    const key = String(episodeId);
    return typeof map[key] === "string" ? map[key] : null;
  } catch {
    return null;
  }
}

function saveSummaryToCache(
  episodeId: number | string | undefined,
  summary: string
): void {
  if (episodeId === undefined || episodeId === null) return;
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[String(episodeId)] = summary;
    localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function useSummarize(episode: PodcastEpisode | null) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const isPollingRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // hydrate from cache or existing episode field
  useEffect(() => {
    if (!episode) return;
    const cached = loadSummaryFromCache(episode.id);
    const initial =
      (episode as PodcastEpisode & { summary?: string | null }).summary ??
      cached ??
      null;
    setSummary(initial);
  }, [episode?.id]);

  const fetchState = useCallback(async () => {
    if (!episode?.id) return null;
    try {
      const res = await apiClient.get<ProcessingResponse | CompletedResponse>(
        `/episodes/${episode.id}/summary`
      );
      return res.data;
    } catch {
      return null;
    }
  }, [episode?.id]);

  const startSummarizing = useCallback(async () => {
    if (!episode?.id || isPollingRef.current) return;
    setIsSummarizing(true);
    try {
      await apiClient.post(`/episodes/${episode.id}/summary`);
      // begin polling
      isPollingRef.current = true;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        const state = await fetchState();
        if (state && (state as CompletedResponse).status === "COMPLETED") {
          const completed = state as CompletedResponse;
          saveSummaryToCache(completed.episode_id, completed.summary);
          setSummary(completed.summary ?? null);
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          isPollingRef.current = false;
          setIsSummarizing(false);
        }
        // else keep polling while PROCESSING
      }, 10000);
    } catch {
      setIsSummarizing(false);
    }
  }, [episode?.id, fetchState]);

  // cleanup
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
      isPollingRef.current = false;
    };
  }, []);

  const bullets = useMemo(() => {
    const text = summary ?? "";
    if (!text) return [] as string[];
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&amp;|&quot;|#39;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/[.;]\s+/)
      .filter((s) => s.length > 8)
      .slice(0, 6);
  }, [summary]);

  return { summary, bullets, isSummarizing, startSummarizing } as const;
}

export default useSummarize;
