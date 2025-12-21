import { useEffect, useRef } from 'react';

interface MediaSessionData {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  currentTime?: number;
  isPlaying: boolean;
}

interface UseMediaSessionProps {
  mediaData: MediaSessionData | null;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
}

export const useMediaSession = ({
  mediaData,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
}: UseMediaSessionProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!mediaData || !('mediaSession' in navigator)) return;

    const { title, artist, album, artwork, duration, currentTime, isPlaying } = mediaData;

    // Set up media session metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: album || 'Clockit',
      artwork: artwork ? [{ src: artwork, sizes: '512x512', type: 'image/jpeg' }] : undefined,
    });

    // Set up media session action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      onPlay?.();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      onPause?.();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      onNext?.();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      onPrevious?.();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        onSeek?.(details.seekTime);
      }
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Set position state if duration is available
    if (duration && currentTime !== undefined) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: currentTime,
      });
    }

    return () => {
      // Clean up handlers when component unmounts or mediaData changes
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [mediaData, onPlay, onPause, onNext, onPrevious, onSeek]);

  return audioRef;
};