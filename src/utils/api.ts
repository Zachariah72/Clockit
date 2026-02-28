// Centralized API URL helper
// IMPORTANT: VITE_API_URL should include /api/ prefix because the frontend code
// has inconsistent endpoint patterns (some with /api/, some without)
// Set VITE_API_URL = "https://your-backend.onrender.com/api" in Vercel
// Backend is deployed at: clockit-gvm2.onrender.com
export const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || 'https://clockit-gvm2.onrender.com/api';
  console.log('API URL being used:', url);
  return url;
};

// Helper to prepend API URL to any endpoint
export const apiEndpoint = (endpoint: string): string => {
  return `${getApiUrl()}${endpoint}`;
};
