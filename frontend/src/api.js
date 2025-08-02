import axios from 'axios';

// Create an Axios instance configured for the SkillMatch Pro backend.
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
});

// Request interceptor to add the JWT token to Authorization header if present.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;