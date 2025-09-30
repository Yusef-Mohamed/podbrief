import React, { useState, useEffect /*, useCallback */ } from "react";
import { Button } from "@/components/ui/button";
import { Play /*, Loader2 */ } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
// import { apiClient } from "@/lib/axios.config";
import type { PodcastEpisode } from "@/types/podcast";
import { useSaved } from "@/contexts/SavedContext";
import { toast } from "sonner";

type EpisodeCardProps = {
  episode: PodcastEpisode;
  onEpisodeUpdate?: (updatedEpisode: PodcastEpisode) => void;
};

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  // onEpisodeUpdate,
}) => {
  const { playEpisode } = usePlayer();
  const { isEpisodeSaved, toggleEpisode } = useSaved();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(episode);
  // const [isSummarizing, setIsSummarizing] = useState(false);
  // const [isPolling, setIsPolling] = useState(false);

  const formattedDate = episode.datePublished
    ? new Date(episode.datePublished * 1000).toLocaleDateString()
    : "";

  const formattedDuration = episode.duration
    ? `${Math.floor(episode.duration / 60)} min`
    : "";

  const meta = [formattedDate, formattedDuration].filter(Boolean).join(" • ");

  const saved = isEpisodeSaved(currentEpisode.id);

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

  // const fetchEpisodeDetails = useCallback(async () => {
  //   if (!currentEpisode.id) return null;
  //
  //   try {
  //     const response = await apiClient.get(`/${currentEpisode.id}/summary`);
  //     return response.data.episode;
  //   } catch (error) {
  //     console.error("Error fetching episode details:", error);
  //     return null;
  //   }
  // }, [currentEpisode.id]);

  // const handleSummary = async () => {
  //   if (!currentEpisode.id || isSummarizing) return;
  //
  //   setIsSummarizing(true);
  //   try {
  //     await apiClient.post(`/${currentEpisode.id}/summary`);
  //     setIsPolling(true);
  //   } catch (error) {
  //     console.error("Error requesting summary:", error);
  //   } finally {
  //     setIsSummarizing(false);
  //   }
  // };

  // Polling effect
  // useEffect(() => {
  //   if (!isPolling) return;
  //
  //   const pollInterval = setInterval(async () => {
  //     const updatedEpisode = await fetchEpisodeDetails();
  //     if (updatedEpisode && updatedEpisode.summary_info) {
  //       setCurrentEpisode(updatedEpisode);
  //       onEpisodeUpdate?.(updatedEpisode);
  //       setIsPolling(false);
  //       clearInterval(pollInterval);
  //     }
  //   }, 10000); // Poll every 10 seconds
  //
  //   return () => clearInterval(pollInterval);
  // }, [isPolling, fetchEpisodeDetails, onEpisodeUpdate]);

  // Update local state when episode prop changes
  useEffect(() => {
    setCurrentEpisode(episode);
  }, [episode]);

  // Create summary bullets from summary_info or description
  // const getSummaryBullets = () => {
  //   if (currentEpisode.summary_info) {
  //     return currentEpisode.summary_info
  //       .replace(/<[^>]*>/g, " ")
  //       .replace(/&nbsp;|&amp;|&quot;|#39;/g, " ")
  //       .replace(/\s+/g, " ")
  //       .trim()
  //       .split(/[.;]\s+/)
  //       .filter((s) => s.length > 8)
  //       .slice(0, 3);
  //   }
  //
  //   if (currentEpisode.description) {
  //     return currentEpisode.description
  //       .replace(/<[^>]*>/g, " ")
  //       .replace(/&nbsp;|&amp;|&quot;|#39;/g, " ")
  //       .replace(/\s+/g, " ")
  //       .trim()
  //       .split(/[.;]\s+/)
  //       .filter((s) => s.length > 8)
  //       .slice(0, 3);
  //   }
  //
  //   return [];
  // };

  // const bullets = getSummaryBullets();
  // const hasSummary = !!currentEpisode.summary_info;

  // Dummy summary bullets (temporary)
  const dummyBullets = [
    "This is a short dummy summary of the episode content.",
    "Key takeaway number two goes here as placeholder.",
    "Another highlight about the episode while real summary is disabled.",
  ];

  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="w-36 h-36 rounded-md overflow-hidden bg-muted flex-none">
        {currentEpisode.image || currentEpisode.feedImage ? (
          <img
            src={currentEpisode.image || currentEpisode.feedImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {currentEpisode.feedTitle || ""} {meta ? `• ${meta}` : ""}
        </div>
        <h3 className="text-lg font-semibold mt-1">
          {currentEpisode.title || "Untitled episode"}
        </h3>
        {/* Summary section (dummy). Original UI commented below. */}
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {dummyBullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>

        {/**
         * Original summary UI (hidden for now):
         * {hasSummary ? (
         *   bullets.length > 0 && (
         *     <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
         *       {bullets.map((bullet, i) => (
         *         <li key={i}>{bullet}</li>
         *       ))}
         *     </ul>
         *   )
         * ) : (
         *   <div className="mt-2 text-sm text-muted-foreground italic">
         *     No summary available for this episode{" "}
         *     <button
         *       onClick={handleSummary}
         *       className="underline cursor-pointer"
         *     >
         *       Click here to Summary
         *     </button>
         *   </div>
         * )}
         */}

        {/* Polling indicator hidden while using dummy summary */}
        {/**
         * {isPolling && (
         *   <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
         *     <Loader2 className="h-3 w-3 animate-spin" />
         *     Generating summary...
         *   </div>
         * )}
         */}

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
          <Button
            size="lg"
            variant="ghost"
            className="px-5 gap-2 w-[calc(33%-8px)] rounded-full"
          >
            Details in markdown
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;
