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
  async (id: string | number, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('ID do professor inválido');
      }
      
      console.log('Fetching teacher with ID:', id, 'Type:', typeof id);
      const response = await api.get(`/api/professores/${id}`);
      console.log('Teacher by ID response raw:', response);
      console.log('Teacher by ID response data:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      let teacherData = null;
      
      // Verificar todas as possíveis estruturas de resposta da API
      // Adicionar um log da estrutura bruta para depuração
      console.log('Raw API response structure:', JSON.stringify(response.data, null, 2));
      
      // Tentar extrair os dados do professor da estrutura de resposta
      try {
        if (response.data) {
          if (typeof response.data.data === 'object' && response.data.data !== null) {
            // Estrutura: { data: { ... } }
            if (response.data.data.professor) {
              teacherData = response.data.data.professor;
              console.log('Extracted from data.data.professor');
            } else if (response.data.data.teacher) {
              teacherData = response.data.data.teacher;
              console.log('Extracted from data.data.teacher');
            } else if (Array.isArray(response.data.data)) {
              teacherData = response.data.data[0];
              console.log('Extracted from data.data array (first item)');
            } else if (Object.keys(response.data.data).length > 0) {
              // Assume that data.data itself is the teacher object
              teacherData = response.data.data;
              console.log('Using data.data object directly as teacher');
            }
          } else if (response.data.professor) {
            teacherData = response.data.professor;
            console.log('Extracted from data.professor');
          } else if (response.data.teacher) {
            teacherData = response.data.teacher;
            console.log('Extracted from data.teacher');
          } else if (Array.isArray(response.data)) {
            teacherData = response.data[0];
            console.log('Extracted from data array (first item)');
          } else if (response.data._id || response.data.id) {
            // Assume data is directly the teacher object if it has ID fields
            teacherData = response.data;
            console.log('Using data directly as teacher (has ID fields)');
          } else if (Object.keys(response.data).length > 0) {
            // Last resort: just use the data object
            teacherData = response.data;
            console.log('Using entire data object as teacher (last resort)');
          }
        }
      } catch (error) {
        console.error('Error parsing teacher data:', error);
      }
      
      if (!teacherData) {
        console.error('Could not find teacher data in API response');
        teacherData = null;
      } else {
        console.log('Final teacher data extracted from API response:', teacherData);
      }
      
      // Se o professor for encontrado mas não tiver id, usar o _id
      if (teacherData && !teacherData.id && teacherData._id) {
        console.log('Using _id as id:', teacherData._id);
        teacherData.id = teacherData._id;
      }
      
      return teacherData;
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
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
      if (!teacher.id) {
        return rejectWithValue('ID do professor inválido');
      }
      
      console.log('Updating teacher with ID:', teacher.id, 'Type:', typeof teacher.id);
      const response = await api.put(`/api/professores/${teacher.id}`, teacher);
      console.log('Update teacher response:', response.data);
      
      // Acessar o caminho correto na estrutura da resposta
      const updatedTeacher = response.data?.data?.professor || null;
      
      // Se o professor atualizado não tiver id, usar o _id
      if (updatedTeacher && !updatedTeacher.id && updatedTeacher._id) {
        updatedTeacher.id = updatedTeacher._id;
      }
      
      return updatedTeacher;
    } catch (error) {
      console.error('Error updating teacher:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar professor');
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/delete',
  async (id: string | number, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('ID do professor inválido');
      }
      
      console.log('Deleting teacher with ID:', id, 'Type:', typeof id);
      await api.delete(`/api/professores/${id}`);
      return id;
    } catch (error) {
      console.error('Error deleting teacher:', error);
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
      .addCase(fetchTeacherById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // Log para depurar o payload recebido
        console.log('Teacher payload received in reducer:', action.payload);
        
        // Se não houver payload, manter o estado anterior
        if (!action.payload) {
          console.warn('Teacher payload is empty or null');
          return;
        }
        
        // Criar um objeto de professor com dados seguros
        const teacher: Teacher = {
          // Use o id existente ou _id do MongoDB
          id: action.payload.id || action.payload._id,
          fullName: action.payload.fullName || '',
          cpf: action.payload.cpf || '',
          rg: action.payload.rg || '',
          birthDate: action.payload.birthDate || '',
          address: {
            street: action.payload.address?.street || '',
            number: action.payload.address?.number || '',
            district: action.payload.address?.district || '',
            city: action.payload.address?.city || '',
            state: action.payload.address?.state || '',
            zipCode: action.payload.address?.zipCode || '',
            complement: action.payload.address?.complement || ''
          },
          phone: action.payload.phone || '',
          email: action.payload.email || '',
          bio: action.payload.bio || '',
          education: action.payload.education || '',
          specializations: Array.isArray(action.payload.specializations) ? 
            action.payload.specializations : [],
          status: action.payload.status || 'active',
          type: action.payload.type || 'volunteer',
          courses: Array.isArray(action.payload.courses) ? action.payload.courses : [],
          documents: Array.isArray(action.payload.documents) ? action.payload.documents : []
        };
        
        console.log('Normalized teacher object stored in state:', teacher);
        state.currentTeacher = teacher;
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
      .addCase(deleteTeacher.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false;
        state.teachers = state.teachers.filter(teacher => 
          teacher.id !== action.payload
        );
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
