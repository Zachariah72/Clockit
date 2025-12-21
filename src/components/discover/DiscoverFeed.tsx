import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, TrendingUp, Music2, Users, Video, 
  Hash, Sparkles, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  type: "song" | "hashtag" | "creator" | "sound";
  stats: string;
  image?: string;
}

interface DiscoverFeedProps {
  onSearch: (query: string) => void;
}

const trendingItems: TrendingItem[] = [
  { id: "1", title: "#MidnightVibes", subtitle: "5.2M posts", type: "hashtag", stats: "Trending" },
  { id: "2", title: "Neon Dreams", subtitle: "Midnight Wave", type: "song", stats: "2.1M plays" },
  { id: "3", title: "@synthwave_queen", subtitle: "Music Producer", type: "creator", stats: "500K followers" },
  { id: "4", title: "Original Sound", subtitle: "by @user123", type: "sound", stats: "15K uses" },
];

const categories = [
  { id: "music", label: "Music", icon: Music2, color: "bg-cyan/20 text-cyan" },
  { id: "creators", label: "Creators", icon: Users, color: "bg-magenta/20 text-magenta" },
  { id: "videos", label: "Videos", icon: Video, color: "bg-purple/20 text-purple" },
  { id: "trending", label: "Trending", icon: TrendingUp, color: "bg-green-500/20 text-green-500" },
];

export const DiscoverFeed = ({ onSearch }: DiscoverFeedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const getItemIcon = (type: TrendingItem["type"]) => {
    switch (type) {
      case "song": return Music2;
      case "hashtag": return Hash;
      case "creator": return Users;
      case "sound": return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search songs, artists, hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(isActive ? null : category.id)}
              className={`shrink-0 gap-2 ${!isActive && category.color}`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Trending Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </h3>
          <Button variant="ghost" size="sm" className="text-primary">
            See All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-2">
          {trendingItems.map((item, index) => {
            const Icon = getItemIcon(item.type);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{item.stats}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* For You Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-magenta" />
            For You
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-square rounded-2xl bg-gradient-to-br from-muted to-card overflow-hidden relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-medium text-foreground truncate">Discover #{index + 1}</p>
                <p className="text-xs text-muted-foreground">10K views</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverFeed;
