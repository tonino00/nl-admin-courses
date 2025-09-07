import React, { useEffect, lazy, useTransition, useState } from 'react';
import { Routes as RouterRoutes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { CircularProgress, Box } from '@mui/material';
import { checkAuthStatus } from '../store/slices/authSlice';
import { RootState } from '../store';

// Layouts
import Layout from '../components/Shared/Layout';
import LazyComponent from '../components/LazyComponent';

// Componente de loading foi movido para o LazyComponent

// Implementando lazy loading para todas as páginas
// Pages
const Login = lazy(() => import('./Login/Login'));
const Register = lazy(() => import('./Register/Register'));
const RequestReset = lazy(() => import('./PasswordReset/RequestReset'));
const ConfirmReset = lazy(() => import('./PasswordReset/ConfirmReset'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const AcademicCalendar = lazy(() => import('./Calendar/AcademicCalendar'));

// Alunos
const ListaAlunos = lazy(() => import('./Alunos/ListaAlunos'));
const FormAluno = lazy(() => import('./Alunos/FormAluno'));
const DetalhesAluno = lazy(() => import('./Alunos/DetalhesAluno'));

// Professores
const ListaProfessores = lazy(() => import('./Professores/ListaProfessores'));
const FormProfessor = lazy(() => import('./Professores/FormProfessor'));
const DetalhesProfessor = lazy(() => import('./Professores/DetalhesProfessor'));
const CursosProfessor = lazy(() => import('./Professores/CursosProfessor'));
const RegistroPonto = lazy(() => import('./Professores/RegistroPonto'));

// Cursos
const ListaCursos = lazy(() => import('./Cursos/ListaCursos'));
const FormCurso = lazy(() => import('./Cursos/FormCurso'));
const DetalhesCurso = lazy(() => import('./Cursos/DetalhesCurso'));
const FrequenciaAvaliacao = lazy(() => import('./Cursos/FrequenciaAvaliacao'));
const Certificado = lazy(() => import('./Cursos/Certificado'));
const MatricularAlunos = lazy(() => import('./Cursos/MatricularAlunos'));

// Relatórios
const RelatorioDesempenho = lazy(() => import('./Relatorios/RelatorioDesempenho'));

// Chat
const ChatPage = lazy(() => import('./chat/ChatPage'));

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Componente para gerenciar a rota de login
const LoginRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Se estiver autenticado, redireciona para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Caso contrário, mostra o componente de login
  return (
    <LazyComponent>
      <Login />
    </LazyComponent>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [authChecked, setAuthChecked] = useState(false);

  // Verificar status de autenticação ao iniciar o componente, mas apenas se ainda não tivermos confirmado a autenticação
  useEffect(() => {
    // Se já estiver autenticado e tiver token, não precisa verificar novamente
    if (isAuthenticated && token) {
      setAuthChecked(true);
      return;
    }
    
    // Se já verificamos, não precisamos verificar novamente
    if (authChecked) return;
    
    const verifyAuth = async () => {
      try {
        console.log('Verificando autenticação...');
        // Verifica autenticação de forma assíncrona
        await dispatch(checkAuthStatus()).unwrap();
        setAuthChecked(true);
      } catch (error) {
        // Já tratamos o erro no reducer
        console.log('Erro de autenticação:', error);
        setAuthChecked(true);
      }
    };
    
    verifyAuth();
  }, [dispatch, isAuthenticated, token, authChecked]);

  useEffect(() => {
    if (!loading && authChecked && !isAuthenticated) {
      // Só redireciona se já verificamos a autenticação e não está autenticado
      console.log('Não autenticado, redirecionando para login');
      // Usando startTransition para evitar redirecionamentos em cascata
      startTransition(() => {
        // Verificando se já não estamos na página de login para evitar loops
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      });
    }
  }, [isAuthenticated, loading, navigate, startTransition, authChecked]);

  if (loading || isPending) {
    // Mostra o componente de loading tanto para carregamento da autenticação quanto para transições pendentes
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Rotas públicas de autenticação */}
      <Route 
        path="/login" 
        element={<LoginRoute />} 
      />
      <Route path="/register" element={<LazyComponent><Register /></LazyComponent>} />
      <Route path="/reset-password" element={<LazyComponent><RequestReset /></LazyComponent>} />
      <Route path="/reset-password/:token" element={<LazyComponent><ConfirmReset /></LazyComponent>} />

      {/* Rotas protegidas - necessitam autenticação */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={
                <LazyComponent>
                  <Dashboard />
                </LazyComponent>
              } />

        {/* Calendário */}
        <Route path="calendario" element={<LazyComponent><AcademicCalendar /></LazyComponent>} />

        {/* Rotas de Alunos */}
        <Route path="alunos">
          <Route index element={<LazyComponent><ListaAlunos /></LazyComponent>} />
          <Route path="cadastro" element={<LazyComponent><FormAluno /></LazyComponent>} />
          <Route path="editar/:id" element={<LazyComponent><FormAluno /></LazyComponent>} />
          <Route path=":id" element={<LazyComponent><DetalhesAluno /></LazyComponent>} />
        </Route>

        {/* Rotas de Professores */}
        <Route path="professores">
          <Route index element={<LazyComponent><ListaProfessores /></LazyComponent>} />
          <Route path="cadastro" element={<LazyComponent><FormProfessor /></LazyComponent>} />
          <Route path="editar/:id" element={<LazyComponent><FormProfessor /></LazyComponent>} />
          <Route path=":id" element={<LazyComponent><DetalhesProfessor /></LazyComponent>} />
          <Route path=":id/cursos" element={<LazyComponent><CursosProfessor /></LazyComponent>} />
          <Route path=":id/ponto" element={<LazyComponent><RegistroPonto /></LazyComponent>} />
        </Route>

        {/* Rotas de Cursos */}
        <Route path="cursos">
          <Route index element={<LazyComponent><ListaCursos /></LazyComponent>} />
          <Route path="cadastro" element={<LazyComponent><FormCurso /></LazyComponent>} />
          <Route path="editar/:id" element={<LazyComponent><FormCurso /></LazyComponent>} />
          <Route path=":id" element={<LazyComponent><DetalhesCurso /></LazyComponent>} />
          <Route path=":id/frequencia-avaliacao" element={<LazyComponent><FrequenciaAvaliacao /></LazyComponent>} />
          <Route path=":id/matricular-alunos" element={<LazyComponent><MatricularAlunos /></LazyComponent>} />
          <Route path=":courseId/certificado/:studentId" element={<LazyComponent><Certificado /></LazyComponent>} />
        </Route>

        {/* Rotas de Relatórios */}
        <Route path="relatorios">
          <Route index element={<LazyComponent><RelatorioDesempenho /></LazyComponent>} />
          <Route path="desempenho" element={<LazyComponent><RelatorioDesempenho /></LazyComponent>} />
        </Route>

        {/* Rota de Chat */}
        <Route path="chat" element={<LazyComponent><ChatPage /></LazyComponent>} />

        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;