import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, User } from '../../types';
import * as authService from '../../services/auth';

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

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async () => {
  const isAuth = authService.isAuthenticated();
  if (isAuth) {
    const user = authService.getCurrentUser();
    const token = localStorage.getItem('token');
    return { user, token };
  }
  return { user: null, token: null };
});

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
      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = !!action.payload.user;
        }
      );
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
