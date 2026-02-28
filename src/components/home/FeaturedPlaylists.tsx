import React from 'react';
import { Play } from 'lucide-react';

const PLAYLISTS = [
  {
    id: 1,
    title: 'Chill Vibes',
    description: 'Relax and unwind with these smooth beats',
    count: '45 songs',
    image: 'https://picsum.photos/seed/chill/400/500'
  },
  {
    id: 2,
    title: 'Night Drive',
    description: 'Perfect for late night cruising',
    count: '32 songs',
    image: 'https://picsum.photos/seed/night/400/500'
  },
  {
    id: 3,
    title: 'Afro Heat',
    description: 'The hottest tracks from the continent',
    count: '50 songs',
    image: 'https://picsum.photos/seed/afro/400/500'
  }
];

export const FeaturedPlaylists = () => {
  return (
    <section className="px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Featured Playlists</h2>
        <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300">See all</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {PLAYLISTS.map((playlist) => (
          <div 
            key={playlist.id}
            className="relative flex-shrink-0 w-[280px] aspect-[4/5] rounded-3xl overflow-hidden group cursor-pointer snap-center shadow-lg shadow-black/20"
          >
            <img 
              src={playlist.image} 
              alt={playlist.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-white mb-1">{playlist.title}</h3>
              <p className="text-cream-100/60 text-sm mb-4 line-clamp-2">{playlist.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-cream-100/40">{playlist.count}</span>
                <button className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-cocoa-950 hover:scale-110 transition-transform shadow-lg shadow-cyan-400/20">
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
