import { toast } from 'sonner';

// Build the API base URL - ensure it's always a proper URL
const getApiBaseUrl = () => {
  const devUrl = 'http://localhost:5000/api';
  const prodUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // In development, try to use proxy if available, otherwise use direct URL
  if (import.meta.env.DEV) {
    // Check if there's a proxy configured (Vite dev server)
    return devUrl;
  }
  return prodUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Check if body is FormData - don't set Content-Type, let browser set it
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      headers: isFormData
        ? { ...options.headers }  // Don't set Content-Type for FormData
        : { 'Content-Type': 'application/json', ...options.headers },
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    console.log(`API ${options.method || 'GET'} ${endpoint}`);
    console.log('Headers:', JSON.stringify(config.headers, null, 2));

    try {
      const response = await fetch(url, config);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new ApiError(response.status, errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof ApiError) {
        // Handle specific API errors
        if (error.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/auth';
        } else if (error.status === 404 && error.message.includes('User not found')) {
          // User not found - clear stale token
          localStorage.removeItem('auth_token');
          window.location.href = '/auth';
        } else if (error.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.message);
        }
        throw error;
      } else {
        // Network or other errors
        toast.error('Network error. Please check your connection.');
        throw error;
      }
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async getPublic<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
      method: 'GET',
    };

    // Don't add auth token for public endpoints
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.message);
        }
        throw error;
      } else {
        toast.error('Network error. Please check your connection.');
        throw error;
      }
    }
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // Check if data is FormData - don't stringify it
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService(API_BASE_URL);

// Artist follow API functions
export const followArtist = async (artistId: string, artistName: string, artistImage: string = '') => {
  return api.post('/artists/follow/follow', { artistId, artistName, artistImage });
};

export const unfollowArtist = async (artistId: string) => {
  return api.delete(`/artists/follow/unfollow/${artistId}`);
};

export const checkArtistFollow = async (artistId: string) => {
  return api.get<{ isFollowing: boolean }>(`/artists/follow/check/${artistId}`);
};

export const checkMultipleArtistFollows = async (artistIds: string[]) => {
  return api.post<{ following: Record<string, boolean> }>('/artists/follow/check-multiple', { artistIds });
};

export const getFollowedArtists = async () => {
  return api.get<any[]>('/artists/follow/following');
};

// Music & Likes API functions
export const toggleMusicLike = async (trackId: string, metadata: any) => {
  return api.post<{ liked: boolean }>('/likes/toggle', {
    contentId: trackId,
    contentType: 'song',
    metadata
  });
};

export const checkMusicLike = async (trackId: string) => {
  return api.get<{ liked: boolean }>(`/likes/check/${trackId}/song`);
};

export const getUserLikes = async () => {
  return api.get<any[]>('/likes/user');
};

export const recordListeningHistory = async (trackId: string, source: string, metadata: any) => {
  return api.post('/music/history', { trackId, source, metadata });
};

export const getListeningHistory = async () => {
  return api.get<any[]>('/music/history');
};

export const searchMusic = async (query: string) => {
  return api.get<any[]>(`/music/search?q=${encodeURIComponent(query)}`);
};

// Playlist API functions
export const getUserPlaylists = async () => {
  return api.get<any[]>('/playlists');
};

export const getPlaylistById = async (id: string) => {
  return api.get<any>(`/playlists/${id}`);
};

export const createPlaylist = async (data: { name: string; description?: string; isPublic?: boolean; coverImage?: string; theme?: any }) => {
  return api.post<any>('/playlists', data);
};

export const updatePlaylist = async (id: string, data: any) => {
  return api.put<any>(`/playlists/${id}`, data);
};

export const deletePlaylist = async (id: string) => {
  return api.delete(`/playlists/${id}`);
};

export const addTrackToPlaylist = async (playlistId: string, trackId: string, source: string, metadata: any) => {
  return api.post(`/playlists/${playlistId}/tracks`, { trackId, source, metadata });
};

export const removeTrackFromPlaylist = async (playlistId: string, trackId: string, source: string) => {
  return api.delete(`/playlists/${playlistId}/tracks`, { body: JSON.stringify({ trackId, source }) });
};

// Listening Group API functions
export const getJoinedGroups = async () => {
  return api.get<any[]>('/listening-groups');
};

export const discoverPublicGroups = async () => {
  return api.get<any[]>('/listening-groups/discover');
};

export const createListeningGroup = async (data: { name: string; description?: string; isPublic?: boolean }) => {
  return api.post<any>('/listening-groups', data);
};

export const joinListeningGroup = async (groupId: string) => {
  return api.post<any>(`/listening-groups/${groupId}/join`);
};

export const leaveListeningGroup = async (groupId: string) => {
  return api.post(`/listening-groups/${groupId}/leave`);
};

export const updateGroupPlayback = async (groupId: string, data: { currentTrack: any; isPlaying: boolean; currentTime: number }) => {
  return api.put(`/listening-groups/${groupId}/playback`, data);
};