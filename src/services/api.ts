import axios from 'axios';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://nl-admin-courses-api-v3.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lista de rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password/request',
  '/api/auth/reset-password/confirm'
];

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Verifica se a URL atual é uma rota pública
    const isPublicRoute = publicRoutes.some(route => 
      config.url?.endsWith(route) || config.url?.includes(route)
    );
    
    // Só adiciona o token para rotas que não são públicas
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
