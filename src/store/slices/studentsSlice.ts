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
      const response = await api.get('/students');
      return response.data;
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
      const response = await api.get(`/students/${id}`);
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
      const response = await api.post('/students', student);
      return response.data;
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
      const response = await api.put(`/students/${student.id}`, student);
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
      await api.delete(`/students/${id}`);
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
