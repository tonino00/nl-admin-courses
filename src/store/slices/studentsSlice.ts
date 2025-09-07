import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Student, StudentsState } from '../../types';
import api from '../../services/api';

// Initial state
const initialState: StudentsState = {
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/alunos');
      
      // Verificar a estrutura dos dados e extrair corretamente
      if (response.data && response.data.data && Array.isArray(response.data.data.students)) {
        // Estrutura aninhada com data.students
        console.log('Dados recebidos da API com estrutura aninhada:', response.data.data.students);
        return response.data.data.students;
      } else if (response.data && Array.isArray(response.data.students)) {
        // Estrutura com students no primeiro nível
        console.log('Dados recebidos da API com students no primeiro nível:', response.data.students);
        return response.data.students;
      } else if (Array.isArray(response.data)) {
        // Array direto
        console.log('Dados recebidos da API como array direto:', response.data);
        return response.data;
      } else {
        // Formato desconhecido, retornar array vazio e logar para depuração
        console.error('Formato de resposta desconhecido da API /api/alunos:', response.data);
        return [];
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar alunos');
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/alunos/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar aluno');
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (student: Omit<Student, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/alunos', student);
      
      // Verificar e processar a resposta corretamente
      console.log('Resposta da API ao criar aluno:', response.data);
      
      if (response.data && response.data.data) {
        // Se a resposta estiver aninhada em data
        return response.data.data;
      } else {
        // Se a resposta estiver diretamente no primeiro nível
        return response.data;
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao criar aluno');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async (student: Student, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/alunos/${student.id}`, student);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar aluno');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/alunos/${id}`);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao deletar aluno');
    }
  }
);

// Students slice
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch student by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action: PayloadAction<Student>) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create student
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action: PayloadAction<Student>) => {
        state.loading = false;
        state.students.push(action.payload);
        state.currentStudent = action.payload;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action: PayloadAction<Student>) => {
        state.loading = false;
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        state.currentStudent = action.payload;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.students = state.students.filter(student => student.id !== action.payload);
        if (state.currentStudent && state.currentStudent.id === action.payload) {
          state.currentStudent = null;
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentStudent, clearError } = studentsSlice.actions;

export default studentsSlice.reducer;
