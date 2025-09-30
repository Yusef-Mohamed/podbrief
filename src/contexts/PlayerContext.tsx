import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { PodcastEpisode } from "@/types/podcast";

interface PlayerState {
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isLoading: boolean;
}

interface PlayerActions {
  playEpisode: (episode: PodcastEpisode) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  seekRelative: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

interface PlayerContextType extends PlayerState, PlayerActions {}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const playEpisode = (episode: PodcastEpisode) => {
    const audio = audioRef.current;
    if (!audio || !episode.enclosureUrl) return;

    // If it's the same episode, just toggle play/pause
    if (currentEpisode?.id === episode.id) {
      togglePlay();
      return;
    }

    // Load new episode
    setCurrentEpisode(episode);
    setIsLoading(true);
    audio.src = episode.enclosureUrl;
    audio.load();

    // Play automatically
    audio.play().catch(console.error);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.min(Math.max(0, time), duration);
  };

  const seekRelative = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = Math.min(
      Math.max(0, audio.currentTime + seconds),
      duration
    );
    audio.currentTime = newTime;
  };

  const updatePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const updateVolume = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(Math.max(0, newVolume), 1);
    setVolume(newVolume);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const contextValue: PlayerContextType = {
    // State
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isLoading,
    // Actions
    playEpisode,
    togglePlay,
    pause,
    seek,
    seekRelative,
    setPlaybackRate: updatePlaybackRate,
    setVolume: updateVolume,
    stop,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
