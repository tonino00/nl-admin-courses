import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { fetchEnrollments } from '../../store/slices/enrollmentsSlice';
import { fetchTeachers } from '../../store/slices/teachersSlice';
import moment from 'moment';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RelatorioDesempenho: React.FC = () => {
  const dispatch = useAppDispatch();
  const { students, loading: loadingStudents } = useAppSelector(state => state.students);
  const { courses, loading: loadingCourses } = useAppSelector(state => state.courses);
  const { enrollments, loading: loadingEnrollments } = useAppSelector(state => state.enrollments);
  const { teachers } = useAppSelector(state => state.teachers);

  const [filterType, setFilterType] = useState<'curso' | 'aluno' | 'geral'>('geral');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dispatch(fetchStudents()),
      dispatch(fetchCourses()),
      dispatch(fetchEnrollments()),
      dispatch(fetchTeachers())
    ]).then(() => setLoading(false));
  }, [dispatch]);

  const handleFilterTypeChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value as 'curso' | 'aluno' | 'geral');
    setSelectedCourseId('');
    setSelectedStudentId('');
  };

  const handleCourseChange = (event: SelectChangeEvent) => {
    setSelectedCourseId(Number(event.target.value));
  };

  const handleStudentChange = (event: SelectChangeEvent) => {
    setSelectedStudentId(Number(event.target.value));
  };

  const calculateAttendanceRate = (enrollment: any) => {
    if (!enrollment.attendance || enrollment.attendance.length === 0) return 0;
    const presentCount = enrollment.attendance.filter((a: any) => a.present).length;
    return (presentCount / enrollment.attendance.length) * 100;
  };

  const calculateAverageGrade = (enrollment: any) => {
    if (!enrollment.evaluations || enrollment.evaluations.length === 0) return 0;
    const total = enrollment.evaluations.reduce((sum: number, e: any) => sum + e.grade, 0);
    return total / enrollment.evaluations.length;
  };

  // Dados para os gráficos
  const generateCoursePerformanceData = () => {
    if (!courses || !enrollments) return [];

    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      let totalAttendance = 0;
      let totalGrade = 0;
      let count = 0;

      courseEnrollments.forEach(enrollment => {
        const attendance = calculateAttendanceRate(enrollment);
        const grade = calculateAverageGrade(enrollment);
        if (attendance > 0) {
          totalAttendance += attendance;
          count++;
        }
        if (grade > 0) {
          totalGrade += grade;
          count++;
        }
      });

      return {
        name: course.name,
        frequencia: count > 0 ? (totalAttendance / count).toFixed(1) : 0,
        nota: count > 0 ? (totalGrade / count).toFixed(1) : 0,
        alunos: courseEnrollments.length
      };
    });
  };

  const generateStudentPerformanceData = () => {
    if (!students || !enrollments) return [];

    return students.map(student => {
      const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
      let totalAttendance = 0;
      let totalGrade = 0;
      let count = 0;

      studentEnrollments.forEach(enrollment => {
        const attendance = calculateAttendanceRate(enrollment);
        const grade = calculateAverageGrade(enrollment);
        if (attendance > 0) {
          totalAttendance += attendance;
          count++;
        }
        if (grade > 0) {
          totalGrade += grade;
          count++;
        }
      });

      return {
        name: student.fullName,
        frequencia: count > 0 ? (totalAttendance / count).toFixed(1) : 0,
        nota: count > 0 ? (totalGrade / count).toFixed(1) : 0,
        cursos: studentEnrollments.length
      };
    });
  };

  const generateCourseDistributionData = () => {
    if (!courses || !enrollments) return [];

    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      return {
        name: course.name,
        value: courseEnrollments.length
      };
    });
  };

  const getSpecificCourseData = (courseId: number) => {
    if (!courseId || !enrollments) return [];

    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    return courseEnrollments.map(enrollment => {
      const student = students.find(s => s.id === enrollment.studentId);
      return {
        id: student?.id || enrollment.studentId,
        nome: student?.fullName || `Aluno ${enrollment.studentId}`,
        frequencia: calculateAttendanceRate(enrollment).toFixed(1),
        nota: calculateAverageGrade(enrollment).toFixed(1),
        status: enrollment.status
      };
    });
  };

  const getSpecificStudentData = (studentId: number) => {
    if (!studentId || !enrollments) return [];

    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return studentEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return {
        id: course?.id || enrollment.courseId,
        nome: course?.name || `Curso ${enrollment.courseId}`,
        frequencia: calculateAttendanceRate(enrollment).toFixed(1),
        nota: calculateAverageGrade(enrollment).toFixed(1),
        status: enrollment.status
      };
    });
  };

  const handleExportPDF = () => {
    alert('Funcionalidade para exportar PDF será implementada em breve.');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || loadingStudents || loadingCourses || loadingEnrollments) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="no-print-margin" maxWidth="lg" sx={{ mx: 'auto', p: 2 }}>
      <Box className="print-hidden" mb={3} display="flex" alignItems="center">
        <AssessmentIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4">Relatório de Desempenho</Typography>
      </Box>

      <Paper className="print-hidden" elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Relatório</InputLabel>
              <Select
                value={filterType}
                label="Tipo de Relatório"
                onChange={handleFilterTypeChange}
              >
                <MenuItem value="geral">Geral</MenuItem>
                <MenuItem value="curso">Por Curso</MenuItem>
                <MenuItem value="aluno">Por Aluno</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {filterType === 'curso' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Curso</InputLabel>
                <Select
                  value={selectedCourseId.toString()}
                  label="Curso"
                  onChange={handleCourseChange}
                >
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {filterType === 'aluno' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Aluno</InputLabel>
                <Select
                  value={selectedStudentId.toString()}
                  label="Aluno"
                  onChange={handleStudentChange}
                >
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={4} textAlign="right">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{ mr: 1 }}
            >
              Exportar PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Relatório Geral */}
      {filterType === 'geral' && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  <BookIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Desempenho por Curso
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={generateCoursePerformanceData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Frequência (%)" dataKey="frequencia" fill="#8884d8" />
                    <Bar name="Nota Média" dataKey="nota" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  <GroupIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Distribuição de Matrículas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generateCourseDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {generateCourseDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alunos`, 'Matrículas']} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <BookIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Resumo dos Cursos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Curso</TableCell>
                    <TableCell align="center">Alunos</TableCell>
                    <TableCell align="center">Frequência Média</TableCell>
                    <TableCell align="center">Nota Média</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generateCoursePerformanceData().map((course: any) => (
                    <TableRow key={course.name}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell align="center">{course.alunos}</TableCell>
                      <TableCell align="center">{course.frequencia}%</TableCell>
                      <TableCell align="center">{course.nota}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={Number(course.alunos) > 0 ? "Ativo" : "Inativo"} 
                          color={Number(course.alunos) > 0 ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Relatório por Curso */}
      {filterType === 'curso' && selectedCourseId && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box mb={2}>
            <Typography variant="h6">
              {courses.find(c => c.id === selectedCourseId)?.name || 'Curso Selecionado'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Professor: {
                (() => {
                  const course = courses.find(c => c.id === selectedCourseId);
                  if (!course) return 'N/A';
                  const teacher = teachers.find(t => t.id === course.teacherId);
                  return teacher ? teacher.fullName : 'N/A';
                })()
              }
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Aluno</TableCell>
                  <TableCell align="center">Frequência</TableCell>
                  <TableCell align="center">Nota</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSpecificCourseData(Number(selectedCourseId)).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell align="center">{row.frequencia}%</TableCell>
                    <TableCell align="center">{row.nota}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small"
                        label={row.status === 'active' ? "Ativo" : "Inativo"} 
                        color={row.status === 'active' ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {getSpecificCourseData(Number(selectedCourseId)).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Não há alunos matriculados neste curso.
            </Alert>
          )}
        </Paper>
      )}

      {/* Relatório por Aluno */}
      {filterType === 'aluno' && selectedStudentId && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box mb={2}>
            <Typography variant="h6">
              {students.find(s => s.id === selectedStudentId)?.fullName || 'Aluno Selecionado'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Matrícula: {selectedStudentId}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Curso</TableCell>
                  <TableCell align="center">Frequência</TableCell>
                  <TableCell align="center">Nota</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSpecificStudentData(Number(selectedStudentId)).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell align="center">{row.frequencia}%</TableCell>
                    <TableCell align="center">{row.nota}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small"
                        label={row.status === 'active' ? "Ativo" : "Inativo"} 
                        color={row.status === 'active' ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {getSpecificStudentData(Number(selectedStudentId)).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Este aluno não está matriculado em nenhum curso.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default RelatorioDesempenho;
