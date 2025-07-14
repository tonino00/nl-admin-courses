// Notification Types

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  userType: UserType;
  targetId?: number; // ID relacionado à notificação (aluno, professor, curso, etc)
  link?: string; // Link opcional para navegação
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'reminder';
export type UserType = 'admin' | 'teacher' | 'student' | 'all';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
