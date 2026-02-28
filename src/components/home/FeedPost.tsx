import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface PostProps {
  id?: number;
  username: string;
  userImage: string;
  location?: string;
  image: string;
  likes: number;
  caption: string;
  comments: number;
  timeAgo: string;
}

export const FeedPost: React.FC<PostProps> = ({ username, userImage, location, image, likes, caption, comments, timeAgo }) => {
  return (
    <div className="mb-8 border-b border-white/5 pb-6 last:border-0">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2962FF] to-[#FF00D4] p-[2px] cursor-pointer">
            <img 
              src={userImage} 
              alt={username} 
              className="w-full h-full rounded-full border border-cocoa-950 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white cursor-pointer hover:text-cream-100">{username}</span>
              <span className="text-xs text-cream-100/40">• {timeAgo}</span>
            </div>
            {location && <div className="text-xs text-cream-100/60">{location}</div>}
          </div>
        </div>
        <button className="text-cream-100/60 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-white/5 shadow-lg shadow-black/20">
        <img 
          src={image} 
          alt="Post content" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-[#FF00D4] transition-colors">
            <Heart size={24} />
          </button>
          <button className="text-white hover:text-[#9500FF] transition-colors">
            <MessageCircle size={24} />
          </button>
          <button className="text-white hover:text-[#2962FF] transition-colors">
            <Send size={24} />
          </button>
        </div>
        <button className="text-white hover:text-cream-100/60 transition-colors">
          <Bookmark size={24} />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-1">
        <div className="text-sm font-bold text-white mb-2">{likes.toLocaleString()} likes</div>
        <div className="text-sm text-cream-100/90 mb-2">
          <span className="font-bold text-white mr-2">{username}</span>
          {caption}
        </div>
        <button className="text-sm text-cream-100/40 mb-1 hover:text-cream-100/60">View all {comments} comments</button>
        <div className="text-xs text-cream-100/40 uppercase tracking-wide">Add a comment...</div>
      </div>
    </div>
  );
};
