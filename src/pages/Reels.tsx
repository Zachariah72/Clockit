import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, MessageCircle, Share2, Music2, Plus, Bookmark, Volume2, VolumeX, Filter, CloudOff, Play, ChevronUp, ChevronDown, Upload, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// Simplified Reels view

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
    <div className="relative h-full w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
      {/* Video Container */}
      <div className="relative h-full w-full max-w-[500px] md:h-full md:aspect-[9/16] overflow-hidden bg-black md:rounded-[32px] shadow-[0_0_40px_rgba(0,0,0,0.5)] md:border md:border-white/10">
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
        
        {/* Play Button Overlay */}
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
        
        {/* Overlay gradient - more aggressive at bottom/right for visibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none md:to-black/40" />

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

        {/* Mobile ONLY Actions Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none md:hidden">
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 pointer-events-auto">
            {/* Mobile actions remain as they were */}
            <motion.div whileTap={{ scale: 0.9 }} className="relative">
              <img src={reel.author.avatar_url} alt={reel.author.username} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </motion.div>

            <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white">
                <Heart className={`w-7 h-7 ${isLiked ? "text-secondary fill-secondary" : ""}`} />
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(likes)}</span>
            </motion.button>

            <motion.button whileTap={{ scale: 0.8 }} className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-full text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(reel.stats.comment_count)}</span>
            </motion.button>

            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center gap-1">
              <div className={`p-2 rounded-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${isSaved ? "text-accent" : "text-white"}`}>
                <Bookmark className={`w-7 h-7 ${isSaved ? "fill-accent" : ""}`} />
              </div>
            </motion.button>

            <motion.button whileTap={{ scale: 0.8 }} className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-full text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <Share2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(reel.stats.share_count)}</span>
            </motion.button>
          </div>
        </div>

        {/* Info Overlay (Common) */}
        <div className="absolute bottom-24 left-4 right-16 z-10 pointer-events-none md:bottom-8 md:left-6">
          <div className="pointer-events-auto max-w-[85%]">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-white drop-shadow-md">@{reel.author.username}</span>
            </div>
            <p className="text-sm text-white/90 mb-3 line-clamp-2 drop-shadow-sm">{reel.title}</p>
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-white" />
              <div className="overflow-hidden">
                <motion.p
                  animate={{ x: isActive ? [0, -100, 0] : 0 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="text-xs text-white whitespace-nowrap"
                >
                  {reel.music.title} • {reel.music.author}
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Interaction Panel */}
      <div className="hidden md:flex flex-col items-center gap-6 self-end pb-8">
        {/* Profile */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative group cursor-pointer mb-2">
          <img
            src={reel.author.avatar_url}
            alt={reel.author.username}
            className="w-14 h-14 rounded-full border-2 border-white/10 group-hover:border-primary transition-colors object-cover"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-black">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all border border-white/5 ${isLiked ? "text-secondary border-secondary/20" : "hover:bg-white/20 text-white"}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? "fill-secondary" : ""}`} />
          </motion.button>
          <span className="text-sm font-bold text-white/80 drop-shadow-sm">{formatCount(likes)}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
          <span className="text-sm font-bold text-white/80">{formatCount(reel.stats.comment_count)}</span>
        </div>

        {/* Save */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setIsSaved(!isSaved)}
            className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-colors ${isSaved ? "text-accent" : "hover:bg-white/20 text-white"}`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-accent" : ""}`} />
          </motion.button>
          <span className="text-sm font-bold text-white/80">{formatCount(reel.stats.play_count)}</span> {/* Using play_count as proxy for saves if data missing */}
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
          <span className="text-sm font-bold text-white/80">{formatCount(reel.stats.share_count)}</span>
        </div>

        {/* Navigation Arrows */}
        <div className="mt-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={onNext}
            disabled={currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1}
            className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-colors ${currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/20 text-white'}`}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={onPrev}
            disabled={currentIndex !== undefined && currentIndex <= 0}
            className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-colors ${currentIndex !== undefined && currentIndex <= 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/20 text-white'}`}
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
        const response = await fetch(`${apiUrl}/tiktok/trending`);
        const data = await response.json();
        if (data.videos) {
          setReels(data.videos);
        }
      } catch (error) {
        console.error('Failed to fetch reels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const verticalThreshold = 30;
    const horizontalThreshold = 60;

    if (Math.abs(info.offset.x) > horizontalThreshold && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x < -horizontalThreshold) {
        setShowOfflineMode(true);
      }
      return;
    }

    if (info.offset.y < -verticalThreshold && currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.y > verticalThreshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <Layout hidePlayer>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80 font-medium tracking-wide">Syncing Blazes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (reels.length === 0) {
    return (
      <Layout hidePlayer>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-black text-center p-8">
          <div>
            <CloudOff className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No blazes found in this dimension.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hidePlayer hideRightPanel>
      <div className="h-[calc(100vh-80px)] md:h-screen relative overflow-hidden bg-black flex justify-center items-center">
        {/* Reels Container - Wider on desktop to fit side bar */}
        <div className="h-full w-full md:h-[85vh] md:max-w-[700px] relative flex items-center justify-center px-4 md:px-0">
          <motion.div
            ref={containerRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="h-full w-full cursor-grab active:cursor-grabbing touch-none relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
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
        </div>

        {/* Swipe Hints */}
        <AnimatePresence>
          {currentIndex === 0 && !showOfflineMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none md:bottom-12"
            >
              <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/60 flex items-center gap-2">
                <ChevronUp className="w-3 h-3 animate-bounce" />
                Swipe up for more
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal handled elsewhere or removed if not needed */}
      </div>
    </Layout>
  );
};

export default Reels;
