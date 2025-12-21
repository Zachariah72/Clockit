import { motion } from "framer-motion";
import { Users, Plus, Lock, Globe, MessageCircle, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Layout } from "@/components/layout/Layout";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";

const groups = [
  {
    id: "1",
    name: "Music Lovers",
    description: "Share and discover new music together",
    memberCount: 1248,
    isPrivate: false,
    image: album1,
    lastActivity: "Active now",
    unreadMessages: 5,
  },
  {
    id: "2",
    name: "Close Friends",
    description: "Private stories and chats",
    memberCount: 12,
    isPrivate: true,
    image: avatar1,
    lastActivity: "2 min ago",
    unreadMessages: 0,
  },
  {
    id: "3",
    name: "Night Owls",
    description: "Late night vibes only",
    memberCount: 456,
    isPrivate: false,
    image: album2,
    lastActivity: "5 min ago",
    unreadMessages: 12,
  },
  {
    id: "4",
    name: "College Squad",
    description: "Class of '24",
    memberCount: 28,
    isPrivate: true,
    image: avatar2,
    lastActivity: "1 hour ago",
    unreadMessages: 0,
  },
];

const suggestedGroups = [
  {
    id: "5",
    name: "Lo-Fi Study",
    description: "Focus music for studying",
    memberCount: 8920,
    image: avatar3,
  },
  {
    id: "6",
    name: "Synthwave Fans",
    description: "Retro future sounds",
    memberCount: 3456,
    image: album1,
  },
];

const Groups = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">Groups</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="glow" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Your Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Groups
          </h3>
          <div className="space-y-3">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="glass-card p-4 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    {group.unreadMessages > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary-foreground">
                          {group.unreadMessages}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {group.name}
                      </h4>
                      {group.isPrivate ? (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Globe className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.memberCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-primary">
                        {group.lastActivity}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Music className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Suggested Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 mt-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Suggested For You
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {suggestedGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-4 rounded-xl text-center cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                />
                <h4 className="font-semibold text-foreground text-sm truncate">
                  {group.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {group.description}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                  <Users className="w-3 h-3" />
                  {group.memberCount.toLocaleString()} members
                </div>
                <Button variant="gradient" size="sm" className="w-full">
                  Join
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Groups;
