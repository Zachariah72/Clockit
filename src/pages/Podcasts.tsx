import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Play, Clock, User, TrendingUp, Headphones, Filter, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Podcasts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock podcast data
  const featuredPodcasts = [
    {
      id: "1",
      title: "Tech Talk Daily",
      host: "Sarah Chen",
      description: "Daily insights into the latest technology trends and innovations",
      episodes: 245,
      duration: "45 min",
      rating: 4.8,
      category: "Technology",
      image: "/api/placeholder/200/200",
      isSubscribed: false,
    },
    {
      id: "2",
      title: "Mindful Moments",
      host: "Dr. James Wilson",
      description: "Guided meditations and mindfulness practices for busy professionals",
      episodes: 120,
      duration: "20 min",
      rating: 4.9,
      category: "Wellness",
      image: "/api/placeholder/200/200",
      isSubscribed: true,
    },
    {
      id: "3",
      title: "Business Breakthrough",
      host: "Maria Rodriguez",
      description: "Strategies and stories from successful entrepreneurs",
      episodes: 89,
      duration: "35 min",
      rating: 4.7,
      category: "Business",
      image: "/api/placeholder/200/200",
      isSubscribed: false,
    },
  ];

  const categories = [
    "All", "Technology", "Business", "Wellness", "News", "Comedy", "Education", "True Crime"
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/music')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Podcasts</h1>
                <p className="text-muted-foreground">Discover amazing audio content</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="px-6 mt-6">
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="subscriptions">My Podcasts</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Trending Now</h2>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>

              <div className="grid gap-4">
                {featuredPodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4 rounded-2xl"
                  >
                    <div className="flex gap-4">
                      <img
                        src={podcast.image}
                        alt={podcast.title}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">{podcast.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{podcast.host}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{podcast.rating}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {podcast.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{podcast.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{podcast.episodes} episodes</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-3 h-3" />
                              Play
                            </Button>
                            <Button
                              size="sm"
                              variant={podcast.isSubscribed ? "default" : "outline"}
                              className="gap-1"
                            >
                              {podcast.isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Browse by Category</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-4 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-medium text-foreground">{category}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.floor(Math.random() * 500) + 50} podcasts
                    </p>
                  </motion.button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Your Subscriptions</h2>
              <div className="text-center py-12">
                <Headphones className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No subscriptions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Subscribe to your favorite podcasts to get new episodes
                </p>
                <Button className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Browse Podcasts
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom spacing for media controls */}
        <div className="pb-32"></div>
      </div>
    </Layout>
  );
};

export default Podcasts;