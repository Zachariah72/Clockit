import React from 'react';
import { motion } from 'motion/react';
import { Music2, ArrowRight } from 'lucide-react';

const GENRES = [
  { id: '1', name: 'Amapiano', color: 'from-purple-500 to-indigo-500', image: 'https://picsum.photos/seed/amapiano/200/200' },
  { id: '2', name: 'Afrobeats', color: 'from-orange-500 to-red-500', image: 'https://picsum.photos/seed/afrobeats/200/200' },
  { id: '3', name: 'Alté', color: 'from-emerald-500 to-teal-500', image: 'https://picsum.photos/seed/alte/200/200' },
  { id: '4', name: 'Highlife', color: 'from-yellow-500 to-orange-500', image: 'https://picsum.photos/seed/highlife/200/200' },
  { id: '5', name: 'Gengetone', color: 'from-pink-500 to-rose-500', image: 'https://picsum.photos/seed/genge/200/200' },
  { id: '6', name: 'Kizomba', color: 'from-blue-500 to-cyan-500', image: 'https://picsum.photos/seed/kizomba/200/200' },
];

export const GenreSection = () => {
  return (
    <section className="py-6 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif italic text-white">Vibes & Genres</h2>
          <p className="text-cream-100/60 text-sm">Explore the sounds of the continent</p>
        </div>
        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowRight size={20} className="text-cream-100/60" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GENRES.map((genre, index) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative h-24 rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img 
              src={genre.image} 
              alt={genre.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-90`} />
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <span className="font-bold text-lg text-white">{genre.name}</span>
              <Music2 size={16} className="text-white/60" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
