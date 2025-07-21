import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchCourseById } from '../../store/slices/coursesSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchEnrollmentsByCourse, createEnrollment } from '../../store/slices/enrollmentsSlice';
import { Course, Student, EnrollmentFull } from '../../types';
import moment from 'moment';
import { formatDateToBR } from '../../utils/masks';

const MatricularAlunos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : 0;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Obter dados do Redux store
  const { currentCourse, loading: courseLoading } = useAppSelector(
    (state: RootState) => state.courses
  );
  
  const { students, loading: studentsLoading } = useAppSelector(
    (state: RootState) => state.students
  );
  
  const { enrollments, loading: enrollmentsLoading } = useAppSelector(
    (state: RootState) => state.enrollments
  );

  // Estados locais
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedStudentNames, setSelectedStudentNames] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Carregar dados do curso e estudantes já matriculados
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchEnrollmentsByCourse(courseId));
      dispatch(fetchStudents());
    }
  }, [dispatch, courseId]);

  // Filtra os alunos que ainda não estão matriculados no curso e ordena por nome
  const availableStudents = students
    .filter((student: Student) => 
      !enrollments.some((enrollment: EnrollmentFull) => 
        enrollment.studentId === student.id && enrollment.courseId === courseId
      )
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Função para lidar com a seleção de estudantes pelo nome
  const handleStudentSelection = (_event: React.SyntheticEvent, newValue: Student[]) => {
    setSelectedStudents(newValue);
    // Extrair os nomes dos estudantes selecionados
    const names = newValue.map(student => student.fullName);
    setSelectedStudentNames(names);
  };

  // Função para matricular os alunos selecionados
  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      setErrorMessage('Selecione pelo menos um aluno para matricular');
      return;
    }

    if (!currentCourse) {
      setErrorMessage('Informações do curso não encontradas');
      return;
    }

    // Verificar disponibilidade de vagas
    const currentEnrollments = enrollments.filter((e: EnrollmentFull) => 
      e.courseId === courseId && e.status === 'active'
    ).length;
    
    const availableSpots = currentCourse.availableSpots || (currentCourse.totalSpots - currentEnrollments);
    
    if (selectedStudents.length > availableSpots) {
      setErrorMessage(`Não há vagas suficientes. Disponíveis: ${availableSpots}`);
      return;
    }

    try {
      // Criar matrículas para cada aluno selecionado, usando o nome como identificador principal
      const enrollmentPromises = selectedStudentNames.map((studentName: string) => {
        // Encontrar o objeto do aluno correspondente ao nome
        // Esse é o ponto-chave da mudança: buscar o aluno pelo nome em vez do ID
        const student = students.find(s => s.fullName === studentName);
        
        if (!student) {
          throw new Error(`Aluno não encontrado: ${studentName}`);
        }
        
        const newEnrollment: Omit<EnrollmentFull, 'id'> = {
          // Nessa implementação, ainda precisamos do ID do estudante para o backend, 
          // mas o foco agora é encontrar o aluno pelo nome e só depois obter seu ID
          studentId: student.id,
          courseId: courseId,
          studentName: student.fullName, // O nome do aluno é agora o identificador principal
          enrollmentDate: moment().format('YYYY-MM-DD'),
          status: 'active',
          attendance: [],
          evaluations: []
        };
        
        console.log(`Matriculando aluno ${student.fullName} no curso ${courseId}`);
        return dispatch(createEnrollment(newEnrollment)).unwrap();
      });
      
      await Promise.all(enrollmentPromises);
      
      // Mostrar os nomes dos alunos matriculados na mensagem de sucesso
      const alunosMatriculados = selectedStudentNames.join(', ');
      setSuccessMessage(`${selectedStudentNames.length} aluno(s) matriculado(s) com sucesso: ${alunosMatriculados}`);
      // Limpar seleções
      setSelectedStudents([]);
      setSelectedStudentNames([]);
      setErrorMessage(null);
      
      // Recarregar matrículas
      dispatch(fetchEnrollmentsByCourse(courseId));
    } catch (error) {
      setErrorMessage('Erro ao matricular alunos. Tente novamente.');
      console.error('Erro ao matricular alunos:', error);
    }
  };

  // Usando a função global de formatação de data
  const formatDate = formatDateToBR;

  if (courseLoading || studentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentCourse) {
    return <Alert severity="error">Curso não encontrado</Alert>;
  }

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: isMobile ? 1 : 2 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton color="primary" onClick={() => navigate(`/cursos/${courseId}`)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <SchoolIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h1">
          Matricular Alunos - {currentCourse.name}
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Informações do curso */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Informações do Curso</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography><strong>Nome:</strong> {currentCourse.name}</Typography>
                <Typography><strong>Descrição:</strong> {currentCourse.description}</Typography>
                <Typography><strong>Carga Horária:</strong> {currentCourse.workload} horas</Typography>
                <Typography>
                  <strong>Vagas:</strong> {currentCourse.availableSpots || (currentCourse.totalSpots - (
                    enrollments.filter((e: EnrollmentFull) => 
                      e.courseId === courseId && e.status === 'active'
                    ).length
                  ))}/{currentCourse.totalSpots}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {currentCourse.status === 'active' ? 'Ativo' : 'Inativo'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Formulário de matrícula */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Adicionar Alunos
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="student-select"
                  options={availableStudents}
                  getOptionLabel={(option: Student) => option.fullName}
                  value={selectedStudents}
                  onChange={handleStudentSelection}
                  isOptionEqualToValue={(option, value) => option.fullName === value.fullName}
                  filterOptions={(options, state) => {
                    const inputValue = state.inputValue.toLowerCase().trim();
                    return options.filter(option => 
                      option.fullName.toLowerCase().includes(inputValue)
                    );
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Typography variant="body1" fontWeight="bold">{option.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({option.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')})
                      </Typography>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Selecionar Alunos por Nome"
                      placeholder="Digite o nome do aluno..."
                      fullWidth
                      helperText="A busca é feita pelo nome do aluno"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const tagProps = getTagProps({ index });
                      return (
                        <Chip
                          label={option.fullName}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  disabled={availableStudents.length === 0}
                />
                {availableStudents.length === 0 && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    Não há alunos disponíveis para matrícula neste curso.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleEnrollStudents}
                  disabled={selectedStudents.length === 0}
                  sx={{ mt: 2 }}
                >
                  Matricular Selecionados
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Lista de alunos já matriculados */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alunos Matriculados ({enrollments.filter(e => e.courseId === courseId).length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {enrollmentsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={30} />
              </Box>
            ) : enrollments.filter(e => e.courseId === courseId).length === 0 ? (
              <Alert severity="info">Nenhum aluno matriculado neste curso.</Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50%"><strong>Nome do Aluno</strong></TableCell>
                      <TableCell>Data de Matrícula</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments
                      .filter((e: EnrollmentFull) => e.courseId === courseId)
                      .sort((a, b) => {
                        const nameA = a.studentName || '';
                        const nameB = b.studentName || '';
                        return nameA.localeCompare(nameB);
                      })
                      .map((enrollment: EnrollmentFull) => (
                        <TableRow key={`${enrollment.studentId}-${enrollment.courseId}`}>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {enrollment.studentName || 'Aluno não encontrado'}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={enrollment.status === 'active' ? 'Ativo' : 'Inativo'}
                              color={enrollment.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MatricularAlunos;
