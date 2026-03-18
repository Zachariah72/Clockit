import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStories } from '@/services/api';

const FALLBACK_STORIES = [
  { id: 'me', name: 'My Snap', img: 'https://picsum.photos/seed/me/100/100', isUser: true, hasNew: false },
  { id: '1', name: 'Ayra Starr', img: 'https://picsum.photos/seed/ayra/100/100', hasNew: true },
  { id: '2', name: 'WizKid', img: 'https://picsum.photos/seed/wiz/100/100', hasNew: true },
  { id: '3', name: 'Don Jazzy', img: 'https://picsum.photos/seed/don/100/100', hasNew: true },
  { id: '4', name: 'Tiwa', img: 'https://picsum.photos/seed/tiwa/100/100', hasNew: false },
  { id: '5', name: 'Omah Lay', img: 'https://picsum.photos/seed/omah/100/100', hasNew: true },
];

export const SnappySection = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getStories();
        if (data && data.length > 0) {
          const transformed = data.map((s: any) => ({
            id: s._id,
            name: s.userId?.username || 'User',
            img: s.mediaUrl,
            hasNew: true,
            isUser: false
          }));
          const mySnap = { id: 'me', name: 'My Snap', img: 'https://picsum.photos/seed/me/100/100', isUser: true, hasNew: false };
          setStories([mySnap, ...transformed]);
        } else {
          setStories(FALLBACK_STORIES);
        }
      } catch (err) {
        console.error("Failed to load stories", err);
        setStories(FALLBACK_STORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleStoryClick = () => {
    // Contract: Any click routes to the main /stories page
    navigate('/stories');
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 md:px-0 mb-4">
        <h2 className="text-xl font-bold text-white">Snappy Moments</h2>
        <button 
          className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={() => navigate('/stories')}
        >
          See all
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {loading ? (
          // Skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
              <div className="relative p-[3px] rounded-full bg-white/10">
                <div className="w-16 h-16 rounded-full bg-white/20"></div>
              </div>
              <div className="w-12 h-3 bg-white/20 rounded"></div>
            </div>
          ))
        ) : (
          stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
              onClick={handleStoryClick}
              tabIndex={0}
              role="button"
              aria-label={`Open ${story.name}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleStoryClick(); }}
            >
              <div className={`relative p-[3px] rounded-full ${story.hasNew ? 'bg-gradient-to-tr from-clay-500 via-pink-500 to-yellow-500' : 'bg-white/10'}`}>
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cocoa-950">
                  <img 
                    src={story.img} 
                    alt={story.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {story.isUser && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Plus className="text-white" size={24} />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-cream-100/80 font-medium">{story.name}</span>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

