import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturedPlaylistProps {
  title: string;
  description: string;
  image: string;
  songCount: number;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
  className?: string; // Add this line
}

export const FeaturedPlaylist: React.FC<FeaturedPlaylistProps> = ({
  title,
  description,
  image,
  songCount,
  onClick,
  onPlay,
  className
}) => {
  // Only show image for 'Trending Now'
  if (title === "Trending Now") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group w-full max-w-full cursor-pointer aspect-[16/7] rounded-2xl overflow-hidden mb-6"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl" />
      </motion.div>
    );
  }
  // Default: show full card
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer w-full max-w-full aspect-[16/7] rounded-2xl overflow-hidden bg-black/60 mb-6"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl" />
      {/* Content */}
      <div className="absolute left-0 bottom-0 w-full p-4 pb-8 text-left z-10 flex flex-col gap-2">
        <div>
          <h3 className="text-white font-bold text-base mb-1 line-clamp-1 drop-shadow">
            {title}
          </h3>
          <p className="text-white/80 text-xs mb-1 line-clamp-2 drop-shadow">
            {description}
          </p>
          <p className="text-white/60 text-xs drop-shadow">
            {songCount} songs
          </p>
        </div>
        <button
          className="absolute right-4 bottom-4 bg-primary text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onPlay}
          style={{ zIndex: 20 }}
        >
          <Play className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
