import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Search, Shuffle, Play, ListMusic, Heart, Clock, Music as MusicIcon, TrendingUp, Moon, Zap, Smile, Frown, Dumbbell, Star, Plus, Users, Radio, ArrowLeft, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import MusicSearch from "@/components/music/MusicSearch";
import MusicDiscovery from "@/components/music/MusicDiscovery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaControls } from "@/components/media/MediaControls";
import { FullPlayer } from "@/components/music/FullPlayer";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import heroMusic from "@/assets/hero-music.jpg";

const Music = () => {
  const location = useLocation();
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "all" | "discover" | "playlists" | "liked" | "spotify">("all");
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // Helper function to format duration from milliseconds to MM:SS
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

const moodModes = [
  { key: 'All', icon: MusicIcon, color: 'bg-[#2B2A2A]', textColor: 'text-[#016B61]' },
  { key: 'Chill', icon: Moon, color: 'bg-blue-500' },
  { key: 'Meditating', icon: Moon, color: 'bg-purple-500' },
  { key: 'Happy', icon: Smile, color: 'bg-yellow-500' },
  { key: 'Party', icon: Zap, color: 'bg-pink-500' },
  { key: 'Sad', icon: Frown, color: 'bg-gray-500' },
  { key: 'Workout', icon: Dumbbell, color: 'bg-red-500' },
  { key: 'Late Night', icon: Moon, color: 'bg-indigo-500' },
  { key: 'Trending', icon: TrendingUp, color: 'bg-green-500' },
];

const genres = [
   'All', 'Pop', 'Hip-Hop/Rap', 'R&B/Soul', 'Rock', 'Electronic/EDM', 'Jazz', 'Blues', 'Classical', 'Gospel', 'Reggae/Dancehall', 'Afrobeat/Afropop/Amapiano', 'Latin', 'Country', 'Folk', 'Indie', 'K-Pop/J-Pop/C-Pop', 'Bollywood/Indian Classical & Pop', 'Arabic/Middle Eastern', 'Caribbean', 'Lo-Fi', 'Instrumental', 'Soundtracks/Scores', 'Experimental/Alternative'
 ];

  const filteredSongs = allSongs.filter(
    (song) => {
      // Only filter by search query if it's not empty
      const matchesSearch = !searchQuery.trim() || 
        song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by genre (if not "All")
      const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
      
      // Filter by mood (if not "All")
      const matchesMood = selectedMood === "All" || song.mood === selectedMood;
      
      return matchesSearch && matchesGenre && matchesMood;
    }
  );

  // Auto-switch to search results when user starts typing
  useEffect(() => {
    if (searchQuery && activeTab !== "search") {
      setActiveTab("search");
    }
  }, [searchQuery, activeTab]);

  const currentMood = moodModes.find(m => m.key === selectedMood);

  const handlePlaylistClick = (playlist: any) => {
    setSelectedPlaylist(playlist);
  };

  const handleBackToMusic = () => {
    setSelectedPlaylist(null);
  };

  // Auto-hide bottom nav when music is playing (media controls stay visible)
  const resetHideTimer = () => {
    setShowBottomNav(true);
    lastInteractionRef.current = Date.now();

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Hide bottom nav after 4 seconds of inactivity (media controls stay visible)
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowBottomNav(false);
    }, 4000);
  };

  // Show controls on user interaction
  const handleUserInteraction = () => {
    resetHideTimer();
  };

  // Effect to handle media controls visibility
  useEffect(() => {
    // Add event listeners for user interactions
    const handleInteraction = () => handleUserInteraction();

    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    // Start the hide timer initially
    resetHideTimer();

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);

      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Effect to reset timer when playlist changes
  useEffect(() => {
    resetHideTimer();
  }, [selectedPlaylist]);

  // Get API base URL for production vs development
  const getApiBaseUrl = () => {
    // In production, use the deployed backend URL
    if (import.meta.env.PROD) {
      return 'https://clockit-gvm2.onrender.com';
    }
    // In development, use the proxy (empty string means relative URL)
    return '';
  };

  // Fetch real tracks from Deezer/Jamendo API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const response = await fetch(`${apiBase}/api/soundcloud/search?q=chill&limit=20`);

        // Check if response is ok
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Music API error:', errorData);
          setAllSongs([]);
          return;
        }

        const tracks = await response.json();

        // Check if tracks is an array and not an error object
        if (!Array.isArray(tracks)) {
          console.error('Invalid response format - expected array, got:', tracks);
          setAllSongs([]);
          return;
        }

        // Check if we have any tracks
        if (tracks.length === 0) {
          console.warn('No tracks returned from Music API');
          setAllSongs([]);
          return;
        }

        const formattedSongs = tracks
          .filter((track: any) => track && track.id && track.title && track.artist) // Filter out invalid tracks
          .map((track: any) => ({
            id: track.id.toString(),
            title: track.title,
            artist: typeof track.artist === 'string' ? track.artist : track.artist?.name || 'Unknown Artist',
            albumArt: track.albumArt || track.artwork_url || album1,
            duration: track.duration ? formatDuration(track.duration) : '3:00', // Format duration as MM:SS
            genre: track.genre || "Chill", // Use provided genre or default
            mood: track.mood || "Chill", // Use provided mood or default
            // Use the proxy stream URL - prepend API base for production
            trackUrl: track.stream_url ? `${apiBase}${track.stream_url}` : ''
          }));

        console.log(`Successfully loaded ${formattedSongs.length} tracks from Music API`);
        setAllSongs(formattedSongs);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        // Don't set fallback tracks - let the user know there was an error
        setAllSongs([]);
      }
    };

    fetchTracks();
  }, []);

  // Update playlists when allSongs is loaded
  useEffect(() => {
    if (allSongs.length > 0) {
      const defaultPlaylists = [
        {
          id: "1",
          title: "My Favorites",
          description: "Your most loved tracks",
          image: allSongs[0]?.albumArt || album1,
          songCount: Math.min(10, allSongs.length),
          songs: allSongs.slice(0, 10)
        },
        {
          id: "2",
          title: "Discover Weekly",
          description: "Fresh picks just for you",
          image: heroMusic,
          songCount: Math.min(10, allSongs.length),
          songs: allSongs.slice(0, 10)
        },
        {
          id: "3",
          title: "Chill Mix",
          description: "Relax and unwind",
          image: album2,
          songCount: Math.min(6, allSongs.length),
          songs: allSongs.slice(0, 6)
        },
        {
          id: "4",
          title: "Trending Hits",
          description: "Latest hot tracks everyone is listening to",
          image: album1,
          songCount: Math.min(8, allSongs.length),
          songs: allSongs.slice(0, 8)
        },
        {
          id: "5",
          title: "Party Anthems",
          description: "High energy tracks for your next party",
          image: album2,
          songCount: Math.min(7, allSongs.length),
          songs: allSongs.slice(0, 7)
        },
        {
          id: "6",
          title: "Chill Vibes",
          description: "Smooth tracks to relax and unwind",
          image: album3,
          songCount: Math.min(6, allSongs.length),
          songs: allSongs.slice(0, 6)
        },
        {
          id: "7",
          title: "Workout Motivation",
          description: "Pump up tracks for your gym session",
          image: album1,
          songCount: Math.min(3, allSongs.length),
          songs: allSongs.slice(0, 3)
        },
        {
          id: "8",
          title: "Happy Tunes",
          description: "Uplifting songs to brighten your day",
          image: album2,
          songCount: Math.min(4, allSongs.length),
          songs: allSongs.slice(0, 4)
        },
        {
          id: "9",
          title: "Afrobeat Collection",
          description: "Finest African beats and rhythms",
          image: album3,
          songCount: Math.min(8, allSongs.length),
          songs: allSongs.slice(0, 8)
        },
        {
          id: "10",
          title: "Hip-Hop Central",
          description: "Best hip-hop and rap tracks",
          image: album1,
          songCount: Math.min(9, allSongs.length),
          songs: allSongs.slice(0, 9)
        },
        {
          id: "11",
          title: "Holiday Classics",
          description: "Festive songs for the holiday season",
          image: album2,
          songCount: Math.min(2, allSongs.length),
          songs: allSongs.slice(0, 2)
        }
      ];
      setPlaylists(defaultPlaylists);
    }
  }, [allSongs]);

  // Handle navigation state from home page
  useEffect(() => {
    const state = location.state as {
      selectedPlaylist?: string;
      showRecentlyPlayed?: boolean;
      playSong?: any;
      songIndex?: number;
      fromHome?: boolean;
      activeTab?: string;
    };
    if (state) {
      if (state.selectedPlaylist) {
        // Find and select the specific playlist
        const playlist = playlists.find((p: any) => p.id === state.selectedPlaylist);
        if (playlist) {
          setSelectedPlaylist(playlist);
        }
      } else if (state.showRecentlyPlayed) {
        // Show recently played/all songs view
        setActiveTab("all");
        // Could add a filter for recently played songs here
      } else if (state.playSong && state.fromHome) {
        // Play specific song from home page
        setActiveTab("all");
        // The song will be played automatically by the SongCard onClick handler
        // which is triggered when navigating from home
      } else if (state.activeTab === 'search') {
        // Navigate from home page search icon - show search bar
        setShowSearchBar(true);
        setActiveTab("search");
        // Focus the search input after a short delay
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 100);
      }
    }
  }, [location.state]);

  // Always show media controls when music is playing
  // (This is handled by the MediaControls component itself based on current track)

  // Playlist View Component
  const PlaylistView = ({ playlist }: { playlist: any }) => (
    <Layout hideBottomNav={!showBottomNav}>
      <div className={`min-h-screen ${currentMood?.color || 'bg-background'} transition-colors duration-500`}>
      {/* Playlist Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 glass-card rounded-b-3xl"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={handleBackToMusic}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Playlist</h1>
          </div>

          {/* Playlist Info */}
          <div className="flex items-end gap-4">
            <img
              src={playlist.image}
              alt={playlist.title}
              className="w-32 h-32 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{playlist.title}</h2>
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
              <p className="text-sm text-muted-foreground">{playlist.songCount} songs</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Playlist Songs */}
      <div className="px-4 mt-6">
        <div className="space-y-2">
          {playlist.songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SongCard
                title={song.title}
                artist={song.artist}
                albumArt={song.albumArt}
                duration={song.duration}
                trackUrl={song.trackUrl}
                playlist={playlist.songs.map(s => ({
                  id: `${s.title}-${s.artist}`,
                  title: s.title,
                  artist: s.artist,
                  album: playlist.title,
                  duration: 180,
                  url: s.trackUrl,
                  artwork: s.albumArt,
                }))}
                currentIndex={index}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Media Controls for Playlist - Always visible when playing */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border cursor-pointer"
        onClick={() => setShowFullPlayer(true)}
      >
        <MediaControls showDeviceControls />
      </motion.div>

      {/* Add padding to prevent content from being hidden behind fixed controls */}
      <div className="pb-32"></div>
      </div>
    </Layout>
  );

  return (
    <Layout hideBottomNav={!showBottomNav}>
      {selectedPlaylist ? (
        <PlaylistView playlist={selectedPlaylist} />
      ) : (
        <div className={`min-h-screen ${currentMood?.color || 'bg-background'} transition-colors duration-500`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">Music</h1>
            </div>

            {/* Mood Selector */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Mood Mode</h3>
              <div className="flex gap-2 overflow-x-auto">
                {moodModes.map((mood) => (
                  <Button
                    key={mood.key}
                    variant={selectedMood === mood.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood.key)}
                    className={`gap-1 flex-shrink-0 ${mood.key === 'All' && selectedMood === 'All' ? mood.textColor : ''}`}
                    style={mood.key === 'All' && selectedMood === 'All' ? { backgroundColor: '#2B2A2A', borderColor: '#2B2A2A' } : {}}
                  >
                    <mood.icon className="w-4 h-4" />
                    {mood.key}
                  </Button>
                ))}
              </div>
            </div>


            {/* Genre Tabs */}
            <div className="mt-4">
              <Tabs value={selectedGenre} onValueChange={setSelectedGenre}>
                <TabsList className="w-full justify-start h-auto overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1 px-1">
                    {genres.slice(0, 8).map((genre) => (
                      <TabsTrigger key={genre} value={genre} className="text-xs px-3 py-1 whitespace-nowrap flex-shrink-0">
                        {genre}
                      </TabsTrigger>
                    ))}
                  </div>
                </TabsList>
              </Tabs>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
              </Button>
              {[
                { key: "all", label: "All Songs", icon: ListMusic },
                { key: "search", label: "Search", icon: Search },
                { key: "discover", label: "Discover", icon: TrendingUp },
                { key: "playlists", label: "Playlists", icon: Clock },
                { key: "liked", label: "Liked", icon: Heart },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.key as any)}
                  className="gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Bar - Show when search icon is clicked */}
            {showSearchBar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setActiveTab("search")}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Popular Artists */}
                <div className="flex flex-wrap gap-2">
                  {['Beyoncé', 'Kendrick Lamar', 'Wizkid', 'Drake', 'Burna Boy'].map((artist) => (
                    <Button
                      key={artist}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery(artist)}
                      className="text-xs px-3 py-1 h-8"
                    >
                      {artist}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Search Tab - Online Music Search */}
        {activeTab === "search" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 mt-6"
          >
            <MusicSearch />
          </motion.section>
        )}

        {/* Discover Tab - Last.fm Music Discovery */}
        {activeTab === "discover" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 mt-6"
          >
            <MusicDiscovery />
          </motion.section>
        )}

        {/* Discovery Section - Moved to top of Listening Groups */}
        {activeTab !== "search" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 mt-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Discover {selectedGenre}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {playlists.slice(0, 4).map((playlist) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FeaturedPlaylist
                    title={playlist.title}
                    description={playlist.description}
                    image={playlist.image}
                    songCount={playlist.songCount}
                    onClick={() => handlePlaylistClick(playlist)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Listening Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Listening Groups
            </h3>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Chill Session</p>
                <p className="text-sm text-muted-foreground">3 members • Now playing</p>
              </div>
              <Button variant="outline" size="sm">
                Join
              </Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Workout Mix</p>
                <p className="text-sm text-muted-foreground">5 members • Paused</p>
              </div>
              <Button variant="outline" size="sm">
                Join
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mt-6"
        >
          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1 gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle All
            </Button>
            <Button variant="glass" className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Play All
            </Button>
          </div>
        </motion.section>


        {/* Playlists Section */}
        {activeTab === "playlists" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Your Playlists</h3>
              <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    <Plus className="w-4 h-4" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                    <DialogDescription>Create a new playlist to organize your favorite music</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="playlist-name">Playlist Name</Label>
                      <Input
                        id="playlist-name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Enter playlist name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="playlist-description">Description (optional)</Label>
                      <Textarea
                        id="playlist-description"
                        value={newPlaylistDescription}
                        onChange={(e) => setNewPlaylistDescription(e.target.value)}
                        placeholder="Enter playlist description"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatePlaylistOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        // TODO: Create playlist API call
                        console.log('Create playlist:', newPlaylistName, newPlaylistDescription);
                        setNewPlaylistName("");
                        setNewPlaylistDescription("");
                        setIsCreatePlaylistOpen(false);
                      }}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
              {playlists.map((playlist) => (
                <FeaturedPlaylist
                  key={playlist.id}
                  title={playlist.title}
                  description={playlist.description}
                  image={playlist.image}
                  songCount={playlist.songCount}
                  onClick={() => handlePlaylistClick(playlist)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Songs List */}
        {activeTab === "all" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedGenre === "All" ? "All Songs" : `${selectedGenre} Songs`}
              </h3>
              <span className="text-sm text-muted-foreground">
                {filteredSongs.length} songs
              </span>
            </div>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12">
                <MusicIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2 text-foreground">
                  {allSongs.length === 0 ? 'No songs loaded' : 'No songs match your filters'}
                </h4>
                <p className="text-muted-foreground">
                  {allSongs.length === 0 
                    ? 'Try refreshing the page or check your connection' 
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
            <div className="space-y-2">
              {filteredSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <SongCard
                    title={song.title}
                    artist={song.artist}
                    albumArt={song.albumArt}
                    duration={song.duration}
                    isPlaying={index === 0}
                    trackUrl={song.trackUrl}
                    playlist={filteredSongs.map(s => ({
                      id: `${s.title}-${s.artist}`,
                      title: s.title,
                      artist: s.artist,
                      album: 'Clockit',
                      duration: 180,
                      url: s.trackUrl,
                      artwork: s.albumArt,
                    }))}
                    currentIndex={index}
                  />
                </motion.div>
              ))}
            </div>
            )}
          </motion.section>
        )}


        {/* Liked Songs Tab */}
        {activeTab === "liked" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Liked Songs</h3>
              <span className="text-sm text-muted-foreground">
                0 songs
              </span>
            </div>
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2 text-foreground">No liked songs yet</h4>
              <p className="text-muted-foreground">Songs you like will appear here</p>
            </div>
          </motion.section>
        )}


          {/* Media Controls - Always visible when playing */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border cursor-pointer"
            onClick={() => setShowFullPlayer(true)}
          >
            <MediaControls showDeviceControls />
          </motion.div>

          {/* Hidden Bottom Nav Indicator */}
          {!showBottomNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-20 left-0 right-0 z-20 flex justify-center"
              onClick={() => setShowBottomNav(true)}
            >
              <div className="bg-secondary/20 backdrop-blur-sm rounded-full p-2 cursor-pointer hover:bg-secondary/30 transition-colors">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Add padding to prevent content from being hidden behind fixed controls */}
          <div className="pb-32"></div>
        </div>
      )}

      {/* Full Player */}
      <FullPlayer open={showFullPlayer} onOpenChange={setShowFullPlayer} />
    </Layout>
  );
};

export default Music;

