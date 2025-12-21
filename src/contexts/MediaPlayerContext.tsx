import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useMediaSession } from '@/hooks/useMediaSession';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  artwork?: string;
}

interface MediaPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playlist: Track[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  deviceConnected: boolean;
  deviceName: string | null;
}

interface MediaPlayerContextType extends MediaPlayerState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playTrack: (track: Track, playlist?: Track[], index?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  connectBluetoothDevice: () => Promise<void>;
  disconnectDevice: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};

interface MediaPlayerProviderProps {
  children: ReactNode;
}

export const MediaPlayerProvider: React.FC<MediaPlayerProviderProps> = ({ children }) => {
  const [state, setState] = useState<MediaPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    playlist: [],
    currentIndex: -1,
    isShuffled: false,
    repeatMode: 'all', // Default to auto-play next songs
    deviceConnected: false,
    deviceName: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bluetoothDeviceRef = useRef<any>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;

      // Audio event listeners
      audioRef.current.addEventListener('timeupdate', () => {
        setState(prev => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }));
      });

      audioRef.current.addEventListener('ended', () => {
        handleTrackEnd();
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setState(prev => ({
            ...prev,
            currentTrack: prev.currentTrack ? {
              ...prev.currentTrack,
              duration: audioRef.current!.duration
            } : null
          }));
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  const handleTrackEnd = () => {
    if (state.repeatMode === 'one') {
      // Replay current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (state.repeatMode === 'all' || state.currentIndex < state.playlist.length - 1) {
      next();
    } else {
      // Stop playback
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const play = () => {
    if (audioRef.current && state.currentTrack) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  };

  const next = () => {
    if (state.playlist.length === 0) return;

    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.playlist.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // End of playlist
      }
    }

    const nextTrack = state.playlist[nextIndex];
    playTrack(nextTrack, state.playlist, nextIndex);
  };

  const previous = () => {
    if (state.playlist.length === 0) return;

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.playlist.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    const prevTrack = state.playlist[prevIndex];
    playTrack(prevTrack, state.playlist, prevIndex);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  const toggleMute = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const playTrack = (track: Track, playlist: Track[] = [], index: number = 0) => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();

      // If no playlist provided, create one from all available songs for continuous play
      const finalPlaylist = playlist.length > 0 ? playlist : [track];

      setState(prev => ({
        ...prev,
        currentTrack: track,
        playlist: finalPlaylist,
        currentIndex: playlist.length > 0 ? index : 0,
        currentTime: 0,
      }));

      // Auto-play after loading
      audioRef.current.addEventListener('canplay', () => {
        if (audioRef.current) {
          audioRef.current.play();
          setState(prev => ({ ...prev, isPlaying: true }));
        }
      }, { once: true });
    }
  };

  const addToQueue = (track: Track) => {
    setState(prev => ({
      ...prev,
      playlist: [...prev.playlist, track]
    }));
  };

  const removeFromQueue = (index: number) => {
    setState(prev => ({
      ...prev,
      playlist: prev.playlist.filter((_, i) => i !== index),
      currentIndex: prev.currentIndex > index ? prev.currentIndex - 1 : prev.currentIndex
    }));
  };

  const toggleShuffle = () => {
    setState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  };

  const setRepeatMode = (mode: 'off' | 'one' | 'all') => {
    setState(prev => ({ ...prev, repeatMode: mode }));
  };

  const connectBluetoothDevice = async () => {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth not supported');
      }

      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'audio_sink'],
      });

      bluetoothDeviceRef.current = device;
      setState(prev => ({
        ...prev,
        deviceConnected: true,
        deviceName: device.name || 'Unknown Device'
      }));

      console.log('Connected to Bluetooth device:', device.name);
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  };

  const disconnectDevice = () => {
    if (bluetoothDeviceRef.current) {
      bluetoothDeviceRef.current.gatt?.disconnect();
      bluetoothDeviceRef.current = null;
    }
    setState(prev => ({
      ...prev,
      deviceConnected: false,
      deviceName: null
    }));
  };

  // Media Session integration for mobile media controls
  useEffect(() => {
    if ('mediaSession' in navigator && state.currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.currentTrack.title,
        artist: state.currentTrack.artist,
        album: state.currentTrack.album || 'Clockit',
        artwork: state.currentTrack.artwork ? [
          { src: state.currentTrack.artwork, sizes: '512x512', type: 'image/png' }
        ] : []
      });

      // Set up action handlers
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', next);
      navigator.mediaSession.setActionHandler('previoustrack', previous);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          seekTo(details.seekTime);
        }
      });

      // Update playback state
      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      // Set position state if duration is available
      if (state.currentTrack.duration && state.currentTrack.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: state.currentTrack.duration,
          playbackRate: 1,
          position: state.currentTime
        });
      }
    }
  }, [state.currentTrack, state.isPlaying, state.currentTime]);

  // Legacy media session hook for additional features
  useMediaSession({
    mediaData: state.currentTrack ? {
      title: state.currentTrack.title,
      artist: state.currentTrack.artist,
      album: state.currentTrack.album,
      artwork: state.currentTrack.artwork,
      duration: state.currentTrack.duration,
      currentTime: state.currentTime,
      isPlaying: state.isPlaying,
    } : null,
    onPlay: play,
    onPause: pause,
    onNext: next,
    onPrevious: previous,
    onSeek: seekTo,
  });

  const contextValue: MediaPlayerContextType = {
    ...state,
    play,
    pause,
    stop,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    playTrack,
    addToQueue,
    removeFromQueue,
    toggleShuffle,
    setRepeatMode,
    connectBluetoothDevice,
    disconnectDevice,
  };

  return (
    <MediaPlayerContext.Provider value={contextValue}>
      {children}
    </MediaPlayerContext.Provider>
  );
};