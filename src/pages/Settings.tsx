import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Shield, MessageCircle, Music, Eye, BarChart3,
  Bell, Users, Palette, Clock, HardDrive, FileText, LogOut,
  ChevronRight, Settings as SettingsIcon, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Settings sections
const settingsSections = [
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account settings and preferences',
    icon: User,
    color: 'text-blue-500'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Control your privacy and security settings',
    icon: Shield,
    color: 'text-green-500'
  },
  {
    id: 'messaging',
    title: 'Messaging & Calls',
    description: 'Configure messaging and calling preferences',
    icon: MessageCircle,
    color: 'text-purple-500'
  },
  {
    id: 'music',
    title: 'Music & Audio',
    description: 'Customize your music listening experience',
    icon: Music,
    color: 'text-pink-500'
  },
  {
    id: 'content',
    title: 'Content & Feed',
    description: 'Personalize your content and feed preferences',
    icon: Eye,
    color: 'text-orange-500'
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Manage your analytics and performance data',
    icon: BarChart3,
    color: 'text-cyan-500'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control your notification preferences',
    icon: Bell,
    color: 'text-yellow-500'
  },
  {
    id: 'appearance',
    title: 'Appearance & Themes',
    description: 'Customize your app appearance and themes',
    icon: Palette,
    color: 'text-indigo-500'
  },
  {
    id: 'wellbeing',
    title: 'Screen Time & Wellbeing',
    description: 'Manage your screen time and digital wellbeing',
    icon: Clock,
    color: 'text-teal-500'
  },
  {
    id: 'data',
    title: 'App & Data',
    description: 'Manage app data and storage settings',
    icon: HardDrive,
    color: 'text-gray-500'
  },
  {
    id: 'legal',
    title: 'Legal & Support',
    description: 'Legal information and support resources',
    icon: FileText,
    color: 'text-slate-500'
  }
];

const Settings = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(sectionId || null);

  // Update selected section when URL changes
  useEffect(() => {
    if (sectionId) {
      setSelectedSection(sectionId);
    }
  }, [sectionId]);

  const filteredSections = settingsSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    // Navigate to specific settings section
    navigate(`/settings/${sectionId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your Clockit experience</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </motion.header>

        {/* Settings Sections or Section Detail View */}
        {selectedSection ? (
          <div className="p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="icon" onClick={() => { setSelectedSection(null); navigate('/settings'); }}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold capitalize">{selectedSection.replace('-', ' ')} Settings</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                This section is coming soon. We're working on providing you with the best {selectedSection} settings experience.
              </p>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  🚧 Under construction
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {filteredSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSectionClick(section.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className={`p-3 rounded-xl bg-muted ${section.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{section.description}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No settings found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
        )}

        {/* Logout Section */}
        <div className="p-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-colors"
          >
            <div className="p-3 rounded-xl bg-destructive/20">
              <LogOut className="w-6 h-6 text-destructive" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-destructive">Logout</h3>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Clockit v1.0.0
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
