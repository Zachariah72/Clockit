import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, Music, Film, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Camera, label: 'Snappy', to: '/stories' },
  { icon: Music, label: 'Music', to: '/music' },
  { icon: Film, label: 'Reels', to: '/reels' },
  { icon: MessageCircle, label: 'Chat', to: '/chat' },
  { icon: User, label: 'Profile', to: '/profile' },
];

export const Sidebar = () => {
  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[244px] border-r border-white/10 bg-black p-4 z-50">
      {/* Logo */}
      <div className="mb-8 px-4 pt-4">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b6cf9] via-[#a259ff] to-[#d936d0] flex items-center justify-center">
              <span className="font-sans font-bold text-white text-lg">C</span>
            </div>
            <span className="font-sans font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5b6cf9] via-[#a259ff] to-[#d936d0]">
              Clockit
            </span>
          </div>
          <p className="text-cream-100/40 text-xs font-medium tracking-wide pl-10">Music & Discover</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 p-3 w-full rounded-xl transition-all duration-200 group hover:bg-white/5',
                isActive ? 'font-bold text-white' : 'font-normal text-cream-100/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={24}
                    className={cn(
                      'transition-transform group-hover:scale-110',
                      isActive ? 'text-[#FF00D4]' : 'text-current'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className="text-base">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};