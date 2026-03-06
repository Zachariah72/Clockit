import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Shuffle, Play, ListMusic, Heart, Clock,
  Music as MusicIcon, TrendingUp, Moon, Zap, Smile,
  Frown, Dumbbell, Star, Plus, Users, Radio, ArrowLeft,
  Bell, Check, X, Hash, Film, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/home/FeaturedPlaylists";
import MusicSearch from "@/components/music/MusicSearch";
import MusicDiscovery from "@/components/music/MusicDiscovery";
import { MediaControls } from "@/components/media/MediaControls";
import { FullPlayer } from "@/components/music/FullPlayer";
import { NotificationCenter, type Notification } from "@/components/notifications/NotificationCenter";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getListeningHistory,
  getUserPlaylists,
  getJoinedGroups,
  searchMusic,
  createPlaylist,
  joinListeningGroup,
  discoverPublicGroups
} from "@/services/api";
import heroMusic from "@/assets/hero-music.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

// ─── Static mock data (previously in Home/Index.tsx) ───────────────────────
const recentSongs = [
  { id: "1", title: "Neon Dreams", artist: "Midnight Wave", albumArt: album1, duration: "3:42", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "2", title: "Sunset Drive", artist: "Synthwave", albumArt: album2, duration: "4:15", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "3", title: "City Lights", artist: "Lo-Fi Beats", albumArt: album3, duration: "2:58", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
  { id: "4", title: "Electric Soul", artist: "Nova", albumArt: album1, duration: "3:21", trackUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
];

const featuredPlaylistsMock = [
  { id: "1", title: "Trending Now", description: "The hottest tracks right now", image: album3, songCount: 50 },
];

// ─── Mood & Genre config ────────────────────────────────────────────────────
const moodModes = [
  { key: "All", icon: MusicIcon, color: "bg-[#2B2A2A]", textColor: "text-[#016B61]" },
  { key: "Chill", icon: Moon, color: "bg-blue-500" },
  { key: "Meditating", icon: Moon, color: "bg-purple-500" },
  { key: "Happy", icon: Smile, color: "bg-yellow-500" },
  { key: "Party", icon: Zap, color: "bg-pink-500" },
  { key: "Sad", icon: Frown, color: "bg-gray-500" },
  { key: "Workout", icon: Dumbbell, color: "bg-red-500" },
  { key: "Late Night", icon: Moon, color: "bg-indigo-500" },
  { key: "Trending", icon: TrendingUp, color: "bg-green-500" },
];

const genres = [
  "All", "Pop", "Hip-Hop/Rap", "R&B/Soul", "Rock", "Electronic/EDM", "Jazz",
  "Blues", "Classical", "Gospel", "Reggae/Dancehall", "Afrobeat/Afropop/Amapiano",
  "Latin", "Country", "Folk", "Indie", "K-Pop/J-Pop/C-Pop",
  "Bollywood/Indian Classical & Pop", "Arabic/Middle Eastern", "Caribbean",
  "Lo-Fi", "Instrumental", "Soundtracks/Scores", "Experimental/Alternative",
];

// ───────────────────────────────────────────────────────────────────────────
const Music: React.FC = () => {
  const { user } = useAuth();
  const { currentTrack, play, pause, isPlaying, recentlyPlayed, likedTrackIDs, playTrack } = useMediaPlayer();
  const { toast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  // ── Active mode ───────────────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<"foryou" | "library" | "discover">(() => {
    console.log("[DEBUG] Initializing activeMode to 'foryou'");
    return "foryou";
  });
  const [libraryTab, setLibraryTab] = useState<"all" | "playlists" | "liked">("all");

  // ── Music/player state (from original Music.tsx) ─────────────────────────
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Missing state variables ──────────────────────────────────────────────
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "new_release",
      message: "New album \"Midnight Waves\" by Synthwave is now available!",
      isRead: false,
      time: "2m ago",
      sender: { name: "Synthwave", avatar: album1 },
      targetUrl: "/music"
    },
    {
      id: "2",
      type: "follow",
      message: "DJ Beats started following you",
      isRead: false,
      time: "15m ago",
      sender: { name: "DJ Beats", avatar: avatar1 },
      targetUrl: "/profile/dj-beats"
    },
    {
      id: "3",
      type: "like",
      message: "Someone liked your playlist \"Chill Mix\"",
      isRead: true,
      time: "1h ago",
      sender: { name: "Sarah J", avatar: avatar2 },
      targetUrl: "/music"
    },
    {
      id: "4",
      type: "mention",
      message: "MusicLover mentioned you in a comment",
      isRead: false,
      time: "2h ago",
      sender: { name: "MusicLover", avatar: avatar3 },
      targetUrl: "/chat"
    },
  ]);

  const [activeGroups, setActiveGroups] = useState<any[]>([]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinListeningGroup(groupId);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Notification Actions ──────────────────────────────────────────────────
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };
  // ── Hero Carousel state ──────────────────────────────────────────────────
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  // Images for the hero carousel
  const heroImages = useMemo(() => [heroMusic, album1, album2, album3], []);
  // Ref to store timeout id
  const heroTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Debug: log heroImages and currentHeroIndex
  useEffect(() => {
    console.log("[DEBUG] heroImages:", heroImages);
  }, [heroImages]);
  useEffect(() => {
    console.log("[DEBUG] currentHeroIndex:", currentHeroIndex);
  }, [currentHeroIndex]);

  // Auto-slide effect for hero carousel using setTimeout (avoids closure issues)
  useEffect(() => {
    console.log("[DEBUG] useEffect: activeMode=", activeMode, "currentHeroIndex=", currentHeroIndex, "heroImages.length=", heroImages.length);
    if (activeMode !== "foryou") {
      if (heroTimeoutRef.current) {
        clearTimeout(heroTimeoutRef.current);
        heroTimeoutRef.current = null;
      }
      return;
    }
    if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    function scheduleNext() {
      heroTimeoutRef.current = setTimeout(() => {
        setCurrentHeroIndex(prev => {
          const next = (prev + 1) % heroImages.length;
          console.log("[DEBUG] Advancing hero slide:", prev, "->", next);
          return next;
        });
      }, 4000);
    }
    scheduleNext();
    return () => {
      if (heroTimeoutRef.current) {
        clearTimeout(heroTimeoutRef.current);
        heroTimeoutRef.current = null;
      }
    };
  }, [activeMode, currentHeroIndex, heroImages.length]);

  // Reset timeout when user manually changes slide
  const handleHeroIndicatorClick = (i: number) => {
    setCurrentHeroIndex(i);
    if (heroTimeoutRef.current) {
      clearTimeout(heroTimeoutRef.current);
      heroTimeoutRef.current = null;
    }
  };


  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDuration = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Computed ──────────────────────────────────────────────────────────────
    const likedSongs = allSongs.filter(song => likedTrackIDs.includes(song.id));

    const displayedRecentSongs = recentlyPlayed.length > 0
      ? recentlyPlayed.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          albumArt: t.artwork || album1,
          duration: formatDuration(t.duration * 1000),
          trackUrl: t.url
        }))
      : recentSongs;
  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = !debouncedSearchQuery.trim() ||
      song.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
    const matchesMood = selectedMood === "All" || song.mood === selectedMood;
    return matchesSearch && matchesGenre && matchesMood;
});

  const getApiBaseUrl = () =>
    import.meta.env.PROD ? "https://clockit-gvm2.onrender.com" : "";

  // ── Auto-hide bottom nav ──────────────────────────────────────────────────
  const resetHideTimer = () => {
    setShowBottomNav(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => setShowBottomNav(false), 4000);
  };

  useEffect(() => {
    const handler = () => resetHideTimer();
    window.addEventListener("touchstart", handler);
    window.addEventListener("click", handler);
    window.addEventListener("scroll", handler);
    resetHideTimer();
    return () => {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => { resetHideTimer(); }, [selectedPlaylist]);

  // ── Notification click-outside ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isNotificationsOpen]);

  // ── FAB click-outside ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isFabOpen && !target.closest("[data-fab]")) setIsFabOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFabOpen]);


  // ── Fetch real data from Backend ──────────────────────────────────────────
  useEffect(() => {
    const loadInitData = async () => {
      try {
        // Load initial "Discover" content (Trending/Chill)
        const tracks = await searchMusic("trending chill");
        if (Array.isArray(tracks)) {
          setAllSongs(tracks.map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            artist: t.artist?.name || t.artist || "Unknown",
            albumArt: t.albumArt || t.artwork_url || album1,
            duration: t.duration ? formatDuration(t.duration * 1000) : "3:00",
            genre: t.genre || "Chill",
            mood: t.mood || "Chill",
            trackUrl: t.trackUrl || t.stream_url || "",
          })));
        }

        // Load user playlists
        const up = await getUserPlaylists();
        if (Array.isArray(up)) {
          setPlaylists(up.map((p: any) => ({
            id: p._id,
            title: p.name,
            description: p.description,
            image: p.coverImage || album1,
            songCount: p.tracks?.length || 0,
            songs: p.tracks?.map((t: any) => ({
              id: t.trackId,
              title: t.metadata?.title || "Unknown",
              artist: t.metadata?.artist || "Unknown",
              albumArt: t.metadata?.artwork || album1,
              trackUrl: t.metadata?.url || "",
              source: t.source
            })) || []
          })));
        }

        // Load Joined Groups
        const groups = await discoverPublicGroups();
        if (Array.isArray(groups)) {
          setActiveGroups(groups.slice(0, 5));
        }
      } catch (err) {
        console.error("Error loading music data:", err);
      }
    };
    loadInitData();
  }, []);

  // ── Live Search effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) return;

    const performSearch = async () => {
      try {
        const results = await searchMusic(debouncedSearchQuery);
        if (Array.isArray(results)) {
          setAllSongs(results.map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            artist: t.artist?.name || t.artist || "Unknown",
            albumArt: t.albumArt || t.artwork_url || album1,
            duration: t.duration ? formatDuration(t.duration * 1000) : "3:00",
            genre: t.genre || "Pop",
            mood: t.mood || "Party",
            trackUrl: t.trackUrl || t.stream_url || "",
          })));
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    };
    performSearch();
  }, [debouncedSearchQuery]);

  // ── Handle Playlist Creation ──────────────────────────────────────────────
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const p = await createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
      });
      setPlaylists(prev => [...prev, {
        id: p._id,
        title: p.name,
        description: p.description,
        image: album1,
        songCount: 0,
        songs: []
      }]);
      setIsCreatePlaylistOpen(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  // ── Derive playlists from allSongs ────────────────────────────────────────
  useEffect(() => {
    if (allSongs.length > 0) {
      setPlaylists([
        { id: "1", title: "My Favorites", description: "Your most loved tracks", image: allSongs[0]?.albumArt || album1, songCount: Math.min(10, allSongs.length), songs: allSongs.slice(0, 10) },
        { id: "2", title: "Discover Weekly", description: "Fresh picks just for you", image: heroMusic, songCount: Math.min(10, allSongs.length), songs: allSongs.slice(0, 10) },
        { id: "3", title: "Chill Mix", description: "Relax and unwind", image: album2, songCount: Math.min(6, allSongs.length), songs: allSongs.slice(0, 6) },
        { id: "4", title: "Trending Hits", description: "Latest hot tracks", image: album1, songCount: Math.min(8, allSongs.length), songs: allSongs.slice(0, 8) },
        { id: "5", title: "Party Anthems", description: "High energy tracks", image: album2, songCount: Math.min(7, allSongs.length), songs: allSongs.slice(0, 7) },
        { id: "6", title: "Chill Vibes", description: "Smooth tracks to unwind", image: album3, songCount: Math.min(6, allSongs.length), songs: allSongs.slice(0, 6) },
        { id: "7", title: "Workout Motivation", description: "Pump up tracks", image: album1, songCount: Math.min(3, allSongs.length), songs: allSongs.slice(0, 3) },
        { id: "8", title: "Happy Tunes", description: "Uplifting songs", image: album2, songCount: Math.min(4, allSongs.length), songs: allSongs.slice(0, 4) },
        { id: "9", title: "Afrobeat Collection", description: "Finest African beats", image: album3, songCount: Math.min(8, allSongs.length), songs: allSongs.slice(0, 8) },
        { id: "10", title: "Hip-Hop Central", description: "Best hip-hop tracks", image: album1, songCount: Math.min(9, allSongs.length), songs: allSongs.slice(0, 9) },
        { id: "11", title: "Holiday Classics", description: "Festive songs", image: album2, songCount: Math.min(2, allSongs.length), songs: allSongs.slice(0, 2) },
      ]);
    }
  }, [allSongs]);

  // ── Handle incoming navigation state ─────────────────────────────────────
  useEffect(() => {
    const state = location.state as any;
    if (!state) return;
    if (state.selectedPlaylist) {
      const p = playlists.find((pl: any) => pl.id === state.selectedPlaylist);
      if (p) setSelectedPlaylist(p);
    } else if (state.showRecentlyPlayed || (state.playSong && state.fromHome)) {
      setActiveMode("library");
      setLibraryTab("all");
    } else if (state.activeTab === "search") {
      setActiveMode("discover");
    }
  }, [location.state, playlists]);


  // ── Playlist handlers ─────────────────────────────────────────────────────
  const handlePlaylistClick = (playlist: any) => setSelectedPlaylist(playlist);
  const handleFeaturedPlaylistClick = (featuredId: string) => {
    const full = playlists.find(p => p.id === featuredId);
    if (full) setSelectedPlaylist(full);
    else {
      const mock = featuredPlaylistsMock.find(p => p.id === featuredId);
      if (mock) setSelectedPlaylist({ ...mock, songs: allSongs.slice(0, mock.songCount) });
    }
  };
  const handleBackToMusic = () => setSelectedPlaylist(null);

  const handlePlayTrending = (e: React.MouseEvent) => {
    e.stopPropagation();
    const trendingSongs = allSongs.length > 0 ? allSongs : recentSongs;
    if (trendingSongs.length > 0) {
      playTrack(trendingSongs[0], trendingSongs, 0);
      toast({
        title: "Now Playing",
        description: `Trending Now - ${trendingSongs[0].title}`,
      });
    }
  };

  // ── PlaylistView ──────────────────────────────────────────────────────────
  const PlaylistView = ({ playlist }: { playlist: any }) => (
    <Layout hideBottomNav={!showBottomNav}>
      <div className="min-h-screen bg-black overflow-x-hidden">
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
            <div className="flex items-end gap-4">
              <img src={playlist.image} alt={playlist.title} className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">{playlist.title}</h2>
                <p className="text-muted-foreground text-sm mb-1">{playlist.description}</p>
                <p className="text-xs text-muted-foreground">{playlist.songCount} songs</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="px-4 mt-6">
          <div className="space-y-2">
            {(playlist.songs || []).map((song: any, index: number) => (
              <motion.div key={song.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                <SongCard
                  title={song.title} artist={song.artist} albumArt={song.albumArt}
                  duration={song.duration} trackUrl={song.trackUrl}
                  playlist={(playlist.songs || []).map((s: any) => ({
                    id: `${s.title}-${s.artist}`, title: s.title, artist: s.artist,
                    album: playlist.title, duration: 180, url: s.trackUrl, artwork: s.albumArt,
                  }))}
                  currentIndex={index}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border cursor-pointer"
          onClick={() => setShowFullPlayer(true)}
        >
          <MediaControls showDeviceControls />
        </motion.div>
        <div className="pb-32" />
      </div>
    </Layout>
  );

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <Layout hideBottomNav={!showBottomNav}>
      {selectedPlaylist ? (
        <PlaylistView playlist={selectedPlaylist} />
      ) : (
        <div className="min-h-screen bg-black transition-colors duration-500 overflow-x-hidden">

          {/* ══════════════════════ HEADER ══════════════════════ */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-20 glass-card rounded-b-3xl"
          >
            <div className="p-4 pb-3">

              {/* Row 1 — Title + Icons */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Clockit</h1>
                  <p className="text-xs text-muted-foreground">Music & Discover</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Search → Discover mode */}
                  <Button variant="ghost" size="icon" className="touch-manipulation"
                    onClick={() => setActiveMode("discover")}>
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Row 2 — Mode Switcher Pill */}
              <div className="flex gap-1 bg-muted/40 rounded-full p-1">
                {[ 
                  { key: "foryou", label: "For You" },
                  { key: "library", label: "Library" },
                  { key: "discover", label: "Discover" },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => {
                      console.log("[DEBUG] Mode switcher clicked:", mode.key);
                      setActiveMode(mode.key as any);
                    }}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeMode === mode.key
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

            </div>
          </motion.header>

          {/* ══════════════════ FOR YOU MODE ══════════════════ */}
          <AnimatePresence mode="wait">
            {activeMode === "foryou" && (
              <motion.div
                key="foryou"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >

                {/* Hero Carousel - Image Only, No Play Button */}
                <div className="mb-8 px-4 md:px-0">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg select-none">
                    <img
                      src={heroImages[currentHeroIndex]}
                      alt="Trending Now"
                      className="w-full h-full object-cover transition-all duration-700 pointer-events-none"
                    />
                    {/* Overlay text */}
                    <div className="absolute left-6 bottom-8 text-left pointer-events-none">
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg">Trending Now</h2>
                      <p className="text-sm text-white/80 drop-shadow">The hottest tracks right now</p>
                      <span className="text-xs text-white/60">50 songs</span>
                    </div>
                    {/* Carousel indicators */}
                    <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
                      {heroImages.map((_, i) => (
                        <button
                          key={i}
                          className={`h-2 w-6 rounded-full transition-all duration-300 ${i === currentHeroIndex ? "bg-primary" : "bg-white/30 w-2"}`}
                          onClick={() => handleHeroIndicatorClick(i)}
                          tabIndex={-1}
                          aria-label={`Go to slide ${i+1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured Playlists */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="mt-7"
                >
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">Featured Playlists</h3>
                    <Button variant="ghost" size="sm" className="text-primary"
                      onClick={() => { setActiveMode("library"); setLibraryTab("playlists"); }}>
                      See all
                    </Button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory scroll-smooth">
                    {featuredPlaylistsMock.map(pl => (
                      <div key={pl.id} className="snap-start flex-shrink-0 w-[360px]">
                        <FeaturedPlaylist
                          title={pl.title}
                          description={pl.description}
                          image={pl.image}
                          songCount={pl.songCount}
                          onClick={() => {
                            const playlistSongs = filteredSongs.length > 0 
                              ? filteredSongs 
                              : allSongs.slice(0, pl.songCount);
                            
                            if (playlistSongs.length > 0) {
                              setSelectedPlaylist({ 
                                ...pl, 
                                songs: playlistSongs.map((song: any) => ({
                                  id: song.id,
                                  title: song.title,
                                  artist: song.artist,
                                  albumArt: song.albumArt,
                                  duration: song.duration,
                                  trackUrl: song.trackUrl
                                }))
                              });
                            } else {
                              setSelectedPlaylist(pl);
                            }
                          }}
                          onPlay={(e) => {
                            e.stopPropagation();
                            const playlistSongs = filteredSongs.length > 0 
                              ? filteredSongs 
                              : allSongs.slice(0, pl.songCount);
                            if (playlistSongs.length > 0) {
                              playTrack(playlistSongs[0], playlistSongs, 0);
                              toast({
                                title: "Now Playing",
                                description: `${pl.title} - ${playlistSongs[0].title}`,
                              });
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Listening Groups */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="px-4 mt-7"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Radio className="w-5 h-5 text-primary" /> Listening Groups
                    </h3>
                    <Button variant="ghost" size="sm" className="text-primary gap-1"
                      onClick={() => navigate("/groups")}>
                      <Plus className="w-4 h-4" /> Create
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {activeGroups.length > 0 ? (
                      activeGroups.map(group => (
                        <div key={group._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                          <div className={`w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center`}>
                            <Users className={`w-5 h-5 text-primary`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{group.name}</p>
                            <p className="text-sm text-muted-foreground">{group.members?.length || 0} members • {group.isPublic ? 'Public' : 'Private'}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleJoinGroup(group._id)}>Join</Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed text-center">
                        <p className="text-sm text-muted-foreground">No active groups found. Create one to start listening together!</p>
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* Recently Played */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="px-4 mt-7"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Recently Played</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary"
                      onClick={() => { setActiveMode("library"); setLibraryTab("all"); }}>
                      See all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {displayedRecentSongs.slice(0, 4).map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.07 }}
                      >
                        <SongCard
                          title={song.title} artist={song.artist} albumArt={song.albumArt}
                          duration={song.duration}
                          isPlaying={currentTrack?.title === song.title && currentTrack?.artist === song.artist}
                          onClick={() => { /* Stay on current mode when playing */ }}
                          trackUrl={song.trackUrl}
                          playlist={displayedRecentSongs.map(s => ({
                            id: s.id, title: s.title, artist: s.artist,
                            album: "Recently Played", duration: 180, url: s.trackUrl || "", artwork: s.albumArt,
                          }))}
                          currentIndex={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Quick Actions */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="px-4 mt-6"
                >
                  <div className="flex gap-3">
                    <Button variant="gradient" className="flex-1 gap-2">
                      <Shuffle className="w-4 h-4" /> Shuffle All
                    </Button>
                    <Button variant="glass" className="flex-1 gap-2">
                      <Play className="w-4 h-4" /> Play All
                    </Button>
                  </div>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════ LIBRARY MODE ══════════════════ */}
          <AnimatePresence mode="wait">
            {activeMode === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {/* Mood Selector */}
                <motion.section
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                  className="px-4 mt-4"
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mood Mode</h3>
                  <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 snap-x">
                    {moodModes.map(mood => (
                      <Button
                        key={mood.key}
                        variant={selectedMood === mood.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMood(mood.key)}
                        className={`gap-1.5 flex-shrink-0 snap-start ${mood.key === "All" && selectedMood === "All" ? mood.textColor : ""}`}
                        style={mood.key === "All" && selectedMood === "All" ? { backgroundColor: "#2B2A2A", borderColor: "#2B2A2A" } : {}}
                      >
                        <mood.icon className="w-3.5 h-3.5" />
                        {mood.key}
                      </Button>
                    ))}
                  </div>
                </motion.section>

                {/* Genre Tabs */}
                <motion.section
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
                  className="px-4 mt-3"
                >
                  <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 snap-x">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 font-medium transition-all duration-200 snap-start ${selectedGenre === genre
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </motion.section>

                {/* Library Sub-tabs */}
                <motion.section
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="px-4 mt-4 flex gap-2"
                >
                  {[
                    { key: "all", label: "All Songs", icon: ListMusic },
                    { key: "playlists", label: "Playlists", icon: Clock },
                    { key: "liked", label: "Liked", icon: Heart },
                  ].map(tab => (
                    <Button
                      key={tab.key}
                      variant={libraryTab === tab.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setLibraryTab(tab.key as any)}
                      className="gap-1.5"
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </Button>
                  ))}
                </motion.section>

                {/* All Songs */}
                {libraryTab === "all" && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="px-4 mt-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {selectedGenre === "All" ? "All Songs" : `${selectedGenre} Songs`}
                      </h3>
                      <span className="text-sm text-muted-foreground">{filteredSongs.length} songs</span>
                    </div>
                    {filteredSongs.length === 0 ? (
                      <div className="text-center py-16">
                        <MusicIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="font-semibold mb-2 text-foreground">
                          {allSongs.length === 0 ? "No songs loaded" : "No songs match your filters"}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {allSongs.length === 0 ? "Try refreshing or check your connection" : "Try adjusting your mood or genre"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredSongs.slice(0, 100).map((song, index) => (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.04 }}
                          >
                            <SongCard
                              title={song.title} artist={song.artist} albumArt={song.albumArt}
                              duration={song.duration}
                              isPlaying={currentTrack?.title === song.title && currentTrack?.artist === song.artist}
                              trackUrl={song.trackUrl}
                              playlist={filteredSongs.map(s => ({
                                id: s.id, title: s.title, artist: s.artist,
                                album: "Clockit", duration: 180, url: s.trackUrl, artwork: s.albumArt,
                              }))}
                              currentIndex={index}
                            />
                          </motion.div>
                        ))}
                        {filteredSongs.length > 100 && (
                          <p className="text-center text-xs text-muted-foreground py-4">
                            Showing first 100 of {filteredSongs.length} songs. Search to find more.
                          </p>
                        )}
                      </div>
                    )}
                  </motion.section>
                )}

                {/* Playlists */}
                {libraryTab === "playlists" && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="mt-5"
                  >
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h3 className="text-lg font-semibold text-foreground">Your Playlists</h3>
                      <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-primary gap-1">
                            <Plus className="w-4 h-4" /> Create New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Playlist</DialogTitle>
                            <DialogDescription>Organize your favorite music</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="playlist-name">Playlist Name</Label>
                              <Input id="playlist-name" value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)} placeholder="Enter playlist name" />
                            </div>
                            <div>
                              <Label htmlFor="playlist-desc">Description (optional)</Label>
                              <Textarea id="playlist-desc" value={newPlaylistDescription}
                                onChange={e => setNewPlaylistDescription(e.target.value)} placeholder="Enter description" />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsCreatePlaylistOpen(false)}>Cancel</Button>
                              <Button onClick={handleCreatePlaylist}>Create</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory scroll-smooth">
                      {playlists.map(pl => (
                        <div key={pl.id} className="snap-start flex-shrink-0 w-[200px]">
                          <FeaturedPlaylist
                            title={pl.title} description={pl.description}
                            image={pl.image} songCount={pl.songCount}
                            onClick={() => handlePlaylistClick(pl)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Liked Songs */}
                {libraryTab === "liked" && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="px-4 mt-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">Liked Songs</h3>
                      <span className="text-sm text-muted-foreground">{likedSongs.length} songs</span>
                    </div>
                    {likedSongs.length > 0 ? (
                      <div className="space-y-2">
                        {likedSongs.map((song, index) => (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.04 }}
                          >
                            <SongCard
                              title={song.title} artist={song.artist} albumArt={song.albumArt}
                              duration={song.duration}
                              isPlaying={currentTrack?.title === song.title && currentTrack?.artist === song.artist}
                              trackUrl={song.trackUrl}
                              playlist={likedSongs.map(s => ({
                                id: s.id, title: s.title, artist: s.artist,
                                album: "Liked Songs", duration: 180, url: s.trackUrl, artwork: s.albumArt,
                              }))}
                              currentIndex={index}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="font-semibold mb-2 text-foreground">No liked songs yet</h4>
                        <p className="text-muted-foreground text-sm">Songs you like will appear here</p>
                      </div>
                    )}
                  </motion.section>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════ DISCOVER MODE ══════════════════ */}
          <AnimatePresence mode="wait">
            {activeMode === "discover" && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {/* Always-visible Search Bar */}
                <motion.section
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                  className="px-4 mt-5"
                >
                  <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search songs, artists, playlists..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Popular Artists Chips */}
                  <div className="flex flex-wrap gap-2">
                    {["Beyoncé", "Kendrick Lamar", "Wizkid", "Drake", "Burna Boy"].map(artist => (
                      <button
                        key={artist}
                        onClick={() => setSearchQuery(artist)}
                        className="px-3 py-1.5 rounded-full text-xs bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/40 transition-all"
                      >
                        {artist}
                      </button>
                    ))}
                  </div>
                </motion.section>

                {/* Results: MusicSearch (when typing) or MusicDiscovery (when idle) */}
                {searchQuery.trim() ? (
                  <motion.section
                    key="search-results"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="px-4 mt-5"
                  >
                    <MusicSearch query={debouncedSearchQuery} />
                  </motion.section>
                ) : (
                  <motion.section
                    key="discovery"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="px-4 mt-5"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" /> Trending & Curated
                    </h3>
                    <MusicDiscovery />
                  </motion.section>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════ FIXED BOTTOM MEDIA CONTROLS ══════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border cursor-pointer"
            onClick={() => setShowFullPlayer(true)}
          >
            <MediaControls showDeviceControls />
          </motion.div>

          {/* Hidden nav dot indicator */}
          {!showBottomNav && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed bottom-20 left-0 right-0 z-20 flex justify-center pointer-events-none"
            >
              <div className="bg-secondary/20 backdrop-blur-sm rounded-full p-2">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
            </motion.div>
          )}

          <div className="pb-36" />
        </div>
      )}

      {/* ══════════════ OVERLAYS ══════════════ */}
      <FullPlayer open={showFullPlayer} onOpenChange={setShowFullPlayer} />
    </Layout>
  );
};

export default Music;
