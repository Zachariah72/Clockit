import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Lock, Globe, MessageCircle, Music, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { getApiUrl } from "@/utils/api";
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
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${apiUrl}/listening-groups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const groups = await response.json();
          setUserGroups(groups);
          // Mark all user's groups as joined
          const groupIds = new Set<string>();
          groups.forEach((g: any) => groupIds.add(g._id));
          setJoinedGroups(groupIds);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch discoverable groups
  useEffect(() => {
    const fetchDiscoverGroups = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${apiUrl}/listening-groups/discover`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const groups = await response.json();
          setDiscoverGroups(groups);
        }
      } catch (error) {
        console.error('Error fetching discover groups:', error);
      }
    };

    fetchDiscoverGroups();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setJoiningGroup(groupId);
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/listening-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setJoinedGroups(prev => new Set(prev).add(groupId));
      } else {
        console.error('Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoiningGroup(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (!newGroupName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/listening-groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          isPrivate
        })
      });

      if (response.ok) {
        const newGroup = await response.json();
        setIsCreateDialogOpen(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setIsPrivate(false);
        // Add the new group to the list
        setUserGroups(prev => [...prev, newGroup]);
        setJoinedGroups(prev => new Set(prev).add(newGroup._id));
      } else {
        console.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

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
              <Button variant="glow" size="sm" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading groups...</p>
              </div>
            ) : userGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't joined any groups yet</p>
                <Button variant="link" onClick={() => setIsCreateDialogOpen(true)}>
                  Create your first group
                </Button>
              </div>
            ) : (
              userGroups.map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="glass-card p-4 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={group.image || '/api/placeholder/56/56'}
                        alt={group.name}
                        className="w-14 h-14 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/56/56';
                        }}
                      />
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
                          {group.members?.length || 1}
                        </span>
                        <span className="text-xs text-primary">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => console.log('Open chat for group', group._id)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => console.log('Open playlist for group', group._id)}>
                        <Music className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Discover Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 mt-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Discover Groups
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {discoverGroups.map((group, index) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-4 rounded-xl text-center cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <img
                  src={group.image || '/api/placeholder/64/64'}
                  alt={group.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                  }}
                />
                <h4 className="font-semibold text-foreground text-sm truncate">
                  {group.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {group.description}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                  <Users className="w-3 h-3" />
                  {group.members?.length || 1}
                </div>
                <Button 
                  variant={joinedGroups.has(group._id) ? "outline" : "gradient"} 
                  size="sm" 
                  className="w-full"
                  disabled={joinedGroups.has(group._id) || joiningGroup === group._id}
                  onClick={() => handleJoinGroup(group._id)}
                >
                  {joiningGroup === group._id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : joinedGroups.has(group._id) ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Joined
                    </span>
                  ) : (
                    "Join"
                  )}
                </Button>
              </motion.div>
            ))}
            {discoverGroups.length === 0 && !isLoading && (
              <div className="col-span-2 text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No groups to discover</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Create Group Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Group
              </DialogTitle>
              <DialogDescription>Create a new group to connect with other users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="What's this group about?"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Private Group</label>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPrivate ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPrivate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleCreateGroup} disabled={isCreating || !newGroupName.trim()}>
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Groups;
