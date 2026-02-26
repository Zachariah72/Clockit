import { api } from './api';

export interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  linkInBio?: string;
  followersCount: number;
  followingCount: number;
  storiesCount: number;
  streakCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface Story {
  _id: string;
  contentType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  viewsCount: number;
  likesCount: number;
  duration?: number;
  createdAt: string;
}

export interface Reel {
  _id: string;
  title?: string;
  description?: string;
  thumbnail: string;
  url: string;
  views: number;
  likes: number;
  duration?: number;
  createdAt: string;
}

export interface SavedItem {
  _id: string;
  contentType: 'reel' | 'song' | 'post' | 'story';
  contentData: {
    title: string;
    artist?: string;
    image: string;
    creator?: User;
  };
  savedAt: string;
}

export interface DraftItem {
  _id: string;
  contentType: 'story' | 'reel' | 'post';
  title?: string;
  description?: string;
  completionPercentage: number;
  lastEditedAt: string;
  createdAt: string;
}

// Profile API functions
export const profileApi = {
  // Get user profile
  getProfile: (userId?: string) =>
    api.get<User>(userId ? `/profile/${userId}` : '/profile'),

  // Update profile (text fields only)
  updateProfile: (data: Partial<User>) =>
    api.put<User>('/profile', data),

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string; user: User }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Don't set Content-Type header - let the browser set it with boundary
    return api.post<{ avatar: string; user: User }>('/profile/avatar', formData);
  },

  // Social features
  getFollowers: (userId?: string, page = 1, limit = 20) =>
    api.get<{ followers: User[]; pagination: any }>(userId ? `/profile/${userId}/followers?page=${page}&limit=${limit}` : `/profile/followers?page=${page}&limit=${limit}`),

  getFollowing: (userId?: string, page = 1, limit = 20) =>
    api.get<{ following: User[]; pagination: any }>(userId ? `/profile/${userId}/following?page=${page}&limit=${limit}` : `/profile/following?page=${page}&limit=${limit}`),

  toggleFollow: (userId: string) =>
    api.post<{ action: 'followed' | 'unfollowed' }>(`/profile/${userId}/follow`),

  // Search
  search: (query: string, type?: string, limit = 10) =>
    api.get<{ success: boolean; data: { query: string; total: number; results: any[] } }>(`/search?q=${encodeURIComponent(query)}&type=${type || ''}&limit=${limit}`),

  // Content features
  getStories: (userId?: string) =>
    api.get<Story[]>(userId ? `/profile/${userId}/stories` : '/profile/stories'),

  getReels: (userId?: string, page = 1, limit = 20) =>
    api.get<{ reels: Reel[]; pagination: any }>(userId ? `/profile/${userId}/reels?page=${page}&limit=${limit}` : `/profile/reels?page=${page}&limit=${limit}`),

  getSavedContent: (type: 'reel' | 'song' | 'post' | 'story' | 'all' = 'all', page = 1, limit = 20) =>
    api.get<{ savedContent: SavedItem[]; pagination: any }>(`/profile/saved?type=${type}&page=${page}&limit=${limit}`),

  toggleSaveContent: (data: {
    contentId: string;
    contentType: 'reel' | 'song' | 'post' | 'story';
    contentModel: string;
    contentData?: any;
  }) =>
    api.post<{ action: 'saved' | 'unsaved'; data?: SavedItem }>(`/profile/save`, data),

  getDrafts: (type: 'story' | 'reel' | 'post' | 'all' = 'all') =>
    api.get<DraftItem[]>(`/profile/drafts?type=${type}`),

  // Music sharing
  shareMusic: (data: {
    songId: string;
    shareType: 'messages' | 'social' | 'friends' | 'link';
    platform?: string;
    recipientUsers?: string[];
  }) =>
    api.post<{ message: string; share: any }>(`/profile/share-music`, data),

  // Phone verification for 2FA
  sendVerificationCode: (phone: string) =>
    api.post<{ message: string }>(`/verification/send`, { phone }),

  verifyPhoneCode: (phone: string, code: string) =>
    api.post<{ message: string }>(`/verification/verify`, { phone, code }),
};