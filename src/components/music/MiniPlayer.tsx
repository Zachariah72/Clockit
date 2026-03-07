import { motion } from "framer-motion";
import { useState } from "react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { Play, Pause, SkipForward, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullPlayer } from "./FullPlayer";

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, play, pause, next, toggleLike, isLiked } = useMediaPlayer();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const isLikedTrack = isLiked(currentTrack.id);

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-[72px] left-0 right-0 z-30 px-2 sm:px-4"
      >
        {/* iPhone-style Mini Player */}
        <div 
          className="mx-auto max-w-2xl bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          {/* Progress indicator at top */}
          <div className="h-0.5 bg-white/10">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ 
                width: `${currentTrack.duration ? (isPlaying ? 5 : 0) : 0}%` 
              }}
            />
          </div>

          <div className="flex items-center gap-3 p-3">
            {/* Album Art Thumbnail */}
            <div className="relative flex-shrink-0">
              <img
                src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              {/* Playing indicator */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 bg-green-500 animate-pulse" style={{ height: '40%' }} />
                    <div className="w-0.5 bg-green-500 animate-pulse" style={{ height: '70%', animationDelay: '0.2s' }} />
                    <div className="w-0.5 bg-green-500 animate-pulse" style={{ height: '50%', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
              <p className="text-white/60 text-xs truncate">{currentTrack.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  isPlaying ? pause() : play();
                }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white hover:bg-white/10 hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white hover:bg-white/10 hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(currentTrack.id);
                }}
              >
                <Heart className={`w-5 h-5 ${isLikedTrack ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <FullPlayer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

