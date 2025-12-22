import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera as CameraIcon, RotateCcw, X, Check, FlipHorizontal, Sparkles, Heart, Zap, Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface CameraProps {
  onCapture?: (imageData: string, file: File) => void;
  onClose?: () => void;
  className?: string;
  enableFilters?: boolean;
}

const filters = [
  { id: 'none', name: 'None', icon: X, style: '' },
  { id: 'vintage', name: 'Vintage', icon: Sun, style: 'sepia(0.3) contrast(1.1) brightness(1.1)' },
  { id: 'bw', name: 'B&W', icon: Moon, style: 'grayscale(1)' },
  { id: 'bright', name: 'Bright', icon: Zap, style: 'brightness(1.2) contrast(1.1)' },
  { id: 'warm', name: 'Warm', icon: Heart, style: 'sepia(0.2) saturate(1.3) brightness(1.1)' },
  { id: 'cool', name: 'Cool', icon: Sparkles, style: 'hue-rotate(180deg) saturate(1.2)' },
  { id: 'dramatic', name: 'Drama', icon: Palette, style: 'contrast(1.5) brightness(0.9) saturate(1.2)' }
];

export const Camera: React.FC<CameraProps> = ({
  onCapture,
  onClose,
  className = '',
  enableFilters = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [showFilters, setShowFilters] = useState(false);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);

        // Create file from blob
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Stop camera after capture
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Confirm capture
  const confirmCapture = useCallback(() => {
    if (capturedImage && canvasRef.current) {
      // Convert data URL to blob and create file
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture?.(capturedImage, file);
        }
      }, 'image/jpeg', 0.9);
    }
  }, [capturedImage, onCapture]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode, startCamera, isStreaming]);

  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden bg-black">
        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-black">
          <AnimatePresence mode="wait">
            {!capturedImage ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-white text-center p-4">
                      <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <p className="text-red-500 mb-4">{error}</p>
                      <Button onClick={startCamera} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    filter: activeFilter !== 'none' ? filters.find(f => f.id === activeFilter)?.style : 'none'
                  }}
                />

                {/* Camera Controls Overlay */}
                {isStreaming && !isLoading && !error && (
                  <>
                    {/* Filter Toggle */}
                    {enableFilters && (
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={() => setShowFilters(!showFilters)}
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                        >
                          <Palette className="w-5 h-5 text-white" />
                        </Button>
                      </div>
                    )}

                    {/* Active Filter Badge */}
                    {activeFilter !== 'none' && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                          {filters.find(f => f.id === activeFilter)?.name}
                        </Badge>
                      </div>
                    )}

                    {/* Filter Selection */}
                    <AnimatePresence>
                      {showFilters && enableFilters && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-2xl p-3"
                        >
                          <div className="flex gap-2">
                            {filters.map((filter) => {
                              const Icon = filter.icon;
                              return (
                                <Button
                                  key={filter.id}
                                  onClick={() => {
                                    setActiveFilter(filter.id);
                                    setShowFilters(false);
                                  }}
                                  variant={activeFilter === filter.id ? "default" : "ghost"}
                                  size="sm"
                                  className="flex flex-col gap-1 h-auto p-2 min-w-16"
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="text-xs">{filter.name}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Main Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      <Button
                        onClick={switchCamera}
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                      >
                        <FlipHorizontal className="w-5 h-5 text-white" />
                      </Button>

                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 border-4 border-white"
                      >
                        <CameraIcon className="w-6 h-6 text-black" />
                      </Button>

                      <Button
                        onClick={onClose}
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                      >
                        <X className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full"
              >
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                  style={{
                    filter: activeFilter !== 'none' ? filters.find(f => f.id === activeFilter)?.style : 'none'
                  }}
                />

                {/* Preview Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <Button
                    onClick={retakePhoto}
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </Button>

                  <Button
                    onClick={confirmCapture}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-6 h-6 text-white" />
                  </Button>

                  <Button
                    onClick={onClose}
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/50 hover:bg-black/70 border-white/20"
                  >
                    <X className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};