import React from 'react';
import { Play, SkipBack, SkipForward, Heart, Repeat, Pause, X } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer = ({ onExpand }: MiniPlayerProps) => {
  const { currentTrack, isPlaying, play, pause, stopPlugin } = useMediaPlayer();

  if (!currentTrack) return null;

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stopPlugin) stopPlugin();
    pause();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className="fixed bottom-[84px] left-4 right-4 z-40">
      <div
        onClick={onExpand}
        className="bg-card/95 backdrop-blur-md rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-xl border border-border cursor-pointer hover:bg-card transition-colors"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img
            src={currentTrack.albumArt || "https://picsum.photos/seed/wizkid/100/100"}
            alt={currentTrack.title}
            className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 rounded-xl ring-1 ring-inset ring-foreground/10" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">{currentTrack.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex gap-1 h-4 items-center">
              <div className="w-1 bg-primary rounded-full animate-pulse h-2" />
              <div className="w-1 bg-primary rounded-full animate-pulse h-4" style={{ animationDelay: '150ms' }} />
              <div className="w-1 bg-primary rounded-full animate-pulse h-3" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          <button
            onClick={handleStop}
            className="text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-background/80 transition-colors"
          >
            <X size={18} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
