import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Grid,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCourseById } from '../../store/slices/coursesSlice';
import { fetchStudentById } from '../../store/slices/studentsSlice';
import { fetchEnrollmentsByCourse } from '../../store/slices/enrollmentsSlice';
import moment from 'moment';

const Certificado: React.FC = () => {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { currentCourse, loading: courseLoading } = useAppSelector(state => state.courses);
  const { enrollments, loading: enrollmentsLoading } = useAppSelector(state => state.enrollments);
  const { currentStudent, loading: studentLoading } = useAppSelector(state => state.students);

  const [isEligible, setIsEligible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attendance, setAttendance] = useState(0);
  const [grade, setGrade] = useState(0);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(Number(courseId)));
      dispatch(fetchEnrollmentsByCourse(Number(courseId)));
    }
    
    if (studentId) {
      dispatch(fetchStudentById(Number(studentId)));
    }
  }, [dispatch, courseId, studentId]);

  useEffect(() => {
    if (!courseLoading && !enrollmentsLoading && !studentLoading && currentCourse && currentStudent && enrollments.length > 0) {
      // Find enrollment for this student
      const enrollment = enrollments.find(e => e.studentId === Number(studentId));
      
      if (!enrollment) {
        setErrorMessage('Este aluno não está matriculado neste curso.');
        return;
      }

      // Calculate attendance
      let attendancePercentage = 0;
      if (enrollment.attendance && enrollment.attendance.length > 0) {
        const totalClasses = enrollment.attendance.length;
        const presentClasses = enrollment.attendance.filter(a => a.present).length;
        attendancePercentage = (presentClasses / totalClasses) * 100;
        setAttendance(attendancePercentage);
      } else {
        setErrorMessage('Não há registros de frequência para este aluno.');
        return;
      }

      // Calculate grade
      let averageGrade = 0;
      if (enrollment.evaluations && enrollment.evaluations.length > 0) {
        const totalGrade = enrollment.evaluations.reduce((sum, evaluation) => sum + evaluation.grade, 0);
        averageGrade = totalGrade / enrollment.evaluations.length;
        setGrade(averageGrade);
      } else {
        setErrorMessage('Não há registros de avaliações para este aluno.');
        return;
      }

      // Check eligibility (minimum 75% attendance and grade >= 7)
      if (attendancePercentage >= 75 && averageGrade >= 7) {
        setIsEligible(true);
      } else {
        setErrorMessage(
          `O aluno não atende aos requisitos para certificação. ` +
          `Frequência: ${attendancePercentage.toFixed(1)}% (mínimo 75%), ` +
          `Média: ${averageGrade.toFixed(1)} (mínimo 7.0)`
        );
      }
    }
  }, [courseLoading, enrollmentsLoading, studentLoading, currentCourse, currentStudent, enrollments, studentId]);

  const handlePrint = () => {
    const content = certificateRef.current;
    if (content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Certificado - ${currentCourse?.name}</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 20px;
                }
                .certificate {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 30px;
                  border: 15px solid #0d47a1;
                  position: relative;
                  page-break-inside: avoid;
                }
                .certificate::before {
                  content: '';
                  position: absolute;
                  top: 5px;
                  left: 5px;
                  right: 5px;
                  bottom: 5px;
                  border: 2px solid #0d47a1;
                  z-index: -1;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .title {
                  font-size: 32px;
                  font-weight: bold;
                  color: #0d47a1;
                  margin-bottom: 10px;
                }
                .content {
                  font-size: 18px;
                  line-height: 1.5;
                  text-align: center;
                }
                .student-name {
                  font-size: 28px;
                  font-weight: bold;
                  color: #0d47a1;
                  margin: 20px 0;
                }
                .course-name {
                  font-size: 24px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .details {
                  margin: 30px 0;
                  font-size: 16px;
                }
                .signature {
                  margin-top: 60px;
                  display: flex;
                  justify-content: space-around;
                }
                .signature-line {
                  width: 200px;
                  border-top: 1px solid #000;
                  margin-top: 10px;
                  padding-top: 5px;
                  text-align: center;
                  font-size: 14px;
                }
                .footer {
                  margin-top: 40px;
                  text-align: center;
                  font-size: 12px;
                }
                .qr-code {
                  text-align: center;
                  margin-top: 20px;
                }
                .certificate-id {
                  margin-top: 10px;
                  font-size: 12px;
                  text-align: center;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .certificate {
                    border: 15px solid #0d47a1 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  if (courseLoading || enrollmentsLoading || studentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentCourse || !currentStudent) {
    return (
      <Box maxWidth="lg" sx={{ mx: 'auto', p: 2 }}>
        <Alert severity="error">
          Curso ou aluno não encontrado.
        </Alert>
        <Box mt={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/cursos/${courseId}`)}
          >
            Voltar ao Curso
          </Button>
        </Box>
      </Box>
    );
  }

  const certificateId = `CERT-${courseId}-${studentId}-${Date.now().toString().substring(7)}`;
  const today = moment().format('DD/MM/YYYY');

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: 2 }}>
      {!isEligible ? (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/cursos/${courseId}`)}
          >
            Voltar ao Curso
          </Button>
        </Box>
      ) : (
        <>
          <Box mb={2} className="no-print" display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/cursos/${courseId}`)}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir Certificado
            </Button>
          </Box>

          <Paper 
            elevation={3} 
            sx={{ p: 4, maxWidth: '800px', mx: 'auto', mb: 4 }}
            ref={certificateRef}
          >
            <Box className="certificate">
              <Box className="header">
                <Typography variant="h4" className="title">CERTIFICADO</Typography>
                <Typography variant="subtitle1">DE CONCLUSÃO DE CURSO</Typography>
              </Box>

              <Box className="content">
                <Typography>
                  Certificamos que
                </Typography>
                
                <Typography variant="h5" className="student-name">
                  {currentStudent.fullName}
                </Typography>
                
                <Typography>
                  concluiu com êxito o curso
                </Typography>
                
                <Typography variant="h6" className="course-name">
                  {currentCourse.name}
                </Typography>
                
                <Box className="details">
                  <Typography>
                    com carga horária de {currentCourse.workload} horas,
                    obtendo aproveitamento de {grade.toFixed(1)} pontos
                    e frequência de {attendance.toFixed(1)}%.
                  </Typography>
                </Box>

                <Box mt={2}>
                  <Typography>
                    {today}
                  </Typography>
                </Box>

                <Box className="signature">
                  <Box>
                    <Box className="signature-line">
                      <Typography>Coordenador do Curso</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box className="signature-line">
                      <Typography>Diretor da Instituição</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="footer">
                  <Typography variant="body2">
                    Este certificado está em conformidade com a legislação vigente e possui validade em todo o território nacional.
                  </Typography>
                </Box>

                <Box className="certificate-id">
                  <Typography variant="caption">
                    Certificado Nº: {certificateId}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Certificado;
