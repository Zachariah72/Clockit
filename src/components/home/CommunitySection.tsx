import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Users, Hash, Heart } from 'lucide-react';

const TOPICS = [
  { id: 1, tag: '#AfroBeatsDaily', title: 'Is Amapiano taking over the world? 🇿🇦', active: 1240 },
  { id: 2, tag: '#LagosLife', title: 'Best spots for live music this weekend? 🇳🇬', active: 856 },
  { id: 3, tag: '#GhanaJollof', title: 'The eternal debate continues... 🇬🇭', active: 2300 },
  { id: 4, tag: '#KigaliVibes', title: 'Rwanda\'s rising hip-hop scene 🇷🇼', active: 420 },
  { id: 5, tag: '#NairobiNights', title: 'Gengetone vs Afro-pop: What\'s next? 🇰🇪', active: 675 },
  { id: 6, tag: '#LuandaSounds', title: 'Kizomba or Semba for the weekend? 🇦🇴', active: 390 },
  { id: 7, tag: '#AccraChills', title: 'Highlife evolution in 2024 🇬🇭', active: 512 },
  { id: 8, tag: '#JoburgHouse', title: 'Deep House culture in SA 🇿🇦', active: 980 },
];

export const CommunitySection = () => {
  return (
    <section className="px-6 py-8 bg-gradient-to-b from-transparent to-cocoa-900/50">
      <div className="mb-8">
        <h2 className="text-2xl font-serif italic text-teal-400 mb-2">The Village Square</h2>
        <p className="text-cream-100/60 text-sm max-w-md">
          Join the conversation. Connect with the culture. Share your rhythm.
        </p>
      </div>

      <div className="grid gap-4">
        {TOPICS.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full">
                {topic.tag}
              </span>
              <div className="flex items-center gap-1 text-xs text-cream-100/40">
                <Users size={12} />
                <span>{topic.active} online</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-cream-50 mb-3 group-hover:text-teal-200 transition-colors">
              {topic.title}
            </h3>
            <div className="flex items-center gap-4 text-cream-100/40">
              <button className="flex items-center gap-1 text-xs hover:text-white transition-colors">
                <MessageCircle size={14} />
                <span>Join Chat</span>
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-pink-400 transition-colors">
                <Heart size={14} />
                <span>Like</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
