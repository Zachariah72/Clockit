import React, { useState, useEffect } from 'react';
import { MoreHorizontal, ChevronDown, ChevronUp, Send, MousePointerClick, FastForward, Repeat2, Share2, Save } from 'lucide-react';

interface Comment {
  id: number;
  username: string;
  text: string;
  timestamp: string;
}

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

export const FeedPost: React.FC<PostProps> = ({
  username,
  userImage,
  location,
  caption,
  timeAgo,
}) => {
  const sliderImages = [
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: 'user123',
      text: 'Great post! 🔥',
      timestamp: '2h ago'
    },
    {
      id: 2,
      username: 'fan_account',
      text: 'Love this content',
      timestamp: '1h ago'
    }
  ]);

  // Action states
  const [effectActive, setEffectActive] = useState(false);
  const [saved, setSaved] = useState(false);
  const [repeated, setRepeated] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [shared, setShared] = useState(false);

  // Effects: Apply visual effect (placeholder)
  const handleEffect = () => {
    setEffectActive(true);
    setTimeout(() => setEffectActive(false), 1000);
    // TODO: Implement real effect logic
  };
  // Fast Forward: Skip to next item
  const handleSkip = () => {
    setSkipped(true);
    setTimeout(() => setSkipped(false), 1000);
    // TODO: Implement skip logic
  };
  // Repeat: Repeat current item
  const handleRepeat = () => {
    setRepeated(true);
    setTimeout(() => setRepeated(false), 1000);
    // TODO: Implement repeat logic
  };
  // Share: Open share dialog
  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1000);
    // TODO: Implement share dialog
  };
  // Save: Save current item
  const handleSave = () => {
    setSaved((prev) => !prev);
    // TODO: Implement save logic
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        username: 'current_user', // Replace with actual username
        text: newComment,
        timestamp: 'Just now'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="mb-8 border-b border-white/5 pb-6 last:border-0">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={userImage}
            alt={username}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-semibold text-white">{username}</h3>
            {location && <p className="text-xs text-cream-100/60">{location}</p>}
          </div>
        </div>
        <button className="text-cream-100/60 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Auto-advancing Image Slider (No Sound) */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-white/5 shadow-lg shadow-black/20">
        <img
          src={sliderImages[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Optional: Slider indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {sliderImages.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-purple-400' : 'bg-white/30'} transition-all`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons - Click, Skip, Echo, Relay, Save */}
      <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-[#1a0022] to-[#2a0033] p-3 rounded-xl overflow-x-auto scrollbar-hide snap-x md:justify-center">
        <button
          className={`text-white font-semibold rounded px-4 py-2 transition-colors flex-shrink-0 snap-start bg-white/5 md:bg-transparent flex items-center justify-center ${effectActive ? 'bg-green-700' : 'hover:bg-blue-900'}`}
          onClick={handleEffect}
          title="Effects"
        >
          <MousePointerClick className="w-5 h-5" />
        </button>
        <button
          className={`text-white font-semibold rounded px-4 py-2 transition-colors flex-shrink-0 snap-start bg-white/5 md:bg-transparent flex items-center justify-center ${skipped ? 'bg-yellow-700' : 'hover:bg-gray-800'}`}
          onClick={handleSkip}
          title="Fast Forward"
        >
          <FastForward className="w-5 h-5" />
        </button>
        <button
          className={`text-white font-semibold rounded px-4 py-2 transition-colors flex-shrink-0 snap-start bg-white/5 md:bg-transparent flex items-center justify-center ${repeated ? 'bg-blue-700' : 'hover:bg-blue-900'}`}
          onClick={handleRepeat}
          title="Repeat"
        >
          <Repeat2 className="w-5 h-5" />
        </button>
        <button
          className={`text-white font-semibold rounded px-4 py-2 transition-colors flex-shrink-0 snap-start bg-white/5 md:bg-transparent flex items-center justify-center ${shared ? 'bg-purple-700' : 'hover:bg-blue-900'}`}
          onClick={handleShare}
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          className={`text-white font-semibold rounded px-4 py-2 transition-colors flex-shrink-0 snap-start bg-white/5 md:bg-transparent flex items-center justify-center ${saved ? 'bg-pink-700' : 'hover:bg-gray-800'}`}
          onClick={handleSave}
          title={saved ? 'Saved' : 'Save'}
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* Caption */}
      <div className="mb-3">
        <span className="font-semibold text-white mr-2">{username}</span>
        <span className="text-cream-100/80">{caption}</span>
      </div>

      {/* Comments Dropdown Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-cream-100/60 hover:text-white transition-colors mb-2"
      >
        <span className="text-sm">Comments ({comments.length})</span>
        {showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Comments Dropdown Content */}
      {showComments && (
        <div className="bg-[#1a0022]/50 rounded-xl p-4 mb-3 border border-white/5">
          {/* Comments List */}
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/30 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-white">{comment.username}</span>
                    <span className="text-xs text-cream-100/40">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-cream-100/80">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-cream-100/40 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="p-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg transition-colors"
              disabled={!newComment.trim()}
            >
              <Send size={18} className="text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-cream-100/40">{timeAgo}</p>
    </div>
  );
};