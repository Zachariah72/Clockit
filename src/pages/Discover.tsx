import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { RightPanel } from '@/components/layout/RightPanel';
import { Play, TrendingUp, Sparkles, Globe, Heart } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

const GENRES = [
  { id: 1, name: 'Afrobeats', color: 'from-orange-500 to-pink-500', image: 'https://picsum.photos/seed/afro/300/300' },
  { id: 2, name: 'Amapiano', color: 'from-purple-500 to-blue-500', image: 'https://picsum.photos/seed/amapiano/300/300' },
  { id: 3, name: 'Hip Hop', color: 'from-red-500 to-yellow-500', image: 'https://picsum.photos/seed/hiphop/300/300' },
  { id: 4, name: 'R&B', color: 'from-pink-500 to-purple-500', image: 'https://picsum.photos/seed/rnb/300/300' },
  { id: 5, name: 'Reggae', color: 'from-green-500 to-yellow-500', image: 'https://picsum.photos/seed/reggae/300/300' },
  { id: 6, name: 'House', color: 'from-cyan-500 to-blue-500', image: 'https://picsum.photos/seed/house/300/300' },
];

const TRENDING_ARTISTS = [
  { id: 1, name: 'WizKid', genre: 'Afrobeats', image: 'https://picsum.photos/seed/wizkid/200/200', followers: '12.4M' },
  { id: 2, name: 'Tyla', genre: 'Amapiano', image: 'https://picsum.photos/seed/tyla/200/200', followers: '8.2M' },
  { id: 3, name: 'Burna Boy', genre: 'Afrobeats', image: 'https://picsum.photos/seed/burna/200/200', followers: '15.8M' },
  { id: 4, name: 'Black Coffee', genre: 'House', image: 'https://picsum.photos/seed/coffee/200/200', followers: '6.9M' },
  { id: 5, name: 'Tems', genre: 'R&B', image: 'https://picsum.photos/seed/tems/200/200', followers: '9.1M' },
  { id: 6, name: 'Davido', genre: 'Afrobeats', image: 'https://picsum.photos/seed/davido/200/200', followers: '11.5M' },
];

const NEW_RELEASES = [
  {
    id: 1,
    title: 'Love, Damini',
    artist: 'Burna Boy',
    image: 'https://picsum.photos/seed/damini/300/300',
    type: 'Album',
    releaseDate: '2024-03-01',
  },
  {
    id: 2,
    title: 'Water (Remix)',
    artist: 'Tyla ft. Travis Scott',
    image: 'https://picsum.photos/seed/water/300/300',
    type: 'Single',
    releaseDate: '2024-02-28',
  },
  {
    id: 3,
    title: 'Made in Lagos Deluxe',
    artist: 'WizKid',
    image: 'https://picsum.photos/seed/lagos/300/300',
    type: 'Album',
    releaseDate: '2024-02-25',
  },
];

const FEATURED_PLAYLISTS = [
  {
    id: 1,
    title: 'Afrobeats Essentials',
    description: 'The biggest Afrobeats hits',
    image: 'https://picsum.photos/seed/afroessentials/300/300',
    curator: 'Clockit',
  },
  {
    id: 2,
    title: 'Amapiano Vibes',
    description: 'Best of South African house',
    image: 'https://picsum.photos/seed/amapiano/300/300',
    curator: 'Clockit',
  },
  {
    id: 3,
    title: 'Naija Heat',
    description: 'Hottest Nigerian tracks',
    image: 'https://picsum.photos/seed/naija/300/300',
    curator: 'Clockit',
  },
  {
    id: 4,
    title: 'Late Night Drive',
    description: 'Smooth vibes for the road',
    image: 'https://picsum.photos/seed/latenight/300/300',
    curator: 'Clockit',
  },
];

const Discover = () => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const { playTrack } = useMediaPlayer();

  const handlePlaySample = () => {
    playTrack({
      id: '1',
      title: 'Essence',
      artist: 'WizKid ft. Tems',
      album: 'Made in Lagos',
      artwork: 'https://picsum.photos/seed/wizkid/300/300',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 240,
    });
    setIsPlayerOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-cream-50">
      <Sidebar />

      <div className="flex justify-center md:pl-[244px] lg:pr-[320px]">
        <main className="w-full max-w-[630px] min-h-screen pb-32 md:py-8 px-0 md:px-4">
          
          {/* Header */}
          <div className="mb-8 px-4 md:px-0 pt-4 md:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
            <p className="text-cream-100/60 text-sm">Explore new music and artists from across Africa</p>
          </div>

          {/* Browse by Genre */}
          <section className="mb-10 px-4 md:px-0">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Browse by Genre</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((genre) => (
                <div
                  key={genre.id}
                  className="relative h-28 rounded-xl overflow-hidden cursor-pointer group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                  <img 
                    src={genre.image} 
                    alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="relative h-full flex items-end p-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{genre.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Artists */}
          <section className="mb-10 px-4 md:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Trending Artists</h2>
              </div>
              <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                See all
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {TRENDING_ARTISTS.map((artist) => (
                <div
                  key={artist.id}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-full aspect-square mb-3 rounded-full overflow-hidden">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center">
                        <Play size={20} className="text-cocoa-950 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white text-center line-clamp-1">{artist.name}</h3>
                  <p className="text-xs text-cream-100/60">{artist.genre}</p>
                  <p className="text-xs text-cream-100/50">{artist.followers}</p>
                </div>
              ))}
            </div>
          </section>

          {/* New Releases */}
          <section className="mb-10 px-4 md:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">New Releases</h2>
              </div>
              <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                See all
              </button>
            </div>
            
            <div className="space-y-4">
              {NEW_RELEASES.map((release) => (
                <div
                  key={release.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <img 
                      src={release.image} 
                      alt={release.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
                        <Play size={16} className="text-cocoa-950 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{release.title}</h3>
                    <p className="text-xs text-cream-100/60">{release.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full">
                        {release.type}
                      </span>
                      <span className="text-xs text-cream-100/50">
                        {new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <Heart size={20} className="text-cream-100/40 hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          </section>

          {/* Featured Playlists */}
          <section className="mb-10 px-4 md:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Featured Playlists</h2>
              </div>
              <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                See all
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {FEATURED_PLAYLISTS.map((playlist) => (
                <div
                  key={playlist.id}
                  className="cursor-pointer group"
                  onClick={handlePlaySample}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img 
                      src={playlist.image} 
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center shadow-xl">
                        <Play size={24} className="text-cocoa-950 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{playlist.title}</h3>
                  <p className="text-xs text-cream-100/60 line-clamp-1">{playlist.description}</p>
                  <p className="text-xs text-cream-100/50 mt-1">By {playlist.curator}</p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden max-w-2xl mx-auto fixed bottom-0 left-0 right-0 pointer-events-none z-50">
        <div className="pointer-events-auto">
          <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
          <BottomNav />
        </div>
      </div>

      {/* Desktop Right Panel */}
      <RightPanel />
    </div>
  );
};

export default Discover;