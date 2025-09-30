import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import type { PodcastEpisode } from "@/types/podcast";

type EpisodeCardProps = {
  episode: PodcastEpisode;
};

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const { playEpisode } = usePlayer();

  const formattedDate = episode.datePublished
    ? new Date(episode.datePublished * 1000).toLocaleDateString()
    : "";

  const formattedDuration = episode.duration
    ? `${Math.floor(episode.duration / 60)} min`
    : "";

  const meta = [formattedDate, formattedDuration].filter(Boolean).join(" • ");

  const handlePlay = () => {
    playEpisode(episode);
  };

  // Create summary bullets from description
  const bullets = episode.description
    ? episode.description
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;|&amp;|&quot;|&#39;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(/[.;]\s+/)
        .filter((s) => s.length > 8)
        .slice(0, 3)
    : [];

  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="w-36 h-36 rounded-md overflow-hidden bg-muted flex-none">
        {episode.image || episode.feedImage ? (
          <img
            src={episode.image || episode.feedImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {episode.feedTitle || ""} {meta ? `• ${meta}` : ""}
        </div>
        <h3 className="text-lg font-semibold mt-1">
          {episode.title || "Untitled episode"}
        </h3>
        {bullets.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            className="px-5 gap-2"
            onClick={handlePlay}
            disabled={!episode.enclosureUrl}
          >
            <Play className="h-3 w-3" />
            Play
          </Button>
          <Button size="sm" variant="secondary" className="px-5">
            Save
          </Button>
          <Button size="sm" variant="ghost" className="px-5">
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;
