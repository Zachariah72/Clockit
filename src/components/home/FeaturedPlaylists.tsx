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
}

export const FeaturedPlaylist: React.FC<FeaturedPlaylistProps> = ({
  title,
  description,
  image,
  songCount,
  onClick,
  onPlay
}) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick from firing
    onPlay?.(e);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Play button */}


        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
            {title}
          </h3>
          <p className="text-white/70 text-xs mb-2 line-clamp-2">
            {description}
          </p>
          <p className="text-white/50 text-xs">
            {songCount} songs
          </p>
        </div>
      </div>
    </motion.div>
  );
};