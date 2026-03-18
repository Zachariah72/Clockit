import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedUsers, toggleFollowUser } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SUGGESTIONS = [
    { id: 1, name: 'Dayo Emmanuel', handle: '@dayo_music', image: 'https://picsum.photos/seed/dayo/100/100', subtitle: 'Followed by wizkid' },
    { id: 2, name: 'The Growth Lounge', handle: '@growth_lounge', image: 'https://picsum.photos/seed/growth/100/100', subtitle: 'New to Instagram' },
    { id: 3, name: 'Kimela 🦋', handle: '@kimela_vibe', image: 'https://picsum.photos/seed/kimela/100/100', subtitle: 'Followed by tems' },
    { id: 4, name: 'SocialNest.ng', handle: '@socialnest', image: 'https://picsum.photos/seed/social/100/100', subtitle: 'Suggested for you' },
    { id: 5, name: 'Ogochukwu U.', handle: '@ogo_design', image: 'https://picsum.photos/seed/ogo/100/100', subtitle: 'Followed by burnaboy' },
];

export const MobileSuggestions = () => {
    const { user, profile } = useAuth();
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
                <button className="text-xs font-bold text-[#9500FF] hover:text-white transition-colors">Switch</button>
            </div>

            {/* Suggested For You Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-cream-100/60">Suggested for you</span>
                <button className="text-xs font-bold text-white hover:text-cream-100/60">See All</button>
            </div>

            {/* Horizontally Scrollable Suggestions List */}
            <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x pb-4">
                {SUGGESTIONS.map((user) => (
                    <div
                        key={user.id}
                        className="flex-shrink-0 w-[140px] bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center snap-start"
                    >
                        <img
                            src={user.image}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover mb-3"
                            referrerPolicy="no-referrer"
                        />
                        <div className="font-bold text-sm text-white truncate w-full mb-1">{user.handle}</div>
                        <div className="text-xs text-cream-100/40 line-clamp-2 h-8 mb-3">{user.subtitle}</div>
                        <button className="w-full py-1.5 rounded-lg bg-[#9500FF]/20 text-[#9500FF] hover:bg-[#9500FF]/30 text-xs font-bold transition-colors">
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
