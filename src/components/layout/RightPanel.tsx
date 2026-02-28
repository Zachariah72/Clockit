import React from 'react';
import { UserPlus } from 'lucide-react';

const SUGGESTIONS = [
  { id: 1, name: 'Dayo Emmanuel', handle: '@dayo_music', image: 'https://picsum.photos/seed/dayo/100/100', subtitle: 'Followed by wizkid' },
  { id: 2, name: 'The Growth Lounge', handle: '@growth_lounge', image: 'https://picsum.photos/seed/growth/100/100', subtitle: 'New to Instagram' },
  { id: 3, name: 'Kimela 🦋', handle: '@kimela_vibe', image: 'https://picsum.photos/seed/kimela/100/100', subtitle: 'Followed by tems' },
  { id: 4, name: 'SocialNest.ng', handle: '@socialnest', image: 'https://picsum.photos/seed/social/100/100', subtitle: 'Suggested for you' },
  { id: 5, name: 'Ogochukwu U.', handle: '@ogo_design', image: 'https://picsum.photos/seed/ogo/100/100', subtitle: 'Followed by burnaboy' },
];

export const RightPanel = () => {
  return (
    <div className="hidden lg:block w-[320px] pl-8 py-8 fixed right-0 top-0 bottom-0 pr-4">
      {/* User Profile Switcher */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2962FF] to-[#FF00D4] p-[2px]">
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="Profile" 
              className="w-full h-full rounded-full border-2 border-cocoa-950 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-sm">
            <div className="font-bold text-white">emmanuel_jimoh</div>
            <div className="text-cream-100/60">Emmanuel Jimoh</div>
          </div>
        </div>
        <button className="text-xs font-bold text-[#9500FF] hover:text-white transition-colors">Switch</button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-cream-100/60">Suggested for you</span>
        <button className="text-xs font-bold text-white hover:text-cream-100/60">See All</button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {SUGGESTIONS.map((user) => (
          <div key={user.id} className="flex items-center justify-between group">
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
            <button className="text-xs font-bold text-[#9500FF] hover:text-white transition-colors">Follow</button>
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-cream-100/20">
        <span>About</span>•<span>Help</span>•<span>Press</span>•<span>API</span>•<span>Jobs</span>•<span>Privacy</span>•<span>Terms</span>•<span>Locations</span>•<span>Language</span>•<span>Meta Verified</span>
      </div>
      <div className="mt-4 text-[11px] text-cream-100/20 uppercase">
        © 2026 CLOCKIT FROM AFRICA
      </div>
    </div>
  );
};
