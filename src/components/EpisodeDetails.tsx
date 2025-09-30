import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import apiClient from "@/lib/axios.config";
import type { EpisodeDetailsResponse, PodcastEpisode } from "@/types/podcast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSaved } from "@/contexts/SavedContext";
import { toast } from "sonner";
import { useSummarize } from "@/hooks/useSummarize";

const EpisodeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { playEpisode } = usePlayer();
  const { isEpisodeSaved, toggleEpisode } = useSaved();
  const [summaryVisibleCount, setSummaryVisibleCount] = useState<number>(3);
  const { bullets, isSummarizing, startSummarizing } = useSummarize(episode);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    apiClient
      .get<EpisodeDetailsResponse>(`/episodes/${id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setEpisode((data && data.episode) || null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formattedDate = episode?.datePublished
    ? new Date(episode.datePublished * 1000).toLocaleDateString()
    : "";

  const formattedDuration = useMemo(() => {
    const totalSeconds = episode?.duration ?? 0;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }, [episode?.duration]);

  const handlePlayEpisode = () => {
    if (episode) {
      playEpisode(episode);
    }
  };

  const handleToggleSave = () => {
    if (!episode) return;
    const wasSaved = isEpisodeSaved(episode.id);
    toggleEpisode(episode);
    toast.success(wasSaved ? "Episode removed from saved" : "Episode saved");
  };

  const hasSummary = bullets.length > 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Card */}
        <div className="rounded-2xl border bg-card">
          <div className="p-6 sm:p-8 flex gap-6">
            {loading ? (
              <Skeleton className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl" />
            ) : (
              <img
                src={episode?.image || episode?.feedImage}
                alt={episode?.title || "Episode"}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl object-cover bg-muted"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                {loading ? <Skeleton className="h-9 w-3/4" /> : episode?.title}
              </h1>
              <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                {loading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <>
                    <span>{episode?.feedTitle || ""}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                    {formattedDuration ? (
                      <>
                        <span>•</span>
                        <span>{formattedDuration} min</span>
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={handlePlayEpisode}
                  disabled={!episode?.enclosureUrl}
                  size="lg"
                  className="gap-2 w-64 rounded-full"
                >
                  <Play className="h-4 w-4" />
                  {episode?.enclosureUrl
                    ? "Play Episode"
                    : "Episode not available"}
                </Button>{" "}
                <Button
                  onClick={handleToggleSave}
                  disabled={!episode}
                  size="lg"
                  variant="secondary"
                  className="gap-2 w-64 rounded-full"
                >
                  {episode && isEpisodeSaved(episode.id)
                    ? "Unsave Episode"
                    : "Save Episode"}
                </Button>{" "}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl border bg-card">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <>
                {hasSummary ? (
                  <>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                      {bullets
                        .slice(0, summaryVisibleCount)
                        .map((line, idx) => (
                          <li key={idx}>{line}</li>
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
                  <div className="text-sm text-muted-foreground italic">
                    No summary available for this episode
                    <button
                      onClick={startSummarizing}
                      disabled={isSummarizing}
                      className="ml-1 underline"
                    >
                      {isSummarizing ? "Generating..." : "Click to generate"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EpisodeDetails;
