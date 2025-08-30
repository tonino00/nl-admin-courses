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
const normalizeCourse = (course: any): Course => {
  if (course.courseData) {
    // Se os dados estão aninhados dentro de courseData
    return {
      id: course.id,
      ...course.courseData
    };
  }
  // Se os dados já estão no formato correto
  return course as Course;
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/cursos');
      // Normaliza cada curso antes de retornar
      const normalizedCourses = response.data.map((course: any) => normalizeCourse(course));
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
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/cursos/${id}`);
      // Normaliza o curso antes de retornar
      const normalizedCourse = normalizeCourse(response.data);
      return normalizedCourse;
    } catch (error) {
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
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao criar curso');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async (params: { id: number, courseData: Course }, { rejectWithValue }) => {
    try {
      const { id, courseData } = params;
      const response = await api.put(`/api/cursos/${id}`, courseData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar curso');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cursos/${id}`);
      return id;
    } catch (error) {
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
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course.id !== action.payload);
        if (state.currentCourse && state.currentCourse.id === action.payload) {
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
