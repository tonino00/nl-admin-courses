import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as ExamIcon,
  Group as MeetingIcon,
  Celebration as HolidayIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  NotificationsActive as NotificationIcon,
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/pt-br';
import { CalendarEvent, CalendarEventType } from '../../types/calendar';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSelectedEvent, removeCalendarEvent } from '../../store/slices/calendarSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { RootState } from '../../store';

// Mapeamento de ícones por tipo de evento
const eventTypeIcons: Record<CalendarEventType, JSX.Element> = {
  class: <SchoolIcon />,
  exam: <ExamIcon />,
  assignment: <AssignmentIcon />,
  meeting: <MeetingIcon />,
  holiday: <HolidayIcon />,
  other: <EventIcon />,
};

// Tradução dos tipos de evento
const eventTypeLabels: Record<CalendarEventType, string> = {
  class: 'Aula',
  exam: 'Prova',
  assignment: 'Trabalho',
  meeting: 'Reunião',
  holiday: 'Feriado',
  other: 'Outro',
};

interface Props {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
}

const CalendarEventDetails: React.FC<Props> = ({ event, onClose, onEdit }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { courses } = useAppSelector((state: RootState) => state.courses);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { students } = useAppSelector((state: RootState) => state.students);
  
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Encontrar curso, professor e alunos relacionados
  const relatedCourse = event.courseId 
    ? courses.find(course => Number(course.id) === event.courseId)
    : undefined;
    
  const relatedTeacher = event.teacherId
    ? teachers.find(teacher => Number(teacher.id) === event.teacherId)
    : undefined;
    
  const relatedStudents = event.studentIds
    ? students.filter(student => event.studentIds?.includes(Number(student.id)))
    : [];

  // Formato de data/hora para exibição
  const formatDateTime = (date: Date, allDay = false) => {
    return allDay
      ? moment(date).format('dddd, D [de] MMMM [de] YYYY')
      : moment(date).format('dddd, D [de] MMMM [de] YYYY, HH:mm[h]');
  };

  // Handler para excluir evento
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    dispatch(removeCalendarEvent(event.id));
    onClose();
  };

  // Handler para adicionar lembrete
  const handleAddReminder = () => {
    const now = new Date();
    const eventDate = new Date(event.start);
    const timeUntilEvent = eventDate.getTime() - now.getTime();
    
    // Só adiciona lembrete se o evento for no futuro
    if (timeUntilEvent > 0) {
      dispatch(addNotification({
        id: `event-${event.id}-reminder`,
        type: 'reminder',
        title: `Lembrete: ${event.title}`,
        message: `O evento "${event.title}" começará em ${moment(event.start).fromNow(true)}`,
        read: false,
        createdAt: new Date().toISOString(),
        userType: 'all',
        link: '/calendario',
        targetId: Number(event.id)
      }));
      
      alert('Lembrete adicionado com sucesso!');
    } else {
      alert('Não é possível adicionar lembretes para eventos que já ocorreram.');
    }
  };

  return (
    <>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: event.color || theme.palette.primary.main,
        color: theme.palette.getContrastText(event.color || theme.palette.primary.main)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {eventTypeIcons[event.type]}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {event.title}
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimeIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {event.allDay ? (
                  <>
                    <strong>Dia inteiro:</strong> {formatDateTime(event.start, true)}
                  </>
                ) : (
                  <>
                    <strong>Início:</strong> {formatDateTime(event.start)}<br />
                    <strong>Término:</strong> {formatDateTime(event.end)}
                  </>
                )}
              </Typography>
            </Box>
            
            <Chip 
              icon={eventTypeIcons[event.type]} 
              label={eventTypeLabels[event.type]} 
              sx={{ 
                bgcolor: event.color || theme.palette.primary.main, 
                color: theme.palette.getContrastText(event.color || theme.palette.primary.main),
                mt: 1
              }} 
            />
          </Grid>
          
          {event.location && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Local:</strong> {event.location}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {relatedCourse && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Curso:</strong> {relatedCourse.name}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {relatedTeacher && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Professor:</strong> {relatedTeacher.fullName}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {event.description && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <DescriptionIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                <Typography variant="body1">
                  <strong>Descrição:</strong><br />
                  {event.description}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {relatedStudents.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <PeopleIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Alunos participantes:</strong> ({relatedStudents.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {relatedStudents.slice(0, 5).map(student => (
                      <Chip 
                        key={student.id}
                        label={student.fullName}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {relatedStudents.length > 5 && (
                      <Chip 
                        label={`+${relatedStudents.length - 5}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Criado em: {moment(event.createdAt).format('DD/MM/YYYY')}
                {event.updatedAt && (
                  <> • Última atualização: {moment(event.updatedAt).format('DD/MM/YYYY')}</>
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          variant={confirmDelete ? 'contained' : 'text'}
        >
          {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
        </Button>
        
        <Box>
          <Button
            startIcon={<NotificationIcon />}
            onClick={handleAddReminder}
            sx={{ mr: 1 }}
          >
            Lembrete
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Editar
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default CalendarEventDetails;
