import React from 'react';
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, Menu, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search' },
  { icon: Compass, label: 'Explore' },
  { icon: Film, label: 'Reels' },
  { icon: MessageCircle, label: 'Messages', badge: 4 },
  { icon: Heart, label: 'Notifications' },
  { icon: PlusSquare, label: 'Create' },
  { icon: Music2, label: 'Music' },
];

export const Sidebar = () => {
  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[244px] border-r border-white/10 bg-cocoa-950 p-4 z-50">
      {/* Logo */}
      <div className="mb-8 px-4 pt-4">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b6cf9] via-[#a259ff] to-[#d936d0] flex items-center justify-center">
              <span className="font-sans font-bold text-white text-lg">C</span>
            </div>
            <span className="font-sans font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5b6cf9] via-[#a259ff] to-[#d936d0]">Clockit</span>
          </div>
          <p className="text-cream-100/40 text-xs font-medium tracking-wide pl-10">Music & Discover</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex items-center gap-4 p-3 w-full rounded-xl transition-all duration-200 group hover:bg-white/5",
              item.active ? "font-bold text-white" : "font-normal text-cream-100/80"
            )}
          >
            <div className="relative">
              <item.icon 
                size={24} 
                className={cn(
                  "transition-transform group-hover:scale-110",
                  item.active ? "text-[#FF00D4]" : "text-current"
                )} 
                strokeWidth={item.active ? 2.5 : 2}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF00D4] rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-cocoa-950">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-base">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-4">
        <button className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-white/5 text-cream-100/80 transition-colors">
          <Menu size={24} />
          <span className="text-base">More</span>
        </button>
      </div>
    </div>
  );
};
