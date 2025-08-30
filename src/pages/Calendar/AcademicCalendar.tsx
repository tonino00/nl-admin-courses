import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Dialog,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';

import {
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as ExamIcon,
  Group as MeetingIcon,
  Celebration as HolidayIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  ViewAgenda as ViewAgendaIcon,
  CalendarMonth as CalendarViewIcon,
  ToggleOn as ToggleIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchCalendarEvents,
  setSelectedEvent,
  setModalOpen,
  setCalendarView,
  setCalendarDate,
  selectCalendarEvents,
  selectSelectedEvent,
  selectIsModalOpen,
  selectIsLoading,
  selectCalendarView,
  selectCalendarDate,
  updateCalendarEvent,
} from '../../store/slices/calendarSlice';
import { addNotification } from '../../store/slices/notificationsSlice';
import { CalendarEvent, CalendarEventType } from '../../types/calendar';
import { RootState } from '../../store';

import CalendarEventForm from '../Calendar/CalendarEventForm';
import CalendarFiltersDrawer from '../Calendar/CalendarFiltersDrawer';
import CalendarEventDetails from '../Calendar/CalendarEventDetails';
import CalendarAgendaView from '../Calendar/CalendarAgendaView';

// Configuração do localizador para internacionalização
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Tipo expandido para compatibilidade com eventos personalizados
type CalendarEventExt = CalendarEvent & { start: Date; end: Date };

// Adicionar funcionalidade de arrastar e soltar ao calendário
const DraggableCalendar = withDragAndDrop(Calendar as any);

// Mapeamento de cores por tipo de evento
const eventTypeColors: Record<CalendarEventType, string> = {
  class: '#4caf50',      // Verde
  exam: '#f44336',       // Vermelho
  assignment: '#ff9800', // Laranja
  meeting: '#2196f3',    // Azul
  holiday: '#9c27b0',    // Roxo
  other: '#757575',      // Cinza
};

// Mapeamento de ícones por tipo de evento
const eventTypeIcons: Record<CalendarEventType, JSX.Element> = {
  class: <SchoolIcon />,
  exam: <ExamIcon />,
  assignment: <AssignmentIcon />,
  meeting: <MeetingIcon />,
  holiday: <HolidayIcon />,
  other: <EventIcon />,
};

// Componente para renderizar o estilo personalizado de eventos no calendário
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    height: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.85rem',
    pl: 0.5
  }}>
    <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', color: event.color }}>
      {eventTypeIcons[event.type]}
    </Box>
    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {event.title}
    </Box>
  </Box>
);

const views = {
  month: true,
  week: true,
  day: true,
  agenda: true,
};

const AcademicCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useAppSelector((state: RootState) => state.auth);
  const events = useAppSelector(selectCalendarEvents);
  const selectedEvent = useAppSelector(selectSelectedEvent);
  const isModalOpen = useAppSelector(selectIsModalOpen);
  const isLoading = useAppSelector(selectIsLoading);
  const view = useAppSelector(selectCalendarView);
  const date = useAppSelector(selectCalendarDate);
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [showAgendaView, setShowAgendaView] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [activeFilters, setActiveFilters] = useState<{
    types: CalendarEventType[];
    courses: number[];
  }>({
    types: [],
    courses: [],
  });

  // Handler para entrar/sair do modo impressão
  const handlePrintMode = () => {
    setPrintMode(prev => !prev);
    if (!printMode) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  // Carregar eventos ao inicializar
  useEffect(() => {
    let userType = 'admin';
    if (user) {
      if (user.role === 'teacher') userType = 'teacher';
      else if (user.role === 'student') userType = 'student';
    }
    dispatch(fetchCalendarEvents({ userType }));
  }, [dispatch, user]);

  // Função para filtrar eventos com base nos filtros ativos
  const filteredEvents = events.filter((event) => {
    const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(event.type);
    const courseMatch = activeFilters.courses.length === 0 || (event.courseId && activeFilters.courses.includes(event.courseId));
    return typeMatch && courseMatch;
  });

  // Handler para selecionar um evento
  const handleSelectEvent = (event: any) => {
    const calEvent = event as CalendarEventExt;
    dispatch(setSelectedEvent(calEvent));
    setIsDetailsOpen(true);
  };

  // Handler para selecionar um slot (para criar novo evento)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const newEvent: Partial<CalendarEvent> = {
      start,
      end,
      title: '',
      type: 'class',
    };
    dispatch(setSelectedEvent(newEvent as CalendarEvent));
    dispatch(setModalOpen(true));
  };

  // Handler para mudar a visualização do calendário
  const handleViewChange = (newView: string) => {
    dispatch(setCalendarView(newView as any));
  };
  
  // Handler para abrir o formulário de edição a partir dos detalhes
  const handleEditFromDetails = () => {
    setIsDetailsOpen(false);
    dispatch(setModalOpen(true));
  };

  // Handler para mudar a data/mês do calendário
  const handleNavigate = (newDate: Date) => {
    dispatch(setCalendarDate(newDate));
  };

  // Handler para aplicar filtros
  const handleApplyFilters = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    setIsFiltersOpen(false);
  };

  // Função para estilizar eventos no calendário
  const eventStyleGetter = (event: any) => {
    const calEvent = event as CalendarEventExt;
    const backgroundColor = calEvent.color || eventTypeColors[calEvent.type] || eventTypeColors.other;
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: theme.palette.getContrastText(backgroundColor),
        border: 'none',
        cursor: 'pointer',
      },
    };
  };

  // Handler para arrastar e soltar um evento
  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      const calEvent = event as CalendarEventExt;
      const updatedEvent: CalendarEvent = {
        ...calEvent,
        start,
        end,
        updatedAt: new Date(),
      };

      // Verificação de permissões - apenas admin e professores podem editar qualquer evento
      // Alunos só podem editar seus próprios eventos
      if (user) {
        if (
          user.role === 'admin' ||
          user.role === 'teacher' ||
          (user.role === 'student' && event.createdBy === user.id)
        ) {
          dispatch(updateCalendarEvent(updatedEvent));
          
          // Adiciona notificação sobre a mudança
          dispatch(
            addNotification({
              id: `event-moved-${Date.now()}`,
              title: 'Evento atualizado',
              message: `O evento "${calEvent.title}" foi movido para ${moment(start).format('DD/MM/YYYY HH:mm')}.`,
              type: 'info',
              createdAt: new Date().toISOString(),
              read: false,
              userType: user.role,
              targetId: user.id,
            })
          );
        } else {
          // Se não tiver permissão, mostrar mensagem de erro
          dispatch(
            addNotification({
              id: `event-moved-error-${Date.now()}`,
              title: 'Permissão negada',
              message: `Você não tem permissão para mover este evento.`,
              type: 'error',
              createdAt: new Date().toISOString(),
              read: false,
              userType: user.role,
              targetId: user.id,
            })
          );
        }
      }
    },
    [dispatch, user]
  );

  // Handler para redimensionar um evento
  const handleEventResize = useCallback(
    ({ event, start, end }: any) => {
      const calEvent = event as CalendarEventExt;
      const updatedEvent: CalendarEvent = {
        ...calEvent,
        start,
        end,
        updatedAt: new Date(),
      };

      // Verificação de permissões - apenas admin e professores podem editar qualquer evento
      // Alunos só podem editar seus próprios eventos
      if (user) {
        if (
          user.role === 'admin' ||
          user.role === 'teacher' ||
          (user.role === 'student' && event.createdBy === user.id)
        ) {
          dispatch(updateCalendarEvent(updatedEvent));
          
          // Adiciona notificação sobre a mudança
          const duration = moment.duration(moment(end).diff(moment(start)));
          const hours = duration.asHours().toFixed(1);
          
          dispatch(
            addNotification({
              id: `event-resized-${Date.now()}`,
              title: 'Evento redimensionado',
              message: `A duração do evento "${calEvent.title}" foi alterada para ${hours} horas.`,
              type: 'info',
              createdAt: new Date().toISOString(),
              read: false,
              userType: user.role,
              targetId: user.id,
            })
          );
        } else {
          // Se não tiver permissão, mostrar mensagem de erro
          dispatch(
            addNotification({
              id: `event-resize-error-${Date.now()}`,
              title: 'Permissão negada',
              message: `Você não tem permissão para redimensionar este evento.`,
              type: 'error',
              createdAt: new Date().toISOString(),
              read: false,
              userType: user.role,
              targetId: user.id,
            })
          );
        }
      }
    },
    [dispatch, user]
  );

  // Tradução dos textos do calendário
  const messages = {
    allDay: 'Dia Inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
  };

  // Formato das datas no calendário
  const formats = {
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd, D [de] MMMM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => 
      `${moment(start).format('D [de] MMMM')} - ${moment(end).format('D [de] MMMM YYYY')}`,
  };

  // Renderizar filtros ativos
  const renderActiveFilters = () => {
    if (activeFilters.types.length === 0 && activeFilters.courses.length === 0) {
      return null;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 1 }}>
        {activeFilters.types.map((type) => (
          <Chip
            key={type}
            icon={eventTypeIcons[type]}
            label={type === 'class' ? 'Aulas' : 
                  type === 'exam' ? 'Provas' :
                  type === 'assignment' ? 'Trabalhos' :
                  type === 'meeting' ? 'Reuniões' :
                  type === 'holiday' ? 'Feriados' : 'Outros'}
            onDelete={() => setActiveFilters({
              ...activeFilters,
              types: activeFilters.types.filter(t => t !== type)
            })}
            sx={{ bgcolor: eventTypeColors[type], color: 'white' }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, ...printMode ? { display: 'none' } : {} }}>
          <Typography variant="h4" gutterBottom>
            Calendário Acadêmico
          </Typography>
          <Box>
            <Tooltip title="Alternar entre visualização de calendário e agenda">
              <IconButton 
                color="primary" 
                onClick={() => setShowAgendaView(!showAgendaView)}
                sx={{ mr: 1 }}
              >
                {showAgendaView ? <CalendarViewIcon /> : <ViewAgendaIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Filtros">
              <IconButton 
                color="primary" 
                onClick={() => setIsFiltersOpen(true)}
                sx={{ mr: 1 }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualizar para impressão">
              <IconButton 
                color="primary" 
                onClick={handlePrintMode}
                sx={{ mr: 1 }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => dispatch(setModalOpen(true))}
            >
              {isMobile ? 'Adicionar' : 'Novo Evento'}
            </Button>
          </Box>
        </Box>
        
        {renderActiveFilters()}
      </Box>

      <Paper sx={{ p: 2, height: '75vh', position: 'relative', ...(printMode ? { boxShadow: 'none', height: 'auto' } : {}) }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}

        {showAgendaView ? (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <CalendarAgendaView 
              events={filteredEvents} 
              onSelectEvent={handleSelectEvent}
              filters={activeFilters}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </Box>
        ) : (
          <DraggableCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: printMode ? 'auto' : '100%', 
              minHeight: printMode ? '100vh' : 'auto'
            }}
            views={views}
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            resizable
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent as any,
            }}
            messages={messages}
            formats={formats}
            popup
            showMultiDayTimes
            longPressThreshold={250}
          />
        )}
      </Paper>

      <CalendarFiltersDrawer
        open={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        filters={activeFilters}
      />

      {/* Dialog para formulário de criação/edição de evento */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => dispatch(setModalOpen(false))}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <CalendarEventForm 
          event={selectedEvent}
          onClose={() => dispatch(setModalOpen(false))}
        />
      </Dialog>
      
      {/* Dialog para detalhes do evento */}
      <Dialog
        open={isDetailsOpen && !!selectedEvent}
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <CalendarEventDetails
            event={selectedEvent}
            onClose={() => setIsDetailsOpen(false)}
            onEdit={handleEditFromDetails}
          />
        )}
      </Dialog>
    </Container>
  );
};

export default AcademicCalendar;
