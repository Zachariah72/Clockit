import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Pause, Music, ListMusic, TrendingUp } from 'lucide-react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  uri: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

const SpotifyMusic: React.FC = () => {
  const { spotifyTokens, signInWithSpotify } = useAuth();
  const { playTrack, pause, currentTrack, isPlaying } = useMediaPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'playlists' | 'top'>('search');

  useEffect(() => {
    if (spotifyTokens) {
      loadUserData();
    }
  }, [spotifyTokens]);

  const loadUserData = async () => {
    try {
      // Load user playlists
      const playlistsResponse = await fetch('/api/spotify/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: spotifyTokens.accessToken }),
      });
      const playlistsData = await playlistsResponse.json();
      setUserPlaylists(playlistsData.items || []);

      // Load top tracks
      const topTracksResponse = await fetch('/api/spotify/top-tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: spotifyTokens.accessToken }),
      });
      const topTracksData = await topTracksResponse.json();
      setTopTracks(topTracksData.items || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const searchTracks = async (query: string) => {
    if (!query.trim() || !spotifyTokens) return;

    setLoading(true);
    try {
      const response = await fetch('/api/spotify/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, accessToken: spotifyTokens.accessToken }),
      });
      const data = await response.json();
      setSearchResults(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: SpotifyTrack) => {
    const mediaTrack = {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms / 1000,
      url: '',
      artwork: track.album.images[0]?.url,
      spotifyUri: track.uri,
      source: 'spotify' as const
    };
    playTrack(mediaTrack);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!spotifyTokens) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Music className="w-12 h-12 text-gray-400" />
        <h3 className="text-lg font-semibold">Connect to Spotify</h3>
        <p className="text-gray-600 text-center max-w-md">
          Connect your Spotify account to access millions of songs and play them directly in Clockit.
        </p>
        <Button onClick={() => signInWithSpotify()} className="bg-green-600 hover:bg-green-700">
          Connect Spotify
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('search')}
          className="flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button
          variant={activeTab === 'playlists' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('playlists')}
          className="flex-1"
        >
          <ListMusic className="w-4 h-4 mr-2" />
          Playlists
        </Button>
        <Button
          variant={activeTab === 'top' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('top')}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Top Tracks
        </Button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Search Spotify</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTracks(searchQuery)}
                className="flex-1"
              />
              <Button onClick={() => searchTracks(searchQuery)} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <img
                      src={track.album.images[0]?.url || '/placeholder.svg'}
                      alt={track.album.name}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(track.duration_ms)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentTrack?.id === track.id && isPlaying) {
                          pause();
                        } else {
                          handlePlayTrack(track);
                        }
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={playlist.images[0]?.url || '/placeholder.svg'}
                      alt={playlist.name}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {playlist.tracks.total} tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Top Tracks Tab */}
      {activeTab === 'top' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Top Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {topTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="w-8 text-center text-sm font-medium text-gray-500">
                      {index + 1}
                    </div>
                    <img
                      src={track.album.images[0]?.url || '/placeholder.svg'}
                      alt={track.album.name}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentTrack?.id === track.id && isPlaying) {
                          pause();
                        } else {
                          handlePlayTrack(track);
                        }
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpotifyMusic;