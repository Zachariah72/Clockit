import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Play, Music, Loader2, Headphones } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface MusicTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
}

const MusicSearch: React.FC = () => {
  const { playTrack } = useMediaPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState<MusicTrack[]>([]);
  const [lastfmResults, setLastfmResults] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<'spotify' | 'lastfm'>('spotify');

  const searchMusic = async (query: string, service: 'spotify' | 'lastfm' = activeService) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = service === 'spotify' ? '/api/spotify/search' : '/api/lastfm/search';
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&limit=20`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.tracks?.items) {
        if (service === 'spotify') {
          setSpotifyResults(data.tracks.items);
        } else {
          setLastfmResults(data.tracks.items);
        }
      } else {
        if (service === 'spotify') {
          setSpotifyResults([]);
        } else {
          setLastfmResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search music. Please try again.');
      if (service === 'spotify') {
        setSpotifyResults([]);
      } else {
        setLastfmResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: MusicTrack) => {
    const mediaTrack = {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms / 1000,
      url: track.preview_url || '', // Use preview URL (30s clip)
      artwork: track.album.images[0]?.url,
      source: 'local' as const, // Since we're using preview URLs
    };
    playTrack(mediaTrack);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMusic(searchQuery, activeService);
  };

  const getCurrentResults = () => {
    return activeService === 'spotify' ? spotifyResults : lastfmResults;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Music Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Tabs */}
        <Tabs value={activeService} onValueChange={(value) => setActiveService(value as 'spotify' | 'lastfm')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Spotify
            </TabsTrigger>
            <TabsTrigger value="lastfm" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Last.fm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spotify" className="space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Search for songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="lastfm" className="space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Search for songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {getCurrentResults().map((track) => (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => handlePlayTrack(track)}
              >
                <img
                  src={track.album.images[0]?.url || '/placeholder.svg'}
                  alt={track.album.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {track.album.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatDuration(track.duration_ms)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    className="p-2"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {getCurrentResults().length === 0 && !loading && searchQuery && !error && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Try searching for a different song or artist
              </p>
            </div>
          )}

          {!searchQuery && !loading && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Search for your favorite music</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Discover music from {activeService === 'spotify' ? 'Spotify' : 'Last.fm'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MusicSearch;