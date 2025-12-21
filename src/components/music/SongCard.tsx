import { motion } from "framer-motion";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";

interface SongCardProps {
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
  isPlaying?: boolean;
  onClick?: () => void;
  trackUrl?: string; // Add track URL for playback
  playlist?: any[]; // Add playlist for auto-play
  currentIndex?: number; // Add current index in playlist
}

export const SongCard = ({
  title,
  artist,
  albumArt,
  duration,
  isPlaying = false,
  onClick,
  trackUrl,
  playlist = [],
  currentIndex = 0,
}: SongCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { playTrack, currentTrack } = useMediaPlayer();

  const parseDuration = (durationStr: string): number => {
    // Parse duration string like "3:42" to seconds
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 180; // Default fallback
  };

  const handlePlay = () => {
    if (trackUrl) {
      // Create a track object for the media player
      const track = {
        id: `${title}-${artist}`, // Simple ID generation
        title,
        artist,
        album: 'Clockit', // Default album
        duration: parseDuration(duration), // Parse actual duration
        url: trackUrl,
        artwork: albumArt,
      };

      // If playlist is provided, play with playlist for auto-play
      if (playlist.length > 0) {
        playTrack(track, playlist, currentIndex);
      } else {
        playTrack(track);
      }
    }
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePlay}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isPlaying ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
      }`}
    >
      {/* Album art with play overlay */}
      <div className="relative group">
        <img
          src={albumArt}
          alt={title}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-primary fill-primary" />
        </div>
        {isPlaying && (
          <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold truncate ${
            isPlaying ? "text-primary" : "text-foreground"
          }`}
        >
          {title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">{artist}</p>
      </div>

      {/* Duration and actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{duration}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={isLiked ? "text-secondary" : "text-muted-foreground"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  );
};
