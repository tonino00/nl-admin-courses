import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchTeacherById } from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { Teacher, Course } from '../../types';

const CursosProfessor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentTeacher, loading: teacherLoading, error: teacherError } = useAppSelector(
    (state: RootState) => state.teachers
  );
  
  const { courses, loading: coursesLoading, error: coursesError } = useAppSelector(
    (state: RootState) => state.courses
  );
  
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  
  // Carregar dados do professor e cursos
  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherById(Number(id)));
      dispatch(fetchCourses());
    }
  }, [dispatch, id]);
  
  // Filtrar cursos do professor quando os dados estiverem disponíveis
  useEffect(() => {
    if (currentTeacher && courses.length > 0) {
      // Filtrar cursos onde o professor é o responsável direto (teacherId)
      // ou está na lista de cursos do professor
      const filteredCourses = courses.filter(course => {
        // Verificar se o professor é o responsável pelo curso
        const isPrimaryTeacher = course.teacherId === currentTeacher.id;
        
        // Verificar se o curso está na lista de cursos do professor
        const isInTeacherCourses = currentTeacher.courses?.includes(course.id);
        
        return isPrimaryTeacher || isInTeacherCourses;
      });
      
      console.log('Cursos filtrados para o professor:', filteredCourses);
      setTeacherCourses(filteredCourses);
    }
  }, [currentTeacher, courses]);
  
  if (teacherLoading || coursesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (teacherError || coursesError) {
    return (
      <Alert severity="error">
        {teacherError || coursesError}
      </Alert>
    );
  }
  
  if (!currentTeacher) {
    return (
      <Alert severity="warning">
        Professor não encontrado.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton color="primary" onClick={() => navigate('/professores/' + id)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          Cursos de {currentTeacher.fullName}
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {teacherCourses.length === 0 ? (
          <Alert severity="info">
            Este professor não está associado a nenhum curso no momento.
          </Alert>
        ) : (
          <List>
            {teacherCourses.map((course) => (
              <React.Fragment key={course.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton 
                        edge="end" 
                        aria-label="frequência e avaliação"
                        onClick={() => navigate(`/cursos/${course.id}/frequencia-avaliacao`)}
                        title="Frequência e Avaliação"
                      >
                        <AssignmentIcon color="primary" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="detalhes"
                        onClick={() => navigate(`/cursos/${course.id}`)}
                        title="Detalhes do Curso"
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <ClassIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={course.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {course.description.substring(0, 80)}
                          {course.description.length > 80 ? '...' : ''}
                        </Typography>
                        <Typography component="span" variant="body2" display="block" sx={{ mt: 1 }}>
                          Carga horária: {course.workload} horas · Status: {course.status === 'active' ? 'Ativo' : 'Inativo'} · Vagas: {course.availableSpots} / {course.totalSpots}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default CursosProfessor;
