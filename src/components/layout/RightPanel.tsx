import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedUsers, toggleFollowUser } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  { id: 1, name: 'Dayo Emmanuel', handle: '@dayo_music', image: 'https://picsum.photos/seed/dayo/100/100', subtitle: 'Followed by wizkid' },
  { id: 2, name: 'The Growth Lounge', handle: '@growth_lounge', image: 'https://picsum.photos/seed/growth/100/100', subtitle: 'New to Instagram' },
  { id: 3, name: 'Kimela 🦋', handle: '@kimela_vibe', image: 'https://picsum.photos/seed/kimela/100/100', subtitle: 'Followed by tems' },
  { id: 4, name: 'SocialNest.ng', handle: '@socialnest', image: 'https://picsum.photos/seed/social/100/100', subtitle: 'Suggested for you' },
  { id: 5, name: 'Ogochukwu U.', handle: '@ogo_design', image: 'https://picsum.photos/seed/ogo/100/100', subtitle: 'Followed by burnaboy' },
];

export const RightPanel = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<any[]>(SUGGESTIONS);
  const [followed, setFollowed] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      getSuggestedUsers().then(data => {
        if (data && data.length > 0) setSuggestions(data);
      }).catch(console.error);
    }
  }, [user]);

  const handleFollow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleFollowUser(id);
      setFollowed((prev) => ({ ...prev, [id]: res.action === 'followed' }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hidden lg:block w-[320px] pl-8 py-8 fixed right-0 top-0 bottom-0 pr-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2962FF] to-[#FF00D4] p-[2px]">
            <img
              src={profile?.avatar || "https://picsum.photos/seed/user/100/100"}
              alt="Profile"
              className="w-full h-full rounded-full border-2 border-cocoa-950 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-sm">
            <div className="font-bold text-white">{user?.username || 'Guest'}</div>
            <div className="text-cream-100/60">{profile?.fullName || 'Welcome to Clockit'}</div>
          </div>
        </div>
        <button className="text-xs font-bold text-[#9500FF] hover:text-white transition-colors">Switch</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-cream-100/60">Suggested for you</span>
        <button className="text-xs font-bold text-white hover:text-cream-100/60">See All</button>
      </div>

      <div className="space-y-4">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/profile/${user.id || user.name}`)}>
            <div className="flex items-center gap-3">
              <img
                src={user.image}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-bold text-white group-hover:text-cream-100 transition-colors">{user.handle}</div>
                <div className="text-cream-100/40 truncate max-w-[140px]">{user.subtitle}</div>
              </div>
            </div>
            <button
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${followed[user.id] ? 'bg-green-600 text-white cursor-default' : 'text-[#9500FF] hover:text-white bg-white/0 hover:bg-[#9500FF]/10'}`}
              disabled={!!followed[user.id]}
              onClick={(e) => handleFollow(user.id, e)}
            >
              {followed[user.id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
