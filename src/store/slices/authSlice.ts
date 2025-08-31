import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, User } from '../../types';
import * as authService from '../../services/auth';
import { RegisterCredentials, PasswordResetRequest, PasswordResetConfirm } from '../../services/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { user, token } = await authService.login(credentials);
      return { user, token };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Falha na autenticação');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async (_, { rejectWithValue }) => {
  try {
    const isAuth = authService.isAuthenticated();
    if (isAuth) {
      // Obter o usuário usando o endpoint /api/auth/me
      const user = await authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        // Se temos token válido mas não conseguimos recuperar o usuário, limpamos o storage
        authService.logout();
        return rejectWithValue('Sessão inválida');
      }
      
      return { user, token };
    }
    return rejectWithValue('Não autenticado');
  } catch (error) {
    // Em caso de erro, limpar o storage para evitar problemas
    authService.logout();
    return rejectWithValue('Erro ao verificar autenticação');
  }
});

// Thunk para registro de usuário
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const { user, token } = await authService.register(credentials);
      return { user, token };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Falha no registro');
    }
  }
);

// Thunk para solicitar recuperação de senha
export const requestPasswordReset = createAsyncThunk(
  'auth/requestReset',
  async (request: PasswordResetRequest, { rejectWithValue }) => {
    try {
      await authService.requestPasswordReset(request);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Falha ao solicitar recuperação de senha');
    }
  }
);

// Thunk para confirmar nova senha
export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmReset',
  async (data: PasswordResetConfirm, { rejectWithValue }) => {
    try {
      await authService.confirmPasswordReset(data);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Falha ao confirmar nova senha');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Se temos os dados do usuário e token, definimos como autenticado
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Falha na autenticação';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request password reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm password reset
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
