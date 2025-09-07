import React, { useEffect, useState } from 'react';
import { formatDateToBR } from '../../utils/masks';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCourseById, deleteCourse } from '../../store/slices/coursesSlice';
import { fetchTeachers } from '../../store/slices/teachersSlice';
import { fetchEnrollmentsByCourse } from '../../store/slices/enrollmentsSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import {
  Attendance,
  Course,
  EnrollmentFull,
  Schedule,
  Student,
  Teacher,
} from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DetalhesCurso: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // Verificação se é dispositivo móvel usando o hook useMediaQuery
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const {
    currentCourse,
    courses,
    loading: courseLoading,
  } = useAppSelector((state: any) => state.courses);

  const { enrollments, loading: enrollmentsLoading } = useAppSelector(
    (state: any) => state.enrollments
  );

  // Obter a lista de alunos para exibir os nomes em vez dos IDs
  const { students, loading: studentsLoading } = useAppSelector(
    (state: any) => state.students
  );

  // Obter a lista de professores para exibir o professor responsável
  const { teachers, loading: teachersLoading } = useAppSelector(
    (state: any) => state.teachers
  );

  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      // Usar ID como string diretamente sem converter para número
      console.log('Buscando detalhes do curso com ID:', id, 'Tipo:', typeof id);
      dispatch(fetchCourseById(id));
      dispatch(fetchEnrollmentsByCourse(id));
      dispatch(fetchStudents()); // Buscar todos os alunos para mapear nomes
      dispatch(fetchTeachers()); // Buscar todos os professores
    }
  }, [dispatch, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (id) {
      // Passar o ID diretamente sem conversão para número
      await dispatch(deleteCourse(id)).unwrap();
      navigate('/cursos');
    }
  };

  // Verificar se algum dado ainda está carregando
  if (
    courseLoading ||
    enrollmentsLoading ||
    studentsLoading ||
    teachersLoading
  ) {
    return <Typography>Carregando...</Typography>;
  }

  // Verificar se há erros no carregamento do curso
  if (!currentCourse && !courseLoading) {
    return <Alert severity="error">Erro ao carregar dados do curso</Alert>;
  }

  if (!currentCourse) {
    return <Alert severity="warning">Curso não encontrado</Alert>;
  }

  // Inspeção detalhada da resposta da API para diagnóstico
  console.log('-------------------------');
  console.log('DIAGNÓSTICO DE PROFESSOR:');
  console.log('ID do professor no curso:', currentCourse.teacherId, 'Tipo:', typeof currentCourse.teacherId);
  console.log('Lista bruta de professores:', teachers);
  console.log('Quantidade de professores disponíveis:', teachers?.length || 0);
  
  if (Array.isArray(teachers) && teachers.length > 0) {
    teachers.forEach((teacher, index) => {
      console.log(`Professor ${index}: id=${teacher.id}, _id=${teacher._id}, nome=${teacher.fullName}`);
    });
  }
  console.log('-------------------------');

  // Função auxiliar aprimorada para comparar IDs (considerando estrutura MongoDB)
  const compareIds = (teacherId: any, courseTeacherId: any): boolean => {
    console.log(`Comparando: teacherId=${teacherId}, courseTeacherId=${courseTeacherId}`);
    
    // Se algum é nulo ou undefined, não há match
    if (teacherId == null || courseTeacherId == null) return false;
    
    // Se são idênticos
    if (teacherId === courseTeacherId) {
      console.log('Match exato!');
      return true;
    }
    
    // Comparar como strings
    const strMatch = String(teacherId).trim() === String(courseTeacherId).trim();
    if (strMatch) {
      console.log('Match por string!');
      return true;
    }
    
    // Se o id do professor é um objeto com propriedade _id ou id
    if (typeof teacherId === 'object' && teacherId !== null) {
      const objId = teacherId._id || teacherId.id;
      if (objId === courseTeacherId || String(objId) === String(courseTeacherId)) {
        console.log('Match por objeto id!'); 
        return true;
      }
    }
    
    return false;
  };
  
  // Verificar e ajustar o teacherId se necessário
  // O MongoDB geralmente usa _id em vez de id
  let teacherId = currentCourse.teacherId;
  console.log('TeacherId original do curso:', teacherId);
  
  // Se o curso tem um campo _id em teacherId (objeto MongoDB)
  if (typeof currentCourse.teacherId === 'object' && currentCourse.teacherId !== null) {
    if (currentCourse.teacherId._id) {
      teacherId = currentCourse.teacherId._id;
      console.log('Extraindo _id do objeto teacherId:', teacherId);
    }
  } 
  // Se teacherId é um objeto (caso extremo)
  else if (currentCourse.teacherId && typeof currentCourse.teacherId === 'object') {
    teacherId = String(currentCourse.teacherId);
    console.log('TeacherId é um objeto, convertendo para string:', teacherId);
  }
  
  console.log('TeacherId ajustado para busca:', teacherId);
  
  // Tentativa 1: Busca normal por ID
  let courseTeacher = teachers.find(
    (teacher: Teacher) => compareIds(teacher.id, teacherId)
  );
  
  // Tentativa 2: Se não encontrado, tenta com _id
  if (!courseTeacher) {
    console.log('Professor não encontrado na primeira tentativa, buscando por _id');
    courseTeacher = teachers.find(
      (teacher: Teacher) => {
        if (teacher._id) {
          return compareIds(teacher._id, teacherId);
        }
        return false;
      }
    );
  }
  
  // Tentativa 3: Comparação direta de strings
  if (!courseTeacher) {
    console.log('Professor não encontrado nas tentativas anteriores, comparando strings');
    const teacherIdStr = String(teacherId).trim();
    courseTeacher = teachers.find(
      (teacher: Teacher) => {
        return String(teacher.id).trim() === teacherIdStr || 
               (teacher._id && String(teacher._id).trim() === teacherIdStr);
      }
    );
  }
  
  console.log('Professor encontrado após todas as tentativas:', courseTeacher);

  // Encontra os cursos de pré-requisito usando comparação segura de IDs
  const prerequisiteCourses =
    currentCourse.prerequisites
      ?.map((prereqId: number | string) =>
        courses.find((course: Course) => compareIds(course.id, prereqId))
      )
      .filter(Boolean) || [];

  // Tradução dos dias da semana
  const translateDay = (day: string) => {
    const translations: Record<string, string> = {
      Monday: 'Segunda-feira',
      Tuesday: 'Terça-feira',
      Wednesday: 'Quarta-feira',
      Thursday: 'Quinta-feira',
      Friday: 'Sexta-feira',
      Saturday: 'Sábado',
      Sunday: 'Domingo',
    };
    return translations[day] || day;
  };

  // Tradução dos turnos
  const translateShift = (shift: string) => {
    const translations: Record<string, string> = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      night: 'Noite',
    };
    return translations[shift] || shift;
  };

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          mb={3}
          gap={2}
        >
          <Box display="flex" alignItems="center">
            <AssignmentIcon
              color="primary"
              sx={{ mr: 1, fontSize: { xs: 24, sm: 30 } }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
            >
              {currentCourse.name}
            </Typography>
          </Box>

          {/* Reorganiza os botões para dispositivos móveis e tablets */}
          {isMobile ? (
            <Stack direction="column" spacing={2} width="100%">
              {/* Primeira linha: Voltar e Editar */}
              <Box display="flex" gap={2} width="100%">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  component={Link}
                  to="/cursos"
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/cursos/editar/${id}`}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Editar
                </Button>
              </Box>
              
              {/* Segunda linha: Matricular e Freq/Aval */}
              <Box display="flex" gap={2} width="100%">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PersonAddIcon />}
                  component={Link}
                  to={`/cursos/${id}/matricular-alunos`}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Matricular
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AssignmentIcon />}
                  component={Link}
                  to={`/cursos/${id}/frequencia-avaliacao`}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Freq/Aval
                </Button>
              </Box>
              
              {/* Terceira linha: Botão de Excluir */}
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                size="small"
              >
                Excluir
              </Button>
            </Stack>
          ) : isTablet ? (
            <Stack
              spacing={1}
              width="100%"
            >
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  component={Link}
                  to="/cursos"
                  size="small"
                  sx={{ flexGrow: 1, fontSize: "0.85rem", py: 0.5 }}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/cursos/editar/${id}`}
                  size="small"
                  sx={{ flexGrow: 1, fontSize: "0.85rem", py: 0.5 }}
                >
                  Editar
                </Button>
              </Box>
              
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AssignmentIcon />}
                  component={Link}
                  to={`/cursos/${id}/frequencia-avaliacao`}
                  size="small"
                  sx={{ flexGrow: 1, fontSize: "0.85rem", py: 0.5 }}
                >
                  Freq/Aval
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PersonAddIcon />}
                  component={Link}
                  to={`/cursos/${id}/matricular-alunos`}
                  size="small"
                  sx={{ flexGrow: 1, fontSize: "0.85rem", py: 0.5 }}
                >
                  Matricular
                </Button>
              </Box>

              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                size="small"
                sx={{ fontSize: "0.85rem", py: 0.5, mt: 1 }}
                fullWidth
              >
                Excluir
              </Button>
            </Stack>
          ) : (
            <Box display="flex" gap={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={Link}
                to="/cursos"
                size="small"
                sx={{ fontSize: "0.85rem" }}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                component={Link}
                to={`/cursos/editar/${id}`}
                size="small"
                sx={{ fontSize: "0.85rem" }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<PersonAddIcon />}
                component={Link}
                to={`/cursos/${id}/matricular-alunos`}
                size="small"
                sx={{ fontSize: "0.85rem" }}
              >
                Matricular
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentIcon />}
                component={Link}
                to={`/cursos/${id}/frequencia-avaliacao`}
                size="small"
                sx={{ fontSize: "0.85rem" }}
              >
                Frequência
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                size="small"
                sx={{ fontSize: "0.85rem" }}
              >
                Excluir
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course tabs"
          sx={{ mb: 2 }}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
        >
          <Tab
            label={isMobile ? 'Informações' : 'Informações Gerais'}
            id="tab-0"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
          <Tab
            label={isMobile ? 'Alunos' : 'Alunos Matriculados'}
            id="tab-1"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
          <Tab
            label={isMobile ? 'Horários' : 'Grade de Horários'}
            id="tab-2"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Detalhes do Curso" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Descrição:
                      </Typography>
                      <Typography variant="body1">
                        {currentCourse.description}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Carga Horária:
                      </Typography>
                      <Typography variant="body1">
                        {currentCourse.workload} horas
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Status:
                      </Typography>
                      <Chip
                        label={
                          currentCourse.status === 'active'
                            ? 'Ativo'
                            : 'Inativo'
                        }
                        color={
                          currentCourse.status === 'active'
                            ? 'success'
                            : 'error'
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Vagas:
                      </Typography>
                      <Typography variant="body1">
                        {currentCourse.availableSpots} disponíveis de{' '}
                        {currentCourse.totalSpots} totais
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Turnos:
                      </Typography>
                      <Box>
                        {currentCourse.shifts.map((shift: string) => (
                          <Chip
                            key={shift}
                            label={translateShift(shift)}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader
                  title="Professor Responsável"
                  avatar={<PersonIcon color="primary" />}
                />
                <CardContent>
                  {courseTeacher ? (
                    <>
                      <Typography variant="h6">
                        {typeof courseTeacher === 'object' && courseTeacher !== null
                          ? courseTeacher.fullName || 'Nome não disponível'
                          : 'Informações não disponíveis'}
                      </Typography>
                      
                      {courseTeacher.email && (
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          <strong>Email:</strong> {courseTeacher.email}
                        </Typography>
                      )}
                      
                      {courseTeacher.phone && (
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          <strong>Telefone:</strong> {courseTeacher.phone}
                        </Typography>
                      )}
                      
                      {courseTeacher.specializations && courseTeacher.specializations.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Especializações:
                          </Typography>
                          <Box>
                            {courseTeacher.specializations.map((spec: string) => (
                              <Chip
                                key={spec}
                                label={spec}
                                size="small"
                                sx={{ mr: 0.5, mt: 0.5 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1">
                      Professor não encontrado
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader title="Pré-requisitos" />
                <CardContent>
                  {prerequisiteCourses.length > 0 ? (
                    <List>
                      {prerequisiteCourses.map((course: any) => (
                        <ListItem
                          key={course.id}
                          component={Link}
                          to={`/cursos/${course.id}`}
                          sx={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          <ListItemText
                            primary={course.name}
                            secondary={`${course.workload} horas`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1">
                      Nenhum pré-requisito
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card variant="outlined">
            <CardHeader
              title="Alunos Matriculados"
              avatar={<SchoolIcon color="primary" />}
              subheader={`Total: ${enrollments.length} alunos`}
              sx={{
                '& .MuiCardHeader-title': {
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                },
                '& .MuiCardHeader-subheader': {
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                },
              }}
            />
            <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
              {enrollments.length > 0 ? (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          ID
                        </TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Data Matr.
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          Frequência
                        </TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment: EnrollmentFull) => (
                        <TableRow key={enrollment.id}>
                          <TableCell
                            sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                          >
                            {enrollment.studentId}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              padding: { xs: '8px 6px', sm: '16px' },
                              fontWeight: 'medium',
                            }}
                          >
                            {enrollment.studentName ||
                              students.find(
                                (s: { id: number }) =>
                                  s.id === enrollment.studentId
                              )?.fullName ||
                              `Aluno ${enrollment.studentId}`}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', md: 'table-cell' },
                              fontSize: { sm: '0.8rem', md: '0.875rem' },
                            }}
                          >
                            {formatDateToBR(enrollment.enrollmentDate)}
                          </TableCell>
                          <TableCell
                            sx={{ padding: { xs: '8px 4px', sm: '16px' } }}
                          >
                            <Chip
                              label={
                                enrollment.status === 'active'
                                  ? 'Ativo'
                                  : 'Inativo'
                              }
                              color={
                                enrollment.status === 'active'
                                  ? 'success'
                                  : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            {enrollment.attendance &&
                            Array.isArray(enrollment.attendance)
                              ? `${
                                  enrollment.attendance.filter(
                                    (a: Attendance) => a.present
                                  ).length
                                }/${enrollment.attendance.length} aulas`
                              : 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{ padding: { xs: '8px 4px', sm: '16px' } }}
                          >
                            <IconButton
                              component={Link}
                              to={`/alunos/${enrollment.studentId}`}
                              color="primary"
                              size="small"
                              title="Ver aluno"
                            >
                              <SchoolIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1">
                  Nenhum aluno matriculado
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined">
            <CardHeader
              title="Grade de Horários"
              avatar={<AccessTimeIcon color="primary" />}
              sx={{
                '& .MuiCardHeader-title': {
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                },
              }}
            />
            <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
              {currentCourse.schedule && currentCourse.schedule.length > 0 ? (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dia</TableCell>
                        <TableCell>Início</TableCell>
                        <TableCell>Término</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          Duração
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentCourse.schedule.map(
                        (scheduleItem: Schedule, index: number) => (
                          <TableRow key={index}>
                            <TableCell
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {isMobile
                                ? translateDay(scheduleItem.day).substring(0, 3)
                                : translateDay(scheduleItem.day)}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {scheduleItem.start}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {scheduleItem.end}
                            </TableCell>
                            <TableCell
                              sx={{
                                display: { xs: 'none', sm: 'table-cell' },
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {(() => {
                                const startParts =
                                  scheduleItem.start.split(':');
                                const endParts = scheduleItem.end.split(':');
                                const startMinutes =
                                  parseInt(startParts[0]) * 60 +
                                  parseInt(startParts[1]);
                                const endMinutes =
                                  parseInt(endParts[0]) * 60 +
                                  parseInt(endParts[1]);
                                const durationMinutes =
                                  endMinutes - startMinutes;
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                return `${hours}h${
                                  minutes > 0 ? ` ${minutes}min` : ''
                                }`;
                              })()}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1">Nenhum horário definido</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
        sx={{ '& .MuiDialog-paper': { width: { xs: '100%', sm: '80%' } } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Tem certeza que deseja excluir o curso "{currentCourse.name}"? Esta
            ação não pode ser desfeita e removerá todas as matrículas
            associadas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog(false)}
            size={isMobile ? 'small' : 'medium'}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            autoFocus
            size={isMobile ? 'small' : 'medium'}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalhesCurso;
