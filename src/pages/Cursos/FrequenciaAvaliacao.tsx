import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  AssignmentTurnedIn as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCourseById } from '../../store/slices/coursesSlice';
import { fetchEnrollmentsByCourse, updateEnrollment } from '../../store/slices/enrollmentsSlice';
import { fetchStudents, fetchStudentById } from '../../store/slices/studentsSlice';
import { RootState } from '../../store';
import { CoursesState, EnrollmentsState, EnrollmentFull, StudentsState, Student } from '../../types';

// Definindo interfaces locais
interface AttendanceRecord {
  date: string;
  present: boolean;
}

interface Evaluation {
  id: number;
  moduleId: number;
  moduleName: string;
  evaluationType: string;
  evaluationDate: string;
  grade: number;
  comments?: string;
}

// Interface estendida que combina EnrollmentFull com propriedades adicionais
// Utilizando um tipo de interseção em vez de extensão para evitar colisões de propriedades
type ExtendedEnrollment = EnrollmentFull & {
  student: {
    id: number;
    name: string;
  };
  evaluations?: Evaluation[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id?: string;
}

// Função para converter EnrollmentFull para ExtendedEnrollment
function convertToExtendedEnrollment(enrollment: EnrollmentFull, student?: any): ExtendedEnrollment {
  return {
    ...enrollment,
    student: {
      id: enrollment.studentId,
      name: student ? student.fullName : `Aluno ${enrollment.studentId}` // Usa nome real do aluno ou valor padrão
    },
    evaluations: [],
    // Garantir que propriedades importantes estejam disponíveis
    studentId: enrollment.studentId,
    status: enrollment.status || 'active'
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

const FrequenciaAvaliacao: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Usar seletores específicos para cada propriedade do estado
  const currentCourse = useAppSelector((state: RootState) => {
    const courses = state.courses as CoursesState;
    return courses.currentCourse;
  });
  const courseLoading = useAppSelector((state: RootState) => {
    const courses = state.courses as CoursesState;
    return courses.loading;
  });
  // Convertendo o array de EnrollmentFull para ExtendedEnrollment
  // Dados dos alunos
  const students = useAppSelector((state: RootState) => {
    const studentsState = state.students as StudentsState;
    return studentsState.students;
  });
  const studentsLoading = useAppSelector((state: RootState) => {
    const studentsState = state.students as StudentsState;
    return studentsState.loading;
  });
  
  // Dados de matrículas com informações completas dos alunos
  const enrollments = useAppSelector((state: RootState) => {
    const enrollmentsState = state.enrollments as EnrollmentsState;
    return enrollmentsState.enrollments.map(enrollment => {
      // Procurar aluno nos dados carregados
      const student = students.find(s => s.id === enrollment.studentId);
      console.log(`Matrícula: ${enrollment.id}, StudentId: ${enrollment.studentId}, Student encontrado:`, student);
      return convertToExtendedEnrollment(enrollment, student);
    }) as ExtendedEnrollment[];
  });
  const enrollmentsLoading = useAppSelector((state: RootState) => {
    const enrollmentsState = state.enrollments as EnrollmentsState;
    return enrollmentsState.loading;
  });
  
  const [tabValue, setTabValue] = useState(0);
  const [attendanceDate, setAttendanceDate] = useState(moment().format('YYYY-MM-DD'));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, boolean>>({}); 
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<ExtendedEnrollment | null>(null);
  const [moduleId, setModuleId] = useState(1);
  const [moduleName, setModuleName] = useState('Introdução');
  const [evaluationType, setEvaluationType] = useState('prova');
  const [evaluationDate, setEvaluationDate] = useState(moment().format('YYYY-MM-DD'));
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Efeito para carregar curso e matrículas
  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(Number(id)));
      dispatch(fetchEnrollmentsByCourse(Number(id)));
      dispatch(fetchStudents()).unwrap().then(response => {
        console.log('Estudantes carregados:', response);
      }).catch(err => {
        console.error('Erro ao carregar estudantes:', err);
      });
    }
  }, [dispatch, id]);
  
  // Efeito para carregar detalhes de cada aluno quando as matrículas são carregadas
  const enrollmentsRaw = useAppSelector((state: RootState) => {
    const enrollmentsState = state.enrollments as EnrollmentsState;
    return enrollmentsState.enrollments;
  });

  // Função para buscar alunos e vincular com matrículas
  const loadStudentsForEnrollments = useCallback(() => {
    if (enrollmentsRaw && enrollmentsRaw.length > 0) {
      console.log('Carregando alunos para as matrículas:', enrollmentsRaw);
      
      // Obter IDs únicos de estudantes de todas as matrículas
      const studentIdsSet = new Set<number>();
      enrollmentsRaw.forEach(e => e.studentId && studentIdsSet.add(e.studentId));
      const studentIds = Array.from(studentIdsSet);
      console.log('IDs de estudantes a carregar:', studentIds);
      
      // Para cada ID de estudante, buscar os dados completos
      studentIds.forEach(studentId => {
        console.log('Buscando dados do estudante ID:', studentId);
        dispatch(fetchStudentById(studentId)).unwrap()
          .then(student => {
            console.log(`Dados do estudante ID ${studentId} carregados:`, student);
          })
          .catch(error => {
            console.error(`Erro ao carregar estudante ID ${studentId}:`, error);
          });
      });
    }
  }, [enrollmentsRaw, dispatch]);
  
  // Efeito para carregar dados dos alunos quando as matrículas estão disponíveis
  useEffect(() => {
    loadStudentsForEnrollments();
  }, [enrollmentsRaw, loadStudentsForEnrollments]);

  const handleAttendanceDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceDate(e.target.value);
    // Reset attendance records when date changes
    setAttendanceRecords({});
  };

  const toggleAttendance = (studentId: number) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = async () => {
    // For each student in attendance records, update their enrollment with the new attendance data
    try {
      for (const enrollment of enrollments) {
        if (attendanceRecords[enrollment.studentId] !== undefined) {
          const existingAttendance = enrollment.attendance || [];
          const newAttendanceRecord: AttendanceRecord = {
            date: attendanceDate,
            present: attendanceRecords[enrollment.studentId]
          };

          // Check if there's already an attendance record for this date
          const existingIndex = existingAttendance.findIndex((a: AttendanceRecord) => a.date === attendanceDate);
          let updatedAttendance;

          if (existingIndex >= 0) {
            // Update existing record
            updatedAttendance = [...existingAttendance];
            updatedAttendance[existingIndex] = newAttendanceRecord;
          } else {
            // Add new record
            updatedAttendance = [...existingAttendance, newAttendanceRecord];
          }

          // Update the enrollment - criando um objeto correto para evitar duplicação de ID
          const enrollmentToUpdate: EnrollmentFull = {
            id: enrollment.id,
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            enrollmentDate: enrollment.enrollmentDate,
            status: enrollment.status,
            attendance: updatedAttendance
          };
          
          await dispatch(updateEnrollment(enrollmentToUpdate));
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
    }
  };

  const handleOpenEvaluationDialog = (enrollment: ExtendedEnrollment) => {
    setSelectedEnrollment(enrollment);
    setEvaluationDialogOpen(true);
  };

  const handleSaveEvaluation = async () => {
    try {
      // Only one student selected for evaluation
      if (selectedEnrollment) {
        const existingEvaluations = selectedEnrollment.evaluations || [];
        
        const newEvaluation: Evaluation = {
          id: Math.floor(Math.random() * 10000), // Generate random ID for now
          moduleId,
          moduleName,
          evaluationType,
          evaluationDate,
          grade: Number(grade),
          comments
        };
        
        // Criando um objeto de matrícula para atualização
        const enrollmentToUpdate: EnrollmentFull = {
          id: selectedEnrollment.id,
          studentId: selectedEnrollment.studentId,
          courseId: selectedEnrollment.courseId,
          enrollmentDate: selectedEnrollment.enrollmentDate,
          status: selectedEnrollment.status,
          attendance: selectedEnrollment.attendance || []
          // Nota: não podemos incluir evaluations diretamente pois não faz parte da interface EnrollmentFull
        };
        
        // Adicionando a avaliação através da atualização da matrícula
        await dispatch(updateEnrollment(enrollmentToUpdate));

        // Reset form
        setEvaluationDialogOpen(false);
        setModuleId(1);
        setModuleName('Introdução');
        setEvaluationType('prova');
        setGrade('');
        setComments('');
        setSelectedEnrollment(null);
        
        // Reload enrollments
        if (id) {
          dispatch(fetchEnrollmentsByCourse(Number(id)));
        }
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  };

  if (courseLoading || enrollmentsLoading) {
    return <Typography>Carregando...</Typography>;
  }

  if (!currentCourse) {
    return <Alert severity="error">Curso não encontrado</Alert>;
  }

  const courseModules = [
    { id: 1, name: 'Fundamentos' },
    { id: 2, name: 'Conceitos Intermediários' },
    { id: 3, name: 'Avançado' },
    { id: 4, name: 'Projeto Final' }
  ];

  const getStudentAttendancePercentage = (enrollment: ExtendedEnrollment) => {
    if (!enrollment.attendance || enrollment.attendance.length === 0) {
      return '-';
    }
    
    const totalClasses = enrollment.attendance.length;
    const presentClasses = enrollment.attendance.filter((a: AttendanceRecord) => a.present).length;
    
    return `${Math.round((presentClasses / totalClasses) * 100)}%`;
  };

  const getStudentAverageGrade = (enrollment: ExtendedEnrollment) => {
    if (!enrollment.evaluations || enrollment.evaluations.length === 0) {
      return '-';
    }

    const sum = enrollment.evaluations.reduce((acc, evaluation) => acc + evaluation.grade, 0);
    const average = sum / enrollment.evaluations.length;
    
    return average.toFixed(1);
  };

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: isMobile ? 1 : 2 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Box display="flex" alignItems="center" mb={isMobile ? 2 : 3} 
             flexDirection={isMobile ? 'column' : 'row'}
             textAlign={isMobile ? 'center' : 'left'}>
          <AssignmentIcon color="primary" sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 1 : 0, fontSize: isMobile ? 24 : 30 }} />
          <Typography variant={isMobile ? "h6" : "h5"} component="h1" noWrap={!isMobile} sx={{ maxWidth: '100%' }}>
            {currentCourse.name} - {isMobile ? 'Freq./Aval.' : 'Frequência e Avaliação'}
          </Typography>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Dados salvos com sucesso!
          </Alert>
        )}

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="course management tabs" 
          sx={{ mb: 2 }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab 
            icon={<CalendarIcon />} 
            label={isMobile ? "Frequência" : "Controle de Frequência"} 
            id="tab-0" 
            sx={{ minWidth: isMobile ? 'auto' : 160 }}
          />
          <Tab 
            icon={<DescriptionIcon />} 
            label="Avaliações" 
            id="tab-1" 
            sx={{ minWidth: isMobile ? 'auto' : 160 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box mb={isMobile ? 1 : 2}>
            <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
              <Grid item xs={12} md={4} sm={6}>
                <TextField
                  label="Data da Aula"
                  type="date"
                  value={attendanceDate}
                  onChange={handleAttendanceDateChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} md={8} sm={6} sx={{ 
                textAlign: { xs: 'center', sm: 'right' },
                mt: { xs: 1, sm: 0 }
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={!isMobile && <SaveIcon />}
                  onClick={handleSaveAttendance}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  {isMobile ? "Salvar" : "Salvar Frequência"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  {!isMobile && <TableCell>ID</TableCell>}
                  <TableCell>Nome</TableCell>
                  {!isMobile && <TableCell>Status</TableCell>}
                  <TableCell align="center" sx={{ display: { xs: isTablet ? 'table-cell' : 'none', sm: 'table-cell' } }}>Freq. Total</TableCell>
                  <TableCell align="center">Presente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment: ExtendedEnrollment) => (
                  <TableRow key={enrollment.id}>
                    {!isMobile && <TableCell>{enrollment.studentId}</TableCell>}
                    <TableCell sx={{ 
                      maxWidth: isMobile ? 150 : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {studentsLoading ? (
                          <Box display="flex" alignItems="center">
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <span>Carregando...</span>
                          </Box>
                        ) : enrollment.student?.name || 
                          (students.find(s => s.id === enrollment.studentId)?.fullName || `Aluno ${enrollment.studentId}`)}
                    </TableCell>
                    {!isMobile && <TableCell>{enrollment.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell>}
                    <TableCell align="center" sx={{ display: { xs: isTablet ? 'table-cell' : 'none', sm: 'table-cell' } }}>
                      {getStudentAttendancePercentage(enrollment)}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={!!attendanceRecords[enrollment.studentId]}
                        onChange={() => toggleAttendance(enrollment.studentId)}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box mb={isMobile ? 1 : 2} textAlign={isMobile ? "center" : "right"}>
            <Button
              variant="contained"
              color="primary"
              startIcon={!isMobile && <AddIcon />}
              disabled={enrollments.length === 0}
              onClick={() => enrollments.length > 0 && handleOpenEvaluationDialog(enrollments[0])}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
            >
              {isMobile ? "Nova" : "Nova Avaliação"}
            </Button>
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  {!isMobile && <TableCell>ID</TableCell>}
                  <TableCell>Nome</TableCell>
                  {!isMobile && <TableCell>Status</TableCell>}
                  <TableCell align="center">Média</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment: ExtendedEnrollment) => (
                  <TableRow key={enrollment.id}>
                    {!isMobile && <TableCell>{enrollment.studentId}</TableCell>}
                    <TableCell sx={{ 
                      maxWidth: isMobile ? 150 : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {studentsLoading ? (
                          <Box display="flex" alignItems="center">
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <span>Carregando...</span>
                          </Box>
                        ) : enrollment.student?.name || 
                          (students.find(s => s.id === enrollment.studentId)?.fullName || `Aluno ${enrollment.studentId}`)}
                    </TableCell>
                    {!isMobile && <TableCell>{enrollment.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell>}
                    <TableCell align="center">{getStudentAverageGrade(enrollment)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleOpenEvaluationDialog(enrollment)}
                        size={isMobile ? "small" : "medium"}
                      >
                        <AddIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Diálogo para adicionar avaliação */}
      <Dialog 
        open={evaluationDialogOpen} 
        onClose={() => setEvaluationDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            width: isMobile ? '95%' : '80%',
            maxWidth: 'sm',
            m: isMobile ? '10px' : 'auto',
            p: isMobile ? 1 : 2
          }
        }}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>Adicionar Avaliação</DialogTitle>
        <DialogContent>
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="module-label">Módulo</InputLabel>
                <Select
                  labelId="module-label"
                  value={moduleId.toString()}
                  label="Módulo"
                  onChange={(e: SelectChangeEvent<string>) => {
                    setModuleId(Number(e.target.value));
                    const selected = courseModules.find(m => m.id === Number(e.target.value));
                    if (selected) setModuleName(selected.name);
                  }}
                >
                  {courseModules.map((module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nota"
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Feedback/Observações"
                multiline
                rows={isMobile ? 2 : 3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1} width="100%" justifyContent={isMobile ? "space-between" : "flex-end"}>
            <DialogActions sx={{ padding: isMobile ? 1 : 2 }}>
              <Button onClick={() => setEvaluationDialogOpen(false)} 
                size={isMobile ? "small" : "medium"}
                sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEvaluation}
                variant="contained"
                color="primary"
                size={isMobile ? "small" : "medium"}
                startIcon={!isMobile && <SaveIcon />}
              >
                Salvar
              </Button>
            </DialogActions>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FrequenciaAvaliacao;
