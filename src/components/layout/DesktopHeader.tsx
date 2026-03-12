import React from 'react';
import { Search, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const DesktopHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 h-20 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for music, creators, or blazes..." 
            className="w-full bg-white/5 border-white/10 pl-12 h-11 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-2xl hover:bg-white/10"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl hover:bg-white/10"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-tight">{user?.username || 'Guest'}</p>
            <p className="text-[10px] text-gray-400 font-medium">View Profile</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-[14px] bg-black overflow-hidden">
              <img 
                src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
