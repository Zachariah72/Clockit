import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Users, Radio, Music, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { discoverPublicGroups } from '@/services/api';

export const CommunitySection = () => {
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await discoverPublicGroups();
        if (Array.isArray(groups)) {
          // Take top 4 groups for the home page
          setSuggestedGroups(groups.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch suggested groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (!isLoading && suggestedGroups.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-8 bg-gradient-to-b from-transparent to-cocoa-900/50">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-teal-400 mb-2">
            <Radio className="w-6 h-6" /> Suggested Groups
          </h2>
          <p className="text-cream-100/60 text-sm max-w-md">
            Join the conversation. Listen together in real-time.
          </p>
        </div>
        <button
          onClick={() => navigate('/groups')}
          className="text-xs text-teal-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : suggestedGroups.map((group, index) => (
          <motion.div
            key={group._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/groups/${group._id}`)}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group flex items-start gap-4"
          >
            <img
              src={group.image || '/api/placeholder/48/48'}
              alt={group.name}
              className="w-12 h-12 rounded-full object-cover shadow-sm bg-black/20"
              onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/48/48'; }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-semibold text-cream-50 truncate group-hover:text-teal-200 transition-colors pr-2">
                  {group.name}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-cream-100/40 bg-black/20 px-2 py-0.5 rounded-full shrink-0">
                  <Users size={10} />
                  <span>{group.members?.length || 1} online</span>
                </div>
              </div>
              <p className="text-xs text-cream-100/60 line-clamp-1 mb-2">
                {group.description || 'A great place to discover new music.'}
              </p>
              <div className="flex items-center gap-3 text-cream-100/40">
                <span className="flex items-center gap-1 text-[11px]">
                  <Music size={12} />
                  <span>{group.currentTrack ? 'Playing now' : 'Idle'}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-400 group-hover:text-white transition-colors">
                  <MessageCircle size={12} />
                  <span>Join Room</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

