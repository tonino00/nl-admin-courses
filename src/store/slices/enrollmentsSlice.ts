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
  async (studentId: string | number, { rejectWithValue }) => {
    try {
      if (!studentId) {
        return rejectWithValue('ID do aluno inválido');
      }

      console.log('Buscando matrículas do aluno com ID:', studentId, 'Tipo:', typeof studentId);
      
      // Busca diretamente o aluno específico
      const response = await api.get(`/api/alunos/${studentId}`);
      
      // Log para depuração da estrutura dos dados
      console.log('Resposta da API para busca de matrículas do aluno:', response.data);
      
      // Definir interface para representar a estrutura de um aluno
      interface StudentData {
        id?: string | number;
        _id?: string | number;
        fullName: string;
        enrollments?: Array<any>;
        [key: string]: any; // Para permitir outras propriedades
      }
      
      // Encontrar o aluno na estrutura de resposta com tipo explícito
      let student: StudentData = { fullName: '' }; // Valor padrão para evitar erros
      
      if (response.data && response.data.data && response.data.data.student) {
        // Estrutura aninhada
        student = response.data.data.student as StudentData;
      } else if (response.data && response.data.student) {
        // No primeiro nível
        student = response.data.student as StudentData;
      } else if (response.data) {
        // Assume que é o próprio objeto
        student = response.data as StudentData;
      }
      
      // Extrai as matrículas do aluno
      const enrollments: EnrollmentFull[] = [];
      if (student && student.enrollments && Array.isArray(student.enrollments) && student.enrollments.length > 0) {
        student.enrollments.forEach((enrollment: any) => {
          // Adiciona as informações do aluno às matrículas
          enrollments.push({
            ...enrollment,
            studentId: student.id || student._id || studentId, // Usar studentId como fallback
            studentName: student.fullName || 'Aluno'
          });
        });
      } else {
        console.log('Nenhuma matrícula encontrada para o aluno');
      }
      
      console.log('Matrículas encontradas:', enrollments.length);
      return enrollments;
    } catch (error) {
      console.error('Erro ao buscar matrículas do aluno:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar matrículas do aluno');
    }
  }
);

export const fetchEnrollmentsByCourse = createAsyncThunk(
  'enrollments/fetchByCourse',
  async (courseId: string | number, { rejectWithValue }) => {
    try {
      // Busca todos os alunos para encontrar as matrículas do curso específico
      const response = await api.get('/api/alunos');
      const students = response.data;
      
      console.log('Buscando matrículas para o curso com ID:', courseId, 'Tipo:', typeof courseId);
      
      // Função auxiliar para comparar IDs que podem ser string ou number
      const compareIds = (id1: any, id2: any): boolean => {
        // Se ambos são iguais, retorna true (mesmo tipo e valor)
        if (id1 === id2) return true;
        // Converter para string e comparar
        return String(id1) === String(id2);
      };
      
      // Filtra as matrículas pelo courseId
      const enrollments: EnrollmentFull[] = [];
      students.forEach((student: any) => {
        if (student.enrollments && student.enrollments.length > 0) {
          const courseEnrollments = student.enrollments.filter(
            (enrollment: any) => compareIds(enrollment.courseId, courseId)
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
  async ({id, studentId}: {id: number, studentId: string | number}, { rejectWithValue }) => {
    try {
      if (!studentId) {
        return rejectWithValue('ID do aluno inválido');
      }
      
      console.log('Deletando matrícula:', id, 'do aluno com ID:', studentId, 'Tipo:', typeof studentId);
      
      // Primeiro buscamos o aluno
      const studentResponse = await api.get(`/api/alunos/${studentId}`);
      
      // Definir interface para representar a estrutura de um aluno
      interface StudentData {
        id?: string | number;
        _id?: string | number;
        fullName: string;
        enrollments?: Array<any>;
        [key: string]: any; // Para permitir outras propriedades
      }
      
      // Verificar a estrutura da resposta e encontrar o aluno com tipo explícito
      let student: StudentData = { fullName: '' }; // Valor padrão
      
      if (studentResponse.data && studentResponse.data.data && studentResponse.data.data.student) {
        // Estrutura aninhada
        student = studentResponse.data.data.student as StudentData;
      } else if (studentResponse.data && studentResponse.data.student) {
        // No primeiro nível
        student = studentResponse.data.student as StudentData;
      } else if (studentResponse.data) {
        // Assume que é o próprio objeto
        student = studentResponse.data as StudentData;
      }
      
      // Verificar se temos dados do aluno (verifica se temos pelo menos dados básicos)
      if (!student || !student.fullName) {
        return rejectWithValue('Aluno não encontrado ou dados incompletos');
      }
      
      console.log('Aluno encontrado, verificando matrículas:', student);
      
      // Removemos a matrícula do array de matrículas do aluno
      if (student.enrollments && Array.isArray(student.enrollments)) {
        student.enrollments = student.enrollments.filter(
          (enrollment: any) => enrollment.id !== id
        );
        
        console.log('Matrículas após remoção:', student.enrollments);
        
        // Atualizamos o aluno sem a matrícula removida
        await api.put(`/api/alunos/${studentId}`, student);
      } else {
        console.warn('Nenhuma matrícula encontrada para o aluno');
      }
      
      return id;
    } catch (error) {
      console.error('Erro ao deletar matrícula:', error);
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
