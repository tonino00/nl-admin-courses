import api from './api';
import axios from 'axios';
import { LoginCredentials, User } from '../types';
import jwtDecode from 'jwt-decode';

// Interfaces para registro e recuperação de senha
export interface RegisterCredentials {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: 'admin' | 'teacher' | 'student';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

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

// Função para criar uma nova conta
export const register = async (credentials: RegisterCredentials): Promise<{ user: User; token: string }> => {
  try {
    // Usa uma instância separada do axios para evitar interceptors
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || 'https://nl-admin-courses-api-v3.onrender.com'}/api/auth/register`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );
    
    const { user, token } = response.data;
    
    // Salva o token e dados do usuário no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  } catch (error: any) {
    console.error('Erro de registro:', error);
    
    // Tenta extrair mensagens de erro mais detalhadas da API
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || error.response.data.error || 'Erro desconhecido do servidor';
      throw new Error(`Falha no registro: ${errorMessage}`);
    }
    
    throw new Error('Falha ao criar nova conta. Verifique os dados fornecidos ou sua conexão com a internet.');
  }
};

// Função para solicitar recuperação de senha
export const requestPasswordReset = async (request: PasswordResetRequest): Promise<void> => {
  try {
    // Usa uma instância separada do axios para evitar interceptors
    await axios.post(
      `${process.env.REACT_APP_API_URL || 'https://nl-admin-courses-api-v3.onrender.com'}/api/auth/reset-password/request`,
      request,
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error: any) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    
    // Tenta extrair mensagens de erro mais detalhadas da API
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || error.response.data.error || 'Erro desconhecido do servidor';
      throw new Error(`Falha na solicitação de recuperação: ${errorMessage}`);
    }
    
    throw new Error('Falha ao solicitar recuperação de senha. Verifique o email fornecido.');
  }
};

// Função para confirmar recuperação de senha com novo token
export const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<void> => {
  try {
    // Usa uma instância separada do axios para evitar interceptors
    await axios.post(
      `${process.env.REACT_APP_API_URL || 'https://nl-admin-courses-api-v3.onrender.com'}/api/auth/reset-password/confirm`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error: any) {
    console.error('Erro ao confirmar nova senha:', error);
    
    // Tenta extrair mensagens de erro mais detalhadas da API
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || error.response.data.error || 'Erro desconhecido do servidor';
      throw new Error(`Falha na confirmação da nova senha: ${errorMessage}`);
    }
    
    throw new Error('Falha ao redefinir senha. Verifique o token e tente novamente.');
  }
};
