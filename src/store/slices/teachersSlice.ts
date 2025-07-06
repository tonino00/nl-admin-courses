import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Teacher, TeachersState } from '../../types';
import api from '../../services/api';

// Initial state
const initialState: TeachersState = {
  teachers: [],
  currentTeacher: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTeachers = createAsyncThunk(
  'teachers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teachers');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar professores');
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar professor');
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/create',
  async (teacher: Omit<Teacher, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/teachers', teacher);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao criar professor');
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/update',
  async (teacher: Teacher, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teachers/${teacher.id}`, teacher);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar professor');
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/teachers/${id}`);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao deletar professor');
    }
  }
);

// Teachers slice
const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearCurrentTeacher: (state) => {
      state.currentTeacher = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action: PayloadAction<Teacher[]>) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch teacher by ID
      .addCase(fetchTeacherById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action: PayloadAction<Teacher>) => {
        state.loading = false;
        state.currentTeacher = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create teacher
      .addCase(createTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeacher.fulfilled, (state, action: PayloadAction<Teacher>) => {
        state.loading = false;
        state.teachers.push(action.payload);
        state.currentTeacher = action.payload;
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update teacher
      .addCase(updateTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacher.fulfilled, (state, action: PayloadAction<Teacher>) => {
        state.loading = false;
        const index = state.teachers.findIndex(teacher => teacher.id === action.payload.id);
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
        state.currentTeacher = action.payload;
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.teachers = state.teachers.filter(teacher => teacher.id !== action.payload);
        if (state.currentTeacher && state.currentTeacher.id === action.payload) {
          state.currentTeacher = null;
        }
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentTeacher, clearError } = teachersSlice.actions;

export default teachersSlice.reducer;
