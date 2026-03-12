import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, PanInfo } from "framer-motion";
import { Heart, MessageCircle, Share2, Music2, Plus, Bookmark, CloudOff, Play, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";

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

const ReelCard = ({
  reel,
  isActive,
  onNext,
  onPrev,
}: {
  reel: Reel;
  isActive: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  reelsLength?: number;
  globalMuted: boolean;
  setGlobalMuted: (muted: boolean) => void;
}) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [likes, setLikes] = useState(reel.stats.like_count);
  const [showHeart, setShowHeart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log("Auto-play blocked");
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
      videoRef.current.muted = globalMuted;
    }
  }, [globalMuted]);

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
        console.log("Play still blocked:", err);
      }
    }
  };

  return (
    <div className="relative h-full w-full flex items-stretch justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Container that handles the layout */}
      <div className="flex-1 w-full h-full flex flex-col items-center justify-start relative bg-black md:px-12 overflow-hidden">
        
        {/* Main Video Wrapper (no overflow-hidden strictly so action column can overflow on desktop) */}
        <motion.div 
          animate={{ height: showComments ? "50%" : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full md:max-w-[380px] lg:max-w-[420px] md:aspect-[9/16] shrink-0 md:my-auto"
        >

          {/* Inner Video Container WITH overflow-hidden for cutting video corners */}
          <div className="absolute inset-0 w-full h-full md:rounded-xl overflow-hidden md:border md:border-white/10 md:bg-black md:shadow-[0_0_80px_rgba(0,0,0,0.8)]">

          {/* Video */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={reel.video_url}
            poster={reel.thumbnail_url}
            playsInline
            muted
            onDoubleClick={handleDoubleTap}
            onClick={handlePlay}
            onEnded={onNext}
          />

          {/* Play Button Overlay */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 pointer-events-none"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
                onClick={handlePlay}
              >
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </motion.div>
            </motion.button>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

          {/* Double Tap Heart */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-24 h-24 md:w-32 md:h-32 text-red-500 fill-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Overlay */}
          <div className="absolute bottom-6 left-4 right-16 z-10 pointer-events-none md:bottom-8 md:right-8 md:left-6">
            <div className="pointer-events-auto max-w-[85%] md:max-w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-white drop-shadow-md">@{reel.author.username}</span>
              </div>
              <p className="text-sm text-white/90 mb-3 line-clamp-2 drop-shadow-sm">{reel.title}</p>
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-white" />
                <div className="overflow-hidden">
                  <motion.p
                    animate={isActive ? { x: [0, -100, 0] } : { x: 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="text-xs text-white whitespace-nowrap"
                  >
                    {reel.music.title} • {reel.music.author}
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
          
          </div> {/* End Inner Video Container */}

          {/* ─── Action Column (bottom-right mobile, outside-right desktop) ─── */}
          <div className="absolute right-2 bottom-[90px] md:-right-20 md:bottom-4 flex flex-col items-center gap-4 z-20 pointer-events-auto w-14 md:w-16">

            {/* Author avatar + follow */}
            <motion.div whileTap={{ scale: 0.9 }} className="relative mb-2 flex flex-col items-center">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/20 md:border-none overflow-hidden shadow-xl bg-zinc-800">
                <img src={reel.author.avatar_url} alt={reel.author.username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </motion.div>

            {/* Like */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center w-full group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-zinc-800 hover:bg-black/60 md:hover:bg-zinc-700 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 md:border-none transition-colors">
                <Heart className={`w-6 h-6 md:w-6 md:h-6 transition-colors ${isLiked ? "text-red-500 fill-red-500" : "group-hover:text-red-400"}`} />
              </div>
              <span className="text-xs font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(likes)}</span>
            </motion.button>

            {/* Comment */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(!showComments)} className="flex flex-col items-center w-full group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-zinc-800 hover:bg-black/60 md:hover:bg-zinc-700 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 md:border-none transition-colors">
                <MessageCircle className="w-6 h-6 md:w-6 md:h-6 group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="text-xs font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(reel.stats.comment_count)}</span>
            </motion.button>

            {/* Save */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center w-full group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-zinc-800 hover:bg-black/60 md:hover:bg-zinc-700 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 md:border-none transition-colors">
                <Bookmark className={`w-6 h-6 md:w-6 md:h-6 transition-colors ${isSaved ? "text-yellow-400 fill-yellow-400" : "group-hover:text-yellow-300"}`} />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-white mt-1 opacity-0">0</span>
            </motion.button>

            {/* Share */}
            <motion.button whileTap={{ scale: 0.8 }} className="flex flex-col items-center w-full group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-zinc-800 hover:bg-black/60 md:hover:bg-zinc-700 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 md:border-none transition-colors">
                <Share2 className="w-6 h-6 md:w-6 md:h-6 group-hover:text-green-400 transition-colors" />
              </div>
              <span className="text-xs font-bold text-white mt-1 w-full text-center drop-shadow-lg">{formatCount(reel.stats.share_count)}</span>
            </motion.button>

            {/* Volume toggle (Mobile Only, or integrated) */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setGlobalMuted(!globalMuted)} className="md:hidden flex flex-col items-center w-full group">
              <div className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 transition-colors">
                {globalMuted
                  ? <VolumeX className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  : <Volume2 className="w-5 h-5 text-white group-hover:text-white transition-colors" />}
              </div>
            </motion.button>
            
            {/* Desktop Volume toggle (Floating inside the video frame, moved in TikTok, but we can put it above action column) */}
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setGlobalMuted(!globalMuted)} className="hidden md:flex absolute -right-4 -top-16 flex-col items-center group">
              <div className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700 backdrop-blur flex items-center justify-center text-white transition-colors">
                {globalMuted
                  ? <VolumeX className="w-5 h-5 text-white/90" />
                  : <Volume2 className="w-5 h-5 text-white/90" />}
              </div>
            </motion.button>

            {/* Spinning disc — mobile only */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="md:hidden w-10 h-10 mt-1 p-1 bg-zinc-900 rounded-full border-[3px] border-white/20 shadow-2xl relative flex items-center justify-center shrink-0"
            >
              <img src={reel.author.avatar_url} alt="music" className="w-full h-full rounded-full object-cover" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rounded-full border border-white/20" />
            </motion.div>
          </div>

        </motion.div>

        {/* Comments Overlay */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[50%] bg-[#121212] z-40 rounded-t-2xl md:max-w-[480px] md:mx-auto border-t border-white/10 flex flex-col shadow-2xl"
            >
              {/* Comment Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <h3 className="text-white font-bold text-sm">
                  {formatCount(reel.stats.comment_count)} Comments
                </h3>
                <button 
                  onClick={() => setShowComments(false)}
                  className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Comment List (Mock Data) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <span className="text-white/60 text-xs font-semibold block mb-1">@user_name_{i}</span>
                       <p className="text-white/90 text-sm">This is an amazing blaze! 🔥 Keep it up. Really love the content here.</p>
                       <div className="flex items-center gap-4 mt-2">
                         <span className="text-white/40 text-[10px]">2h ago</span>
                         <button className="text-white/40 text-[10px] font-semibold hover:text-white transition-colors">Reply</button>
                       </div>
                     </div>
                     <button className="flex flex-col items-center text-white/40 hover:text-red-500 transition-colors pt-2 shrink-0">
                       <Heart className="w-4 h-4" />
                       <span className="text-[10px] mt-1">{i * 12}</span>
                     </button>
                   </div>
                 ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-[#121212] shrink-0 pb-8 sm:pb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?img=5`} alt="me" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary/50"
                />
                <button className="text-primary font-bold text-sm px-2 hover:text-primary/80 transition-colors">Post</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};


const Reels = () => {
  console.log("Reels component mounted");
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://your-backend.onrender.com";
        const response = await fetch(`${apiUrl}/tiktok/trending`);
        const data = await response.json();
        if (data.videos) {
          setReels(data.videos);
        }
      } catch (error) {
        console.error("Failed to fetch reels:", error);
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
      <Layout hidePlayer hideRightPanel>
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
      <Layout hidePlayer hideRightPanel>
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
      <div className="h-[100dvh] w-full relative overflow-hidden bg-black flex justify-center items-center">
        <div className="h-full w-full relative flex items-center justify-center">
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
                  onNext={() => currentIndex < reels.length - 1 && setCurrentIndex((prev) => prev + 1)}
                  onPrev={() => currentIndex > 0 && setCurrentIndex((prev) => prev - 1)}
                  currentIndex={currentIndex}
                  reelsLength={reels.length}
                  globalMuted={globalMuted}
                  setGlobalMuted={setGlobalMuted}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Desktop floating Up/Down Controls */}
        <div className="hidden md:flex absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentIndex === 0 ? 'bg-zinc-800/50 text-white/30 cursor-not-allowed' : 'bg-[#2f2f2f] text-white hover:bg-zinc-700'}`}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={() => currentIndex < reels.length - 1 && setCurrentIndex(prev => prev + 1)}
            disabled={currentIndex === reels.length - 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentIndex === reels.length - 1 ? 'bg-zinc-800/50 text-white/30 cursor-not-allowed' : 'bg-[#2f2f2f] text-white hover:bg-zinc-700'}`}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Swipe Hint — mobile only */}
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
      </div>
    </Layout>
  );
};

export default Reels;
