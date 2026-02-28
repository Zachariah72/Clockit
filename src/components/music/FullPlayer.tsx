import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Play, SkipBack, SkipForward, Repeat, Shuffle, Heart, Share2, ListMusic, Mic2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullPlayer = ({ isOpen, onClose }: FullPlayerProps) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'art' | 'lyrics'>('art');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-gradient-to-b from-cocoa-900 to-cocoa-950 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pt-12">
            <button onClick={onClose} className="text-cream-100/60 hover:text-white transition-colors">
              <ChevronDown size={28} />
            </button>
            <div className="text-center">
              <span className="text-xs font-medium text-clay-400 uppercase tracking-widest">Now Playing</span>
              <p className="text-xs text-cream-100/40">From "Made in Lagos"</p>
            </div>
            <button className="text-cream-100/60 hover:text-white transition-colors">
              <ListMusic size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {activeTab === 'art' ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full aspect-square max-w-sm relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 mb-8"
              >
                <img 
                  src="https://picsum.photos/seed/wizkid/500/500" 
                  alt="Album Art" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ) : (
              <div className="w-full h-96 overflow-y-auto hide-scrollbar text-center space-y-6 py-4">
                <p className="text-cream-100/40 text-lg">Yeah, yeah, yeah</p>
                <p className="text-white text-2xl font-medium">You don't need no other body</p>
                <p className="text-white text-2xl font-medium">You don't need no other body</p>
                <p className="text-cream-100/40 text-lg">Only you fi hold my body</p>
                <p className="text-cream-100/40 text-lg">Only you fi hold my body</p>
                <p className="text-cream-100/40 text-lg">You don't need no other body</p>
              </div>
            )}

            {/* Track Info */}
            <div className="w-full flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Essence (feat. Tems)</h2>
                <p className="text-lg text-clay-400">WizKid</p>
              </div>
              <button className="text-pink-500">
                <Heart size={28} fill="currentColor" />
              </button>
            </div>

            {/* Progress */}
            <div className="w-full mb-8">
              <div className="h-1 bg-white/10 rounded-full mb-2 relative group cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-clay-500 rounded-full" />
                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex justify-between text-xs text-cream-100/40 font-mono">
                <span>1:15</span>
                <span>4:08</span>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex items-center justify-between mb-8">
              <button className="text-cream-100/40 hover:text-white transition-colors">
                <Shuffle size={24} />
              </button>
              <button className="text-white hover:text-clay-400 transition-colors">
                <SkipBack size={32} fill="currentColor" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-clay-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-clay-500/20 hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <div className="flex gap-1.5 h-6">
                    <div className="w-1.5 bg-white rounded-full" />
                    <div className="w-1.5 bg-white rounded-full" />
                  </div>
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </button>
              <button className="text-white hover:text-clay-400 transition-colors">
                <SkipForward size={32} fill="currentColor" />
              </button>
              <button className="text-cream-100/40 hover:text-white transition-colors">
                <Repeat size={24} />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('lyrics')}
                className={cn(
                  "p-3 rounded-full transition-colors",
                  activeTab === 'lyrics' ? "bg-white/10 text-clay-400" : "text-cream-100/40 hover:text-white"
                )}
              >
                <Mic2 size={20} />
              </button>
              <button 
                onClick={() => setActiveTab('art')}
                className={cn(
                  "p-3 rounded-full transition-colors",
                  activeTab === 'art' ? "bg-white/10 text-clay-400" : "text-cream-100/40 hover:text-white"
                )}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
