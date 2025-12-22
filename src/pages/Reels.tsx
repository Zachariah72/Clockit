import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, MessageCircle, Share2, Music2, Plus, Bookmark, Volume2, VolumeX, Filter, CloudOff } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

interface Reel {
  id: string;
  username: string;
  avatar: string;
  video: string;
  thumbnail: string;
  caption: string;
  musicTitle: string;
  musicArtist: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
}

const mockReels: Reel[] = [
  {
    id: "1",
    username: "sarah_dance",
    avatar: avatar1,
    video: "",
    thumbnail: album1,
    caption: "Summer vibes only ☀️ #dance #summer #fun",
    musicTitle: "Blinding Lights",
    musicArtist: "The Weeknd",
    likes: 45200,
    comments: 892,
    shares: 234,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    username: "mike_travels",
    avatar: avatar2,
    video: "",
    thumbnail: album2,
    caption: "POV: You found paradise 🌴",
    musicTitle: "Heat Waves",
    musicArtist: "Glass Animals",
    likes: 28900,
    comments: 456,
    shares: 123,
    isLiked: true,
    isSaved: false,
  },
  {
    id: "3",
    username: "alex_fitness",
    avatar: avatar3,
    video: "",
    thumbnail: album3,
    caption: "Morning workout routine 💪 Who's joining?",
    musicTitle: "Levitating",
    musicArtist: "Dua Lipa",
    likes: 67800,
    comments: 1234,
    shares: 567,
    isLiked: false,
    isSaved: true,
  },
];

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const ReelCard = ({ reel, isActive }: { reel: Reel; isActive: boolean }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [isSaved, setIsSaved] = useState(reel.isSaved);
  const [likes, setLikes] = useState(reel.likes);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);

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

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Video/Image Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${reel.thumbnail})` }}
        onDoubleClick={handleDoubleTap}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
      </div>

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
            src={reel.avatar}
            alt={reel.username}
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
          <span className="text-xs font-semibold text-foreground">{formatCount(reel.comments)}</span>
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
          <span className="text-xs font-semibold text-foreground">{formatCount(reel.shares)}</span>
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
          <img src={reel.thumbnail} alt="music" className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-24 left-4 right-20 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-foreground">@{reel.username}</span>
        </div>
        <p className="text-sm text-foreground/90 mb-3 line-clamp-2">{reel.caption}</p>
        
        {/* Music Info */}
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-foreground" />
          <div className="overflow-hidden">
            <motion.p
              animate={{ x: isActive ? [0, -100, 0] : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-sm text-foreground whitespace-nowrap"
            >
              {reel.musicTitle} • {reel.musicArtist}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Mute Button - Moved below Share */}
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
    </div>
  );
};

const Reels = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragConstraints = { top: 0, bottom: 0 };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const verticalThreshold = 50;
    const horizontalThreshold = 80;

    // Check for horizontal swipe (left/right) for offline mode
    if (Math.abs(info.offset.x) > horizontalThreshold && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x < -horizontalThreshold) {
        // Swipe left - open offline mode
        setShowOfflineMode(true);
      }
      return;
    }

    // Vertical swipes for reel navigation
    if (info.offset.y < -verticalThreshold && currentIndex < mockReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.y > verticalThreshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <Layout hidePlayer>
      <div className="h-[calc(100vh-80px)] relative overflow-hidden">


        {/* Reels Container */}
        <motion.div
          ref={containerRef}
          drag="y"
          dragConstraints={dragConstraints}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ y }}
          className="h-full w-full cursor-grab active:cursor-grabbing"
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
                reel={mockReels[currentIndex]}
                isActive={true}
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
      </div>
    </Layout>
  );
};

export default Reels;
