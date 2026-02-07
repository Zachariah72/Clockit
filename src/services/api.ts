import { toast } from 'sonner';

// Build the API base URL - ensure it's always a proper URL
const getApiBaseUrl = () => {
  const devUrl = 'http://localhost:5000';
  const prodUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // In development, use dev URL
  if (import.meta.env.DEV) {
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