// Centralized API URL helper
// Uses VITE_API_URL environment variable, falls back to Render URL for production
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
};

// Helper to prepend API URL to any endpoint
export const apiEndpoint = (endpoint: string): string => {
  return `${getApiUrl()}${endpoint}`;
};
