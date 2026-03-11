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
    <div className="relative h-full w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-14 px-4 md:px-0 bg-[#0a0a0a]">
      {/* Video Container - Minimalist TikTok Style */}
      <div className={`relative h-full w-full max-w-[480px] md:h-full md:aspect-[9/16] overflow-hidden bg-black rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-500 ease-out ${showComments ? 'md:translate-x-[-18%] scale-[0.98]' : ''}`}>
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
            <motion.div whileTap={{ scale: 0.9 }} className="relative mb-2 flex justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-xl">
                <img src={reel.author.avatar_url} alt={reel.author.username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </motion.div>
 
            {/* Interaction Buttons - Vertically Centered */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                <Heart className={`w-6 h-6 transition-colors ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{formatCount(likes)}</span>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)} className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{formatCount(reel.stats.comment_count)}</span>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? "text-yellow-400 fill-yellow-400" : ""}`} />
              </div>
            </motion.button>
 
            <motion.button whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{formatCount(reel.stats.share_count)}</span>
            </motion.button>
 
            {/* Rotating music disc - perfectly aligned bottom pillar */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-11 h-11 mt-2 p-1 bg-zinc-900 rounded-full border-[3px] border-white/20 shadow-2xl relative flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                <img src={reel.author.avatar_url} alt="music" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-900 rounded-full border border-white/20" />
            </motion.div>
          </div>
        </div>

        {/* Info Overlay (Common) */}
        <div className="absolute bottom-28 left-4 right-16 z-10 pointer-events-none md:bottom-8 md:left-6">
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

      {/* Desktop Interaction & Navigation Cluster */}
      <div className="hidden md:flex items-center gap-6 self-center mb-12">
        {/* Interaction Buttons Column */}
        <div className="flex flex-col items-center gap-5">
          {/* Profile */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative group cursor-pointer mb-1">
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
            className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center transition-all border border-white/10 shadow-lg ${isLiked ? "text-red-500 border-red-500/30" : "hover:bg-white/20 text-white"}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
          </motion.button>
          <span className="text-sm font-bold text-white/90 drop-shadow-sm">{formatCount(likes)}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setShowComments(!showComments)}
            className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white flex items-center justify-center border border-white/10 shadow-lg ${showComments ? 'bg-white/20 border-white/30' : ''}`}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
          <span className="text-sm font-bold text-white/90">{formatCount(reel.stats.comment_count)}</span>
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
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 shadow-lg"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
          <span className="text-sm font-bold text-white/90">{formatCount(reel.stats.share_count)}</span>
        </div>

        {/* Music Disc - Desktop sidebar premium vinyl style */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 p-1.5 bg-zinc-900 rounded-full border-4 border-white/10 shadow-2xl relative cursor-pointer group"
          >
            <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-white/20 transition-colors" />
            <img src={reel.author.avatar_url} alt="music" className="w-full h-full rounded-full object-cover relative z-10" />            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-900 rounded-full border border-white/20 z-20" />
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows Column (to the right of interactions) */}
      <div className="hidden md:flex flex-col gap-3 self-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          onClick={onPrev}
          disabled={currentIndex !== undefined && currentIndex <= 0}
          className={`w-11 h-11 rounded-full bg-white/5 flex items-center justify-center transition-colors border border-white/10 ${currentIndex !== undefined && currentIndex <= 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-white shadow-xl'}`}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          onClick={onNext}
          disabled={currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1}
          className={`w-11 h-11 rounded-full bg-white/5 flex items-center justify-center transition-colors border border-white/10 ${currentIndex !== undefined && reelsLength !== undefined && currentIndex >= reelsLength - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-white shadow-xl'}`}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </div>
    </div>



      {/* Mobile Comment Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-x-0 bottom-0 h-[70vh] bg-zinc-900/95 backdrop-blur-xl rounded-t-[40px] z-[100] border-t border-white/10 flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4" onClick={() => setShowComments(false)} />
            <div className="px-6 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Comments</h3>
                <span className="text-white/40 text-sm">{formatCount(reel.stats.comment_count)}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pb-20 custom-scrollbar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <img src={`https://picsum.photos/seed/${i+50}/100/100`} alt="user" className="w-10 h-10 rounded-full object-cover bg-white/5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white/50">user_mobile_{i}</span>
                        <span className="text-[10px] text-white/20">1h</span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">This look is so premium now! Love the frame roundness 🤙🏽</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <input type="text" placeholder="Add comment..." className="bg-transparent flex-1 text-sm outline-none" />
                  <button className="text-secondary font-bold text-sm">Post</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Comment Panel (Desktop Only) - Anchored to Right Edge */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="hidden md:flex absolute right-0 w-[420px] h-full bg-black/80 backdrop-blur-3xl border-l border-white/10 shadow-3xl flex-col p-8 z-20 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Comments</h3>
                <span className="text-white/30 text-sm font-medium">{reel.stats.comment_count}</span>
              </div>
              <button 
                onClick={() => setShowComments(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors group"
              >
                <X className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 overflow-hidden border border-white/5">
                    <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="user" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white/90">user_premium_{i}</span>
                      <span className="text-xs text-white/20">2d ago</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed mb-3">This exact layout matches the premium TikTok experience 🤙🏽 minimalist and clean.</p>
                    <div className="flex items-center gap-6">
                      <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">Reply</button>
                      <div className="flex items-center gap-1.5 text-white/30">
                        <Heart className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{10 + i * 5}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 focus-within:border-white/20 transition-all">
                <img src={reel.author.avatar_url} className="w-8 h-8 rounded-full border border-white/10" />
                <input 
                  type="text" 
                  placeholder="Add comment..." 
                  className="bg-transparent flex-1 text-sm outline-none placeholder:text-white/20"
                />
                <button className="text-secondary font-bold text-sm px-2">Post</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
