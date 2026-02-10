import { useState } from "react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { MediaControls } from "@/components/media/MediaControls";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, User, Share2, Music, Heart, Plus, Download, Play, Mic } from "lucide-react";
import { toast } from "sonner";

interface FullPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FullPlayer = ({ open, onOpenChange }: FullPlayerProps) => {
  const { currentTrack, cacheTrack, isTrackCached } = useMediaPlayer();
  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from liked songs" : "Added to liked songs");
  };

  const handleShare = async () => {
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
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
        toast.success("Link copied to clipboard!");
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} ${shareData.url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToPlaylist = () => {
    toast.info("Playlist selection coming soon!");
    // TODO: Open playlist selection modal
  };

  const handleDownload = () => {
    if (isTrackCached(currentTrack.id)) {
      toast.info("Track already downloaded for offline listening!");
    } else {
      cacheTrack(currentTrack.id);
      toast.success("Track downloaded for offline listening!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85dvh] sm:h-[90vh] rounded-t-3xl overflow-hidden w-full max-w-full">
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

        <div className="relative flex flex-col h-full z-10">
          {/* Fixed Header */}
          <div className="flex-shrink-0">
            <SheetHeader className="text-left mb-4 sm:mb-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <SheetTitle className="text-2xl sm:text-3xl font-bold text-gradient">Now Playing</SheetTitle>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8">
              {/* Album Art with Enhanced Styling */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                  <img
                    src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
                    alt={currentTrack.title}
                    className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl sm:rounded-3xl object-cover shadow-2xl border border-white/20"
                  />
                  {/* Inner Glow */}
                  <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
                </div>
              </div>

              {/* Track Info with Better Typography */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">{currentTrack.title}</h2>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-1 sm:mb-2">{currentTrack.artist}</p>
                <p className="text-xs sm:text-sm text-muted-foreground/70">Album • 2024</p>
              </div>

              {/* Media Controls with Enhanced Styling */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <MediaControls showDeviceControls />
              </div>

              {/* Song Details */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  Song Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-sm sm:text-base">{currentTrack.duration || '3:42'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Genre</p>
                      <p className="font-medium text-sm sm:text-base">Electronic/EDM</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Released</p>
                      <p className="font-medium text-sm sm:text-base">2024</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Album</p>
                      <p className="font-medium text-sm sm:text-base">Neon Dreams</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Label</p>
                      <p className="font-medium text-sm sm:text-base">Synthwave Records</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">BPM</p>
                      <p className="font-medium text-sm sm:text-base">128</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artist Info */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  About the Artist
                </h3>
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.artist}`}
                    alt={currentTrack.artist}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{currentTrack.artist}</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      Midnight Wave is an electronic music producer known for blending synthwave aesthetics with modern electronic production techniques. Their music explores themes of nostalgia, technology, and urban life.
                    </p>
                    <div className="flex gap-3 sm:gap-4 mt-2 sm:mt-3">
                      <span className="text-xs sm:text-sm text-muted-foreground">2.1M followers</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">•</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">156 tracks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Actions */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  Connect & Share
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="font-medium text-sm sm:text-base">Share</span>
                  </button>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-colors ${
                      isLiked
                        ? 'bg-red-500/20 hover:bg-red-500/30'
                        : 'bg-red-500/10 hover:bg-red-500/20'
                    }`}
                  >
                    <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />
                    <span className="font-medium text-sm sm:text-base">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="font-medium text-sm sm:text-base">Add to Playlist</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-colors ${
                      isTrackCached(currentTrack.id)
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-600'
                        : 'bg-green-500/10 hover:bg-green-500/20'
                    }`}
                  >
                    <Download className={`w-3 h-3 sm:w-4 sm:h-4 ${isTrackCached(currentTrack.id) ? 'text-green-600' : 'text-green-500'}`} />
                    <span className="font-medium text-sm sm:text-base">
                      {isTrackCached(currentTrack.id) ? 'Downloaded' : 'Download'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Related Songs */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  More from {currentTrack.artist}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    { title: "Neon Nights", duration: "3:55" },
                    { title: "Digital Dreams", duration: "4:12" },
                    { title: "Cyber City", duration: "3:28" },
                  ].map((song, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                        <Music className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{song.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{song.duration}</p>
                      </div>
                      <button className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                        <Play className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lyrics Section with Modern Design */}
              <div className="glass-card-modern p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  Lyrics
                </h3>
                <div className="text-center text-muted-foreground space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Music className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-medium">Lyrics not available for this track</p>
                    <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-75">We're working on adding lyrics for all songs!</p>
                  </div>
                  <div className="flex justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};