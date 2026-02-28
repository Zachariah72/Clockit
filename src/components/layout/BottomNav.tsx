import React from 'react';
import { Home, Film, Camera, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const BottomNav = () => {
  const [active, setActive] = React.useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'reels', icon: Film, label: 'Reels' },
    { id: 'snappy', icon: Camera, label: 'Snappy' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'profile', icon: User, label: 'You' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cocoa-950/90 backdrop-blur-lg border-t border-white/5 px-6 py-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex flex-col items-center gap-1 relative group"
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-white/10 text-clay-400" : "text-cream-100/40 group-hover:text-cream-100/80"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-clay-400" : "text-transparent"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 bg-clay-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
