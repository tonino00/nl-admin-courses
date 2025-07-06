import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EnrollmentFull, EnrollmentsState } from '../../types';
import api from '../../services/api';

// Initial state
const initialState: EnrollmentsState = {
  enrollments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/enrollments');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar matrículas');
    }
  }
);

export const fetchEnrollmentsByStudent = createAsyncThunk(
  'enrollments/fetchByStudent',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/enrollments?studentId=${studentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar matrículas do aluno');
    }
  }
);

export const fetchEnrollmentsByCourse = createAsyncThunk(
  'enrollments/fetchByCourse',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/enrollments?courseId=${courseId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar matrículas do curso');
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (enrollment: Omit<EnrollmentFull, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/enrollments', enrollment);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao criar matrícula');
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/update',
  async (enrollment: EnrollmentFull, { rejectWithValue }) => {
    try {
      const response = await api.put(`/enrollments/${enrollment.id}`, enrollment);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar matrícula');
    }
  }
);

export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/enrollments/${id}`);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao deletar matrícula');
    }
  }
);

// Attendance management
export const updateAttendance = createAsyncThunk(
  'enrollments/updateAttendance',
  async (
    {
      enrollmentId,
      attendanceData,
    }: {
      enrollmentId: number;
      attendanceData: { date: string; present: boolean }[];
    },
    { rejectWithValue, getState }
  ) => {
    try {
      // First, get current enrollment data
      const response = await api.get(`/enrollments/${enrollmentId}`);
      const enrollment = response.data;

      // Update the attendance
      const updatedEnrollment = {
        ...enrollment,
        attendance: attendanceData,
      };

      // Save the updated enrollment
      const updateResponse = await api.put(`/enrollments/${enrollmentId}`, updatedEnrollment);
      return updateResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar presença');
    }
  }
);

// Enrollments slice
const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action: PayloadAction<EnrollmentFull[]>) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch enrollments by student
      .addCase(fetchEnrollmentsByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentsByStudent.fulfilled, (state, action: PayloadAction<EnrollmentFull[]>) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollmentsByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch enrollments by course
      .addCase(fetchEnrollmentsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentsByCourse.fulfilled, (state, action: PayloadAction<EnrollmentFull[]>) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollmentsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action: PayloadAction<EnrollmentFull>) => {
        state.loading = false;
        state.enrollments.push(action.payload);
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action: PayloadAction<EnrollmentFull>) => {
        state.loading = false;
        const index = state.enrollments.findIndex(enrollment => enrollment.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.enrollments = state.enrollments.filter(enrollment => enrollment.id !== action.payload);
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update attendance
      .addCase(updateAttendance.fulfilled, (state, action: PayloadAction<EnrollmentFull>) => {
        state.loading = false;
        const index = state.enrollments.findIndex(enrollment => enrollment.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = enrollmentsSlice.actions;

export default enrollmentsSlice.reducer;
