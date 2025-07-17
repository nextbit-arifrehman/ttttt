import axios from 'axios';

// Get the correct backend URL based on environment
const getBackendURL = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('replit.dev')) {
    // Extract the replit ID from current URL and construct backend URL
    const parts = hostname.split('-');
    if (parts.length >= 3) {
      const replId = parts[1];
      const replSlug = parts[2];
      return `https://3001-${replId}-${replSlug}.kirk.replit.dev/api`;
    }
  }
  return 'http://localhost:3001/api';
};

const apiClient = axios.create({
  baseURL: getBackendURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  withCredentials: false
});

// Function to get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Add a request interceptor to include the token in the headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    const backendToken = localStorage.getItem('backendToken');
    
    if (backendToken) {
      config.headers.Authorization = `Bearer ${backendToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;