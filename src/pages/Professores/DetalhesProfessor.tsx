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
    (state) => state.teachers
  );
  const { courses, loading: coursesLoading } = useAppSelector(
    (state) => state.courses
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
  const teacherCourses = courses.filter(
    (course) => currentTeacher.courses && currentTeacher.courses.includes(course.id)
  );
  
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
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  CPF
                </Typography>
                <Typography variant="body1">{currentTeacher.cpf}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Data de Nascimento
                </Typography>
                <Typography variant="body1">
                  {new Date(currentTeacher.birthDate).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1">{currentTeacher.phone}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{currentTeacher.email}</Typography>
              </Grid>
              
              {currentTeacher.specializations && currentTeacher.specializations.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Especializações
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentTeacher.specializations.map((spec, index) => (
                      <Chip
                        key={index}
                        label={spec}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
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
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Formação Acadêmica" />
                <Divider />
                <CardContent>
                  <Typography>
                    {currentTeacher.education}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Biografia" />
                <Divider />
                <CardContent>
                  <Typography>
                    {currentTeacher.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Endereço" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body2" color="text.secondary">
                        Rua
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.street}, {currentTeacher.address.number}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Complemento
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.complement || '-'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Bairro
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.district}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Cidade
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.city}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.state}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        CEP
                      </Typography>
                      <Typography variant="body1">
                        {currentTeacher.address.zipCode}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Tab de Cursos Ministrados */}
        <TabPanel value={tabValue} index={1}>
          {teacherCourses.length > 0 ? (
            <Grid container spacing={3}>
              {teacherCourses.map((course) => (
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
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Duração:
                            </Typography>
                            <Typography variant="body1">
                              {course.duration} {course.durationType}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Vagas:
                            </Typography>
                            <Typography variant="body1">
                              {course.availableSlots} vagas
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Categoria:
                            </Typography>
                            <Typography variant="body1">
                              {course.category}
                            </Typography>
                          </Grid>
                        </Grid>
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
