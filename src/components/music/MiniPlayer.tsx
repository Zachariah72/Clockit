import { motion } from "framer-motion";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { MediaControls } from "@/components/media/MediaControls";

export const MiniPlayer = () => {
  const { currentTrack, isPlaying } = useMediaPlayer();

  // Only show if there's a current track
  if (!currentTrack) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-[72px] left-0 right-0 z-30 px-3"
    >
      <div className="glass-card mx-auto max-w-lg overflow-hidden">
        {/* Compact Media Controls */}
        <MediaControls compact showDeviceControls />
      </div>
    </motion.div>
  );
};
