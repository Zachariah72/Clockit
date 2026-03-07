import React from 'react';
import { motion } from 'motion/react';
import { Share2 } from 'lucide-react'; // Removed Play and other icons

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
}

const TRENDING_SONGS: Song[] = [
  // ... your songs array remains the same
];

export const TrendingSection = () => {
  // Remove any handlePlay functions or navigation logic

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
            // Remove cursor-pointer if you don't want any click interaction
            className="flex-none w-48 snap-start"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg shadow-black/20">
              <img 
                src={song.cover} 
                alt={song.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* REMOVED: The entire overlay div with play button */}
              {/* No hover effects, no play button, just the image */}
            </div>
            <h3 className="font-medium text-cream-50 truncate">{song.title}</h3>
            <div className="flex justify-between items-center">
              <p className="text-sm text-cream-100/60 truncate">{song.artist}</p>
              {/* Optional: Keep or remove share button based on your needs */}
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