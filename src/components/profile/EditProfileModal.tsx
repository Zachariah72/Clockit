import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User, Edit2, Save, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera as CameraComponent } from "@/components/Camera";
import avatar1 from "@/assets/avatar-1.jpg";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
  };
  onSave: (profile: any) => void;
}

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onSave }: EditProfileModalProps) => {
  const [profile, setProfile] = useState(currentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(profile);
    setIsLoading(false);
    onClose();
  };

  const handleAvatarChange = () => {
    setShowAvatarOptions(true);
  };

  const handleCameraCapture = (imageData: string, file: File) => {
    // Convert image to data URL for preview
    setProfile({ ...profile, avatar: imageData });
    setShowCamera(false);
    setShowAvatarOptions(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, avatar: e.target?.result as string });
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-background rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted p-1">
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <Button
                  variant="glow"
                  size="icon-sm"
                  className="absolute bottom-0 right-0"
                  onClick={handleAvatarChange}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>

              {/* Avatar Options */}
              <AnimatePresence>
                {showAvatarOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-full mt-2 z-10 bg-background border border-border rounded-lg p-3 shadow-lg"
                  >
                    <div className="flex flex-col gap-2 min-w-32">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCamera(true);
                          setShowAvatarOptions(false);
                        }}
                        className="justify-start gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('avatar-file')?.click()}
                        className="justify-start gap-2"
                      >
                        <Image className="w-4 h-4" />
                        Choose Photo
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden file input */}
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.bio.length}/150 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>

            {/* Camera Component */}
            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background rounded-2xl overflow-hidden"
                >
                  <CameraComponent
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                    className="w-full h-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};