import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User, Edit2, Save, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera as CameraComponent } from "@/components/Camera";
import { profileApi } from "@/services/profileApi";
import { toast } from "sonner";
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewTime, setAvatarPreviewTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      let newAvatarUrl = profile.avatar;
      
      // Upload avatar if a new file was selected
      if (avatarFile) {
        console.log('=== UPLOADING AVATAR ===');
        console.log('File name:', avatarFile.name);
        console.log('File type:', avatarFile.type);
        console.log('File size:', avatarFile.size);
        console.log('Calling profileApi.uploadAvatar...');
        
        const result = await profileApi.uploadAvatar(avatarFile);
        console.log('Avatar upload result:', JSON.stringify(result, null, 2));
        newAvatarUrl = result.avatar;
        console.log('New avatar URL:', newAvatarUrl);
        console.log('=== UPLOAD COMPLETE ===');
      } else {
        console.log('No avatar file selected, keeping existing avatar:', newAvatarUrl);
      }
      
      // Update text fields
      console.log('Updating profile fields...');
      await profileApi.updateProfile({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
      });
      
      // Return updated profile with new avatar URL
      console.log('Calling onSave with updated profile...');
      onSave({ ...profile, avatar: newAvatarUrl });
      console.log('Profile saved successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      toast.error("Failed to update profile: " + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleAvatarChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Avatar change button clicked');
    setShowAvatarOptions(!showAvatarOptions);
  };

  const handleCameraCapture = (imageData: string, file: File) => {
    setProfile({ ...profile, avatar: imageData });
    setAvatarFile(file);
    setAvatarPreviewTime(Date.now());
    setShowCamera(false);
    setShowAvatarOptions(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name, 'type:', file?.type);
    if (file) {
      console.log('Starting FileReader...');
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader completed, result length:', e.target?.result?.toString().length);
        console.log('Updating state...');
        setProfile({ ...profile, avatar: e.target?.result as string });
        setAvatarFile(file);
        setAvatarPreviewTime(Date.now());
        setShowAvatarOptions(false);
        console.log('State updated');
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
      };
      reader.onprogress = (e) => {
        console.log('FileReader progress:', e.loaded, '/', e.total);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Take Photo clicked');
    setShowCamera(true);
    setShowAvatarOptions(false);
  };

  const handleChoosePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Choose Photo clicked');
    const fileInput = document.getElementById('avatar-file');
    if (fileInput) {
      console.log('Found file input, triggering click');
      fileInput.click();
    } else {
      console.error('File input not found!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && !showCamera && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-background rounded-2xl p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6 relative">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-muted p-1 overflow-hidden">
                  <img
                    src={profile.avatar ? `${profile.avatar}?t=${avatarPreviewTime}` : avatar1}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = avatar1;
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAvatarChange}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors cursor-pointer z-20"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>

              {/* Avatar Options Dropdown */}
              <AnimatePresence>
                {showAvatarOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 bg-background border border-border rounded-lg p-2 shadow-lg min-w-36 z-30"
                  >
                    <button
                      type="button"
                      onClick={handleTakePhoto}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleChoosePhoto}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md cursor-pointer"
                    >
                      <Image className="w-4 h-4" />
                      Choose Photo
                    </button>
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

            {/* Username */}
            <div className="mb-4">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="Enter username"
                className="mt-1"
              />
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Enter display name"
                className="mt-1"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Camera Component */}
      {showCamera && (
        <div className="fixed inset-0 z-[100]">
          <CameraComponent
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
