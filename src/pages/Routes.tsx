import React, { useEffect, lazy, Suspense, useTransition } from 'react';
import { Routes as RouterRoutes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { CircularProgress, Box } from '@mui/material';
import { checkAuthStatus } from '../store/slices/authSlice';
import { RootState } from '../store';

// Layouts
import Layout from '../components/Shared/Layout';

// Componente de loading para o Suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Implementando lazy loading para todas as páginas
// Pages
const Login = lazy(() => import('./Login/Login'));
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

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  // Verificar status de autenticação ao iniciar o componente
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verifica autenticação de forma assíncrona
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        // Já tratamos o erro no reducer
        console.log('Erro de autenticação:', error);
      }
    };
    
    verifyAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Usando startTransition para envolver a navegação que pode acionar lazy loading
      startTransition(() => {
        navigate('/login');
      });
    }
  }, [isAuthenticated, loading, navigate, startTransition]);

  if (loading || isPending) {
    // Mostra o componente de loading tanto para carregamento da autenticação quanto para transições pendentes
    return <LoadingComponent />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Rota pública para login */}
      <Route path="/login" element={<Suspense fallback={<LoadingComponent />}><Login /></Suspense>} />

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
        <Route index element={<Suspense fallback={<LoadingComponent />}><Dashboard /></Suspense>} />
        
        {/* Calendário */}
        <Route path="calendario" element={<Suspense fallback={<LoadingComponent />}><AcademicCalendar /></Suspense>} />

        {/* Rotas de Alunos */}
        <Route path="alunos">
          <Route index element={<Suspense fallback={<LoadingComponent />}><ListaAlunos /></Suspense>} />
          <Route path="cadastro" element={<Suspense fallback={<LoadingComponent />}><FormAluno /></Suspense>} />
          <Route path="editar/:id" element={<Suspense fallback={<LoadingComponent />}><FormAluno /></Suspense>} />
          <Route path=":id" element={<Suspense fallback={<LoadingComponent />}><DetalhesAluno /></Suspense>} />
        </Route>

        {/* Rotas de Professores */}
        <Route path="professores">
          <Route index element={<Suspense fallback={<LoadingComponent />}><ListaProfessores /></Suspense>} />
          <Route path="cadastro" element={<Suspense fallback={<LoadingComponent />}><FormProfessor /></Suspense>} />
          <Route path="editar/:id" element={<Suspense fallback={<LoadingComponent />}><FormProfessor /></Suspense>} />
          <Route path=":id" element={<Suspense fallback={<LoadingComponent />}><DetalhesProfessor /></Suspense>} />
          <Route path=":id/cursos" element={<Suspense fallback={<LoadingComponent />}><CursosProfessor /></Suspense>} />
          <Route path=":id/ponto" element={<Suspense fallback={<LoadingComponent />}><RegistroPonto /></Suspense>} />
        </Route>

        {/* Rotas de Cursos */}
        <Route path="cursos">
          <Route index element={<Suspense fallback={<LoadingComponent />}><ListaCursos /></Suspense>} />
          <Route path="cadastro" element={<Suspense fallback={<LoadingComponent />}><FormCurso /></Suspense>} />
          <Route path="editar/:id" element={<Suspense fallback={<LoadingComponent />}><FormCurso /></Suspense>} />
          <Route path=":id" element={<Suspense fallback={<LoadingComponent />}><DetalhesCurso /></Suspense>} />
          <Route path=":id/frequencia-avaliacao" element={<Suspense fallback={<LoadingComponent />}><FrequenciaAvaliacao /></Suspense>} />
          <Route path=":id/matricular-alunos" element={<Suspense fallback={<LoadingComponent />}><MatricularAlunos /></Suspense>} />
          <Route path=":courseId/certificado/:studentId" element={<Suspense fallback={<LoadingComponent />}><Certificado /></Suspense>} />
        </Route>

        {/* Rotas de Relatórios */}
        <Route path="relatorios">
          <Route index element={<Suspense fallback={<LoadingComponent />}><RelatorioDesempenho /></Suspense>} />
          <Route path="desempenho" element={<Suspense fallback={<LoadingComponent />}><RelatorioDesempenho /></Suspense>} />
        </Route>

        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;