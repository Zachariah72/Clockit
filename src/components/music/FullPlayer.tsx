import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  Heart, Share2, ListMusic, Mic2, Plus, Download, Check,
  UserPlus, UserCheck, Speaker, Airplay, Ellipsis
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MediaControls } from "@/components/media/MediaControls";
import { toast } from "sonner";
import { followArtist, unfollowArtist, checkArtistFollow } from "@/services/api";

interface FullPlayerProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FullPlayer = ({ isOpen, onClose, open, onOpenChange }: FullPlayerProps) => {
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
    isLiked: checkLiked,
    playbackRate,
    setPlaybackRate,
    completedLessons,
    toggleLessonComplete,
    cacheTrack,
    isTrackCached
  } = useMediaPlayer();

  const [activeTab, setActiveTab] = useState<'art' | 'lyrics'>('art');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  // Handle both prop patterns
  const isOpenActual = isOpen !== undefined ? isOpen : open;
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const liked = currentTrack ? checkLiked(currentTrack.id) : false;
  const isCompleted = currentTrack ? completedLessons.includes(currentTrack.id) : false;

  // Check if following artist when track changes
  useEffect(() => {
    if (!currentTrack?.artist) return;

    const checkFollow = async () => {
      try {
        const artistId = encodeURIComponent(currentTrack.artist);
        const result = await checkArtistFollow(artistId);
        setIsFollowing(result.isFollowing);
      } catch (error) {
        setIsFollowing(false);
      }
    };

    checkFollow();
  }, [currentTrack?.artist]);

  const handleFollowToggle = async () => {
    if (!currentTrack?.artist || isFollowingLoading) return;

    setIsFollowingLoading(true);
    try {
      const artistId = encodeURIComponent(currentTrack.artist);
      const artistImage = currentTrack.artwork || '';

      if (isFollowing) {
        await unfollowArtist(artistId);
        setIsFollowing(false);
        toast.success(`Unfollowed ${currentTrack.artist}`);
      } else {
        await followArtist(artistId, currentTrack.artist, artistImage);
        setIsFollowing(true);
        toast.success(`Following ${currentTrack.artist}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to update follow status';
      toast.error(errMsg);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
      toast.success(liked ? "Removed from liked songs" : "Added to liked songs");
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (!currentTrack) return;

    const shareData = {
      title: currentTrack.title,
      text: `Check out "${currentTrack.title}" by ${currentTrack.artist} on Clockit!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  const handleDownload = () => {
    if (!currentTrack) return;

    if (isTrackCached(currentTrack.id)) {
      toast.info("Track already downloaded for offline listening!");
    } else {
      cacheTrack(currentTrack.id);
      toast.success("Track downloaded for offline listening!");
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    toast.info(`Playback speed: ${nextRate}x`);
  };

  const handleToggleComplete = () => {
    if (currentTrack) {
      toggleLessonComplete(currentTrack.id);
      toast.success(isCompleted ? "Lesson marked as incomplete" : "Lesson marked as complete!");
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat className="w-5 h-5 text-primary" />;
      case 'all':
        return <Repeat className="w-5 h-5 text-primary" />;
      default:
        return <Repeat className="w-5 h-5 opacity-40" />;
    }
  };

  if (!currentTrack) return null;

  return (
    <Sheet open={isOpenActual} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] rounded-t-[40px] overflow-hidden p-0 bg-black border-none">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.3)',
          }}
        />

        {/* Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative flex flex-col h-full z-10">
          {/* Header */}
          <div className="flex-shrink-0 pt-6 px-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
                <ChevronDown size={28} />
              </button>
              <div className="text-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Now Playing</span>
                <p className="text-xs text-white/60 font-medium truncate max-w-[200px]">
                  {currentTrack.album || 'Clockit Originals'}
                </p>
              </div>
              <button className="text-white/60 hover:text-white transition-colors">
                <ListMusic size={24} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="px-8 pb-12 flex flex-col items-center">

              {/* Tabs Toggle */}
              <div className="flex bg-white/5 rounded-full p-1 mb-8">
                <button
                  onClick={() => setActiveTab('art')}
                  className={cn(
                    "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === 'art' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Artwork
                </button>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  className={cn(
                    "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === 'lyrics' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Lyrics
                </button>
              </div>

              {activeTab === 'art' ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full aspect-square max-w-[320px] relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10"
                >
                  <img
                    src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                </motion.div>
              ) : (
                <div className="w-full h-[320px] mb-10 text-center flex flex-col justify-center space-y-6 opacity-80">
                  <p className="text-white/30 text-lg">Lyrics coming soon</p>
                  <p className="text-white text-2xl font-bold leading-relaxed">
                    Enjoy the rhythm of<br />{currentTrack.title}
                  </p>
                  <p className="text-white/30 text-lg">by {currentTrack.artist}</p>
                </div>
              )}

              {/* Track Info & Like */}
              <div className="w-full max-w-sm flex items-start justify-between mb-8">
                <div className="flex-1 pr-6">
                  <h2 className="text-3xl font-black text-white mb-1 leading-tight tracking-tight">
                    {currentTrack.title}
                  </h2>
                  <p className="text-xl text-white/60 font-medium">{currentTrack.artist}</p>
                </div>
                <button
                  onClick={handleLikeToggle}
                  className="mt-2 shrink-0 group"
                >
                  <Heart
                    className={cn(
                      "w-8 h-8 transition-all duration-300 transform group-active:scale-125",
                      liked ? "fill-red-500 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "text-white/40 hover:text-white"
                    )}
                  />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm mb-10">
                <Slider
                  value={[currentTime]}
                  max={currentTrack.duration || 300}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-3 font-bold tracking-widest">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration || 0)}</span>
                </div>
              </div>

              {/* Central Controls */}
              <div className="w-full max-w-sm flex items-center justify-between mb-12">
                <button
                  onClick={toggleShuffle}
                  className={cn("p-2 transition-colors", isShuffled ? "text-primary" : "text-white/30 hover:text-white/50")}
                >
                  <Shuffle size={22} />
                </button>

                <div className="flex items-center gap-8">
                  <button onClick={previous} className="text-white hover:text-primary transition-colors">
                    <SkipBack size={36} fill="white" />
                  </button>
                  <button
                    onClick={isPlaying ? pause : play}
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl"
                  >
                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} className="ml-1" fill="currentColor" />}
                  </button>
                  <button onClick={next} className="text-white hover:text-primary transition-colors">
                    <SkipForward size={36} fill="white" />
                  </button>
                </div>

                <button
                  onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                  className="p-2 transition-colors"
                >
                  {getRepeatIcon()}
                </button>
              </div>

              {/* Utility Row */}
              <div className="w-full max-w-sm flex items-center justify-between px-4 mb-10 text-white/40">
                <button onClick={handleShare} className="hover:text-white transition-colors flex flex-col items-center gap-1">
                  <Share2 size={20} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Share</span>
                </button>
                <button onClick={handleDownload} className={cn("hover:text-white transition-colors flex flex-col items-center gap-1", isTrackCached(currentTrack.id) && "text-primary")}>
                  {isTrackCached(currentTrack.id) ? <Check size={20} /> : <Download size={20} />}
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Offline</span>
                </button>
                <button onClick={cyclePlaybackRate} className="hover:text-white transition-colors flex flex-col items-center gap-1">
                  <div className="w-5 h-5 border border-current rounded flex items-center justify-center text-[8px] font-black">{playbackRate}x</div>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Speed</span>
                </button>
                <button onClick={handleToggleComplete} className={cn("hover:text-white transition-colors flex flex-col items-center gap-1", isCompleted && "text-primary")}>
                  <Check size={20} className={cn(isCompleted && "fill-current")} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Done</span>
                </button>
              </div>

              {/* Artist Card */}
              <div className="w-full max-w-sm bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.artist}`}
                    alt={currentTrack.artist}
                    className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-lg leading-none mb-1">{currentTrack.artist}</h4>
                    <p className="text-white/40 text-xs truncate">Verified Artist on Clockit</p>
                  </div>
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowingLoading}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-black transition-all",
                      isFollowing
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-primary text-white shadow-lg shadow-primary/20"
                    )}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              </div>

              {/* Extra Info Buttons */}
              <div className="flex items-center gap-4 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                <button className="hover:text-white/60">Airplay</button>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                <button className="hover:text-white/60">Audio Settings</button>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                <button className="hover:text-white/60 text-white/60">Report</button>
              </div>

            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
