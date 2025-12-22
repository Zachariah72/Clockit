import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search as SearchIcon, Music, User, Users, Film, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "electronic music",
    "workout playlists",
    "indie artists",
    "live concerts",
    "study beats"
  ]);

  // Mock search results - in real app, this would come from API
  const mockResults = [
    {
      id: "1",
      type: "music",
      title: "Blinding Lights",
      subtitle: "The Weeknd",
      image: "/api/placeholder/60/60",
      category: "Song"
    },
    {
      id: "2",
      type: "artist",
      title: "The Weeknd",
      subtitle: "2.3M followers",
      image: "/api/placeholder/60/60",
      category: "Artist"
    },
    {
      id: "3",
      type: "playlist",
      title: "Chill Vibes",
      subtitle: "45 songs • Curated by Clockit",
      image: "/api/placeholder/60/60",
      category: "Playlist"
    },
    {
      id: "4",
      type: "user",
      title: "sarah_dance",
      subtitle: "Dancer • 12.5K followers",
      image: "/api/placeholder/60/60",
      category: "User"
    },
    {
      id: "5",
      type: "hashtag",
      title: "#electronic",
      subtitle: "2.1M posts",
      image: "/api/placeholder/60/60",
      category: "Hashtag"
    },
    {
      id: "6",
      type: "reel",
      title: "Summer Dance Moves",
      subtitle: "sarah_dance • 45.2K likes",
      image: "/api/placeholder/60/60",
      category: "Reel"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "music": return Music;
      case "artist": return Music;
      case "user": return User;
      case "playlist": return Music;
      case "hashtag": return Hash;
      case "reel": return Film;
      default: return SearchIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "music": return "text-green-500";
      case "artist": return "text-purple-500";
      case "user": return "text-blue-500";
      case "playlist": return "text-orange-500";
      case "hashtag": return "text-pink-500";
      case "reel": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);

      // Add to search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
    }, 300);
  };

  const handleResultClick = (result: any) => {
    // Navigate based on result type
    switch (result.type) {
      case "music":
        navigate("/music", { state: { searchQuery: result.title } });
        break;
      case "artist":
        navigate("/music", { state: { artist: result.title } });
        break;
      case "playlist":
        navigate("/music", { state: { playlist: result.id } });
        break;
      case "user":
        navigate(`/profile/${result.id}`);
        break;
      case "hashtag":
        navigate("/reels", { state: { hashtag: result.title } });
        break;
      case "reel":
        navigate("/reels", { state: { reelId: result.id } });
        break;
      default:
        break;
    }
  };

  const removeFromHistory = (item: string) => {
    setSearchHistory(prev => prev.filter(h => h !== item));
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

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
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gradient">Search</h1>
                <p className="text-sm text-muted-foreground">Find music, people, and more</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for songs, artists, users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-muted/50 border-border/50"
                autoFocus
              />
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="p-4">
          {query.trim() === "" ? (
            /* Search History */
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setQuery(item)}
                  >
                    <div className="flex items-center gap-3">
                      <SearchIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{item}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item);
                      }}
                      className="w-6 h-6"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Popular Searches */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {["Pop Music", "Rock Bands", "Jazz Artists", "Hip Hop", "Classical", "Electronic", "R&B", "Country"].map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div>
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {searchResults.map((result, index) => {
                      const Icon = getTypeIcon(result.type);
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{result.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                              {result.category}
                            </Badge>
                            <Icon className={`w-4 h-4 ${getTypeColor(result.type)}`} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No results found</h3>
                  <p className="text-muted-foreground">
                    Try searching for songs, artists, users, or hashtags
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;