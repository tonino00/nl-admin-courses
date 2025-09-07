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
import AnalyticsContent from '../../components/Dashboard/AnalyticsContent';
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
    
    if (user.role === 'admin') return 'admin';
    if (user.role === 'teacher') return 'teacher';
    if (user.role === 'student') return 'student';
    
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
  
  // Inicializar o rastreador de chamadas globalmente se não existir
  React.useEffect(() => {
    if (!(window as any).__API_CALLS_TRACKER) {
      (window as any).__API_CALLS_TRACKER = {
        apiCallTimestamps: {},
        loadedData: {
          students: false,
          teachers: false,
          courses: false,
          enrollments: false
        }
      };
    }
  }, []);
  
  // Referência ao rastreador global de chamadas à API
  const apiCallsTrackerRef = React.useRef<{
    apiCallTimestamps: Record<string, number>;
    loadedData: {
      students: boolean;
      teachers: boolean;
      courses: boolean;
      enrollments: boolean;
    };
  }>((window as any).__API_CALLS_TRACKER || {
    apiCallTimestamps: {},
    loadedData: {
      students: false,
      teachers: false,
      courses: false,
      enrollments: false
    }
  });

  // Função para verificar se é seguro chamar a API
  const canCallApi = (endpoint: string): boolean => {
    const tracker = (window as any).__API_CALLS_TRACKER;
    if (!tracker) return true;
    
    const now = Date.now();
    const lastCall = tracker.apiCallTimestamps[endpoint];
    
    // Se não houver registro ou se passou tempo suficiente desde a última chamada
    if (!lastCall || now - lastCall > 10000) { // 10 segundos entre chamadas
      tracker.apiCallTimestamps[endpoint] = now;
      return true;
    }
    
    console.log(`Evitando chamada duplicada para ${endpoint}. Última chamada há ${(now - lastCall)/1000}s.`);
    return false;
  };

  // Carregamos os dados básicos para uso geral apenas uma vez
  // Efeito para carregar dados iniciais - executado uma vez na montagem
  useEffect(() => {
    const tracker = (window as any).__API_CALLS_TRACKER;
    if (!tracker) return;

    // Verificar se já temos dados carregados no Redux
    if (students.length > 0) tracker.loadedData.students = true;
    if (teachers.length > 0) tracker.loadedData.teachers = true;
    if (courses.length > 0) tracker.loadedData.courses = true;
    if (enrollments.length > 0) tracker.loadedData.enrollments = true;

    // Função para carregar dados se necessário
    const fetchDataIfNeeded = async () => {
      // Alunos
      if (students.length === 0 && !studentsLoading && 
          !tracker.loadedData.students && 
          canCallApi('/api/alunos')) {
        console.log('Carregando alunos pela primeira vez');
        dispatch(fetchStudents());
        tracker.loadedData.students = true;
      }
      
      // Professores
      if (teachers.length === 0 && !teachersLoading && 
          !tracker.loadedData.teachers && 
          canCallApi('/api/professores')) {
        console.log('Carregando professores pela primeira vez');
        dispatch(fetchTeachers());
        tracker.loadedData.teachers = true;
      }
      
      // Cursos
      if (courses.length === 0 && !coursesLoading && 
          !tracker.loadedData.courses && 
          canCallApi('/api/cursos')) {
        console.log('Carregando cursos pela primeira vez');
        dispatch(fetchCourses());
        tracker.loadedData.courses = true;
      }
      
      // Matrículas
      if (enrollments.length === 0 && !enrollmentsLoading && 
          !tracker.loadedData.enrollments && 
          canCallApi('/api/matriculas')) {
        console.log('Carregando matrículas pela primeira vez');
        dispatch(fetchEnrollments());
        tracker.loadedData.enrollments = true;
      }
    };

    fetchDataIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Apenas dispatch como dependência para executar somente uma vez


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
          {user?.role === 'admin' && 'Visão geral da administração acadêmica'}
          {user?.role === 'teacher' && 'Visão geral de suas atividades como professor'}
          {user?.role === 'student' && 'Visão geral de seu desempenho acadêmico'}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', padding:6}}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="overview" label="Visão Geral" />
          {user?.role === 'admin' && <Tab value="analytics" label="Análise Detalhada" />}
          {user?.role === 'teacher' && <Tab value="students" label="Meus Alunos" />}
          {user?.role === 'student' && <Tab value="courses" label="Meus Cursos" />}
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
            {selectedTab === 'analytics' && (
              <AnalyticsContent />
            )}
            {/* Tabs específicos para professores e alunos */}
            {selectedTab === 'students' && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Meus Alunos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Esta seção será implementada em breve com funcionalidades adicionais.
                </Typography>
              </Box>
            )}
            {selectedTab === 'courses' && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Meus Cursos</Typography>
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
