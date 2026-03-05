import { Bell, Heart, MessageCircle, UserPlus, Music } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/layout/MiniPlayer';
import { useState } from 'react';

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'music';

interface Notification {
  id: number;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  content?: string;
  timestamp: string;
  read: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: { name: 'wizkidayo', avatar: 'https://picsum.photos/seed/wizkid/100/100' },
    action: 'liked your post',
    timestamp: '5m ago',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    user: { name: 'tyla', avatar: 'https://picsum.photos/seed/tyla/100/100' },
    action: 'commented on your post',
    content: 'This is fire! 🔥',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 3,
    type: 'follow',
    user: { name: 'blackcoffee', avatar: 'https://picsum.photos/seed/coffee/100/100' },
    action: 'started following you',
    timestamp: '3h ago',
    read: true,
  },
  {
    id: 4,
    type: 'music',
    user: { name: 'burnaboy', avatar: 'https://picsum.photos/seed/burna/100/100' },
    action: 'released a new album',
    content: 'I Told Them...',
    timestamp: '1d ago',
    read: true,
  },
  {
    id: 5,
    type: 'like',
    user: { name: 'davido', avatar: 'https://picsum.photos/seed/davido/100/100' },
    action: 'liked your reel',
    timestamp: '2d ago',
    read: true,
  },
];

const Notifications = () => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" size={20} fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="text-blue-400" size={20} />;
      case 'follow':
        return <UserPlus className="text-cyan-400" size={20} />;
      case 'music':
        return <Music className="text-purple-400" size={20} />;
      default:
        return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cocoa-950 to-cocoa-900 text-cream-50">
      <Sidebar />

      <div className="flex justify-center md:pl-[244px]">
        <main className="w-full max-w-[630px] min-h-screen pb-32 md:py-8 px-4">
          {/* Header */}
          <div className="mb-6 pt-4 md:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-cream-100/60 text-sm">Stay updated with your activity</p>
          </div>

          {/* Notifications List */}
          <div className="space-y-1">
            {NOTIFICATIONS.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
                  notification.read
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20'
                }`}
              >
                {/* Avatar */}
                <img
                  src={notification.user.avatar}
                  alt={notification.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-bold">{notification.user.name}</span>{' '}
                    <span className="text-cream-100/70">{notification.action}</span>
                  </p>
                  {notification.content && (
                    <p className="text-sm text-cream-100/60 mt-1">{notification.content}</p>
                  )}
                  <p className="text-xs text-cream-100/50 mt-1">{notification.timestamp}</p>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">{getIcon(notification.type)}</div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State (if no notifications) */}
          {NOTIFICATIONS.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={64} className="text-cream-100/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
              <p className="text-cream-100/60 text-sm">
                When someone interacts with your content, you'll see it here
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden max-w-2xl mx-auto fixed bottom-0 left-0 right-0 pointer-events-none z-50">
        <div className="pointer-events-auto">
          <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default Notifications;