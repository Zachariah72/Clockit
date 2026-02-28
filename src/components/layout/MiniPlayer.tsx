import React from 'react';
import { Play, SkipBack, SkipForward, Heart, Repeat } from 'lucide-react';

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer = ({ onExpand }: MiniPlayerProps) => {
  return (
    <div className="fixed bottom-[84px] left-4 right-4 z-40">
      <div 
        onClick={onExpand}
        className="bg-cocoa-800/95 backdrop-blur-md rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-xl shadow-black/40 border border-white/5 cursor-pointer hover:bg-cocoa-800 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img 
            src="https://picsum.photos/seed/wizkid/100/100" 
            alt="Album Art" 
            className="w-full h-full object-cover animate-[spin_8s_linear_infinite]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 rounded-xl ring-1 ring-inset ring-white/10" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">Essence (feat. Tems)</h4>
          <p className="text-xs text-cream-100/60 truncate">WizKid</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 h-3 items-end">
            <div className="w-0.5 bg-clay-400 animate-[music-bar_1s_ease-in-out_infinite]" />
            <div className="w-0.5 bg-clay-400 animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]" />
            <div className="w-0.5 bg-clay-400 animate-[music-bar_0.8s_ease-in-out_infinite_0.2s]" />
            <div className="w-0.5 bg-clay-400 animate-[music-bar_1.1s_ease-in-out_infinite_0.3s]" />
          </div>
          <button className="text-cream-100/60 hover:text-clay-400 transition-colors">
            <Heart size={20} />
          </button>
          <button className="w-8 h-8 bg-white text-cocoa-950 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
