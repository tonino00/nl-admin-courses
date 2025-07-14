export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number; // mudança percentual em relação ao período anterior
  changeType?: 'increase' | 'decrease' | 'stable';
}

export interface DashboardCard {
  id: string;
  title: string;
  type: 'chart' | 'list' | 'calendar' | 'stats';
  data: any;
  size: 'small' | 'medium' | 'large';
}

export interface UserDashboard {
  metrics: DashboardMetric[];
  cards: DashboardCard[];
  userType: 'admin' | 'teacher' | 'student';
}
