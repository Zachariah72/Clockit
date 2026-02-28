import React from 'react';
import { motion } from 'motion/react';
import { Play, Heart, MessageCircle } from 'lucide-react';

const REELS = [
  { 
    id: '1', 
    title: 'Vibes on vibes 🇳🇬', 
    views: '1.2M', 
    thumbnail: 'https://picsum.photos/seed/dance1/300/500',
    user: '@poco_lee'
  },
  { 
    id: '2', 
    title: 'New dance challenge?', 
    views: '856K', 
    thumbnail: 'https://picsum.photos/seed/dance2/300/500',
    user: '@kamo_mphela'
  },
  { 
    id: '3', 
    title: 'Studio sessions 🎹', 
    views: '2.1M', 
    thumbnail: 'https://picsum.photos/seed/studio/300/500',
    user: '@sarz'
  },
];

export const ReelsSection = () => {
  return (
    <section className="py-6">
      <div className="px-6 mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif italic text-pink-400">Clockit Reels</h2>
          <p className="text-cream-100/60 text-sm">Short vibes, big energy</p>
        </div>
      </div>

      <div className="flex overflow-x-auto px-6 gap-4 hide-scrollbar snap-x">
        {REELS.map((reel, index) => (
          <motion.div
            key={reel.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-none w-40 h-64 snap-center relative rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img 
              src={reel.thumbnail} 
              alt={reel.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Play size={20} fill="currentColor" className="text-white ml-1" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-xs font-medium text-white mb-1 truncate">{reel.user}</p>
              <p className="text-[10px] text-white/80 line-clamp-2 mb-2">{reel.title}</p>
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span className="text-[10px]">{reel.views}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
