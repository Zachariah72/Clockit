import { useState, useEffect } from "react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Heart, Airplay, Speaker, ListMusic, Ellipsis, Mic2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FullPlayer = ({ open, onOpenChange }: FullPlayerProps) => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    play, 
    pause, 
    next, 
    previous, 
    seekTo,
    isShuffled,
    repeatMode,
    toggleShuffle,
    setRepeatMode,
    toggleLike,
    isLiked 
  } = useMediaPlayer();

  const [isLikedTrack, setIsLikedTrack] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsLikedTrack(isLiked(currentTrack.id));
    }
  }, [currentTrack, isLiked]);

  if (!currentTrack) return null;

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
      setIsLikedTrack(!isLikedTrack);
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat className="w-5 h-5" />;
      case 'all':
        return <Repeat className="w-5 h-5" />;
      default:
        return <Repeat className="w-5 h-5 opacity-40" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[40px] overflow-hidden p-0 bg-black">
        {/* iPhone-style Background */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(50px) brightness(0.4)',
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />

        <div className="relative flex flex-col h-full z-10">
          {/* Header */}
          <div className="flex-shrink-0 pt-4 px-6">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-white/90 text-sm font-medium uppercase tracking-widest">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </SheetTitle>
            </SheetHeader>
            
            {/* Drag Handle */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="px-6 pb-8">
              {/* Album Art - iPhone Style */}
              <div className="flex justify-center mb-8 mt-4">
                <img
                  src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
                  alt={currentTrack.title}
                  className="w-72 h-72 rounded-xl object-cover shadow-2xl"
                />
              </div>

              {/* Track Info */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                    {currentTrack.title}
                  </h2>
                  <p className="text-lg text-white/70">{currentTrack.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLikeToggle}
                  className="flex-shrink-0"
                >
                  <Heart 
                    className={`w-7 h-7 transition-all ${isLikedTrack ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </Button>
              </div>

              {/* Progress Bar - iPhone Style */}
              <div className="mb-8">
                <Slider
                  value={[currentTime]}
                  max={currentTrack.duration || 300}
                  step={1}
                  onValueChange={handleSeek}
                  className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_.relative]:bg-white/30 [&_.relative>div]:bg-white"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1 font-medium">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration || 0)}</span>
                </div>
              </div>

              {/* Main Controls - iPhone Style */}
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={`${isShuffled ? 'text-green-500' : 'text-white/70'} hover:bg-transparent`}
                >
                  <Shuffle className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previous}
                  className="text-white hover:bg-white/10"
                >
                  <SkipBack className="w-8 h-8" />
                </Button>

                <Button
                  onClick={isPlaying ? pause : play}
                  className="w-20 h-20 rounded-full bg-white text-black hover:bg-white/90 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="text-white hover:bg-white/10"
                >
                  <SkipForward className="w-8 h-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                  className={`${repeatMode !== 'off' ? 'text-green-500' : 'text-white/70'} hover:bg-transparent`}
                >
                  {getRepeatIcon()}
                </Button>
              </div>

              {/* Bottom Controls - iPhone Style */}
              <div className="flex items-center justify-between px-2">
                <Button variant="ghost" size="sm" className="text-white/50 hover:bg-white/10 hover:text-white">
                  <Speaker className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="sm" className="text-white/50 hover:bg-white/10 hover:text-white">
                  <Airplay className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="sm" className="text-white/50 hover:bg-white/10 hover:text-white">
                  <ListMusic className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="sm" className="text-white/50 hover:bg-white/10 hover:text-white">
                  <Ellipsis className="w-5 h-5" />
                </Button>
              </div>

              {/* Lyrics Placeholder */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-white/50 mb-2">
                  <Mic2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Lyrics</span>
                </div>
                <p className="text-white/30 text-center text-sm">
                  Lyrics not available
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

