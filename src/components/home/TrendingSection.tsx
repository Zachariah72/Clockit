import React from 'react';
import { motion } from 'motion/react';
import { Play, Heart, Share2, MessageCircle } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
}

const TRENDING_SONGS: Song[] = [
  {
    id: '1',
    title: 'City Boys',
    artist: 'Burna Boy 🇳🇬',
    cover: 'https://picsum.photos/seed/burna/300/300',
    duration: '3:33'
  },
  {
    id: '2',
    title: 'Me & U',
    artist: 'Tems 🇳🇬',
    cover: 'https://picsum.photos/seed/tems/300/300',
    duration: '3:12'
  },
  {
    id: '3',
    title: 'Water',
    artist: 'Tyla 🇿🇦',
    cover: 'https://picsum.photos/seed/tyla/300/300',
    duration: '3:20'
  },
  {
    id: '4',
    title: 'Kaskie Vibaya',
    artist: 'Fathermoh 🇰🇪',
    cover: 'https://picsum.photos/seed/kaskie/300/300',
    duration: '4:15'
  },
  {
    id: '5',
    title: 'Terminator',
    artist: 'King Promise 🇬🇭',
    cover: 'https://picsum.photos/seed/promise/300/300',
    duration: '3:45'
  },
  {
    id: '6',
    title: 'Soweto',
    artist: 'Victony 🇳🇬',
    cover: 'https://picsum.photos/seed/victony/300/300',
    duration: '2:40'
  },
  {
    id: '7',
    title: 'Amapiano',
    artist: 'Asake 🇳🇬',
    cover: 'https://picsum.photos/seed/asake/300/300',
    duration: '2:38'
  },
  {
    id: '8',
    title: 'Inama',
    artist: 'Diamond Platnumz 🇹🇿',
    cover: 'https://picsum.photos/seed/diamond/300/300',
    duration: '3:30'
  }
];

export const TrendingSection = () => {
  return (
    <section className="py-8">
      <div className="px-6 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif italic text-clay-400">Trending Now</h2>
          <p className="text-cream-100/60 text-sm">The heartbeat of Lagos & beyond</p>
        </div>
        <button className="text-xs uppercase tracking-widest text-clay-400 hover:text-clay-500 transition-colors">
          View All
        </button>
      </div>

      <div className="flex overflow-x-auto px-6 gap-6 pb-8 hide-scrollbar snap-x">
        {TRENDING_SONGS.map((song, index) => (
          <motion.div 
            key={song.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-none w-48 snap-start group cursor-pointer"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg shadow-black/20">
              <img 
                src={song.cover} 
                alt={song.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-12 h-12 bg-clay-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
            </div>
            <h3 className="font-medium text-cream-50 truncate">{song.title}</h3>
            <div className="flex justify-between items-center">
              <p className="text-sm text-cream-100/60 truncate">{song.artist}</p>
              <button className="text-cream-100/40 hover:text-clay-400 transition-colors p-1">
                <Share2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
