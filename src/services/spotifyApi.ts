import { api } from './api';

class SpotifyApiService {
  private baseURL = '/api/spotify';

  // Get Spotify authorization URL
  async getAuthURL(): Promise<{ authURL: string }> {
    const response = await api.get(`${this.baseURL}/auth/url`);
    return response as { authURL: string };
  }

  // Search tracks
  async searchTracks(query: string, limit: number = 20): Promise<any[]> {
    const response = await api.get(`${this.baseURL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return (response as any).tracks;
  }

  // Get user playlists
  async getUserPlaylists(limit: number = 20): Promise<any[]> {
    const response = await api.get(`${this.baseURL}/me/playlists?limit=${limit}`);
    return (response as any).playlists;
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string, limit: number = 50): Promise<any[]> {
    const response = await api.get(`${this.baseURL}/playlists/${playlistId}/tracks?limit=${limit}`);
    return (response as any).tracks;
  }

  // Get user's top tracks
  async getTopTracks(limit: number = 20): Promise<any[]> {
    const response = await api.get(`${this.baseURL}/me/top-tracks?limit=${limit}`);
    return (response as any).tracks;
  }

  // Get currently playing track
  async getCurrentlyPlaying(): Promise<any> {
    const response = await api.get(`${this.baseURL}/me/player/currently-playing`);
    return (response as any).currentlyPlaying;
  }

  // Playback controls
  async startPlayback(uris: string[], positionMs: number = 0): Promise<void> {
    await api.put(`${this.baseURL}/me/player/play`, {
      uris,
      position_ms: positionMs,
    });
  }

  async pausePlayback(): Promise<void> {
    await api.put(`${this.baseURL}/me/player/pause`);
  }

  async skipToNext(): Promise<void> {
    await api.post(`${this.baseURL}/me/player/next`);
  }

  async skipToPrevious(): Promise<void> {
    await api.post(`${this.baseURL}/me/player/previous`);
  }

  async setVolume(volumePercent: number): Promise<void> {
    await api.put(`${this.baseURL}/me/player/volume`, {
      volume_percent: volumePercent,
    });
  }

  // Helper function to format track data for our player
  formatTrackForPlayer(track: any): any {
    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms,
      artwork: track.album.images[0]?.url,
      url: track.external_urls.spotify,
      spotifyUri: track.uri,
      previewUrl: track.preview_url,
    };
  }

  // Helper function to format playlist data
  formatPlaylistForUI(playlist: any): any {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      artwork: playlist.images[0]?.url,
      trackCount: playlist.tracks.total,
      owner: playlist.owner.display_name,
      spotifyUri: playlist.uri,
    };
  }
}

export const spotifyApi = new SpotifyApiService();