import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  AssignmentTurnedIn as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import moment from 'moment';
import { formatDateToBR } from '../../utils/masks';
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
  evaluations: Evaluation[];
  averageGrade?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id?: string;
}

// Função para converter EnrollmentFull para ExtendedEnrollment
function convertToExtendedEnrollment(enrollment: EnrollmentFull, student?: Student): ExtendedEnrollment {
  // Garantir que enrollment.evaluations seja sempre um array
  const evaluations = Array.isArray(enrollment.evaluations) ? enrollment.evaluations : [];
  
  console.log('Convertendo enrollment para ExtendedEnrollment:', enrollment.id, 'avaliações:', evaluations);
  
  // Calcular média do aluno
  let averageGrade = undefined;
  if (evaluations && evaluations.length > 0) {
    const sum = evaluations.reduce((acc, evaluation) => acc + evaluation.grade, 0);
    averageGrade = sum / evaluations.length;
  }
  
  return {
    ...enrollment,
    student: {
      id: enrollment.studentId,
      name: student ? student.fullName : `Aluno ${enrollment.studentId}` // Usa nome real do aluno ou valor padrão
    },
    evaluations: evaluations,
    averageGrade: averageGrade,
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
  // Definindo interfaces locais para o componente
  interface CourseModule {
    id: number;
    name: string;
    description?: string;
    order?: number;
  }
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      const student = students.find((s: Student) => s.id === enrollment.studentId);
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
  const [savedAttendanceDates, setSavedAttendanceDates] = useState<string[]>([]); 
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

  // Função para coletar todas as datas de frequência existentes
  const collectAttendanceDates = useCallback(() => {
    if (!enrollments || enrollments.length === 0) return;
    
    const datesSet = new Set<string>();
    
    // Percorrer todas as matrículas e coletar datas únicas de frequência
    enrollments.forEach(enrollment => {
      if (enrollment.attendance && enrollment.attendance.length > 0) {
        enrollment.attendance.forEach(record => {
          if (record.date) {
            datesSet.add(record.date);
          }
        });
      }
    });
    
    // Converter para array e ordenar por data (mais recente primeiro)
    const datesArray = Array.from(datesSet).sort((a, b) => {
      return moment(b).diff(moment(a));
    });
    
    console.log('Datas de frequência coletadas:', datesArray);
    setSavedAttendanceDates(datesArray);
  }, [enrollments]);

  // Efeito para carregar o curso e as matrículas - apenas na montagem inicial do componente
  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(Number(id)));
      dispatch(fetchEnrollmentsByCourse(Number(id)))
        .unwrap()
        .then(() => {
          // Só coletar as datas uma vez que as matrículas estejam carregadas
          setTimeout(() => {
            collectAttendanceDates();
          }, 500);
        });
      dispatch(fetchStudents()); // Carregar dados dos alunos
    }
  }, [dispatch, id]);
  
  // Efeito para recarregar os dados quando saveSuccess mudar
  useEffect(() => {
    if (saveSuccess && id) {
      console.log('Avaliação salva com sucesso, recarregando dados...');
      // Recarregar matrículas após salvar com sucesso
      setTimeout(() => {
        dispatch(fetchEnrollmentsByCourse(Number(id)));
        // Resetar o estado de sucesso após recarregar os dados
        setTimeout(() => setSaveSuccess(false), 500);
      }, 500);
    }
  }, [saveSuccess, dispatch, id]);

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
      enrollmentsRaw.forEach((e: EnrollmentFull) => e.studentId && studentIdsSet.add(e.studentId));
      const studentIds = Array.from(studentIdsSet);
      console.log('IDs de estudantes a carregar:', studentIds);
      
      // Para cada ID de estudante, buscar os dados completos
      studentIds.forEach((studentId: number) => {
        console.log('Buscando dados do estudante ID:', studentId);
        dispatch(fetchStudentById(studentId)).unwrap()
          .then((student: Student) => {
            console.log(`Dados do estudante ID ${studentId} carregados:`, student);
          })
          .catch((error: Error) => {
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
    const newDate = e.target.value;
    setAttendanceDate(newDate);
    
    // Carregar os registros de presença existentes para a data selecionada
    const newAttendanceRecords: Record<number, boolean> = {};
    
    // Para cada matrícula, verificar se existe registro para a data selecionada
    enrollments.forEach((enrollment) => {
      const attendanceForDate = enrollment.attendance?.find(
        (record) => record.date === newDate
      );
      
      // Se existir registro para esta data, usar o valor existente
      if (attendanceForDate) {
        newAttendanceRecords[enrollment.studentId] = attendanceForDate.present;
      } else {
        // Se não existir, inicializar como falso (ausente)
        newAttendanceRecords[enrollment.studentId] = false;
      }
    });
    
    console.log('Registros de presença carregados para a data', newDate, newAttendanceRecords);
    setAttendanceRecords(newAttendanceRecords);
  };

  // Função para lidar com a seleção de uma data existente
  const handleSelectDate = (date: string) => {
    setAttendanceDate(date);
    
    // Carregar os registros de presença para a data selecionada
    const newAttendanceRecords: Record<number, boolean> = {};
    
    // Para cada matrícula, verificar se existe registro para a data selecionada
    enrollments.forEach((enrollment) => {
      const attendanceForDate = enrollment.attendance?.find(
        (record) => record.date === date
      );
      
      // Se existir registro para esta data, usar o valor existente
      if (attendanceForDate) {
        newAttendanceRecords[enrollment.studentId] = attendanceForDate.present;
      } else {
        // Se não existir, inicializar como falso (ausente)
        newAttendanceRecords[enrollment.studentId] = false;
      }
    });
    
    console.log(`Registros de presença carregados para ${date}:`, newAttendanceRecords);
    setAttendanceRecords(newAttendanceRecords);
  };
  
  const toggleAttendance = (studentId: number) => {
    setAttendanceRecords((prev: Record<number, boolean>) => ({
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
            attendance: updatedAttendance,
            evaluations: enrollment.evaluations || [] // Adicionando a propriedade evaluations que estava faltando
          };
          
          await dispatch(updateEnrollment(enrollmentToUpdate));
        }
      }
      
      // Mostrar mensagem de sucesso
      setSaveSuccess(true);
      
      // Evitar loop infinito: não recarregar matrículas imediatamente
      // Em vez disso, atualize a lista de datas em um timeout
      setTimeout(() => {
        if (id) {
          dispatch(fetchEnrollmentsByCourse(Number(id)))
            .unwrap()
            .then(() => {
              // Só coletar as datas uma vez que as matrículas estejam carregadas
              collectAttendanceDates();
              setSaveSuccess(false);
            });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao salvar frequencia:', error);
    }
  };

  const handleOpenEvaluationDialog = (enrollment: ExtendedEnrollment) => {
    setSelectedEnrollment(enrollment);
    setEvaluationDialogOpen(true);
    // Resetar campos do formulário para valores padrão
    setModuleId(1);
    setModuleName('Fundamentos');
    setEvaluationType('prova');
    setGrade('');
    setComments('');
    setEvaluationDate(moment().format('YYYY-MM-DD'));
  };

  const handleSaveEvaluation = async () => {
    try {
      // Only one student selected for evaluation
      if (selectedEnrollment) {
        console.log('Enrollment antes de atualizar:', selectedEnrollment);
        
        // Trabalhar com a matrícula selecionada
        const currentEnrollment = enrollments.find(e => e.id === selectedEnrollment.id);
        
        // Se não encontrar a matrícula no estado, usa a selecionada
        const enrollmentToModify = currentEnrollment || selectedEnrollment;
        
        // Garantir que a propriedade evaluations é um array
        const existingEvaluations = Array.isArray(enrollmentToModify.evaluations) 
          ? enrollmentToModify.evaluations 
          : [];
        
        console.log('Avaliações existentes:', existingEvaluations);
        
        const newEvaluation: Evaluation = {
          id: Date.now(), // ID baseado no timestamp atual para garantir unicidade
          moduleId,
          moduleName,
          evaluationType,
          evaluationDate,
          grade: Number(grade),
          comments
        };
        console.log('Nova avaliação:', newEvaluation);
        
        // Adicionar a nova avaliação à lista existente
        const updatedEvaluations = [...existingEvaluations, newEvaluation];
        console.log('Lista atualizada de avaliações:', updatedEvaluations);
        
        // Calcular a nova média
        const sum = updatedEvaluations.reduce((acc, evaluation) => acc + evaluation.grade, 0);
        const averageGrade = sum / updatedEvaluations.length;
        console.log('Média calculada:', averageGrade);
        
        // Criando um objeto de matrícula completo para atualização
        const enrollmentToUpdate: EnrollmentFull = {
          id: enrollmentToModify.id,
          studentId: enrollmentToModify.studentId,
          courseId: enrollmentToModify.courseId,
          enrollmentDate: enrollmentToModify.enrollmentDate,
          status: enrollmentToModify.status,
          attendance: enrollmentToModify.attendance || [],
          evaluations: updatedEvaluations,
          averageGrade: averageGrade,
          studentName: enrollmentToModify.studentName
        };
        
        console.log('Enrollment para atualizar:', enrollmentToUpdate);
        
        try {
          // Adicionando a avaliação através da atualização da matrícula
          const result = await dispatch(updateEnrollment(enrollmentToUpdate));
          console.log('Resultado da atualização:', result);
          
          // Mostrar notificação de sucesso
          setSaveSuccess(true);
          
          // Reset form
          setEvaluationDialogOpen(false);
          setModuleId(1);
          setModuleName('Introdução');
          setEvaluationType('prova');
          setGrade('');
          setComments('');
          setSelectedEnrollment(null);
          
          // Recarregar as matrículas imediatamente
          if (id) {
            dispatch(fetchEnrollmentsByCourse(Number(id)));
          }
        } catch (innerError) {
          console.error('Erro ao salvar avaliação no Redux:', innerError);
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

  const courseModules: CourseModule[] = [
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
    // Se a média já foi calculada e armazenada, usar esse valor
    if (enrollment.averageGrade !== undefined) {
      return enrollment.averageGrade.toFixed(1);
    }
    
    // Caso contrário, calcular na hora
    if (!enrollment.evaluations || enrollment.evaluations.length === 0) {
      return '-';
    }

    const sum = enrollment.evaluations.reduce((acc: number, evaluation: Evaluation) => acc + evaluation.grade, 0);
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
                  type="text"
                  value={formatDateToBR(attendanceDate)}
                  onChange={(e) => {
                    // Aplicar máscara de data brasileira
                    const maskedValue = e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3');
                    if (maskedValue.length === 10) {
                      // Converter para ISO quando tiver formato completo
                      const [day, month, year] = maskedValue.split('/');
                      const isoDate = `${year}-${month}-${day}`;
                      handleAttendanceDateChange({ target: { value: isoDate } } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  helperText="DD/MM/AAAA"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  inputProps={{ maxLength: 10 }}
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
            
            {/* Lista de datas já cadastradas */}
            {savedAttendanceDates.length > 0 && (
              <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={1}>
                <Typography variant="subtitle1" gutterBottom>
                  <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Datas de aula cadastradas:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {savedAttendanceDates.map((date) => {
                    // Separar as props para evitar o warning de key em spread operator
                    const chipProps = {
                      label: formatDateToBR(date),
                      color: date === attendanceDate ? "primary" : "default",
                      onClick: () => handleSelectDate(date),
                      variant: date === attendanceDate ? "filled" : "outlined" as "filled" | "outlined",
                      size: isMobile ? "small" : "medium"
                    } as const;
                    return <Chip key={date} {...chipProps} />;
                  })}
                </Box>
              </Box>
            )}
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
                          (students.find((s: Student) => s.id === enrollment.studentId)?.fullName || `Aluno ${enrollment.studentId}`)}
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
          <Box mb={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate(`/cursos/${id}/matricular-alunos`)}
              sx={{ mr: 2 }}
            >
              Matricular Alunos
            </Button>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate(`/relatorios/desempenho?cursoId=${id}`)}
            >
              Relatório de Desempenho
            </Button>
          </Box>
          <Box mb={isMobile ? 1 : 2} sx={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" component="h2">
              Avaliações dos Alunos
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={!isMobile && <AddIcon />}
              disabled={enrollments.length === 0}
              onClick={() => enrollments.length > 0 && handleOpenEvaluationDialog(enrollments[0])}
              size={isMobile ? "small" : "medium"}
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
                          (students.find((s: Student) => s.id === enrollment.studentId)?.fullName || `Aluno ${enrollment.studentId}`)}
                    </TableCell>
                    {!isMobile && <TableCell>{enrollment.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell>}
                    <TableCell align="center">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={(enrollment.averageGrade || 0) >= 7 ? 'success.main' : 'error.main'}
                      >
                        {getStudentAverageGrade(enrollment)}
                      </Typography>
                    </TableCell>
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
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          {selectedEnrollment && (
            <>Avaliação - {selectedEnrollment.student?.name}</>
          )}
        </DialogTitle>
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
                    const selected = courseModules.find((m: CourseModule) => m.id === Number(e.target.value));
                    if (selected) setModuleName(selected.name);
                  }}
                >
                  {courseModules.map((module: CourseModule) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="evaluation-type-label">Tipo de Avaliação</InputLabel>
                <Select
                  labelId="evaluation-type-label"
                  value={evaluationType}
                  label="Tipo de Avaliação"
                  onChange={(e) => setEvaluationType(e.target.value)}
                >
                  <MenuItem value="prova">Prova</MenuItem>
                  <MenuItem value="trabalho">Trabalho</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="participacao">Participação</MenuItem>
                  <MenuItem value="projeto">Projeto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data da Avaliação"
                type="text"
                value={formatDateToBR(evaluationDate)}
                onChange={(e) => {
                  const maskedValue = e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3');
                  if (maskedValue.length === 10) {
                    const [day, month, year] = maskedValue.split('/');
                    const isoDate = `${year}-${month}-${day}`;
                    setEvaluationDate(isoDate);
                  } else {
                    // Se não for um formato completo, manter a máscara mas não atualizar a data
                    e.target.value = maskedValue;
                  }
                }}
                fullWidth
                helperText="DD/MM/AAAA"
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
                inputProps={{ maxLength: 10 }}
              />
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
                required
                error={grade === ''}
                helperText={grade === '' ? 'A nota é obrigatória' : ''}
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
            <Button 
              onClick={() => setEvaluationDialogOpen(false)} 
              size={isMobile ? "small" : "medium"}
              sx={{ mr: 1 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEvaluation}
              variant="contained"
              color="primary"
              size={isMobile ? "small" : "medium"}
              startIcon={!isMobile && <SaveIcon />}
              disabled={grade === ''}
            >
              Salvar
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FrequenciaAvaliacao;
