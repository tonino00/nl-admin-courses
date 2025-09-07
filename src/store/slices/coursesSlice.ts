import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CoursesState } from '../../types';
import api from '../../services/api';

// Initial state
const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
// Função para normalizar os dados do curso (lidando com estrutura aninhada)
const normalizeCourse = (rawData: any): Course => {
  console.log('Normalizando dados do curso:', rawData);
  
  // Verificar se os dados estão na estrutura {status, data, data.course}
  if (rawData.status === 'success' && rawData.data && rawData.data.course) {
    const courseData = rawData.data.course;
    return {
      // Usar _id se disponível, caso contrário usar id, ou gerar um ID baseado em timestamp
      id: courseData._id || courseData.id || `temp-${Date.now()}`,
      name: courseData.name || '',
      description: courseData.description || '',
      workload: courseData.workload || 0,
      shifts: courseData.shifts || [],
      totalSpots: courseData.totalSpots || 0,
      availableSpots: courseData.availableSpots || 0,
      prerequisites: courseData.prerequisites || [],
      schedule: courseData.schedule || [],
      teacherId: courseData.teacherId || '',
      status: courseData.status || 'inactive',
    };
  }
  
  // Verificar se os dados estão aninhados em courseData
  if (rawData.courseData) {
    return {
      id: rawData.id || rawData._id || `temp-${Date.now()}`,
      ...rawData.courseData
    };
  }
  
  // Para casos em que o objeto já está quase no formato correto, mas pode usar _id
  if (rawData._id && !rawData.id) {
    return {
      ...rawData,
      id: rawData._id
    };
  }
  
  // Se os dados já estão no formato correto
  return rawData as Course;
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/cursos');
      console.log('Resposta completa da API de cursos:', response.data);
      
      // Verificar estrutura da resposta e extrair os cursos
      let coursesArray: any[] = [];
      
      // Caso 1: Resposta paginada com data.data ou data.courses
      if (response.data && response.data.status === 'success') {
        if (response.data.data && Array.isArray(response.data.data)) {
          // Formato: {status, data: [...cursos]}
          coursesArray = response.data.data;
        } else if (response.data.data && response.data.data.courses && Array.isArray(response.data.data.courses)) {
          // Formato: {status, data: {courses: [...cursos]}}
          coursesArray = response.data.data.courses;
        } else if (response.data.courses && Array.isArray(response.data.courses)) {
          // Formato: {status, courses: [...cursos]}
          coursesArray = response.data.courses;
        } else if (response.data.data && response.data.data.course) {
          // Formato: {status, data: {course: {...}}}
          // Caso especial: um único curso em vez de um array
          coursesArray = [response.data.data.course];
        }
      }
      
      // Caso 2: Resposta já é um array
      if (Array.isArray(response.data)) {
        coursesArray = response.data;
      }
      
      if (coursesArray.length === 0) {
        console.warn('Não foi possível extrair cursos da resposta da API:', response.data);
      } else {
        console.log(`Extraídos ${coursesArray.length} cursos da resposta da API`);
      }
      
      // Normaliza cada curso antes de retornar
      const normalizedCourses = coursesArray.map((course: any) => normalizeCourse(course));
      return normalizedCourses;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar cursos');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      console.log(`Buscando curso com ID: ${id}, tipo: ${typeof id}`);
      const response = await api.get(`/api/cursos/${id}`);
      console.log('Resposta da API para busca por ID:', response.data);
      
      // Extrair o curso da estrutura da resposta
      let courseData = response.data;
      
      // Verifica se os dados estão na estrutura {status, data, data.course}
      if (response.data && response.data.status === 'success') {
        if (response.data.data && response.data.data.course) {
          courseData = response.data.data.course;
        } else if (response.data.course) {
          courseData = response.data.course;
        }
      }
      
      // Normaliza o curso antes de retornar
      const normalizedCourse = normalizeCourse(courseData);
      console.log('Curso normalizado:', normalizedCourse);
      return normalizedCourse;
    } catch (error) {
      console.error('Erro ao buscar curso por ID:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao buscar curso');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (course: Omit<Course, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/cursos', course);
      console.log('Resposta da API ao criar curso:', response.data);
      
      // Extrair o curso da estrutura da resposta
      let courseData = response.data;
      
      // Verifica se os dados estão na estrutura {status, data, data.course}
      if (response.data && response.data.status === 'success') {
        if (response.data.data && response.data.data.course) {
          courseData = response.data.data.course;
        } else if (response.data.course) {
          courseData = response.data.course;
        }
      }
      
      // Normaliza o curso antes de retornar
      const normalizedCourse = normalizeCourse(courseData);
      console.log('Curso criado e normalizado:', normalizedCourse);
      return normalizedCourse;
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao criar curso');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async (params: { id: number | string, courseData: Course }, { rejectWithValue }) => {
    try {
      const { id, courseData } = params;
      console.log(`Atualizando curso com ID: ${id}`, courseData);
      
      const response = await api.put(`/api/cursos/${id}`, courseData);
      console.log('Resposta da API ao atualizar curso:', response.data);
      
      // Extrair o curso da estrutura da resposta
      let updatedData = response.data;
      
      // Verifica se os dados estão na estrutura {status, data, data.course}
      if (response.data && response.data.status === 'success') {
        if (response.data.data && response.data.data.course) {
          updatedData = response.data.data.course;
        } else if (response.data.course) {
          updatedData = response.data.course;
        }
      }
      
      // Normaliza o curso antes de retornar
      const normalizedCourse = normalizeCourse(updatedData);
      console.log('Curso atualizado e normalizado:', normalizedCourse);
      return normalizedCourse;
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar curso');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id: string | number, { rejectWithValue }) => {
    try {
      console.log(`Excluindo curso com ID: ${id}, tipo: ${typeof id}`);
      await api.delete(`/api/cursos/${id}`);
      return id;
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao deletar curso');
    }
  }
);

// Courses slice
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.courses.push(action.payload);
        state.currentCourse = action.payload;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        const index = state.courses.findIndex(course => course.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        state.currentCourse = action.payload;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false;
        
        // Função auxiliar para comparar IDs, considerando string ou number
        const compareIds = (id1: any, id2: any): boolean => {
          if (id1 === id2) return true;
          return String(id1) === String(id2);
        };
        
        // Filtrar os cursos mantendo todos exceto o que foi excluído
        state.courses = state.courses.filter(course => !compareIds(course.id, action.payload));
        
        // Limpar o curso atual se for o que foi excluído
        if (state.currentCourse && compareIds(state.currentCourse.id, action.payload)) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCourse, clearError } = coursesSlice.actions;

export default coursesSlice.reducer;
