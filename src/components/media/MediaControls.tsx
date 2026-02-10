import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, RotateCcw, Bluetooth, BluetoothConnected, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaControlsProps {
  compact?: boolean;
  showDeviceControls?: boolean;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  compact = false,
  showDeviceControls = false
}) => {
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);

  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    currentTrack,
    isShuffled,
    repeatMode,
    deviceConnected,
    deviceName,
    play,
    pause,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    connectBluetoothDevice,
    disconnectDevice,
    cacheTrack,
    isTrackCached,
  } = useMediaPlayer();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <RotateCcw className="w-4 h-4" />;
      case 'all':
        return <Repeat className="w-4 h-4" />;
      default:
        return <Repeat className="w-4 h-4" />;
    }
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={`bg-background/95 backdrop-blur-sm border-t border-border p-4 ${compact ? 'p-2' : ''}`}>
      {/* Track Info */}
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <img
            src={currentTrack.artwork || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.title}`}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{currentTrack.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={currentTrack.duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack.duration || 0)}</span>
        </div>
      </div>

      {/* Main Controls - All on one line */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {/* Volume Control - positioned before shuffle */}
        <div className="relative flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVolumeExpanded(!isVolumeExpanded)}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          {/* Expandable Volume Slider */}
          <AnimatePresence>
            {isVolumeExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 120, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden ml-2"
              >
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleShuffle}
          className={`rounded-full p-2 ${isShuffled ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
        >
          <Shuffle className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={previous}
          className="rounded-full p-2 text-muted-foreground hover:text-foreground"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={isPlaying ? pause : play}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={next}
          className="rounded-full p-2 text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
          className={`rounded-full p-2 ${repeatMode !== 'off' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
        >
          {getRepeatIcon()}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentTrack) {
              if (isTrackCached(currentTrack.id)) {
                // Could show a message or different action for already downloaded tracks
              } else {
                cacheTrack(currentTrack.id);
              }
            }
          }}
          className={`rounded-full p-2 ${currentTrack && isTrackCached(currentTrack.id) ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground hover:text-primary'}`}
          title={currentTrack && isTrackCached(currentTrack.id) ? 'Downloaded for offline' : 'Download for offline'}
        >
          <Download className="w-4 h-4" />
        </Button>

        {/* Bluetooth Control - positioned after repeat button */}
        {showDeviceControls && (
          <div className="flex items-center">
            {deviceConnected ? (
              <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
                <BluetoothConnected className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-muted-foreground max-w-16 truncate">
                  {deviceName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectDevice}
                  className="h-5 px-1 text-xs ml-1"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={connectBluetoothDevice}
                className="rounded-full p-1.5 bg-muted/50 hover:bg-muted/70"
              >
                <Bluetooth className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};