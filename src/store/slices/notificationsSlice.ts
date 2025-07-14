import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from '../../types/notifications';

// Simular fetching de notificações (em um cenário real seria uma chamada API)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userType: string) => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em um ambiente real, isso viria de uma API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nota publicada',
        message: 'Sua nota para a disciplina Matemática foi publicada',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        userType: userType === 'student' ? 'student' : 'all'
      },
      {
        id: '2',
        title: 'Novo material disponível',
        message: 'Professor de Física disponibilizou novo material para estudo',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        userType: userType === 'student' ? 'student' : 'all'
      },
      {
        id: '3',
        title: 'Prazo de entrega',
        message: 'O prazo para entrega do trabalho de História termina amanhã',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
        userType: userType === 'student' ? 'student' : 'all'
      },
      {
        id: '4',
        title: 'Registro de Ponto',
        message: 'Não esqueça de registrar sua entrada hoje',
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString(),
        userType: userType === 'teacher' ? 'teacher' : 'all'
      },
      {
        id: '5',
        title: 'Novo aluno matriculado',
        message: 'Um novo aluno foi matriculado no curso de Programação',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
        userType: userType === 'teacher' ? 'teacher' : 'all'
      }
    ];

    return mockNotifications.filter(
      n => n.userType === userType || n.userType === 'all'
    );
  }
);

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao carregar notificações';
      });
  },
});

export const { markAsRead, markAllAsRead, addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
