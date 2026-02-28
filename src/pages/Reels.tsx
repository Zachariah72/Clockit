import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, MessageCircle, Share2, Music2, Plus, Bookmark, Volume2, VolumeX, Filter, CloudOff, Play, ChevronUp, ChevronDown, Upload } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UploadVideoModal } from "@/components/reels/UploadVideoModal";

interface Reel {
  id: string;
  video_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
    follower_count: number;
  };
  stats: {
    play_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
  };
  music: {
    title: string;
    author: string;
    duration: number;
  };
  duration: number;
  create_time: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const ReelCard = ({ reel, isActive, onNext, onPrev, currentIndex, reelsLength }: { reel: Reel; isActive: boolean; onNext?: () => void; onPrev?: () => void; currentIndex?: number; reelsLength?: number }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [likes, setLikes] = useState(reel.stats.like_count);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked
        console.log('Auto-play blocked');
      });
      setIsPlaying(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes((prev) => prev + 1);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Play still blocked:', err);
      }
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={reel.video_url}
        poster={reel.thumbnail_url}
        loop
        playsInline
        muted
        onDoubleClick={handleDoubleTap}
        onClick={handlePlay}
      />
      
      {/* Play Button Overlay (shown when auto-play is blocked) */}
      {!isPlaying && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center z-15 bg-black/20"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center"
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </motion.div>
        </motion.button>
      )}
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 pointer-events-none" />

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-24 h-24 text-secondary fill-secondary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
        {/* Profile */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <img
            src={reel.author.avatar_url}
            alt={reel.author.username}
            className="w-12 h-12 rounded-full border-2 border-primary object-cover"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2 rounded-full ${isLiked ? "text-secondary" : "text-foreground"}`}>
            <Heart className={`w-7 h-7 ${isLiked ? "fill-secondary" : ""}`} />
          </div>
          <span className="text-xs font-semibold text-foreground">{formatCount(likes)}</span>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full text-foreground">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold text-foreground">{formatCount(reel.stats.comment_count)}</span>
        </motion.button>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2 rounded-full ${isSaved ? "text-accent" : "text-foreground"}`}>
            <Bookmark className={`w-7 h-7 ${isSaved ? "fill-accent" : ""}`} />
          </div>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full text-foreground">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold text-foreground">{formatCount(reel.stats.share_count)}</span>
        </motion.button>

        {/* Mute */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full text-foreground">
            {isMuted ? (
              <VolumeX className="w-7 h-7" />
            ) : (
              <Volume2 className="w-7 h-7" />
            )}
          </div>
        </motion.button>

        {/* Music Disc */}
        <motion.div
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-muted"
        >
          <img src={reel.thumbnail_url} alt="music" className="w-full h-full object-cover" />
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onNext}
            disabled={currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1}
            className="flex flex-col items-center gap-1"
          >
            <div className={`p-2 rounded-full ${currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1 ? 'text-muted-foreground/50' : 'text-foreground'}`}>
              <ChevronUp className="w-7 h-7" />
            </div>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onPrev}
            disabled={currentIndex !== undefined && currentIndex <= 0}
            className="flex flex-col items-center gap-1"
          >
            <div className={`p-2 rounded-full ${currentIndex !== undefined && currentIndex <= 0 ? 'text-muted-foreground/50' : 'text-foreground'}`}>
              <ChevronDown className="w-7 h-7" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-24 left-4 right-20 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground">@{reel.author.username}</span>
        </div>
        <p className="text-sm text-foreground/90 mb-3 line-clamp-2">{reel.title}</p>

        {/* Music Info */}
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-foreground" />
          <div className="overflow-hidden">
            <motion.p
              animate={{ x: isActive ? [0, -100, 0] : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-sm text-foreground whitespace-nowrap"
            >
              {reel.music.title} • {reel.music.author}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reels = () => {
  console.log('Reels component mounted');
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragConstraints = { top: 0, bottom: 0 };

  const handleUploadVideo = async (file: File, title: string, description: string) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    const apiUrl = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
    const response = await fetch(`${apiUrl}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    // Refresh reels to include new video
    const reelsResponse = await fetch(`${apiUrl}/videos/feed`);
    const reelsData = await reelsResponse.json();
    if (reelsData.videos) {
      setReels(reelsData.videos);
      setCurrentIndex(0); // Go to the new video
    }
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        console.log('Fetching reels from TikTok API...');
        const apiUrl = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
        const response = await fetch(`${apiUrl}/tiktok/trending`);
        console.log('TikTok API response status:', response.status);
        const data = await response.json();
        console.log('TikTok API response data:', data);
        if (data.videos) {
          console.log('Setting reels data:', data.videos.length, 'videos');
          setReels(data.videos);
        } else {
          console.log('No videos in response');
        }
      } catch (error) {
        console.error('Failed to fetch reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const verticalThreshold = 30; // Lowered from 50 for easier swiping
    const horizontalThreshold = 60;

    // Check for horizontal swipe (left/right) for offline mode
    if (Math.abs(info.offset.x) > horizontalThreshold && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x < -horizontalThreshold) {
        // Swipe left - open offline mode
        setShowOfflineMode(true);
      }
      return;
    }

    // Vertical swipes for reel navigation
    if (info.offset.y < -verticalThreshold && currentIndex < reels.length - 1) {
      // Swipe up - next video
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.y > verticalThreshold && currentIndex > 0) {
      // Swipe down - previous video
      setCurrentIndex((prev) => prev - 1);
    }
  };

  console.log('Reels render - loading:', loading, 'reels length:', reels.length);

  if (loading) {
    console.log('Showing loading state');
    return (
      <Layout hidePlayer>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reels...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (reels.length === 0) {
    console.log('Showing empty state');
    return (
      <Layout hidePlayer>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <CloudOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reels available</p>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Showing reels, currentIndex:', currentIndex, 'reel:', reels[currentIndex]);
  return (
    <Layout hidePlayer>
      <div className="h-[calc(100vh-80px)] relative overflow-hidden">


        {/* Reels Container */}
        <motion.div
          ref={containerRef}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragSnapToOrigin={false}
          onDragEnd={handleDragEnd}
          style={{ y }}
          className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <ReelCard
                reel={reels[currentIndex]}
                isActive={true}
                onNext={() => currentIndex < reels.length - 1 && setCurrentIndex(prev => prev + 1)}
                onPrev={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                currentIndex={currentIndex}
                reelsLength={reels.length}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>


        {/* Swipe Hint */}
        {currentIndex === 0 && !showOfflineMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 text-sm text-muted-foreground z-20"
          >
            Swipe up for more • Swipe left for offline
          </motion.div>
        )}

        {/* Offline Mode Overlay */}
        <AnimatePresence>
          {showOfflineMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-sm z-30 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center p-8 max-w-sm mx-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CloudOff className="w-8 h-8 text-primary drop-shadow-[0_0_12px_hsl(var(--primary))]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Offline Reels</h3>
                <p className="text-muted-foreground mb-6">
                  Watch your downloaded reels without an internet connection
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/offline-reels')}
                    className="w-full gap-2"
                  >
                    <CloudOff className="w-4 h-4" />
                    View Offline Reels
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowOfflineMode(false)}
                    className="w-full"
                  >
                    Continue Watching
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowUploadModal(true)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-primary/80 backdrop-blur-sm"
          title="Upload Video"
        >
          <Upload className="w-5 h-5 text-primary-foreground" />
        </motion.button>

        {/* Upload Modal */}
        <UploadVideoModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadVideo}
        />
      </div>
    </Layout>
  );

};

export default Reels;
