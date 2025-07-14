import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { RootState } from '../../store';
import DashboardContent from '../../components/Dashboard/DashboardContent';
import { getUserDashboard } from '../../services/dashboardService';
import { UserDashboard } from '../../types/dashboard';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchTeachers } from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { fetchEnrollments } from '../../store/slices/enrollmentsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  
  // Ainda mantemos esses dados disponíveis para possível uso no dashboard
  const { students, loading: studentsLoading } = useAppSelector((state: RootState) => state.students);
  const { teachers, loading: teachersLoading } = useAppSelector((state: RootState) => state.teachers);
  const { courses, loading: coursesLoading } = useAppSelector((state: RootState) => state.courses);
  const { enrollments, loading: enrollmentsLoading } = useAppSelector((state: RootState) => state.enrollments);
  
  // Determinar o tipo de usuário baseado no papel atual
  const getUserType = () => {
    if (!user) return 'admin'; // Padrão para admin se não houver usuário
    
    if (user.role === 'ADMIN') return 'admin';
    if (user.role === 'TEACHER') return 'teacher';
    if (user.role === 'STUDENT') return 'student';
    
    return 'admin'; // Fallback para admin
  };
  
  // Carregar o dashboard personalizado de acordo com o tipo de usuário
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userType = getUserType();
        const dashboardData = await getUserDashboard(userType);
        setDashboard(dashboardData);
      } catch (err) {
        console.error('Erro ao carregar o dashboard:', err);
        setError('Não foi possível carregar o dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboard();
  }, [user]);
  
  // Também carregamos os dados básicos para uso geral
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchCourses());
    dispatch(fetchEnrollments());
  }, [dispatch]);

  // Manipular mudança de tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {user?.role === 'ADMIN' && 'Visão geral da administração acadêmica'}
          {user?.role === 'TEACHER' && 'Visão geral de suas atividades como professor'}
          {user?.role === 'STUDENT' && 'Visão geral de seu desempenho acadêmico'}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="overview" label="Visão Geral" />
          {user?.role === 'ADMIN' && <Tab value="analytics" label="Análise Detalhada" />}
          {user?.role === 'TEACHER' && <Tab value="students" label="Meus Alunos" />}
          {user?.role === 'STUDENT' && <Tab value="courses" label="Meus Cursos" />}
        </Tabs>

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading && !error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {selectedTab === 'overview' && dashboard && (
              <DashboardContent dashboard={dashboard} />
            )}
            {/* Outros tabs podem ser implementados posteriormente */}
            {selectedTab !== 'overview' && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Conteúdo em desenvolvimento</Typography>
                <Typography variant="body2" color="text.secondary">
                  Esta seção será implementada em breve com funcionalidades adicionais.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
