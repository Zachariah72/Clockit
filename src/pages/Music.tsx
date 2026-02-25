import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Shuffle, Play, ListMusic, Heart, Clock,
  Music as MusicIcon, TrendingUp, Moon, Zap, Smile,
  Frown, Dumbbell, Star, Plus, Users, Radio, ArrowLeft,
  Bell, Check, X, Hash, Film, User, ImagePlus, Video, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/music/SongCard";
import { FeaturedPlaylist } from "@/components/music/FeaturedPlaylist";
import MusicSearch from "@/components/music/MusicSearch";
import MusicDiscovery from "@/components/music/MusicDiscovery";
import { MediaControls } from "@/components/media/MediaControls";
import { FullPlayer } from "@/components/music/FullPlayer";
import { StoriesRow } from "@/components/stories/StoriesRow";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { StoryCreator } from "@/components/stories/StoryCreator";
import { getApiUrl } from "@/utils/api";
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
  { id: "1", title: "Chill Vibes", description: "Relax and unwind with these smooth beats", image: album2, songCount: 45 },
  { id: "2", title: "Night Drive", description: "Perfect for late night cruising", image: album3, songCount: 32 },
  { id: "3", title: "Energy Boost", description: "Get pumped with high energy tracks", image: album1, songCount: 28 },
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
const Music = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Active mode ───────────────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<"foryou" | "library" | "discover">("foryou");
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

  // ── Social/Home state (from original Index.tsx) ───────────────────────────
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [stories, setStories] = useState([
    { id: "1", username: "Sarah", image: avatar1, hasUnseenStory: true },
    { id: "2", username: "Mike", image: avatar2, hasUnseenStory: true },
    { id: "3", username: "Alex", image: avatar3, hasUnseenStory: true },
    { id: "4", username: "Emma", image: avatar1, hasUnseenStory: false },
    { id: "5", username: "Jake", image: avatar2, hasUnseenStory: false },
    { id: "6", username: "Lily", image: avatar3, hasUnseenStory: true },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "new_release", message: "New album \"Midnight Waves\" by Synthwave is now available!", isRead: false, time: "2m ago" },
    { id: 2, type: "follow", message: "DJ Beats started following you", isRead: false, time: "15m ago" },
    { id: 3, type: "like", message: "Someone liked your playlist \"Chill Mix\"", isRead: true, time: "1h ago" },
    { id: 4, type: "message", message: "New message from MusicLover", isRead: false, time: "2h ago" },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Computed ──────────────────────────────────────────────────────────────
  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = !searchQuery.trim() ||
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
    const matchesMood = selectedMood === "All" || song.mood === selectedMood;
    return matchesSearch && matchesGenre && matchesMood;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDuration = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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

  // ── Fetch stories ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await fetch(`${getApiUrl()}/stories`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setStories(data.map((s: any) => ({
            id: s._id,
            username: s.userId?.username || "Unknown",
            image: s.mediaUrl,
            hasUnseenStory: true,
          })));
        }
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };
    fetchStories();
  }, []);

  // ── Fetch tracks from SoundCloud ──────────────────────────────────────────
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/soundcloud/search?q=chill&limit=20`);
        if (!res.ok) { setAllSongs([]); return; }
        const tracks = await res.json();
        if (!Array.isArray(tracks) || tracks.length === 0) { setAllSongs([]); return; }
        setAllSongs(
          tracks
            .filter((t: any) => t && t.id && t.title && t.artist)
            .map((t: any) => ({
              id: t.id.toString(),
              title: t.title,
              artist: typeof t.artist === "string" ? t.artist : t.artist?.name || "Unknown Artist",
              albumArt: t.albumArt || t.artwork_url || album1,
              duration: t.duration ? formatDuration(t.duration) : "3:00",
              genre: t.genre || "Chill",
              mood: t.mood || "Chill",
              trackUrl: t.stream_url ? `${apiBase}${t.stream_url}` : "",
            }))
        );
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setAllSongs([]);
      }
    };
    fetchTracks();
  }, []);

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

  // ── Story handlers ────────────────────────────────────────────────────────
  const handleStoryClick = (id: string) => { setSelectedStoryId(id); setIsStoryViewerOpen(true); };
  const handleCreateStory = () => setIsStoryCreatorOpen(true);
  const handleStoryViewed = (id: string) =>
    setStories(prev => prev.map(s => s.id === id ? { ...s, hasUnseenStory: false } : s));

  const handleStoryCreated = async (media: File, type: "image" | "video") => {
    try {
      setIsStoryCreatorOpen(false);
      const formData = new FormData();
      formData.append("media", media);
      const token = localStorage.getItem("auth_token");
      const apiUrl = getApiUrl();
      const uploadRes = await fetch(`${apiUrl}/stories/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const createRes = await fetch(`${apiUrl}/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", mediaUrl: uploadData.mediaUrl, type, isPrivate: false }),
      });
      if (!createRes.ok) throw new Error("Create story failed");
      const newStory = await createRes.json();
      setStories(prev => [{ id: newStory._id, username: "You", image: newStory.mediaUrl, hasUnseenStory: true }, ...prev]);
      alert("Story created successfully!");
    } catch (err) {
      console.error("Error creating story:", err);
      alert("Failed to create story. Please try again.");
    }
  };

  // ── Notification handlers ─────────────────────────────────────────────────
  const markAsRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setIsNotificationsOpen(false);
  };

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

  // ── PlaylistView ──────────────────────────────────────────────────────────
  const PlaylistView = ({ playlist }: { playlist: any }) => (
    <Layout hideBottomNav={!showBottomNav}>
      <div className="min-h-screen bg-background overflow-x-hidden">
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
        <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">

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

                  {/* Bell + Notifications dropdown */}
                  <div className="relative" ref={notificationRef}>
                    <Button variant="ghost" size="icon" className="relative touch-manipulation"
                      onClick={() => setIsNotificationsOpen(v => !v)}>
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-12 right-0 w-72 max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg z-50"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">Notifications</h3>
                              {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                                  <Check className="w-3 h-3 mr-1" /> Mark all read
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {notifications.map(n => (
                                <motion.div
                                  key={n.id}
                                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                  className={`p-3 rounded-xl cursor-pointer transition-colors ${n.isRead ? "bg-muted/30" : "bg-primary/10 border border-primary/20"}`}
                                  onClick={() => markAsRead(n.id)}
                                >
                                  <p className="text-sm">{n.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                                  {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                                </motion.div>
                              ))}
                              {notifications.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                    onClick={() => setActiveMode(mode.key as any)}
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
                {/* Stories Row */}
                <motion.section
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                  className="mt-4"
                >
                  <StoriesRow stories={stories} onStoryClick={handleStoryClick} onCreateStory={handleCreateStory} />
                </motion.section>

                {/* Hero Banner — exact copy from Index.tsx */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="px-4 mt-6"
                >
                  <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
                    <img src={heroMusic} alt="Featured" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Trending Now
                      </span>
                      <h2 className="text-xl font-bold text-foreground mt-1">
                        Discover New Sounds
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Fresh drops every week
                      </p>
                    </div>
                  </div>
                </motion.section>

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
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
                    {featuredPlaylistsMock.map(pl => (
                      <div key={pl.id} className="snap-start flex-shrink-0 w-[200px]">
                        <FeaturedPlaylist
                          title={pl.title} description={pl.description}
                          image={pl.image} songCount={pl.songCount}
                          onClick={() => handleFeaturedPlaylistClick(pl.id)}
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
                    {[
                      { name: "Chill Session", members: 3, status: "Now playing", color: "bg-primary/20", textColor: "text-primary" },
                      { name: "Workout Mix", members: 5, status: "Paused", color: "bg-secondary/20", textColor: "text-secondary" },
                    ].map(group => (
                      <div key={group.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                        <div className={`w-10 h-10 ${group.color} rounded-full flex items-center justify-center`}>
                          <Users className={`w-5 h-5 ${group.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.members} members • {group.status}</p>
                        </div>
                        <Button variant="outline" size="sm">Join</Button>
                      </div>
                    ))}
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
                    {recentSongs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.07 }}
                      >
                        <SongCard
                          title={song.title} artist={song.artist} albumArt={song.albumArt}
                          duration={song.duration} isPlaying={index === 0}
                          onClick={() => { setActiveMode("library"); setLibraryTab("all"); }}
                          trackUrl={song.trackUrl}
                          playlist={recentSongs.map(s => ({
                            id: `${s.title}-${s.artist}`, title: s.title, artist: s.artist,
                            album: "Recently Played", duration: 180, url: s.trackUrl, artwork: s.albumArt,
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
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {moodModes.map(mood => (
                      <Button
                        key={mood.key}
                        variant={selectedMood === mood.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMood(mood.key)}
                        className={`gap-1.5 flex-shrink-0 ${mood.key === "All" && selectedMood === "All" ? mood.textColor : ""}`}
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
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 font-medium transition-all duration-200 ${selectedGenre === genre
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
                        {filteredSongs.map((song, index) => (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.04 }}
                          >
                            <SongCard
                              title={song.title} artist={song.artist} albumArt={song.albumArt}
                              duration={song.duration} isPlaying={index === 0} trackUrl={song.trackUrl}
                              playlist={filteredSongs.map(s => ({
                                id: `${s.title}-${s.artist}`, title: s.title, artist: s.artist,
                                album: "Clockit", duration: 180, url: s.trackUrl, artwork: s.albumArt,
                              }))}
                              currentIndex={index}
                            />
                          </motion.div>
                        ))}
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
                              <Button onClick={() => {
                                console.log("Create playlist:", newPlaylistName, newPlaylistDescription);
                                setNewPlaylistName(""); setNewPlaylistDescription(""); setIsCreatePlaylistOpen(false);
                              }}>Create</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
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
                      <span className="text-sm text-muted-foreground">0 songs</span>
                    </div>
                    <div className="text-center py-16">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="font-semibold mb-2 text-foreground">No liked songs yet</h4>
                      <p className="text-muted-foreground text-sm">Songs you like will appear here</p>
                    </div>
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
                    <MusicSearch />
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

          {/* ══════════════ FLOATING FAB (bottom-right) ══════════════ */}
          <div className="fixed bottom-24 right-4 z-40" data-fab>
            <AnimatePresence>
              {isFabOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute bottom-16 right-0 w-52 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden"
                  data-fab
                >
                  <div className="p-2 space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wide">Create</p>
                    {[
                      { label: "Reel", desc: "Create a new reel", icon: Video, color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-500", action: () => navigate("/reels") },
                      { label: "Story", desc: "Share a story", icon: ImagePlus, color: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-500", action: () => { setIsFabOpen(false); handleCreateStory(); } },
                      { label: "Group", desc: "Start a listening group", icon: Users, color: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-500", action: () => navigate("/groups") },
                      { label: "Go Live", desc: "Start live stream", icon: Radio, color: "from-red-500/20 to-rose-500/20", iconColor: "text-red-500", action: () => navigate("/live") },
                    ].map(item => (
                      <button
                        key={item.label}
                        data-fab
                        onClick={() => { setIsFabOpen(false); item.action(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-left"
                      >
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
              data-fab
              onClick={() => setIsFabOpen(v => !v)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-primary-foreground"
            >
              <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </div>

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
      <StoryViewer
        isOpen={isStoryViewerOpen}
        onClose={() => setIsStoryViewerOpen(false)}
        initialStoryId={selectedStoryId || undefined}
        stories={stories}
        onStoryViewed={handleStoryViewed}
      />
      <StoryCreator
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        onStoryCreated={handleStoryCreated}
      />
      <FullPlayer open={showFullPlayer} onOpenChange={setShowFullPlayer} />
    </Layout>
  );
};

export default Music;
