import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Bell, Check, Trash2, MoreVertical, 
  UserPlus, Heart, MessageSquare, Star, Settings2,
  Filter, CheckSquare, Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'mention' | 'system' | 'new_release';
  // `message` is kept for backwards compatibility but is no longer
  // shown in the UI. It is optional so callers can omit it.
  message?: string;
  time: string;
  isRead: boolean;
  sender?: {
    name: string;
    avatar?: string;
  };
  targetUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
  onNavigate?: (url: string) => void;
}

export const NotificationCenter = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onDeleteAll,
  onNavigate
}: NotificationCenterProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleBatchDelete = () => {
    selectedIds.forEach(id => onDelete(id));
    setSelectedIds([]);
    setIsEditMode(false);
    toast.success(`Deleted ${selectedIds.length} notifications`);
  };

  const handleBatchMarkRead = () => {
    selectedIds.forEach(id => onMarkAsRead(id));
    setSelectedIds([]);
    setIsEditMode(false);
    toast.success(`Marked ${selectedIds.length} as read`);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'like': return <Heart className="w-4 h-4 text-secondary fill-secondary" />;
      case 'mention': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'new_release': return <Bell className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="safe-top bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Notifications</h1>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {filteredNotifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={isEditMode ? "text-primary bg-primary/10" : ""}
                  >
                    {isEditMode ? "Cancel" : "Edit"}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sub-header / Filters */}
            {!isEditMode ? (
              <div className="px-4 pb-2 flex gap-4">
                <button 
                  onClick={() => setFilter('all')}
                  className={`text-sm font-medium pb-2 transition-colors relative ${filter === 'all' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  All
                  {filter === 'all' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setFilter('unread')}
                  className={`text-sm font-medium pb-2 transition-colors relative ${filter === 'unread' ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Unread
                  {unreadCount > 0 && <Badge variant="secondary" className="ml-1 scale-75 h-4 min-w-[1rem] px-1">{unreadCount}</Badge>}
                  {filter === 'unread' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-3 flex items-center justify-between bg-primary/5 py-2"
              >
                <button 
                  onClick={handleSelectAll}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  {selectedIds.length === filteredNotifications.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  Select All ({selectedIds.length})
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBatchMarkRead} disabled={selectedIds.length === 0} className="text-xs h-8">
                    Mark Read
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="text-xs h-8 text-destructive hover:text-destructive">
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              <AnimatePresence initial={false}>
                {filteredNotifications.map((n, idx) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => {
                      if (isEditMode) {
                        toggleSelect(n.id);
                      } else {
                        onMarkAsRead(n.id);
                        if (n.targetUrl) {
                          onClose();
                          if (onNavigate) {
                            onNavigate(n.targetUrl);
                          } else {
                            navigate(n.targetUrl);
                          }
                        }
                      }
                    }}
                    className={`group relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      n.isRead 
                        ? 'bg-muted/30 border-transparent' 
                        : 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm shadow-primary/5'
                    } ${isEditMode ? 'pl-12' : ''} active:scale-[0.98] cursor-pointer`}
                  >
                    {/* Selection Checkbox */}
                    {isEditMode && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {selectedIds.includes(n.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    )}

                    {/* Avatar / Icon */}
                    <div className="relative">
                      {n.sender?.avatar ? (
                        <img 
                          src={n.sender.avatar} 
                          alt={n.sender.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="absolute -right-1 -bottom-1 bg-background rounded-full p-1 shadow-sm">
                        {getIcon(n.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold truncate">
                          {n.sender?.name || (n.type === 'system' ? 'System' : 'Update')}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      {/* The message field is intentionally not displayed anymore */}
                      {/* <p className="text-sm text-foreground/90 leading-snug">
                        {n.message}
                      </p> */}
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    )}

                    {/* Quick Delete (Non-edit mode) */}
                    {!isEditMode && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold">All caught up!</h3>
                  <p className="text-sm">No new notifications to show.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Actions Area (Optional) */}
          {!isEditMode && notifications.length > 0 && (
            <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md pb-safe">
              <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={onMarkAllAsRead}>
                <Check className="w-4 h-4" /> Mark all as read
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
