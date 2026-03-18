import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, Music, Film, MessageCircle, User, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Camera, label: 'Snappy', to: '/stories' },
  { icon: Music, label: 'Music', to: '/music' },
  { icon: Film, label: 'Reels', to: '/reels' },
  { icon: Radio, label: 'Live', to: '/live' },
  { icon: MessageCircle, label: 'Chat', to: '/chat' },
  { icon: User, label: 'Profile', to: '/profile' },
];

export const Sidebar = () => {
  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] border-r border-white/5 bg-black/95 backdrop-blur-xl p-6 z-50">
      {/* Logo */}
      <div className="mb-10 px-2">
        <div className="flex items-center cursor-pointer">
          <span className="font-sans font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5b6cf9] via-[#a259ff] to-[#d936d0]">
            Clockit
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl transition-all duration-300 group relative overflow-hidden',
                isActive 
                  ? 'bg-white/5 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative z-10 p-2 rounded-xl transition-colors duration-300",
                  isActive ? "bg-primary/10 text-primary" : "text-gray-400 group-hover:text-white"
                )}>
                  <item.icon
                    size={20}
                    className={cn(
                      'transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'drop-shadow-[0_0_8px_rgba(255,0,212,0.5)]' : ''
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn(
                  "text-sm font-semibold tracking-wide transition-colors duration-300 relative z-10",
                  isActive ? "text-white" : "group-hover:text-white"
                )}>
                  {item.label}
                </span>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Footer or Version */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-white font-medium">All systems go</span>
          </div>
        </div>
      </div>
    </div>
  );
};