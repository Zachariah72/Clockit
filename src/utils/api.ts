// Centralized API URL helper
// IMPORTANT: VITE_API_URL should include /api/ prefix because the frontend code
// has inconsistent endpoint patterns (some with /api/, some without)
// Set VITE_API_URL = "https://your-backend.onrender.com/api" in Vercel
// Backend is deployed at: clockit-gvm2.onrender.com
export const getApiUrl = (): string => {
  // Check if we're in development mode (localhost)
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // If localhost, always use localhost API
  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }
  
  // Use env variable or production fallback in production
  const url = import.meta.env.VITE_API_URL || 'https://clockit-gvm2.onrender.com/api';
  console.log('API URL being used:', url);
  return url;
};

// Helper to prepend API URL to any endpoint
export const apiEndpoint = (endpoint: string): string => {
  return `${getApiUrl()}${endpoint}`;
};
