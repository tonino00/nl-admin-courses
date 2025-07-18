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
      {/* Rota pública para login */}
      <Route path="/login" element={<LazyComponent><Login /></LazyComponent>} />

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

        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;