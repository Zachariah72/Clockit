import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, MessageCircle, Share2, Music2, Plus, Bookmark, Volume2, VolumeX, Filter, CloudOff, Play, ChevronUp, ChevronDown, Upload, ArrowLeft, X } from "lucide-react";
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
  const [showComments, setShowComments] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'recommended'>('comments');
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
    <div className="relative h-full w-full flex flex-col md:flex-row items-stretch justify-center bg-[#0a0a0a] overflow-hidden">
      {/* LEFT COLUMN: Anchored Comments (Desktop Only) */}
      <div className="hidden md:flex flex-col w-[350px] border-r border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">Comments</h3>
          <p className="text-xs text-white/30">{formatCount(reel.stats.comment_count)} thoughts</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 scale-95 origin-left">
              <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-white/90 mb-0.5">user_{i}</p>
                <p className="text-[11px] text-white/60 leading-relaxed">This layout is so much better anchored to the side! 🤙🏽</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: Video Player */}
      <div className="flex-1 flex items-center justify-center relative bg-black/20 px-4 md:px-12">
        {/* Video Container - Minimalist TikTok Style */}
        <div className="relative h-full w-full max-w-[480px] md:h-full md:aspect-[9/16] overflow-hidden bg-black rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 shrink-0">
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
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile ONLY Actions Overlay - Precision Aligned Interaction Pillar */}
        <div className="absolute inset-0 z-10 pointer-events-none md:hidden pt-20">
          <div className="absolute right-2 bottom-36 flex flex-col items-center gap-5 pointer-events-auto w-16">
            {/* Profile Pillar */}
            <motion.div whileTap={{ scale: 0.9 }} className="relative mb-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-xl">
                <img src={reel.author.avatar_url} alt={reel.author.username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </motion.div>
 
            {/* Interaction Buttons - Vertically Centered */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center w-full">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
                <Heart className={`w-6 h-6 transition-colors ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(likes)}</span>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)} className="flex flex-col items-center w-full">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(reel.stats.comment_count)}</span>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center w-full">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
                <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? "text-yellow-400 fill-yellow-400" : ""}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 w-full text-center drop-shadow-lg opacity-0">0</span>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} className="flex flex-col items-center w-full">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(reel.stats.share_count)}</span>
            </motion.button>
 
            {/* Rotating music disc - perfectly aligned bottom pillar */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-11 h-11 mt-1 p-1 bg-zinc-900 rounded-full border-[3px] border-white/20 shadow-2xl relative flex items-center justify-center shrink-0"
            >
              <img src={reel.author.avatar_url} alt="music" className="w-full h-full rounded-full object-cover" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-900 rounded-full border border-white/20" />
            </motion.div>
          </div>
        </div>

        {/* Info Overlay (Common) */}
        <div className="absolute bottom-28 left-4 right-16 z-10 pointer-events-none md:bottom-12 md:left-8">
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

        {/* Desktop Controls (Interaction Pillar & Navigation) - FLANKING THE VIDEO */}
        <div className="hidden md:flex flex-col items-center gap-6 absolute right-[-85px] bottom-12 z-10">
          <div className="flex flex-col items-center gap-5">
            <motion.button whileHover={{ scale: 1.1 }} onClick={handleLike} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center">
                <Heart className={`w-6 h-6 ${isLiked ? "text-red-500 fill-red-500" : "text-white/60 group-hover:text-white"}`} />
              </div>
              <span className="text-xs font-bold text-white/40">{formatCount(likes)}</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white/60 group-hover:text-white" />
              </div>
              <span className="text-xs font-bold text-white/40">{formatCount(reel.stats.comment_count)}</span>
            </motion.button>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={onPrev} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronUp className="w-6 h-6 text-white/40" />
            </button>
            <button onClick={onNext} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronDown className="w-6 h-6 text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Recommendations (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-[350px] border-l border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">You may like</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 custom-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-white/5 overflow-hidden relative group cursor-pointer transition-all hover:scale-105 border border-white/5">
              <img src={`https://picsum.photos/seed/rec_${i}/400/600`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-white line-clamp-1 mb-1">Blaze Premium</p>
                <div className="flex items-center gap-1 text-[8px] text-white/60">
                  <Play className="w-2 h-2 fill-white/60" />
                  {formatCount(Math.floor(Math.random() * 50000))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



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
        {/* Reels Container - Absolute 3-Column Width */}
        <div className="h-full w-full md:h-full relative flex items-center justify-center">
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

        {/* Swipe Hints - strictly mobile */}
        <AnimatePresence>
          {currentIndex === 0 && !showOfflineMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="md:hidden absolute bottom-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
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
