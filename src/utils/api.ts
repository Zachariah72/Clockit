// Centralized API URL helper
// Uses VITE_API_URL environment variable, falls back to Render URL for production
export const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || 'https://clockit-gvm2.onrender.com';
  console.log('API URL being used:', url);
  return url;
};

// Helper to prepend API URL to any endpoint
export const apiEndpoint = (endpoint: string): string => {
  return `${getApiUrl()}${endpoint}`;
};
