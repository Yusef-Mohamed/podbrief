import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode } from "@/types/podcast";
import { useSaved } from "@/contexts/SavedContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type EpisodeCardProps = {
  episode: PodcastEpisode;
  onEpisodeUpdate?: (updatedEpisode: PodcastEpisode) => void;
};

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  onEpisodeUpdate,
}) => {
  const { playEpisode } = usePlayer();
  const { isEpisodeSaved, toggleEpisode } = useSaved();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(episode);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [summaryVisibleCount, setSummaryVisibleCount] = useState<number>(3);

  const formattedDate = episode.datePublished
    ? new Date(episode.datePublished * 1000).toLocaleDateString()
    : "";

  const formattedDuration = episode.duration
    ? `${Math.floor(episode.duration / 60)} min`
    : "";

  const meta = [formattedDate, formattedDuration].filter(Boolean).join(" • ");

  const saved = isEpisodeSaved(currentEpisode.id);

  // Local cache for summaries by episode id
  const SUMMARY_CACHE_KEY = "podbreaf_summaries";

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

  const handleToggleSave = () => {
    const wasSaved = isEpisodeSaved(currentEpisode.id);
    toggleEpisode(currentEpisode);
    if (wasSaved) {
      toast.success("Episode removed from saved");
    } else {
      toast.success("Episode saved");
    }
  };

  const handlePlay = () => {
    playEpisode(currentEpisode);
  };

  const fetchEpisodeState = useCallback(async () => {
    if (!currentEpisode.id) return null;

    try {
      const response = await apiClient.get<
        ProcessingResponse | CompletedResponse
      >(`/episodes/${currentEpisode.id}/summary`);
      return response.data;
    } catch (error) {
      console.error("Error fetching episode details:", error);
      return null;
    }
  }, [currentEpisode.id]);

  const handleSummary = async () => {
    if (!currentEpisode.id || isSummarizing) return;

    setIsSummarizing(true);
    try {
      await apiClient.post(`/episodes/${currentEpisode.id}/summary`);
      setIsPolling(true);
      toast.info("Generating summary... this may take a moment");
    } catch (error) {
      console.error("Error requesting summary:", error);
      toast.error("Failed to start summarization");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Polling effect
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      const state = await fetchEpisodeState();
      if (!state) return;
      if ((state as CompletedResponse).status === "COMPLETED") {
        const completed = state as CompletedResponse;
        const summary = completed.summary;
        saveSummaryToCache(completed.episode_id, summary);
        const updated: PodcastEpisode = {
          ...currentEpisode,
          id: completed.episode_id,
          ...(summary ? { summary } : {}),
        } as PodcastEpisode;
        setCurrentEpisode(updated);
        onEpisodeUpdate?.(updated);
        setIsPolling(false);
        clearInterval(pollInterval);
        toast.success("Summary ready");
      }
      // else still PROCESSING
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, fetchEpisodeState, onEpisodeUpdate, currentEpisode]);

  // Update local state when episode prop changes
  useEffect(() => {
    setCurrentEpisode(episode);
    // hydrate summary from cache if backend summary is empty
    const cached = loadSummaryFromCache(episode.id);
    if (
      cached &&
      !(episode as PodcastEpisode & { summary?: string | null }).summary
    ) {
      setCurrentEpisode({
        ...(episode as PodcastEpisode),
        summary: cached,
      } as PodcastEpisode & { summary?: string });
    }
  }, [episode]);

  const getSummaryBullets = () => {
    const text =
      (currentEpisode as PodcastEpisode & { summary?: string | null })
        .summary ??
      loadSummaryFromCache(currentEpisode.id) ??
      "";
    if (!text) return [] as string[];
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&amp;|&quot;|#39;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/[.;]\s+/)
      .filter((s) => s.length > 8)
      .slice(0, 3);
  };

  const bullets = getSummaryBullets();
  const hasSummary = bullets.length > 0;

  const showRequestSummary = !hasSummary && !isPolling;

  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
      <Link
        to={`/episode/${currentEpisode.id}`}
        className="w-36 block h-36 rounded-md overflow-hidden bg-muted flex-none"
      >
        {currentEpisode.image || currentEpisode.feedImage ? (
          <img
            src={currentEpisode.image || currentEpisode.feedImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </Link>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {currentEpisode.feedTitle || ""} {meta ? `• ${meta}` : ""}
        </div>
        <h3 className="text-lg font-semibold mt-1">
          <Link
            to={`/episode/${currentEpisode.id}`}
            className="hover:underline focus:underline focus:outline-none"
          >
            {currentEpisode.title || "Untitled episode"}
          </Link>
        </h3>
        {/* Summary section */}
        {hasSummary ? (
          <>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {bullets.slice(0, summaryVisibleCount).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
            {summaryVisibleCount < Math.min(6, bullets.length) && (
              <button
                className="mt-2 text-xs underline text-muted-foreground"
                onClick={() => setSummaryVisibleCount(6)}
              >
                See more
              </button>
            )}
          </>
        ) : (
          <div className="mt-2 text-sm text-muted-foreground italic">
            No summary available for this episode
            {showRequestSummary && (
              <button
                onClick={handleSummary}
                className="underline cursor-pointer ml-1"
              >
                Click to generate
              </button>
            )}
          </div>
        )}

        {/* Polling indicator */}
        {(isPolling || isSummarizing) && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating summary...
          </div>
        )}

        <div className="mt-4 flex justify-between w-full">
          <Button
            size="lg"
            className="px-5 gap-2 w-[calc(33%-8px)] rounded-full"
            onClick={handlePlay}
            disabled={!currentEpisode.enclosureUrl}
          >
            <Play className="h-3 w-3" />
            Play
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="px-5 gap-2 w-[calc(33%-8px)] rounded-full"
            onClick={handleToggleSave}
          >
            {saved ? "Unsave" : "Save"}
          </Button>
          <Link
            className="block w-[calc(33%-8px)]"
            to={`/episode/${currentEpisode.id}`}
          >
            <Button
              size="lg"
              variant="secondary"
              className="px-5 gap-2 rounded-full w-full"
            >
              Episode Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;
