import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Trash2, Music as MusicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DownloadedMusic = () => {
  const navigate = useNavigate();
  const { cachedTracks, playTrack } = useMediaPlayer();
  const [downloadedSongs, setDownloadedSongs] = useState<any[]>([]);

  // Mock data for downloaded songs - in real app, this would come from a proper data source
  useEffect(() => {
    // For now, we'll show some mock downloaded songs
    // In a real implementation, you'd fetch songs based on cachedTracks
    const mockDownloadedSongs = [
      { id: "7", title: "God Is The Greatest", artist: "Vybz Kartel", albumArt: "/api/placeholder/60/60", duration: "3:30", genre: "Reggae/Dancehall", trackUrl: "/assets/Vybz Kartel - God Is The Greatest (Official Music Video) - VybzKartelVEVO.mp3" },
      { id: "8", title: "Crocodile Teeth", artist: "Skillibeng", albumArt: "/api/placeholder/60/60", duration: "2:45", genre: "Reggae/Dancehall", trackUrl: "/assets/Skillibeng - Crocodile Teeth (Official Music Video) - SkillibengVEVO.mp3" },
      { id: "9", title: "Let Go", artist: "Central Cee", albumArt: "/api/placeholder/60/60", duration: "2:55", genre: "Hip-Hop/Rap", trackUrl: "/assets/Central Cee - Let Go [Music Video] - Central Cee.mp3" },
      { id: "13", title: "Halo (Extended Version)", artist: "Beyoncé", albumArt: "/api/placeholder/60/60", duration: "4:25", genre: "Pop", trackUrl: "/assets/halo - by beyonce (extended version) - Cristian Daniel Gonzalez Várgas 6-B.mp3" },
    ];

    setDownloadedSongs(mockDownloadedSongs);
  }, [cachedTracks]);

  const handlePlaySong = (song: any) => {
    const trackData = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: "Downloaded Music",
      duration: 180, // Mock duration in seconds
      url: song.trackUrl,
      artwork: song.albumArt,
    };

    playTrack(trackData);
    toast.success(`Playing "${song.title}"`);
  };

  const handleRemoveDownload = (songId: string, songTitle: string) => {
    // In a real implementation, this would remove from cache
    setDownloadedSongs(prev => prev.filter(song => song.id !== songId));
    toast.success(`"${songTitle}" removed from downloads`);
  };

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
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Downloaded Music</h1>
            </div>
            <p className="text-muted-foreground">
              {downloadedSongs.length} downloaded {downloadedSongs.length === 1 ? 'song' : 'songs'} • Ready for offline listening
            </p>
          </div>
        </motion.header>

        {/* Content */}
        <div className="px-4 mt-6">
          {downloadedSongs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-6">
                <MusicIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Downloaded Music</h3>
              <p className="text-muted-foreground mb-6">
                Download songs from the music player to listen offline
              </p>
              <Button onClick={() => navigate('/music')} className="gap-2">
                <MusicIcon className="w-4 h-4" />
                Browse Music
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Your Downloads</h3>
                <span className="text-sm text-muted-foreground">
                  {downloadedSongs.length} {downloadedSongs.length === 1 ? 'track' : 'tracks'}
                </span>
              </div>

              {downloadedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <img
                    src={song.albumArt}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{song.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{song.duration}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaySong(song)}
                      className="w-8 h-8 p-0 rounded-full hover:bg-primary/20"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDownload(song.id, song.title)}
                      className="w-8 h-8 p-0 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for media controls */}
        <div className="pb-32"></div>
      </div>
    </Layout>
  );
};

export default DownloadedMusic;