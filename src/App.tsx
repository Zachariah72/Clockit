/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { FeaturedPlaylists } from '@/components/home/FeaturedPlaylists';
import { CommunitySection } from '@/components/home/CommunitySection';
import { SnappySection } from '@/components/home/SnappySection';
import { ReelsSection } from '@/components/home/ReelsSection';
import { GenreSection } from '@/components/home/GenreSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { FullPlayer } from '@/components/music/FullPlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FeedPost } from '@/components/home/FeedPost';
import { Plus } from 'lucide-react';

const FEED_POSTS = [
  {
    id: 1,
    username: 'wizkidayo',
    userImage: 'https://picsum.photos/seed/wizkid/100/100',
    location: 'Lagos, Nigeria',
    image: 'https://picsum.photos/seed/concert/600/600',
    likes: 45230,
    caption: 'Made in Lagos. The energy was unmatched last night! 🦅🇳🇬 #Starboy',
    comments: 1240,
    timeAgo: '2h'
  },
  {
    id: 2,
    username: 'tyla',
    userImage: 'https://picsum.photos/seed/tyla/100/100',
    location: 'Johannesburg, SA',
    image: 'https://picsum.photos/seed/dance/600/600',
    likes: 89400,
    caption: 'Water remix dropping soon... 💦🇿🇦',
    comments: 3500,
    timeAgo: '5h'
  },
  {
    id: 3,
    username: 'blackcoffee',
    userImage: 'https://picsum.photos/seed/coffee/100/100',
    location: 'Ibiza',
    image: 'https://picsum.photos/seed/dj/600/600',
    likes: 22100,
    caption: 'House music is a spiritual thing. see you next week.',
    comments: 890,
    timeAgo: '1d'
  }
];

export default function App() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cocoa-950 text-cream-50">
      <FullPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />
      
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex justify-center md:pl-[244px] lg:pr-[320px]">
        <main className="w-full max-w-[630px] min-h-screen pb-32 md:py-8 px-0 md:px-4">
          
          {/* Mobile Header (Hidden on Desktop) & Hero Content */}
          <div className="mb-6">
            <Hero />
          </div>

          {/* Featured Playlists (Moved Up) */}
          <div className="mb-8">
            <FeaturedPlaylists />
          </div>

          {/* Stories (Snappy) */}
          <div className="mb-8">
            <SnappySection />
          </div>

          {/* Main Feed Content */}
          <div className="space-y-6">
            {/* Feed Posts */}
            <div className="px-4 md:px-0">
              {FEED_POSTS.map(post => (
                <FeedPost 
                  key={post.id}
                  username={post.username}
                  userImage={post.userImage}
                  location={post.location}
                  image={post.image}
                  likes={post.likes}
                  caption={post.caption}
                  comments={post.comments}
                  timeAgo={post.timeAgo}
                />
              ))}
            </div>

            {/* Interspersed Sections */}
            <div className="py-4">
              <GenreSection />
            </div>

            <div className="py-4">
              <h3 className="px-4 md:px-0 text-lg font-bold text-white mb-4">Clockit Reels</h3>
              <ReelsSection />
            </div>

            <CommunitySection />
            
            <div className="px-4 md:px-0 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Listening Groups</h2>
                <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300">See all</button>
              </div>
              {/* Placeholder for Listening Groups */}
              <div className="h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cream-100/40 text-sm">
                Join a listening party...
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center text-cocoa-950 shadow-xl shadow-cyan-400/20 hover:scale-110 transition-transform">
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Desktop Right Panel */}
      <RightPanel />
      
      {/* Mobile Bottom Nav & Player */}
      <div className="md:hidden max-w-2xl mx-auto fixed bottom-0 left-0 right-0 pointer-events-none z-50">
        <div className="pointer-events-auto">
          <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
          <BottomNav />
        </div>
      </div>

      {/* Desktop Player (Floating) */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50 w-80">
         <div 
          onClick={() => setIsPlayerOpen(true)}
          className="bg-cocoa-800/95 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 shadow-xl shadow-black/40 border border-white/5 cursor-pointer hover:bg-cocoa-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <img src="https://picsum.photos/seed/wizkid/100/100" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">Essence</div>
            <div className="text-xs text-cream-100/60 truncate">WizKid ft. Tems</div>
          </div>
        </div>
      </div>
    </div>
  );
}
