import React from "react";
import { Link } from "react-router-dom";
import type { PodcastEpisode } from "@/types/podcast";

type TopEpisodePickCardProps = {
  episode: PodcastEpisode;
};

const TopEpisodePickCard: React.FC<TopEpisodePickCardProps> = ({ episode }) => {
  const formattedDate = episode.datePublished
    ? new Date(episode.datePublished * 1000).toLocaleDateString()
    : "";

  const formattedDuration = episode.duration
    ? `${Math.floor(episode.duration / 60)} min`
    : "";

  const meta = [formattedDate, formattedDuration].filter(Boolean).join(" • ");

  return (
    <Link
      to={`/episode/${episode.id}`}
      className="block rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="h-36 w-full bg-muted">
        {episode.image || episode.feedImage ? (
          <img
            src={episode.image || episode.feedImage}
            alt="episode cover"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <div className="font-medium leading-tight line-clamp-2">
          {episode.title || "Untitled Episode"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {episode.feedTitle || ""}
          {meta && (
            <span className="text-xs text-muted-foreground"> • {meta}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TopEpisodePickCard;
