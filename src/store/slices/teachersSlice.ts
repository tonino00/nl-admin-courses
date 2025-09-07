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
      // Adicionar logs para debug da API
      console.log('Fetching teachers from API...');
      const response = await api.get('/api/professores');
      console.log('Teachers API response:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      const teachersData = response.data?.data?.teachers || [];
      console.log('Teachers data from nested structure:', teachersData);
      
      // Garantir que seja um array
      const teachersArray = Array.isArray(teachersData) ? teachersData : [];
      
      // Mapear os dados para garantir compatibilidade com o DataGrid
      // Principalmente transformando _id para id
      const teachers = teachersArray.map(teacher => ({
        ...teacher,
        id: teacher._id || `temp-${Math.random()}`  // Usar _id como id ou gerar um temporário
      }));
      
      console.log('Transformed teachers with id field:', teachers);
      return teachers;
    } catch (error) {
      console.error('Error fetching teachers:', error);
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
      const response = await api.get(`/api/professores/${id}`);
      console.log('Teacher by ID response:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      const teacherData = response.data?.data?.professor || null;
      return teacherData;
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
      const response = await api.post('/api/professores', teacher);
      console.log('Create teacher response:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      const createdTeacher = response.data?.data?.professor || null;
      return createdTeacher;
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
      const response = await api.put(`/api/professores/${teacher.id}`, teacher);
      console.log('Update teacher response:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      const updatedTeacher = response.data?.data?.professor || null;
      return updatedTeacher;
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
      await api.delete(`/api/professores/${id}`);
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
        // Verificar se state.teachers é um array antes de usar push
        if (Array.isArray(state.teachers)) {
          state.teachers.push(action.payload);
        } else {
          state.teachers = [action.payload];
        }
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
