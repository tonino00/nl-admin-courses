import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent, CalendarState, CalendarEventType } from '../../types/calendar';
import { RootState } from '..';
import api from '../../services/api';

// Type for filtering calendar events
export type CalendarFilterOptions = {
  userType?: string;
  startDate?: Date;
  endDate?: Date;
};

// Estado inicial
const initialState: CalendarState = {
  events: [],
  selectedEvent: null,
  isModalOpen: false,
  isLoading: false,
  error: null,
  view: 'month',
  date: new Date()
};

// Thunk para buscar eventos do calendário
export const fetchCalendarEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async (filters: CalendarFilterOptions = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/calendario', {
        params: filters
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao carregar eventos do calendário');
    }
  }
);

// Thunk para adicionar um novo evento
export const addCalendarEvent = createAsyncThunk(
  'calendar/addEvent',
  async (event: Omit<CalendarEvent, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/calendario', event);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao adicionar evento ao calendário');
    }
  }
);

// Thunk para atualizar um evento existente
export const updateCalendarEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (event: CalendarEvent, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/calendario/${event.id}`, event);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao atualizar evento do calendário');
    }
  }
);

// Thunk para remover um evento do calendário
export const removeCalendarEvent = createAsyncThunk(
  'calendar/removeEvent',
  async (id: string | number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/calendario/${id}`);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Erro ao remover evento do calendário');
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.selectedEvent = action.payload;
      state.isModalOpen = action.payload !== null;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
      if (!action.payload) {
        state.selectedEvent = null;
      }
    },
    setCalendarView: (state, action: PayloadAction<CalendarState['view']>) => {
      state.view = action.payload;
    },
    setCalendarDate: (state, action: PayloadAction<Date>) => {
      state.date = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar eventos';
      })
      
      // Add event
      .addCase(addCalendarEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      
      // Update event
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.selectedEvent = null;
      })
      
      // Remove event
      .addCase(removeCalendarEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        state.selectedEvent = null;
      });
  }
});

export const { 
  setSelectedEvent, 
  setModalOpen, 
  setCalendarView,
  setCalendarDate
} = calendarSlice.actions;

export const selectCalendarEvents = (state: RootState) => state.calendar.events;
export const selectSelectedEvent = (state: RootState) => state.calendar.selectedEvent;
export const selectIsModalOpen = (state: RootState) => state.calendar.isModalOpen;
export const selectIsLoading = (state: RootState) => state.calendar.isLoading;
export const selectCalendarError = (state: RootState) => state.calendar.error;
export const selectCalendarView = (state: RootState) => state.calendar.view;
export const selectCalendarDate = (state: RootState) => state.calendar.date;

export default calendarSlice.reducer;
