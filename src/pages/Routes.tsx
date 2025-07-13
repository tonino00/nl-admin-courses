import React, { useEffect } from 'react';
import { Routes as RouterRoutes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';

// Layouts
import Layout from '../components/Shared/Layout';

// Pages
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';

// Alunos
import ListaAlunos from './Alunos/ListaAlunos';
import FormAluno from './Alunos/FormAluno';
import DetalhesAluno from './Alunos/DetalhesAluno';

// Professores
import ListaProfessores from './Professores/ListaProfessores';
import FormProfessor from './Professores/FormProfessor';
import DetalhesProfessor from './Professores/DetalhesProfessor';
import CursosProfessor from './Professores/CursosProfessor';

// Cursos
import ListaCursos from './Cursos/ListaCursos';
import FormCurso from './Cursos/FormCurso';
import DetalhesCurso from './Cursos/DetalhesCurso';
import FrequenciaAvaliacao from './Cursos/FrequenciaAvaliacao';
import Certificado from './Cursos/Certificado';
import MatricularAlunos from './Cursos/MatricularAlunos';

// Relatórios
import RelatorioDesempenho from './Relatorios/RelatorioDesempenho';

// Auth
import { checkAuthStatus } from '../store/slices/authSlice';
import { RootState } from '../store';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    // Pode-se adicionar um componente de loading aqui
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Rota pública para login */}
      <Route path="/login" element={<Login />} />

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
        <Route index element={<Dashboard />} />

        {/* Rotas de Alunos */}
        <Route path="alunos">
          <Route index element={<ListaAlunos />} />
          <Route path="cadastro" element={<FormAluno />} />
          <Route path="editar/:id" element={<FormAluno />} />
          <Route path=":id" element={<DetalhesAluno />} />
        </Route>

        {/* Rotas de Professores */}
        <Route path="professores">
          <Route index element={<ListaProfessores />} />
          <Route path="cadastro" element={<FormProfessor />} />
          <Route path="editar/:id" element={<FormProfessor />} />
          <Route path=":id" element={<DetalhesProfessor />} />
          <Route path=":id/cursos" element={<CursosProfessor />} />
        </Route>

        {/* Rotas de Cursos */}
        <Route path="cursos">
          <Route index element={<ListaCursos />} />
          <Route path="cadastro" element={<FormCurso />} />
          <Route path="editar/:id" element={<FormCurso />} />
          <Route path=":id" element={<DetalhesCurso />} />
          <Route path=":id/frequencia-avaliacao" element={<FrequenciaAvaliacao />} />
          <Route path=":id/matricular-alunos" element={<MatricularAlunos />} />
          <Route path=":courseId/certificado/:studentId" element={<Certificado />} />
        </Route>

        {/* Rotas de Relatórios */}
        <Route path="relatorios">
          <Route index element={<RelatorioDesempenho />} />
          <Route path="desempenho" element={<RelatorioDesempenho />} />
        </Route>

        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;