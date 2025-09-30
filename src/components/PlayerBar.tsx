import React from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

const PlayerBar: React.FC = () => {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    togglePlay,
    seekRelative,
    seek,
    setVolume,
  } = usePlayer();

  // Don't render if no episode is loaded
  if (!currentEpisode) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!duration) return;
    const percent = Number(e.target.value);
    const newTime = (percent / 100) * duration;
    seek(newTime);
  };
  console.log(currentEpisode);
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Left Section - Episode Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={currentEpisode.image || currentEpisode.feedImage}
            alt={currentEpisode.title}
            className="w-12 h-12 rounded-md object-cover bg-muted"
          />
          <div className="min-w-0 flex-1 max-w-32">
            <h4 className="font-medium text-sm truncate">
              {currentEpisode.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentEpisode.feedTitle}
            </p>
          </div>
        </div>

        {/* Center Section - Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => seekRelative(-10)}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-10 w-10 rounded-full"
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => seekRelative(10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={handleSeek}
              className="flex-1 accent-primary"
              disabled={!duration}
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Section - Additional Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
