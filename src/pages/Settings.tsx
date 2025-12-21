import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Bell, Lock, Moon, Volume2, Palette, 
  Shield, HelpCircle, Info, LogOut, ChevronRight, 
  Smartphone, Globe, Eye, Download, Trash2, Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Layout } from "@/components/layout/Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

const SettingItem = ({ 
  icon: Icon, 
  label, 
  description, 
  onClick, 
  toggle, 
  toggleValue, 
  onToggle,
  destructive 
}: SettingItemProps) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
      destructive ? "hover:bg-destructive/10" : "hover:bg-muted/50"
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        destructive ? "bg-destructive/20" : "bg-muted"
      }`}>
        <Icon className={`w-5 h-5 ${destructive ? "text-destructive" : "text-foreground"}`} />
      </div>
      <div className="text-left">
        <span className={`font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>
          {label}
        </span>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {toggle ? (
      <Switch checked={toggleValue} onCheckedChange={onToggle} />
    ) : (
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    )}
  </motion.button>
);

const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-muted-foreground px-4 mb-2">{title}</h3>
    <div className="glass-card rounded-2xl overflow-hidden">{children}</div>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <Layout hideNav>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-card rounded-b-3xl"
        >
          <div className="p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
        </motion.header>

        <div className="p-4 space-y-6">
          {/* Account */}
          <SettingSection title="ACCOUNT">
            <SettingItem 
              icon={User} 
              label="Edit Profile" 
              description="Change your name, bio, and photo"
              onClick={() => navigate("/profile")}
            />
            <SettingItem 
              icon={Lock} 
              label="Password & Security" 
              description="Manage your password and 2FA"
              onClick={() => toast.info("Coming soon")}
            />
            <SettingItem 
              icon={Shield} 
              label="Privacy" 
              description="Control who can see your content"
              onClick={() => toast.info("Coming soon")}
            />
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="NOTIFICATIONS">
            <SettingItem 
              icon={Bell} 
              label="Push Notifications" 
              toggle
              toggleValue={pushNotifications}
              onToggle={setPushNotifications}
            />
            <SettingItem 
              icon={Bell} 
              label="In-App Notifications" 
              toggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <SettingItem 
              icon={Volume2} 
              label="Sound Effects" 
              toggle
              toggleValue={soundEffects}
              onToggle={setSoundEffects}
            />
          </SettingSection>

          {/* Appearance */}
          <SettingSection title="APPEARANCE">
            <SettingItem 
              icon={Moon} 
              label="Dark Mode" 
              toggle
              toggleValue={theme === "dark"}
              onToggle={() => toggleTheme()}
            />
            <SettingItem 
              icon={Palette} 
              label="Theme" 
              description="Customize app colors"
              onClick={() => toast.info("Coming soon")}
            />
          </SettingSection>

          {/* Content */}
          <SettingSection title="CONTENT & MEDIA">
            <SettingItem 
              icon={Eye} 
              label="Auto-Play Videos" 
              toggle
              toggleValue={autoPlay}
              onToggle={setAutoPlay}
            />
            <SettingItem 
              icon={Download} 
              label="Data Saver" 
              description="Reduce data usage"
              toggle
              toggleValue={dataSaver}
              onToggle={setDataSaver}
            />
            <SettingItem 
              icon={Heart} 
              label="Content Preferences" 
              description="Manage your feed"
              onClick={() => toast.info("Coming soon")}
            />
          </SettingSection>

          {/* Privacy */}
          <SettingSection title="PRIVACY & SECURITY">
            <SettingItem 
              icon={Lock} 
              label="Private Account" 
              toggle
              toggleValue={privateAccount}
              onToggle={setPrivateAccount}
            />
            <SettingItem 
              icon={Globe} 
              label="Activity Status" 
              description="Show when you're online"
              toggle
              toggleValue={activityStatus}
              onToggle={setActivityStatus}
            />
            <SettingItem 
              icon={Smartphone} 
              label="Connected Devices" 
              onClick={() => toast.info("Coming soon")}
            />
          </SettingSection>

          {/* Support */}
          <SettingSection title="SUPPORT">
            <SettingItem 
              icon={HelpCircle} 
              label="Help Center" 
              onClick={() => toast.info("Coming soon")}
            />
            <SettingItem 
              icon={Info} 
              label="About Clockit" 
              description="Version 1.0.0"
              onClick={() => toast.info("Clockit v1.0.0")}
            />
          </SettingSection>

          {/* Danger Zone */}
          <SettingSection title="ACCOUNT ACTIONS">
            <SettingItem 
              icon={LogOut} 
              label="Sign Out" 
              onClick={handleSignOut}
            />
            <SettingItem 
              icon={Trash2} 
              label="Delete Account" 
              description="Permanently delete your account"
              destructive
              onClick={() => toast.error("This action cannot be undone")}
            />
          </SettingSection>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
