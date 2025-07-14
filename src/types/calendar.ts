import { User } from './index';

export type CalendarEventType = 'class' | 'exam' | 'assignment' | 'meeting' | 'holiday' | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurrenceDaysOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // A cada X dias/semanas/meses/anos
  daysOfWeek?: RecurrenceDaysOfWeek[]; // Para recorrência semanal
  endDate?: Date | null; // Data final da recorrência (null = sem fim)
  occurrences?: number | null; // Número de ocorrências (null = sem limite)
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: CalendarEventType;
  description?: string;
  location?: string;
  courseId?: number;
  teacherId?: number;
  studentIds?: number[];
  color?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date;
  recurrence?: RecurrenceRule | null;
  parentEventId?: string | number | null; // Para eventos que são parte de uma série recorrente
  isException?: boolean; // Indica se este evento é uma exceção a uma série recorrente
  originalStart?: Date; // Data original se for uma exceção
}

export interface CalendarEventFormData {
  id?: string | number;
  title: string;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  type: CalendarEventType;
  description: string;
  location: string;
  courseId: number | null;
  teacherId: number | null;
  studentIds: number[];
  color: string;
}

export interface CalendarView {
  name: string;
  value: 'month' | 'week' | 'day' | 'agenda';
  label: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  view: CalendarView['value'];
  date: Date;
}

export interface CalendarFilters {
  eventTypes: CalendarEventType[];
  courseIds: number[];
  teacherIds: number[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
