import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedPlaylistProps {
  title: string;
  description: string;
  image: string;
  songCount: number;
  onClick?: () => void;
}

export const FeaturedPlaylist = ({
  title,
  description,
  image,
  songCount,
  onClick,
}: FeaturedPlaylistProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full max-w-[200px] h-[240px] rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Background image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {songCount} songs
          </span>
          <Button variant="glow" size="icon-sm">
            <Play className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
