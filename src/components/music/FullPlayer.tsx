import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Play, SkipBack, SkipForward, Repeat, Shuffle, Heart, Share2, ListMusic, Mic2, Info, User, Music, Plus, Download, Mic, Check, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { MediaControls } from "@/components/media/MediaControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { followArtist, unfollowArtist, checkArtistFollow } from "@/services/api";

interface FullPlayerProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FullPlayer = ({ isOpen, onClose, open, onOpenChange }: FullPlayerProps) => {
  const { currentTrack, cacheTrack, isTrackCached, toggleLike, isLiked: checkLiked } = useMediaPlayer();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics'>('art');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  // Handle both prop patterns (isOpen/onClose from your version, open/onOpenChange from Zach's)
  const isOpenActual = isOpen !== undefined ? isOpen : open;
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const liked = currentTrack ? checkLiked(currentTrack.id) : false;

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
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleLike = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
      toast.success(liked ? "Removed from liked songs" : "Added to liked songs");
    }
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    
    const shareData = {
      title: currentTrack.title,
      text: `Check out "${currentTrack.title}" by ${currentTrack.artist} on Clockit!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (error) {
        navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
        toast.success("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToPlaylist = () => {
    toast.info("Playlist selection coming soon!");
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

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {(isOpenActual) && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-gradient-to-b from-cocoa-900 to-cocoa-950 flex flex-col overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 pt-12 z-10">
            <button onClick={handleClose} className="text-cream-100/60 hover:text-white transition-colors">
              <ChevronDown size={28} />
            </button>
            <div className="text-center">
              <span className="text-xs font-medium text-clay-400 uppercase tracking-widest">Now Playing</span>
              <p className="text-xs text-cream-100/40">From "{currentTrack.album || 'Made in Lagos'}"</p>
            </div>
            <button className="text-cream-100/60 hover:text-white transition-colors">
              <ListMusic size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 flex flex-col items-center px-8 overflow-y-auto z-10">
            {activeTab === 'art' ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full aspect-square max-w-sm relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 mb-8"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                <img 
                  src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Inner Glow */}
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
              </motion.div>
            ) : (
              <ScrollArea className="w-full h-96 mb-8">
                <div className="text-center space-y-6 py-4">
                  <p className="text-cream-100/40 text-lg">Yeah, yeah, yeah</p>
                  <p className="text-white text-2xl font-medium">You don't need no other body</p>
                  <p className="text-white text-2xl font-medium">You don't need no other body</p>
                  <p className="text-cream-100/40 text-lg">Only you fi hold my body</p>
                  <p className="text-cream-100/40 text-lg">Only you fi hold my body</p>
                  <p className="text-cream-100/40 text-lg">You don't need no other body</p>
                </div>
              </ScrollArea>
            )}

            {/* Track Info */}
            <div className="w-full max-w-sm flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{currentTrack.title}</h2>
                <p className="text-lg text-clay-400">{currentTrack.artist}</p>
              </div>
              <button onClick={handleLike} className="text-pink-500">
                <Heart size={28} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Progress */}
            <div className="w-full max-w-sm mb-4">
              <div className="h-1 bg-white/10 rounded-full mb-2 relative group cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-clay-500 rounded-full" />
                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex justify-between text-xs text-cream-100/40 font-mono">
                <span>1:15</span>
                <span>{currentTrack.duration || '4:08'}</span>
              </div>
            </div>

            {/* Media Controls */}
            <div className="w-full max-w-sm mb-8">
              <MediaControls showDeviceControls />
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-6 mb-8">
              <button 
                onClick={() => setActiveTab('lyrics')}
                className={cn(
                  "p-3 rounded-full transition-colors",
                  activeTab === 'lyrics' ? "bg-white/10 text-clay-400" : "text-cream-100/40 hover:text-white"
                )}
              >
                <Mic2 size={20} />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 rounded-full text-cream-100/40 hover:text-white transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={handleAddToPlaylist}
                className="p-3 rounded-full text-cream-100/40 hover:text-white transition-colors"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={handleDownload}
                className={cn(
                  "p-3 rounded-full transition-colors",
                  isTrackCached(currentTrack.id) ? "bg-green-500/20 text-green-400" : "text-cream-100/40 hover:text-white"
                )}
              >
                <Download size={20} />
              </button>
            </div>

            {/* Artist Info */}
            <div className="w-full max-w-sm glass-card-modern p-4 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.artist}`}
                  alt={currentTrack.artist}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-base">{currentTrack.artist}</h4>
                    <button
                      onClick={handleFollowToggle}
                      disabled={isFollowingLoading}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isFollowing
                          ? 'bg-white/10 text-clay-400 hover:bg-white/20'
                          : 'bg-clay-500 text-white hover:bg-clay-600'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-cream-100/60 text-xs">
                    Electronic music producer known for blending synthwave aesthetics with modern production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};