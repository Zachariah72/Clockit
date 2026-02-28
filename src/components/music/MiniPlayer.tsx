import { motion } from "framer-motion";
import { useState } from "react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { MediaControls } from "@/components/media/MediaControls";
import { FullPlayer } from "./FullPlayer";

export const MiniPlayer = () => {
  const { currentTrack } = useMediaPlayer();
  const [isOpen, setIsOpen] = useState(false);

  // Only show if there's a current track
  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-[72px] left-0 right-0 z-30 px-3 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative mx-auto max-w-lg overflow-hidden">
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-xl"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
                "linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />

          {/* Glass Card with Enhanced Styling */}
          <div className="relative glass-card-modern rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl">
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/5" />

            {/* Content */}
            <div className="relative p-4">
              <MediaControls compact showDeviceControls />
            </div>

            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-gradient-to-r from-purple-400/50 via-pink-400/50 to-blue-400/50"
              animate={{
                borderImageSource: [
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5))",
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5))",
                  "linear-gradient(45deg, rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))",
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5))"
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />

            {/* Floating Particles Effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <FullPlayer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
