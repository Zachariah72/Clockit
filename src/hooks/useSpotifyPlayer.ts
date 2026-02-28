import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface SpotifyPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: any;
  position: number;
  duration: number;
  volume: number;
  deviceId: string | null;
}

export const useSpotifyPlayer = () => {
  const { spotifyTokens, setSpotifyTokens } = useAuth();
  const [state, setState] = useState<SpotifyPlayerState>({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 1,
    deviceId: null,
  });

  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!spotifyTokens || !spotifyTokens.accessToken) return;

    // Check if SDK is already loaded
    if (window.Spotify) {
      initializePlayer();
      return;
    }

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [spotifyTokens]);

  const initializePlayer = useCallback(() => {
    if (!window.Spotify || !spotifyTokens) return;

    const player = new window.Spotify.Player({
      name: 'Clockit Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        // Check if token is expired and refresh if needed
        if (spotifyTokens.expiresAt && Date.now() > spotifyTokens.expiresAt) {
          refreshToken().then((newTokens) => {
            if (newTokens) {
              cb(newTokens.accessToken);
            }
          });
        } else {
          cb(spotifyTokens.accessToken);
        }
      },
      volume: 0.5
    });

    playerRef.current = player;

    // Error handling
    player.addListener('initialization_error', ({ message }: any) => {
      console.error('Failed to initialize:', message);
    });

    player.addListener('authentication_error', ({ message }: any) => {
      console.error('Failed to authenticate:', message);
      // Token might be invalid, try refreshing
      refreshToken();
    });

    player.addListener('account_error', ({ message }: any) => {
      console.error('Failed to validate Spotify account:', message);
    });

    player.addListener('playback_error', ({ message }: any) => {
      console.error('Failed to perform playback:', message);
    });

    // Playback status updates
    player.addListener('player_state_changed', (playerState: any) => {
      if (!playerState) return;

      const {
        paused,
        position,
        duration,
        track_window: { current_track }
      } = playerState;

      setState(prev => ({
        ...prev,
        isPlaying: !paused,
        currentTrack: current_track,
        position: position,
        duration: duration,
      }));
    });

    // Ready
    player.addListener('ready', ({ device_id }: any) => {
      console.log('Ready with Device ID', device_id);
      deviceIdRef.current = device_id;
      setState(prev => ({ ...prev, isReady: true, deviceId: device_id }));

      // Transfer playback to this device
      transferPlayback(device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Device ID has gone offline', device_id);
      setState(prev => ({ ...prev, isReady: false, deviceId: null }));
    });

    // Connect to the player
    player.connect();
  }, [spotifyTokens]);

  const refreshToken = async () => {
    if (!spotifyTokens?.refreshToken) return null;

    try {
      const response = await fetch('/api/spotify/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: spotifyTokens.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          accessToken: data.accessToken,
          refreshToken: spotifyTokens.refreshToken, // Keep the same refresh token
          expiresAt: Date.now() + (data.expiresIn * 1000)
        };

        setSpotifyTokens(newTokens);
        return newTokens;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
    return null;
  };

  const transferPlayback = async (deviceId: string) => {
    if (!spotifyTokens) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        }),
      });
    } catch (error) {
      console.error('Failed to transfer playback:', error);
    }
  };

  const play = useCallback(async (uris?: string[]) => {
    if (!playerRef.current || !state.isReady) return;

    try {
      if (uris && uris.length > 0) {
        // Play specific tracks
        await playerRef.current.play({
          uris: uris
        });
      } else {
        // Resume playback
        await playerRef.current.resume();
      }
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }, [state.isReady]);

  const pause = useCallback(async () => {
    if (!playerRef.current || !state.isReady) return;

    try {
      await playerRef.current.pause();
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, [state.isReady]);

  const next = useCallback(async () => {
    if (!playerRef.current || !state.isReady) return;

    try {
      await playerRef.current.nextTrack();
    } catch (error) {
      console.error('Failed to skip to next:', error);
    }
  }, [state.isReady]);

  const previous = useCallback(async () => {
    if (!playerRef.current || !state.isReady) return;

    try {
      await playerRef.current.previousTrack();
    } catch (error) {
      console.error('Failed to skip to previous:', error);
    }
  }, [state.isReady]);

  const seekTo = useCallback(async (position: number) => {
    if (!playerRef.current || !state.isReady) return;

    try {
      await playerRef.current.seek(position);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, [state.isReady]);

  const setVolume = useCallback(async (volume: number) => {
    if (!playerRef.current || !state.isReady) return;

    try {
      await playerRef.current.setVolume(volume);
      setState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, [state.isReady]);

  return {
    ...state,
    play,
    pause,
    next,
    previous,
    seekTo,
    setVolume,
  };
};