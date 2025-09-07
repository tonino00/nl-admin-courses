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
      // Busca todos os alunos para extrair as informações de matrículas
      const response = await api.get('/api/alunos');
      
      // Extrai todas as matrículas de todos os alunos
      const enrollments: EnrollmentFull[] = [];
      response.data.forEach((student: any) => {
        if (student.enrollments && student.enrollments.length > 0) {
          student.enrollments.forEach((enrollment: any) => {
            // Adiciona as informações do aluno às matrículas
            enrollments.push({
              ...enrollment,
              studentId: student.id,
              studentName: student.fullName
            });
          });
        }
      });
      
      return enrollments;
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
      // Busca diretamente o aluno específico
      const response = await api.get(`/api/alunos/${studentId}`);
      const student = response.data;
      
      // Extrai as matrículas do aluno
      const enrollments: EnrollmentFull[] = [];
      if (student.enrollments && student.enrollments.length > 0) {
        student.enrollments.forEach((enrollment: any) => {
          // Adiciona as informações do aluno às matrículas
          enrollments.push({
            ...enrollment,
            studentId: student.id,
            studentName: student.fullName
          });
        });
      }
      
      return enrollments;
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
      // Busca todos os alunos para encontrar as matrículas do curso específico
      const response = await api.get('/api/alunos');
      const students = response.data;
      
      // Filtra as matrículas pelo courseId
      const enrollments: EnrollmentFull[] = [];
      students.forEach((student: any) => {
        if (student.enrollments && student.enrollments.length > 0) {
          const courseEnrollments = student.enrollments.filter(
            (enrollment: any) => enrollment.courseId === courseId
          );
          
          courseEnrollments.forEach((enrollment: any) => {
            enrollments.push({
              ...enrollment,
              studentId: student.id,
              studentName: student.fullName
            });
          });
        }
      });
      
      return enrollments;
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
      // Primeiro buscamos o aluno
      const studentResponse = await api.get(`/api/alunos/${enrollment.studentId}`);
      const student = studentResponse.data;
      
      // Adicionamos a matrícula à lista de matrículas do aluno
      if (!student.enrollments) {
        student.enrollments = [];
      }
      
      // Geramos um ID único para a matrícula (pode ser necessário ajustar dependendo de como seu backend gera IDs)
      const newEnrollment = {
        ...enrollment,
        id: Date.now() // Isso é uma simplificação, idealmente o backend cuidaria disso
      };
      
      student.enrollments.push(newEnrollment);
      
      // Atualizamos o aluno com a nova matrícula
      const updateResponse = await api.put(`/api/alunos/${enrollment.studentId}`, student);
      
      // Retornamos a matrícula criada com dados completos
      return {
        ...newEnrollment,
        studentName: student.fullName
      };
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
      // Primeiro buscamos o aluno
      const studentResponse = await api.get(`/api/alunos/${enrollment.studentId}`);
      const student = studentResponse.data;
      
      // Encontramos e atualizamos a matrícula específica no array de matrículas do aluno
      if (student.enrollments) {
        const enrollmentIndex = student.enrollments.findIndex(
          (e: any) => e.id === enrollment.id
        );
        
        if (enrollmentIndex !== -1) {
          // Remover propriedades que são apenas para o frontend
          const { studentName, ...enrollmentData } = enrollment;
          
          student.enrollments[enrollmentIndex] = enrollmentData;
          
          // Atualizamos o aluno com a matrícula atualizada
          await api.put(`/api/alunos/${enrollment.studentId}`, student);
        }
      }
      
      // Retornamos a matrícula atualizada
      return enrollment;
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
  async ({id, studentId}: {id: number, studentId: number}, { rejectWithValue }) => {
    try {
      // Primeiro buscamos o aluno
      const studentResponse = await api.get(`/api/alunos/${studentId}`);
      const student = studentResponse.data;
      
      // Removemos a matrícula do array de matrículas do aluno
      if (student.enrollments) {
        student.enrollments = student.enrollments.filter(
          (enrollment: any) => enrollment.id !== id
        );
        
        // Atualizamos o aluno sem a matrícula removida
        await api.put(`/api/alunos/${studentId}`, student);
      }
      
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
      studentId,
      attendanceData,
    }: {
      enrollmentId: number;
      studentId: number;
      attendanceData: { date: string; present: boolean }[];
    },
    { rejectWithValue }
  ) => {
    try {
      // Primeiro buscamos o aluno
      const studentResponse = await api.get(`/api/alunos/${studentId}`);
      const student = studentResponse.data;
      
      // Encontramos a matrícula específica
      if (student.enrollments) {
        const enrollmentIndex = student.enrollments.findIndex(
          (e: any) => e.id === enrollmentId
        );
        
        if (enrollmentIndex !== -1) {
          // Atualizamos os dados de presença
          student.enrollments[enrollmentIndex].attendance = attendanceData;
          
          // Atualizamos o aluno com a matrícula atualizada
          await api.put(`/api/alunos/${studentId}`, student);
          
          // Retornamos a matrícula atualizada
          return {
            ...student.enrollments[enrollmentIndex],
            studentId,
            studentName: student.fullName
          };
        }
      }
      
      throw new Error('Matrícula não encontrada');
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
