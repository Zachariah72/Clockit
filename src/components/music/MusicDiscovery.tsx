import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, TrendingUp, Users, Disc, Star, Loader2 } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface LastfmArtist {
  name: string;
  mbid?: string;
  url: string;
  image: Array<{ '#text': string; size: string }>;
  streamable: string;
  ontour: string;
  stats?: {
    listeners: string;
    playcount: string;
  };
  similar?: {
    artist: Array<any>;
  };
  tags?: {
    tag: Array<any>;
  };
  bio?: {
    published: string;
    summary: string;
    content: string;
  };
}

interface LastfmAlbum {
  name: string;
  mbid?: string;
  url: string;
  image: Array<{ '#text': string; size: string }>;
  artist: string | { name: string; mbid?: string; url?: string };
  streamable: string;
  playcount?: string;
}

interface LastfmTrack {
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
    lastfm: string;
  };
  source: string;
}

const MusicDiscovery: React.FC = () => {
  const { playTrack } = useMediaPlayer();
  const [topArtists, setTopArtists] = useState<LastfmArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<LastfmAlbum[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<LastfmTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('artists');

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load top artists
      const artistsResponse = await fetch('/api/lastfm/charts/artists?limit=10');
      const artistsData = await artistsResponse.json();
      setTopArtists(artistsData.artists?.artist || []);

      // Load top albums
      const albumsResponse = await fetch('/api/lastfm/charts/albums?limit=10');
      const albumsData = await albumsResponse.json();
      setTopAlbums(albumsData.albums?.album || []);

      // Load trending tracks
      const tracksResponse = await fetch('/api/lastfm/trending?limit=10');
      const tracksData = await tracksResponse.json();
      setTrendingTracks(tracksData.tracks?.items || []);

    } catch (error) {
      console.error('Error loading discovery data:', error);
      setError('Failed to load music discovery data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: LastfmTrack) => {
    const mediaTrack = {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms / 1000,
      url: track.preview_url || '',
      artwork: track.album.images[0]?.url,
      source: 'local' as const // Last.fm tracks use local playback
    };
    playTrack(mediaTrack);
  };

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading music discovery...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadDiscoveryData}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Music Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Artists
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center gap-2">
              <Disc className="w-4 h-4" />
              Top Albums
            </TabsTrigger>
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Top Artists Tab */}
          <TabsContent value="artists" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {topArtists.map((artist, index) => (
                  <div
                    key={artist.mbid || artist.name}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>

                    <img
                      src={artist.image?.[2]?.['#text'] || '/placeholder.svg'}
                      alt={artist.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
                      {artist.stats && (
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {formatNumber(artist.stats.listeners)} listeners
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(artist.stats.playcount)} plays
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(artist.url, '_blank')}
                    >
                      View on Last.fm
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Top Albums Tab */}
          <TabsContent value="albums" className="mt-6">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topAlbums.map((album, index) => (
                  <div
                    key={album.mbid || `${typeof album.artist === 'object' ? album.artist.name : album.artist}-${album.name}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-secondary/20 rounded-full">
                      <span className="text-xs font-bold">#{index + 1}</span>
                    </div>

                    <img
                      src={album.image?.[2]?.['#text'] || '/placeholder.svg'}
                      alt={album.name}
                      className="w-12 h-12 rounded object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{album.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {typeof album.artist === 'object' ? album.artist.name : album.artist}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(album.url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Trending Tracks Tab */}
          <TabsContent value="tracks" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {trendingTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
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

                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track);
                        }}
                      >
                        <Music className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MusicDiscovery;