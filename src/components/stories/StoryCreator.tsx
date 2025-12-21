import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Image, RotateCcw, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (media: File, type: 'image' | 'video') => void;
}

export const StoryCreator = ({ isOpen, onClose, onStoryCreated }: StoryCreatorProps) => {
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    try {
      setFacingMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'story-photo.jpg', { type: 'image/jpeg' });
            setSelectedMedia(file);
            setMediaPreview(canvas.toDataURL('image/jpeg'));
            setMediaType('image');
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = () => {
    if (selectedMedia && mediaType) {
      onStoryCreated(selectedMedia, mediaType);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    onClose();
  };

  const switchCamera = () => {
    stopCamera();
    setTimeout(() => {
      startCamera(facingMode === 'user' ? 'environment' : 'user');
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-6 h-6" />
              </Button>
              <h2 className="text-lg font-semibold">Create Story</h2>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Main Content */}
          <div className="h-full flex flex-col">
            {!selectedMedia ? (
              /* Media Selection */
              <div className="flex-1 flex flex-col">
                {/* Camera View */}
                {isCapturing ? (
                  <div className="flex-1 relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={switchCamera}
                        className="rounded-full w-12 h-12"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>

                      <Button
                        variant="default"
                        size="lg"
                        onClick={capturePhoto}
                        className="rounded-full w-16 h-16 border-4 border-white"
                      >
                        <div className="w-6 h-6 bg-white rounded-full" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full w-12 h-12"
                      >
                        <Image className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Initial Options */
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-8">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Create Your Story</h3>
                      <p className="text-muted-foreground">Share a moment with your friends</p>
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-xs">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => startCamera('user')}
                        className="gap-3"
                      >
                        <Camera className="w-5 h-5" />
                        Take Photo
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-3"
                      >
                        <Image className="w-5 h-5" />
                        Choose from Gallery
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Preview and Edit */
              <div className="flex-1 flex flex-col">
                {/* Media Preview */}
                <div className="flex-1 relative">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaPreview!}
                      alt="Story preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={mediaPreview!}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Story Type Indicator */}
                  <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {mediaType === 'image' ? '📸 Photo' : '🎥 Video'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMedia(null);
                      setMediaPreview(null);
                      setMediaType(null);
                      startCamera(facingMode);
                    }}
                  >
                    Retake
                  </Button>

                  <Button
                    variant="default"
                    onClick={handleCreateStory}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Share Story
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};