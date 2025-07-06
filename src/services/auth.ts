import api from './api';
import { LoginCredentials, User, ApiResponse } from '../types';
import jwtDecode from 'jwt-decode';

// Simple JWT implementation for mock authentication
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  try {
    // In a real app, we'd call a login endpoint
    // For our mock, we'll fetch users and match credentials
    const response = await api.get('/users');
    const users = response.data as User[];
    
    const user = users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    // Create a mock JWT token (in real app this would come from backend)
    const token = createMockJwt(user);
    
    // Save token to localStorage
    localStorage.setItem('token', token);
    
    return { user, token };
  } catch (error) {
    throw new Error('Falha na autenticação');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
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

export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    const decodedToken: any = jwtDecode(token);
    return decodedToken.user;
  } catch {
    return null;
  }
};

// Helper to create a mock JWT token
const createMockJwt = (user: User): string => {
  // Create a simple mock JWT (don't do this in production!)
  const { password, ...userWithoutPassword } = user;
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    user: userWithoutPassword,
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600 // Token expires in 1 hour
  };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(`${base64Header}.${base64Payload}`); // In real JWT this would be cryptographically signed
  
  return `${base64Header}.${base64Payload}.${signature}`;
};
