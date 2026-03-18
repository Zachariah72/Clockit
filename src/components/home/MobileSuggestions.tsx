import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedUsers, toggleFollowUser, getDiscoverUsers } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
    { id: 1, name: 'Loading', handle: '@loading', image: 'https://picsum.photos/seed/load/100/100', subtitle: 'Fetching suggestions' },
];

export const MobileSuggestions = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<any[]>(SUGGESTIONS);
    const [followed, setFollowed] = useState<{ [id: string]: boolean }>({});

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const data = user ? await getSuggestedUsers() : await getDiscoverUsers();
                if (data && data.length > 0) setSuggestions(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSuggestions();
    }, [user]);

    const handleFollow = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            navigate('/auth');
            return;
        }
        try {
            const res = await toggleFollowUser(id);
            setFollowed((prev) => ({ ...prev, [id]: res.action === 'followed' }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="lg:hidden mb-8 px-4 md:px-0">
            {/* Current User Profile Block */}
            <div className="flex items-center justify-between mb-6">
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
                <button 
                  onClick={() => navigate('/auth')}
                  className="text-xs font-bold text-[#9500FF] hover:text-white transition-colors"
                >
                  {user ? 'Switch' : 'Sign In'}
                </button>
            </div>

            {/* Suggested For You Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-cream-100/60">Suggested for you</span>
                <button className="text-xs font-bold text-white hover:text-cream-100/60">See All</button>
            </div>

            {/* Horizontally Scrollable Suggestions List */}
            <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x pb-4">
                {suggestions.map((userObj) => (
                    <div
                        key={userObj.id}
                        className="flex-shrink-0 w-[140px] bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center snap-start cursor-pointer"
                        onClick={() => navigate(`/profile/${userObj.id || userObj.name}`)}
                    >
                        <img
                            src={userObj.image}
                            alt={userObj.name}
                            className="w-16 h-16 rounded-full object-cover mb-3"
                            referrerPolicy="no-referrer"
                        />
                        <div className="font-bold text-sm text-white truncate w-full mb-1">{userObj.handle}</div>
                        <div className="text-xs text-cream-100/40 line-clamp-2 h-8 mb-3">{userObj.subtitle}</div>
                        <button 
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              followed[userObj.id] 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-[#9500FF]/20 text-[#9500FF] hover:bg-[#9500FF]/30'
                          }`}
                          disabled={!!followed[userObj.id]}
                          onClick={(e) => handleFollow(userObj.id, e)}
                        >
                            {followed[userObj.id] ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
