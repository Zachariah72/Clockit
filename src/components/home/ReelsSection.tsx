import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

const FALLBACK_REELS = [
  { 
    id: '1', 
    video_id: '1',
    title: 'Vibes on vibes 🇳🇬', 
    thumbnail_url: 'https://picsum.photos/seed/dance1/300/500',
    author: { username: 'poco_lee' },
    stats: { play_count: 1200000, like_count: 50000 }
  },
  { 
    id: '2', 
    video_id: '2',
    title: 'New dance challenge?', 
    thumbnail_url: 'https://picsum.photos/seed/dance2/300/500',
    author: { username: 'kamo_mphela' },
    stats: { play_count: 856000, like_count: 40000 }
  },
  { 
    id: '3', 
    video_id: '3',
    title: 'Studio sessions 🎹', 
    thumbnail_url: 'https://picsum.photos/seed/studio/300/500',
    author: { username: 'sarz' },
    stats: { play_count: 2100000, like_count: 150000 }
  },
];

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num ? num.toString() : '0';
};

export const ReelsSection = () => {
  const navigate = useNavigate();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const data = await api.getPublic<any>('/tiktok/trending');
        if (data && data.videos && data.videos.length > 0) {
          // Send 3 reals for MD grid, let Mobile get up to 10
          setReels(data.videos.slice(0, 10));
        } else {
          setReels(FALLBACK_REELS);
        }
      } catch (err) {
        console.error("Failed to load reels", err);
        setReels(FALLBACK_REELS);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const handleReelClick = (reel: any) => {
    navigate('/reels', { state: { reelId: reel.id || reel.video_id } });
  };

  return (
    <section className="py-6">
      <div className="px-6 mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-pink-400">Clockit Reels</h2>
          <p className="text-cream-100/60 text-sm">Short vibes, big energy</p>
        </div>
      </div>

      <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible px-6 gap-4 md:gap-3 hide-scrollbar snap-x md:snap-none">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-none md:flex-initial w-[calc(50vw-1.5rem)] md:w-full aspect-[9/16] snap-center md:snap-align-none relative rounded-[15px] overflow-hidden bg-white/5 border border-white/10 animate-pulse">
            </div>
          ))
        ) : (
          reels.map((reel, index) => (
            <motion.div
              key={reel.id || index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-none md:flex-initial w-[calc(50vw-1.5rem)] md:w-full aspect-[9/16] relative snap-center md:snap-align-none rounded-[15px] overflow-hidden cursor-pointer group"
              onClick={() => handleReelClick(reel)}
              tabIndex={0}
              role="button"
              aria-label={`Open reel: ${reel.title}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleReelClick(reel); }}
            >
              <img 
                src={reel.thumbnail_url || 'https://picsum.photos/seed/reel/300/500'} 
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${reel.id || index}/300/500`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Play size={20} fill="currentColor" className="text-white ml-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-medium text-white mb-1 truncate">@{reel.author?.username || 'user'}</p>
                <p className="text-[10px] text-white/80 line-clamp-2 mb-2">{reel.title}</p>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1">
                    <Heart size={12} />
                    <span className="text-[10px]">{formatCount(reel.stats?.play_count || reel.stats?.like_count || 0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Hide overflow items on desktop via CSS */}
      <style>{`
        @media (min-width: 768px) {
          .flex.md\\:grid > div:nth-child(n+4) {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};
