import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, MessageCircle, Send, Music, Users, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import album1 from "@/assets/album-1.jpg";

interface ShareMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong?: {
    title: string;
    artist: string;
    albumArt: string;
  };
}

export const ShareMusicModal = ({ isOpen, onClose, currentSong }: ShareMusicModalProps) => {
  const [shareUrl, setShareUrl] = useState("");

  // Mock current playing song if none provided
  const song = currentSong || {
    title: "Neon Dreams",
    artist: "Midnight Wave",
    albumArt: album1
  };

  const shareText = `🎵 Listen to "${song.title}" by ${song.artist} on Clockit!`;
  const shareUrlExample = `https://clockit.app/song/${song.title.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrlExample);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    // In a real app, this would integrate with native sharing or platform APIs
    switch (platform) {
      case 'messages':
        toast.success(`Shared "${song.title}" via Messages`);
        break;
      case 'social':
        toast.success(`Shared "${song.title}" on social media`);
        break;
      case 'friends':
        toast.success(`Shared "${song.title}" with friends`);
        break;
      default:
        toast.success(`Shared "${song.title}"`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-background rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Share Music</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Song Display */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-6">
              <img
                src={song.albumArt}
                alt={song.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Music className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">Now Playing</span>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleShare('messages')}
              >
                <MessageCircle className="w-5 h-5" />
                Share via Messages
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleShare('social')}
              >
                <Share2 className="w-5 h-5" />
                Share on Social Media
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleShare('friends')}
              >
                <Users className="w-5 h-5" />
                Share with Friends
              </Button>
            </div>

            {/* Copy Link Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Share Link</span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground break-all">{shareUrlExample}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Share Text Preview */}
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-foreground">{shareText}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};