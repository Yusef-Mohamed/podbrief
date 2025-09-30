import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import type {
  PodcastFeed,
  PodcastDetailsResponse,
  PodcastEpisodesResponse,
  PodcastEpisode,
} from "@/types/podcast";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/axios.config";
import { Skeleton } from "@/components/ui/skeleton";

const PodcastDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [feed, setFeed] = useState<PodcastFeed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient
      .get<PodcastDetailsResponse>(`/podcasts/${id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setFeed(
          (data && (data as PodcastDetailsResponse).feed) as PodcastFeed | null
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoadingEpisodes(true);
    apiClient
      .get<PodcastEpisodesResponse>(`/podcasts/${id}/episodes`)
      .then(({ data }) => {
        if (!isMounted) return;
        const list = data.items || [];
        setEpisodes(list);
      })
      .finally(() => {
        if (isMounted) setLoadingEpisodes(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);
  return (
    <MainLayout>
      <div className="flex items-start gap-6">
        {loading ? (
          <Skeleton className="w-48 h-48 rounded-xl" />
        ) : (
          <img
            src={feed?.image}
            alt={feed?.title || "Podcast artwork"}
            className="w-48 h-48 rounded-xl object-cover bg-muted"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">
            {loading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              feed?.title || `Podcast #${id}`
            )}
          </h1>
          <div className="mt-2">
            {loading ? (
              <>
                <Skeleton className="h-3 w-5/6 mb-2" />
                <Skeleton className="h-3 w-4/6" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground ">
                {feed?.description || "Podcast description unavailable."}
              </p>
            )}
          </div>
          <div className="mt-4">
            <Button disabled={loading} className="px-20 rounded-full">
              Follow
            </Button>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Episodes</h2>
      <div className="space-y-3">
        {loadingEpisodes ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`ep-s-${i}`} className="rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : episodes.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            No episodes found.
          </div>
        ) : (
          episodes.map((ep, idx) => (
            <Link
              key={`${ep.id ?? idx}`}
              to={`/episode/${ep.id ?? ""}`}
              className="rounded-xl border bg-card p-4 block hover:bg-accent/40 transition-colors"
            >
              <div className="text-sm text-muted-foreground">
                {ep.datePublished
                  ? new Date(ep.datePublished * 1000).toLocaleDateString()
                  : ""}
                {ep.duration ? ` • ${ep.duration} min` : ""}
              </div>
              <div className="font-medium">
                {ep.title || "Untitled episode"}
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: ep.description || "" }}
                className="text-sm text-muted-foreground line-clamp-1"
              />
            </Link>
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default PodcastDetails;
