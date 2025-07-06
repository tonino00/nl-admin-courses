import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Group as StudentIcon,
  School as TeacherIcon,
  MenuBook as CourseIcon,
  AssignmentTurnedIn as EnrollmentIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchTeachers } from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { fetchEnrollments } from '../../store/slices/enrollmentsSlice';
import { Student, Teacher, Course, EnrollmentFull } from '../../types';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading } = useSelector((state: RootState) => state.students);
  const { teachers, loading: teachersLoading } = useSelector((state: RootState) => state.teachers);
  const { courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses);
  const { enrollments, loading: enrollmentsLoading } = useSelector((state: RootState) => state.enrollments);
  
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchCourses());
    dispatch(fetchEnrollments());
  }, [dispatch]);
  
  const loading = studentsLoading || teachersLoading || coursesLoading || enrollmentsLoading;

  // Calculate active students and courses
  const activeStudents = students.filter(student => student.status === 'active');
  const activeCourses = courses.filter(course => course.status === 'active');
  
  // Get recent enrollments (last 5)
  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
    .slice(0, 5);

  // Get courses with low availability (less than 30% spots left)
  const lowAvailabilityCourses = courses
    .filter(course => (course.availableSpots / course.totalSpots) < 0.3)
    .slice(0, 5);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 120,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <Box display="flex" alignItems="center">
                  <StudentIcon sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{activeStudents.length}</Typography>
                    <Typography variant="subtitle2">Alunos Ativos</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 120,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                }}
              >
                <Box display="flex" alignItems="center">
                  <TeacherIcon sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{teachers.length}</Typography>
                    <Typography variant="subtitle2">Professores</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 120,
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                }}
              >
                <Box display="flex" alignItems="center">
                  <CourseIcon sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{activeCourses.length}</Typography>
                    <Typography variant="subtitle2">Cursos Ativos</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 120,
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                }}
              >
                <Box display="flex" alignItems="center">
                  <EnrollmentIcon sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{enrollments.length}</Typography>
                    <Typography variant="subtitle2">Matrículas</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Dashboard Content */}
          <Grid container spacing={3}>
            {/* Recent Enrollments */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Matrículas Recentes" />
                <Divider />
                <CardContent>
                  <List>
                    {recentEnrollments.length > 0 ? (
                      recentEnrollments.map((enrollment) => {
                        const student = students.find(s => s.id === enrollment.studentId);
                        const course = courses.find(c => c.id === enrollment.courseId);
                        
                        return (
                          <React.Fragment key={enrollment.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar alt={student?.fullName}>
                                  {student?.fullName.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={student?.fullName}
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {course?.name}
                                    </Typography>
                                    {` - Matrícula em ${new Date(enrollment.enrollmentDate).toLocaleDateString()}`}
                                  </>
                                }
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <ListItem>
                        <ListItemText primary="Nenhuma matrícula recente encontrada" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Courses with Low Availability */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Cursos com Poucas Vagas" />
                <Divider />
                <CardContent>
                  <List>
                    {lowAvailabilityCourses.length > 0 ? (
                      lowAvailabilityCourses.map((course) => {
                        const availabilityPercentage = (course.availableSpots / course.totalSpots) * 100;
                        const teacher = teachers.find(t => t.id === course.teacherId);
                        
                        return (
                          <React.Fragment key={course.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                  <CourseIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={course.name}
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {`${course.availableSpots} de ${course.totalSpots} vagas disponíveis (${availabilityPercentage.toFixed(0)}%)`}
                                    </Typography>
                                    <br />
                                    {`Professor: ${teacher?.fullName || 'Não atribuído'}`}
                                  </>
                                }
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <ListItem>
                        <ListItemText primary="Todos os cursos têm vagas suficientes" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
