import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Tabs, Tab, Card, CardContent, CardHeader, 
  Divider, Grid, Paper, List, ListItem, ListItemText, IconButton, 
  Table, TableHead, TableRow, TableCell, TableContainer, TableBody, 
  Chip, Button, Alert, Avatar, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { WorkspacePremium as CertificateIcon } from '@mui/icons-material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { CheckCircle as ActiveIcon } from '@mui/icons-material';
import { Cancel as InactiveIcon } from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchStudentById } from '../../store/slices/studentsSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { fetchEnrollmentsByStudent } from '../../store/slices/enrollmentsSlice';
import { Student, Course, EnrollmentFull } from '../../types';

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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `student-tab-${index}`,
    'aria-controls': `student-tabpanel-${index}`,
  };
}

const DetalhesAluno: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentStudent, loading: studentLoading } = useSelector(
    (state: RootState) => state.students
  );
  const { courses, loading: coursesLoading } = useSelector(
    (state: RootState) => state.courses
  );
  const { enrollments, loading: enrollmentsLoading } = useSelector(
    (state: RootState) => state.enrollments
  );
  
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchStudentById(Number(id)) as any);
      dispatch(fetchCourses() as any);
      dispatch(fetchEnrollmentsByStudent(Number(id)) as any);
    }
  }, [dispatch, id]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEdit = () => {
    if (id) {
      navigate(`/alunos/editar/${id}`);
    }
  };
  
  const handleBack = () => {
    navigate('/alunos');
  };
  
  const loading = studentLoading || coursesLoading || enrollmentsLoading;
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentStudent) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Aluno não encontrado
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
  
  // Find student's enrollments
  const studentEnrollments = enrollments.filter((enrollment) => enrollment.studentId === Number(id));
  const activeEnrollments = studentEnrollments.filter((enrollment) => enrollment.status === 'active');
  const courseIds = activeEnrollments.map((enrollment) => enrollment.courseId);
  
  // Obter todos os cursos em que o aluno está ou esteve matriculado (para certificados)
  const enrolledCourses = courses.filter(course => 
    studentEnrollments.some(enrollment => enrollment.courseId === course.id)
  );
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton color="primary" onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" flex={1}>
          Detalhes do Aluno
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
              }}
            >
              {currentStudent.fullName.charAt(0)}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {currentStudent.fullName}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                icon={currentStudent.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                label={currentStudent.status === 'active' ? 'Ativo' : 'Inativo'}
                color={currentStudent.status === 'active' ? 'success' : 'error'}
                sx={{ mr: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                ID: {currentStudent.id}
              </Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>CPF</TableCell>
                    <TableCell>RG</TableCell>
                    <TableCell>Nome da Mãe</TableCell>
                    <TableCell>Data de Nascimento</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{currentStudent.cpf}</TableCell>
                    <TableCell>{currentStudent.rg}</TableCell>
                    <TableCell>{currentStudent.mothersName}</TableCell>
                    <TableCell>{new Date(currentStudent.birthDate).toLocaleDateString()}</TableCell>
                    <TableCell>{currentStudent.phone}</TableCell>
                    <TableCell>{currentStudent.email}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Abas para organizar informações detalhadas */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="student details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Informações Pessoais"
              {...a11yProps(0)}
            />
            <Tab
              label="Cursos Matriculados"
              icon={<SchoolIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Notas"
              icon={<AssignmentIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="Certificados"
              icon={<CertificateIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
            <Tab
              label="Emissão de Certificados"
              icon={<PdfIcon />}
              iconPosition="start"
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>
        
        {/* Tab de Informações Pessoais */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
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
                        <TableCell>{currentStudent.address.street}</TableCell>
                        <TableCell>{currentStudent.address.number}</TableCell>
                        <TableCell>{currentStudent.address.complement || '-'}</TableCell>
                        <TableCell>{currentStudent.address.district}</TableCell>
                        <TableCell>{currentStudent.address.city}</TableCell>
                        <TableCell>{currentStudent.address.state}</TableCell>
                        <TableCell>{currentStudent.address.zipCode}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Documentos" />
                <Divider />
                <CardContent>
                  {currentStudent.documents && currentStudent.documents.length > 0 ? (
                    <Grid container spacing={2}>
                      {currentStudent.documents.map((doc) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={doc.id}>
                          <Box
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            {doc.type === 'photo' ? (
                              <img
                                src={doc.url}
                                alt="Documento"
                                style={{
                                  width: '100%',
                                  height: 150,
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: 150,
                                  bgcolor: 'grey.100',
                                }}
                              >
                                <PdfIcon fontSize="large" color="primary" />
                              </Box>
                            )}
                            <Box sx={{ p: 1 }}>
                              <Typography variant="body2" noWrap>
                                {doc.type}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>Nenhum documento cadastrado.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Tab de Cursos Matriculados */}
        <TabPanel value={tabValue} index={1}>
          {studentEnrollments.length > 0 ? (
            <Grid container spacing={3}>
              {enrolledCourses.map((course) => {
                const enrollment = studentEnrollments.find(
                  (e) => e.courseId === course.id
                );
                return (
                  <Grid item xs={12} md={6} key={course.id}>
                    <Card>
                      <CardHeader
                        title={course.name}
                        subheader={`Matrícula: ${enrollment ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}`}
                        action={
                          <Chip
                            label={enrollment?.status === 'active' ? 'Cursando' : enrollment?.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            color={
                              enrollment?.status === 'active'
                                ? 'primary'
                                : enrollment?.status === 'completed'
                                ? 'success'
                                : 'error'
                            }
                            size="small"
                          />
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Descrição
                            </Typography>
                            <Typography variant="body1">
                              {course.description}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Carga Horária
                            </Typography>
                            <Typography variant="body1">
                              {course.workload} horas
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Status do Curso
                            </Typography>
                            <Typography variant="body1">
                              {course.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Typography>
                          </Grid>
                          
                          {enrollment && enrollment.attendance && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Frequência
                              </Typography>
                              <Box>
                                {enrollment.attendance.length > 0 ? (
                                  <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Data</TableCell>
                                          <TableCell align="right">Presença</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {enrollment.attendance.map((record, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              {new Date(record.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                              <Chip
                                                size="small"
                                                label={record.present ? 'Presente' : 'Ausente'}
                                                color={record.present ? 'success' : 'error'}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Typography>
                                    Nenhum registro de frequência.
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>
              Este aluno não está matriculado em nenhum curso.
            </Typography>
          )}
        </TabPanel>
        
        {/* Tab de Notas */}
        <TabPanel value={tabValue} index={2}>
          {currentStudent.grades && currentStudent.grades.length > 0 ? (
            <Grid container spacing={3}>
              {currentStudent.grades.map((courseGrade) => {
                const course = courses.find((c) => c.id === courseGrade.courseId);
                return (
                  <Grid item xs={12} key={courseGrade.courseId}>
                    <Card>
                      <CardHeader
                        title={course ? course.name : `Curso ID ${courseGrade.courseId}`}
                      />
                      <Divider />
                      <CardContent>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Módulo</TableCell>
                                <TableCell align="right">Nota</TableCell>
                                <TableCell align="right">Situação</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {courseGrade.grades.map((grade, index) => (
                                <TableRow key={index}>
                                  <TableCell>{grade.module}</TableCell>
                                  <TableCell align="right">{grade.grade}</TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      size="small"
                                      label={grade.grade >= 60 ? 'Aprovado' : 'Reprovado'}
                                      color={grade.grade >= 60 ? 'success' : 'error'}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        <Box mt={2}>
                          <Typography variant="subtitle1">
                            Média: {
                              (courseGrade.grades.reduce((sum, grade) => sum + grade.grade, 0) / courseGrade.grades.length).toFixed(1)
                            }
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>
              Este aluno não possui notas registradas.
            </Typography>
          )}
        </TabPanel>
        
        {/* Tab de Certificados */}
        <TabPanel value={tabValue} index={3}>
          {currentStudent.certificates && currentStudent.certificates.length > 0 ? (
            <Grid container spacing={3}>
              {currentStudent.certificates.map((certificate) => {
                const course = courses.find((c) => c.id === certificate.courseId);
                return (
                  <Grid item xs={12} sm={6} md={4} key={certificate.id}>
                    <Card>
                      <CardHeader
                        title={course ? course.name : `Curso ID ${certificate.courseId}`}
                        subheader={`Emitido em: ${new Date(certificate.issueDate).toLocaleDateString()}`}
                        action={
                          <IconButton color="primary" size="small">
                            <PdfIcon />
                          </IconButton>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Box
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                            textAlign: 'center',
                          }}
                        >
                          <CertificateIcon
                            color="primary"
                            sx={{ fontSize: 60, mb: 1 }}
                          />
                          <Typography variant="body1">
                            Certificado de Conclusão
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course ? course.description : 'Descrição não disponível'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>
              Este aluno não possui certificados emitidos.
            </Typography>
          )}
        </TabPanel>

        {/* Tab de Emissão de Certificados */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardHeader title="Emissão de Novos Certificados" />
            <Divider />
            <CardContent>
              {enrolledCourses.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Selecione o curso para emitir o certificado:
                  </Typography>
                  <Grid container spacing={3}>
                    {enrolledCourses.map((course) => {
                      const enrollment = studentEnrollments.find((e) => e.courseId === course.id);
                      const alreadyHasCertificate = currentStudent.certificates?.some(cert => cert.courseId === course.id);
                      const canEmitCertificate = enrollment?.status === 'completed';
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={`emit-cert-${course.id}`}>
                          <Card variant="outlined" sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            opacity: canEmitCertificate ? 1 : 0.7
                          }}>
                            <CardHeader
                              title={course.name}
                              subheader={`Status: ${enrollment ? (
                                enrollment.status === 'active' ? 'Cursando' : 
                                enrollment.status === 'completed' ? 'Concluído' : 'Cancelado'
                              ) : 'Não matriculado'}`}
                            />
                            <Divider />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}
                              </Typography>
                              
                              {/* Status do certificado */}
                              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                {alreadyHasCertificate ? (
                                  <Chip 
                                    icon={<CheckCircleIcon />} 
                                    label="Certificado já emitido" 
                                    color="success" 
                                    variant="outlined" 
                                  />
                                ) : canEmitCertificate ? (
                                  <Chip 
                                    icon={<CheckCircleIcon />} 
                                    label="Elegível para certificado" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                ) : (
                                  <Chip 
                                    icon={<CancelIcon />} 
                                    label="Curso não concluído" 
                                    color="error" 
                                    variant="outlined" 
                                  />
                                )}
                              </Box>
                            </CardContent>
                            <Divider />
                            <Box sx={{ p: 2 }}>
                              <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                startIcon={<PdfIcon />}
                                disabled={!canEmitCertificate || alreadyHasCertificate}
                                onClick={() => {
                                  // Lógica para emitir certificado aqui
                                  alert(`Certificado para o curso ${course.name} será emitido`)
                                }}
                              >
                                {alreadyHasCertificate ? 'Certificado Emitido' : 'Emitir Certificado'}
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : (
                <Alert severity="info">
                  Este aluno não está matriculado em nenhum curso. A emissão de certificados só é possível para cursos concluídos.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DetalhesAluno;
