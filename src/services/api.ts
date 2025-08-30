import axios from 'axios';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://nl-admin-courses-api-v3.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
