import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  List,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  School as CourseIcon,
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchTeacherById } from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { Teacher, Course } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `teacher-tab-${index}`,
    'aria-controls': `teacher-tabpanel-${index}`,
  };
}

const DetalhesProfessor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { currentTeacher, loading: teacherLoading } = useAppSelector(
    (state: RootState) => state.teachers as { currentTeacher: Teacher; loading: boolean }
  );
  const { courses, loading: coursesLoading } = useAppSelector(
    (state: RootState) => state.courses as { courses: Course[]; loading: boolean }
  );
  
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherById(Number(id)));
      dispatch(fetchCourses());
    }
  }, [dispatch, id]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEdit = () => {
    if (id) {
      navigate(`/professores/editar/${id}`);
    }
  };
  
  const handleBack = () => {
    navigate('/professores');
  };
  
  const loading = teacherLoading || coursesLoading;
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentTeacher) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Professor não encontrado
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          Voltar
        </Button>
      </Box>
    );
  }
  
  // Encontrar cursos ministrados pelo professor
  // Verificamos tanto se o ID do professor está no curso quanto se o curso está listado no professor
  const teacherCourses = courses.filter((course: Course) => {
    // Verificação principal: o professor é o responsável pelo curso
    const isTeacherOfCourse = course.teacherId === currentTeacher.id;
    
    // Verificação secundária: o curso está na lista de cursos do professor (se existir)
    const isInTeacherCourses = currentTeacher?.courses?.includes(course.id);
    
    // Log para depuração
    console.log(`Curso: ${course.name}, ID: ${course.id}, teacherId: ${course.teacherId}, Professor ID: ${currentTeacher.id}, Está na lista do professor: ${isInTeacherCourses}`);
    
    // Retorna verdadeiro se alguma das condições for verdadeira
    return isTeacherOfCourse || isInTeacherCourses;
  });
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton color="primary" onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" flex={1}>
          Detalhes do Professor
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CourseIcon />}
          onClick={() => navigate(`/professores/${id}/cursos`)}
          sx={{ mr: 1 }}
        >
          Gerenciar Cursos
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Editar
        </Button>
      </Box>
      
      {/* Card com informações básicas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} display="flex" justifyContent="center">
            <Avatar
              sx={{
                width: 150,
                height: 150,
                fontSize: 64,
                bgcolor: 'secondary.main',
              }}
            >
              {currentTeacher.fullName.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {currentTeacher.fullName}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                icon={currentTeacher.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                label={currentTeacher.status === 'active' ? 'Ativo' : 'Inativo'}
                color={currentTeacher.status === 'active' ? 'success' : 'error'}
                sx={{ mr: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                ID: {currentTeacher.id}
              </Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>CPF</TableCell>
                    <TableCell>Data de Nascimento</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{currentTeacher.cpf}</TableCell>
                    <TableCell>{new Date(currentTeacher.birthDate).toLocaleDateString()}</TableCell>
                    <TableCell>{currentTeacher.phone}</TableCell>
                    <TableCell>{currentTeacher.email}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
              
            {currentTeacher.specializations && currentTeacher.specializations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Especializações:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentTeacher.specializations.map((spec: string, index: number) => (
                    <Chip
                      key={index}
                      label={spec}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Abas para organizar informações detalhadas */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="teacher details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Informações Detalhadas"
              {...a11yProps(0)}
            />
            <Tab
              label="Cursos Ministrados"
              icon={<CourseIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
        
        {/* Tab de Informações Detalhadas */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Informações Acadêmicas e Profissionais" />
                <Divider />
                <CardContent sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Formação Acadêmica</TableCell>
                        <TableCell>Biografia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'pre-wrap', verticalAlign: 'top', width: '50%' }}>
                          {currentTeacher.education}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap', verticalAlign: 'top', width: '50%' }}>
                          {currentTeacher.bio}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Endereço" />
                <Divider />
                <CardContent sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rua</TableCell>
                        <TableCell>Número</TableCell>
                        <TableCell>Complemento</TableCell>
                        <TableCell>Bairro</TableCell>
                        <TableCell>Cidade</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>CEP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{currentTeacher.address.street}</TableCell>
                        <TableCell>{currentTeacher.address.number}</TableCell>
                        <TableCell>{currentTeacher.address.complement || '-'}</TableCell>
                        <TableCell>{currentTeacher.address.district}</TableCell>
                        <TableCell>{currentTeacher.address.city}</TableCell>
                        <TableCell>{currentTeacher.address.state}</TableCell>
                        <TableCell>{currentTeacher.address.zipCode}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Tab de Cursos Ministrados */}
        <TabPanel value={tabValue} index={1}>
          {teacherCourses.length > 0 ? (
            <Grid container spacing={3}>
              {teacherCourses.map((course: Course) => (
                <Grid item xs={12} md={6} key={course.id}>
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <CourseIcon />
                        </Avatar>
                      }
                      title={course.name}
                      subheader={`Carga horária: ${course.workload} horas`}
                      action={
                        <Chip
                          label={course.status === 'active' ? 'Ativo' : 'Inativo'}
                          color={course.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        {course.description}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Detalhes do curso:
                        </Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Duração</TableCell>
                                <TableCell>Categoria</TableCell>
                                <TableCell>Vagas</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{course.workload} horas</TableCell>
                                <TableCell>{course.description.split(' ').slice(0, 2).join(' ')}</TableCell>
                                <TableCell>{course.availableSpots} vagas</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>
              Este professor não está ministrando nenhum curso atualmente.
            </Typography>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DetalhesProfessor;
