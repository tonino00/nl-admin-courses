import api from './api';
import { LoginCredentials, User } from '../types';
import jwtDecode from 'jwt-decode';

// Real API authentication implementation
export const login = async (
  credentials: LoginCredentials
): Promise<{ user: User; token: string }> => {
  try {
    // Call the real login endpoint
    const response = await api.post('/api/auth/login', credentials);
    const { user, token } = response.data;
    
    // Save token and user data to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Falha na autenticação. Verifique suas credenciais.');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    return decodedToken.exp > currentTime;
  } catch {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Primeiro tentamos obter o usuário do endpoint /api/auth/me
    const response = await api.get('/api/auth/me');
    const user = response.data;
    
    // Atualizamos o usuário no localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    
    // Fallback: tentamos obter do localStorage
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson) as User;
      }
      return null;
    } catch {
      return null;
    }
  }
};

// No longer need the mock JWT implementation as we're using the real API
