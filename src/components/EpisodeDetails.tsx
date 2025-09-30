import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import apiClient from "@/lib/axios.config";
import type { EpisodeDetailsResponse, PodcastEpisode } from "@/types/podcast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

const EpisodeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { playEpisode } = usePlayer();

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

  const summaryBullets = useMemo(() => {
    if (!episode?.description) return [] as string[];
    // Strip basic HTML tags and split into bullet-like sentences
    const text = episode.description
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&amp;|&quot;|&#39;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const sentences = text.split(/[.;]\s+/).filter((s) => s.length > 8);
    return sentences.slice(0, 6);
  }, [episode?.description]);

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
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                {summaryBullets.length > 0 ? (
                  summaryBullets.map((line, idx) => <li key={idx}>{line}</li>)
                ) : (
                  <li>No summary available for this episode.</li>
                )}
              </ul>
            )}
          </div>

          {/* Play Button under description */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <Button
              onClick={handlePlayEpisode}
              disabled={!episode?.enclosureUrl}
              className="w-full gap-2"
            >
              <Play className="h-4 w-4" />
              {episode?.enclosureUrl ? "Play Episode" : "Episode not available"}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button className="gap-2">Save Episode</Button>
          <Button variant="outline" className="gap-2">
            Share
          </Button>
          {episode?.link ? (
            <a href={episode.link} target="_blank" rel="noreferrer">
              <Button variant="ghost">Open Episode Page</Button>
            </a>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
};

export default EpisodeDetails;
