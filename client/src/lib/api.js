import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://65be57f83c49.ngrok-free.app/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
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