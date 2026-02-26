import { useState, useEffect } from "react";
import {
  ArrowLeft, User, Shield, MessageCircle, Music, Eye, BarChart3,
  Bell, Palette, Clock, HardDrive, FileText, LogOut,
  ChevronRight, Settings as SettingsIcon, Search, ToggleLeft, ToggleRight, Info,
  Mail, Lock, Smartphone, Link2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { settingsData, getSettingsSection, SettingItem } from "@/data/settingsData";
import { profileApi } from "@/services/profileApi";

// Settings sections
const settingsSections = [
  { id: 'account', title: 'Account', description: 'Manage your account settings and preferences', icon: User, color: 'text-blue-500' },
  { id: 'privacy', title: 'Privacy & Security', description: 'Control your privacy and security settings', icon: Shield, color: 'text-green-500' },
  { id: 'messaging', title: 'Messaging & Calls', description: 'Configure messaging and calling preferences', icon: MessageCircle, color: 'text-purple-500' },
  { id: 'music', title: 'Music & Audio', description: 'Customize your music listening experience', icon: Music, color: 'text-pink-500' },
  { id: 'content', title: 'Content & Feed', description: 'Personalize your content and feed preferences', icon: Eye, color: 'text-orange-500' },
  { id: 'analytics', title: 'Analytics & Insights', description: 'Manage your analytics and performance data', icon: BarChart3, color: 'text-cyan-500' },
  { id: 'notifications', title: 'Notifications', description: 'Control your notification preferences', icon: Bell, color: 'text-yellow-500' },
  { id: 'appearance', title: 'Appearance & Themes', description: 'Customize your app appearance and themes', icon: Palette, color: 'text-indigo-500' },
  { id: 'wellbeing', title: 'Screen Time & Wellbeing', description: 'Manage your screen time and digital wellbeing', icon: Clock, color: 'text-teal-500' },
  { id: 'data', title: 'App & Data', description: 'Manage app data and storage settings', icon: HardDrive, color: 'text-gray-500' },
  { id: 'legal', title: 'Legal & Support', description: 'Legal information and support resources', icon: FileText, color: 'text-slate-500' }
];

const Settings = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(sectionId || null);
  const [settingsValues, setSettingsValues] = useState<Record<string, boolean>>({});
  
  // Modal states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [linkedAccountsModalOpen, setLinkedAccountsModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleToggle = (itemId: string) => {
    if (itemId === 'two-factor') {
      setTwoFactorEnabled(!twoFactorEnabled);
      if (!twoFactorEnabled) {
        toast.info("Two-factor authentication setup - coming soon!");
      } else {
        toast.success("Two-factor authentication disabled");
      }
      return;
    }
    setSettingsValues(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    toast.success("Setting updated");
  };

  const handleSettingClick = (item: SettingItem) => {
    if (item.type === 'toggle') {
      handleToggle(item.id);
    } else if (item.type === 'link') {
      // Handle specific links - show info or navigate to appropriate pages
      if (item.id === 'edit-profile') {
        toast.info("Edit Profile - Feature loading...");
        // Navigate only if profile page is working
        navigate('/profile/me');
      } else if (item.id === 'change-email') {
        setEmailModalOpen(true);
      } else if (item.id === 'change-password') {
        setPasswordModalOpen(true);
      } else if (item.id === 'two-factor') {
        // Toggle 2FA - would need backend implementation
        toast.info("Two-factor authentication feature coming soon");
      } else if (item.id === 'linked-accounts') {
        setLinkedAccountsModalOpen(true);
      } else if (item.id === 'blocked-users') {
        navigate('/settings/privacy');
      } else if (item.id === 'hidden-content') {
        navigate('/settings/privacy');
      } else if (item.id === 'equalizer') {
        navigate('/settings/appearance');
      } else if (item.id === 'storage') {
        navigate('/settings/data');
      } else if (item.id === 'content-preferences') {
        navigate('/settings/content');
      } else if (item.id === 'language') {
        navigate('/settings/content');
      } else if (item.id === 'feed-order') {
        navigate('/settings/content');
      } else if (item.id === 'autoplay') {
        // Toggle handled by type
      } else if (item.id === 'message-requests') {
        navigate('/settings/messaging');
      } else if (item.id === 'group-invites') {
        navigate('/settings/messaging');
      } else if (item.id === 'call-quality') {
        navigate('/settings/messaging');
      } else if (item.id === 'audio-quality') {
        navigate('/settings/music');
      } else if (item.id === 'downloading') {
        navigate('/settings/music');
      } else if (item.id === 'profile-visibility') {
        navigate('/settings/privacy');
      } else {
        toast.info(`Opening ${item.title}...`);
      }
    } else if (item.type === 'button') {
      if (item.id === 'delete-account') {
        setDeleteAccountModalOpen(true);
      } else if (item.id === 'clear-cache') {
        toast.success("Cache cleared successfully");
      } else if (item.id === 'export-data') {
        toast.info("Preparing your data for download...");
      } else if (item.id === 'backup') {
        toast.info("Starting backup...");
      } else if (item.id === 'report') {
        toast.info("Opening report form...");
      } else {
        toast.info(`Opening ${item.title}...`);
      }
    }
  };

  const renderSettingIcon = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return settingsValues[item.id] || item.value ? 
          <ToggleRight className="w-5 h-5 text-green-500" /> : 
          <ToggleLeft className="w-5 h-5 text-muted-foreground" />;
      case 'link':
        return <ChevronRight className="w-5 h-5 text-muted-foreground" />;
      case 'button':
        return <ChevronRight className="w-5 h-5 text-muted-foreground" />;
      case 'info':
        return <Info className="w-5 h-5 text-muted-foreground" />;
      default:
        return <ChevronRight className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCurrentSectionData = () => {
    if (!selectedSection) return null;
    return getSettingsSection(selectedSection);
  };

  const currentSectionData = getCurrentSectionData();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 glass-card rounded-b-3xl">
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
        </div>

        {/* Settings Sections or Section Detail View */}
        {selectedSection && currentSectionData ? (
          <div className="p-4 space-y-4">
            {/* Back button and title */}
            <div className="flex items-center gap-3 mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { 
                  setSelectedSection(null); 
                  navigate('/settings'); 
                }}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold">{currentSectionData.title}</h2>
            </div>

            {/* Section description */}
            <p className="text-muted-foreground text-sm mb-4">{currentSectionData.description}</p>

            {/* Settings items */}
            <div className="space-y-2" style={{ pointerEvents: 'auto' }}>
              {currentSectionData.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSettingClick(item)}
                  style={{ pointerEvents: 'auto' }}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                    item.type === 'info' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    )}
                  </div>
                  
                  {/* Value display for certain types */}
                  {item.type === 'link' && item.value && (
                    <span className="text-sm text-muted-foreground capitalize">{item.value}</span>
                  )}
                  {item.type === 'info' && item.value && (
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  )}
                  
                  {/* Icon based on type */}
                  {renderSettingIcon(item)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
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
                </div>
              );
            })}

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
          <div
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Clockit v1.0.0
          </p>
        </div>
      </div>

      {/* Change Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" /> Change Email
            </DialogTitle>
            <DialogDescription>
              Enter your new email address below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password-email">Current Password</Label>
              <Input
                id="current-password-email"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Email change request sent! Please verify your new email.");
              setEmailModalOpen(false);
              setNewEmail("");
              setCurrentPassword("");
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current and new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (newPassword !== confirmPassword) {
                toast.error("Passwords don't match!");
                return;
              }
              if (newPassword.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }
              toast.success("Password changed successfully!");
              setPasswordModalOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Accounts Modal */}
      <Dialog open={linkedAccountsModalOpen} onOpenChange={setLinkedAccountsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" /> Linked Accounts
            </DialogTitle>
            <DialogDescription>
              Manage your connected social accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold">G</span>
                </div>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Google account cannot be disconnected")}>
                Disconnect
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">A</span>
                </div>
                <div>
                  <p className="font-medium">Apple</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button size="sm" onClick={() => toast.info("Apple Sign-In coming soon")}>
                Connect
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setLinkedAccountsModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={deleteAccountModalOpen} onOpenChange={setDeleteAccountModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Warning: This will permanently delete your profile, posts, followers, and all other data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type "DELETE" to confirm</Label>
              <Input
                id="delete-confirm"
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={async () => {
                if (deleteConfirmText !== 'DELETE') {
                  toast.error("Type DELETE to confirm");
                  return;
                }
                setIsLoading(true);
                try {
                  toast.success("Account deletion request submitted. We'll process it within 24 hours.");
                  setDeleteAccountModalOpen(false);
                  setDeleteConfirmText("");
                } catch (error) {
                  toast.error("Failed to submit deletion request");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? "Processing..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
