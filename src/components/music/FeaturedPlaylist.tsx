import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedPlaylistProps {
  title: string;
  description: string;
  image: string;
  songCount: number;
  onClick?: () => void;
  hidePlayButton?: boolean;  // Add this line
  onPlay?: (e: React.MouseEvent) => void;  // Add this line
}

export const FeaturedPlaylist = ({
  title,
  description,
  image,
  songCount,
  onClick,
  hidePlayButton = false,  // Add this with default value
  onPlay,  // Add this
}: FeaturedPlaylistProps) => {
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(e);
    }
  };

  // Remove play button and text for 'Trending Now'
  if (title === "Trending Now") {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative rounded-2xl overflow-hidden group cursor-pointer w-full h-48 md:h-56"
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Overlay text content */}
        <div className="absolute left-6 bottom-8 text-left">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h2>
          <p className="text-sm text-white/80 drop-shadow">{description}</p>
          <span className="text-xs text-white/60">{songCount} songs</span>
        </div>
      </motion.div>
    );
  }
  // Default: show full card, horizontally aligned and wide
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group w-full h-40 md:h-48"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute left-6 bottom-8 text-left w-[80%]">
        <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">{title}</h3>
        <p className="text-sm text-white/80 drop-shadow mb-1 line-clamp-2">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{songCount} songs</span>
          {!hidePlayButton && (
            <Button 
              variant="glow" 
              size="icon-sm"
              onClick={handlePlayClick}
              className="ml-auto"
            >
              <Play className="w-5 h-5 ml-0.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};