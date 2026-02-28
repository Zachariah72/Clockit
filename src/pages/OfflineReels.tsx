import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Trash2, Film, CloudOff, Download, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const OfflineReels = () => {
  const navigate = useNavigate();
  const [offlineReels, setOfflineReels] = useState<any[]>([]);

  // Mock data for offline reels - in real app, this would come from a proper data source
  useEffect(() => {
    // For now, we'll show some mock offline reels
    // In a real implementation, you'd fetch reels based on cached/saved content
    const mockOfflineReels = [
      {
        id: "1",
        username: "sarah_dance",
        avatar: avatar1,
        thumbnail: album1,
        caption: "Summer vibes only ☀️ #dance #summer #fun",
        musicTitle: "Blinding Lights",
        musicArtist: "The Weeknd",
        likes: 45200,
        comments: 892,
        shares: 234,
        duration: "0:15",
        downloadDate: "2024-01-15",
        fileSize: "2.3 MB"
      },
      {
        id: "2",
        username: "mike_travels",
        avatar: avatar2,
        thumbnail: album2,
        caption: "POV: You found paradise 🌴",
        musicTitle: "Heat Waves",
        musicArtist: "Glass Animals",
        likes: 28900,
        comments: 456,
        shares: 123,
        duration: "0:12",
        downloadDate: "2024-01-14",
        fileSize: "1.8 MB"
      },
      {
        id: "3",
        username: "alex_fitness",
        avatar: avatar3,
        thumbnail: album3,
        caption: "Morning workout routine 💪 Who's joining?",
        musicTitle: "Levitating",
        musicArtist: "Dua Lipa",
        likes: 67800,
        comments: 1234,
        shares: 567,
        duration: "0:18",
        downloadDate: "2024-01-13",
        fileSize: "3.1 MB"
      },
    ];

    setOfflineReels(mockOfflineReels);
  }, []);

  const handlePlayReel = (reel: any) => {
    // In a real implementation, this would play the offline reel
    toast.success(`Playing "${reel.caption.slice(0, 30)}..."`);
  };

  const handleRemoveReel = (reelId: string, caption: string) => {
    // In a real implementation, this would remove from offline storage
    setOfflineReels(prev => prev.filter(reel => reel.id !== reelId));
    toast.success(`"${caption.slice(0, 20)}..." removed from offline reels`);
  };

  const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/reels')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <CloudOff className="w-5 h-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                <h1 className="text-2xl font-bold text-foreground">Offline Reels</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <WifiOff className="w-4 h-4" />
              <p className="text-sm">
                {offlineReels.length} offline {offlineReels.length === 1 ? 'reel' : 'reels'} • Ready for offline viewing
              </p>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="px-4 mt-6">
          {offlineReels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Film className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Offline Reels</h3>
              <p className="text-muted-foreground mb-6">
                Download reels from the reels player to watch offline
              </p>
              <Button onClick={() => navigate('/reels')} className="gap-2">
                <Film className="w-4 h-4" />
                Browse Reels
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Your Offline Reels</h3>
                <span className="text-sm text-muted-foreground">
                  {offlineReels.length} {offlineReels.length === 1 ? 'reel' : 'reels'}
                </span>
              </div>

              {offlineReels.map((reel, index) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 rounded-2xl"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={reel.thumbnail}
                        alt={reel.caption}
                        className="w-20 h-28 rounded-xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {reel.duration}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={reel.avatar}
                              alt={reel.username}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="font-medium text-foreground text-sm">@{reel.username}</span>
                          </div>
                          <p className="text-sm text-foreground/90 line-clamp-2 mb-2">
                            {reel.caption}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>🎵 {reel.musicTitle} • {reel.musicArtist}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>❤️</span>
                          <span>{formatCount(reel.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💬</span>
                          <span>{formatCount(reel.comments)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📤</span>
                          <span>{formatCount(reel.shares)}</span>
                        </div>
                      </div>

                      {/* Download Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Downloaded {reel.downloadDate}</span>
                        <span>{reel.fileSize}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePlayReel(reel)}
                          className="flex-1 gap-2"
                        >
                          <Play className="w-3 h-3" />
                          Play Offline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveReel(reel.id, reel.caption)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for media controls */}
        <div className="pb-32"></div>
      </div>
    </Layout>
  );
};

export default OfflineReels;