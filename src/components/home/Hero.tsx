import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

export const Hero = () => {
  const [activeTab, setActiveTab] = useState('For You');

  return (
    <div className="pt-6 pb-2 px-4">
      {/* Header - Mobile Only */}
      <div className="flex md:hidden justify-between items-start mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5b6cf9] via-[#a259ff] to-[#d936d0]">
            Clockit
          </h1>
          <p className="text-cream-100/40 text-xs font-medium tracking-wide">Music & Discover</p>
        </div>
        <div className="flex gap-5">
          <button className="text-cream-100/80 hover:text-white transition-colors">
            <Search size={22} />
          </button>
          <button className="relative text-cream-100/80 hover:text-white transition-colors">
            <Bell size={22} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF00D4] rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-cocoa-950">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between bg-white/5 rounded-full p-1 mb-8">
        {['For You', 'Library', 'Discover'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === tab
                ? 'bg-cyan-400 text-cocoa-950 font-bold shadow-lg shadow-cyan-400/20'
                : 'text-cream-100/60 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Banner Card */}
      <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800">
           {/* Sound wave visual simulation */}
           <div className="absolute inset-0 opacity-60 mix-blend-screen bg-[url('https://picsum.photos/seed/wave/800/400')] bg-cover bg-center" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end items-start">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-cyan-400/10 backdrop-blur-md border border-cyan-400/20 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Trending Now
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">Discover New Sounds</h2>
          <p className="text-cream-100/70 text-xs font-medium">Fresh drops every week</p>
          
          {/* Pagination Dots */}
          <div className="absolute bottom-6 right-6 flex gap-1.5">
            <div className="w-6 h-1.5 bg-cyan-400 rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
