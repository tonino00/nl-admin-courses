import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent, CalendarState, CalendarEventType } from '../../types/calendar';
import { RootState } from '..';

// Dados iniciais mockados para eventos do calendário
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Aula de Matemática',
    start: new Date(new Date().setHours(10, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    type: 'class',
    description: 'Introdução à Álgebra Linear',
    location: 'Sala 101',
    courseId: 1,
    teacherId: 1,
    studentIds: [1, 2, 3, 4, 5],
    color: '#4caf50',
    createdBy: 1,
    createdAt: new Date(),
  },
  {
    id: 2,
    title: 'Prova de História',
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    allDay: true,
    type: 'exam',
    description: 'Prova sobre Revolução Industrial',
    location: 'Sala 203',
    courseId: 2,
    teacherId: 2,
    studentIds: [1, 2, 3],
    color: '#f44336',
    createdBy: 2,
    createdAt: new Date(),
  },
  {
    id: 3,
    title: 'Entrega de Trabalho',
    start: new Date(new Date().setDate(new Date().getDate() + 5)),
    end: new Date(new Date().setDate(new Date().getDate() + 5)),
    allDay: true,
    type: 'assignment',
    description: 'Trabalho final de Literatura',
    courseId: 3,
    teacherId: 3,
    studentIds: [4, 5, 6],
    color: '#ff9800',
    createdBy: 3,
    createdAt: new Date(),
  },
  {
    id: 4,
    title: 'Reunião de Professores',
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1)),
    allDay: false,
    type: 'meeting',
    description: 'Discussão sobre metodologias de ensino',
    location: 'Sala dos Professores',
    teacherId: 1,
    color: '#2196f3',
    createdBy: 1,
    createdAt: new Date(),
  },
  {
    id: 5,
    title: 'Feriado - Dia do Professor',
    start: new Date(new Date().setDate(new Date().getDate() + 10)),
    end: new Date(new Date().setDate(new Date().getDate() + 10)),
    allDay: true,
    type: 'holiday',
    description: 'Feriado em celebração ao Dia do Professor',
    color: '#9c27b0',
    createdBy: 1,
    createdAt: new Date(),
  }
];

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
  async (userType?: string) => {
    // Simular um delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filtrar eventos baseados no tipo de usuário (em uma aplicação real, isso viria da API)
    if (userType === 'student') {
      return mockEvents.filter(event => 
        event.type === 'class' || event.type === 'exam' || event.type === 'assignment'
      );
    } else if (userType === 'teacher') {
      return mockEvents.filter(event => 
        event.teacherId === 1 || event.type === 'meeting' || event.type === 'holiday'
      );
    }
    
    return mockEvents;
  }
);

// Thunk para adicionar um novo evento
export const addCalendarEvent = createAsyncThunk(
  'calendar/addEvent',
  async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    // Simular um delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em uma aplicação real, enviaria para API e receberia ID de volta
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now(),
      createdAt: new Date()
    };
    
    return newEvent;
  }
);

// Thunk para atualizar um evento existente
export const updateCalendarEvent = createAsyncThunk(
  'calendar/updateEvent',
  async (event: CalendarEvent) => {
    // Simular um delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em uma aplicação real, enviaria para API
    return event;
  }
);

// Thunk para remover um evento
export const removeCalendarEvent = createAsyncThunk(
  'calendar/removeEvent',
  async (eventId: string | number) => {
    // Simular um delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em uma aplicação real, enviaria para API
    return eventId;
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
