import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as ExamIcon,
  Group as MeetingIcon,
  Celebration as HolidayIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  Room as LocationIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/pt-br';
import { CalendarEvent, CalendarEventType } from '../../types/calendar';

// Mapeamento de ícones por tipo de evento
const eventTypeIcons: Record<CalendarEventType, React.ReactElement> = {
  class: <SchoolIcon color="primary" />,
  assignment: <AssignmentIcon color="secondary" />,
  exam: <ExamIcon color="error" />,
  meeting: <MeetingIcon color="info" />,
  holiday: <HolidayIcon color="warning" />,
  other: <EventIcon color="action" />,
};

// Cores para os chips de tipo de evento
const eventTypeColors: Record<CalendarEventType, string> = {
  class: '#4caf50',      // Verde
  assignment: '#9c27b0', // Roxo
  exam: '#f44336',       // Vermelho
  meeting: '#2196f3',    // Azul
  holiday: '#ff9800',    // Laranja
  other: '#757575',      // Cinza
};

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  filters: {
    types: CalendarEventType[];
    courses: number[];
  };
  dateFilter: 'today' | 'week' | 'month' | 'all';
  setDateFilter: (filter: 'today' | 'week' | 'month' | 'all') => void;
}

const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  onSelectEvent,
  filters,
  dateFilter,
  setDateFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Função para agrupar eventos por data
  const groupEventsByDate = (events: CalendarEvent[]) => {
    const groupedEvents: Record<string, CalendarEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = moment(event.start).format('YYYY-MM-DD');
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    // Ordenar eventos dentro de cada grupo por horário
    Object.keys(groupedEvents).forEach(dateKey => {
      groupedEvents[dateKey].sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
    });

    return groupedEvents;
  };

  // Função para filtrar eventos por data
  const filterEventsByDate = (events: CalendarEvent[], dateFilter: string): CalendarEvent[] => {
    const today = moment().startOf('day');
    
    switch (dateFilter) {
      case 'today':
        return events.filter(event => moment(event.start).isSame(today, 'day'));
      case 'week':
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');
        return events.filter(event => 
          moment(event.start).isBetween(startOfWeek, endOfWeek, 'day', '[]')
        );
      case 'month':
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');
        return events.filter(event => 
          moment(event.start).isBetween(startOfMonth, endOfMonth, 'day', '[]')
        );
      default:
        return events;
    }
  };

  // Filtrar eventos com base nos filtros ativos e termo de pesquisa
  let filteredEvents = [...events];
  
  // Aplicar filtros de tipo e curso
  if (filters.types.length > 0) {
    filteredEvents = filteredEvents.filter(event => filters.types.includes(event.type));
  }
  
  if (filters.courses.length > 0) {
    filteredEvents = filteredEvents.filter(event => {
      return event.courseId !== undefined && filters.courses.includes(event.courseId);
    });
  }

  // Aplicar filtro por data
  filteredEvents = filterEventsByDate(filteredEvents, dateFilter);

  // Aplicar pesquisa por texto
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredEvents = filteredEvents.filter(event => {
      return (
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)) ||
        (event.location && event.location.toLowerCase().includes(searchLower))
      );
    });
  }

  // Agrupar eventos filtrados por data
  const groupedEvents = groupEventsByDate(filteredEvents);
  const sortedDates = Object.keys(groupedEvents).sort();

  // Toggle para expandir/colapsar grupos
  const toggleGroup = (dateKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Renderização do status do evento recorrente
  const renderRecurrenceInfo = (event: CalendarEvent) => {
    if (!event.recurrence) return null;

    let recurrenceText = '';
    switch (event.recurrence.type) {
      case 'daily':
        recurrenceText = `Diariamente`;
        if (event.recurrence.interval > 1) {
          recurrenceText += ` a cada ${event.recurrence.interval} dias`;
        }
        break;
      case 'weekly':
        recurrenceText = `Semanalmente`;
        if (event.recurrence.interval > 1) {
          recurrenceText += ` a cada ${event.recurrence.interval} semanas`;
        }
        break;
      case 'monthly':
        recurrenceText = `Mensalmente`;
        if (event.recurrence.interval > 1) {
          recurrenceText += ` a cada ${event.recurrence.interval} meses`;
        }
        break;
      case 'yearly':
        recurrenceText = `Anualmente`;
        if (event.recurrence.interval > 1) {
          recurrenceText += ` a cada ${event.recurrence.interval} anos`;
        }
        break;
    }

    return (
      <Chip 
        size="small" 
        label={recurrenceText} 
        icon={<ExpandMoreIcon />} 
        variant="outlined" 
        color="primary"
        sx={{ ml: 1 }} 
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Pesquisar eventos..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Hoje">
            <Chip 
              icon={<TodayIcon />} 
              label="Hoje" 
              onClick={() => setDateFilter('today')} 
              color={dateFilter === 'today' ? 'primary' : 'default'}
              variant={dateFilter === 'today' ? 'filled' : 'outlined'}
            />
          </Tooltip>
          <Tooltip title="Esta semana">
            <Chip 
              icon={<DateIcon />} 
              label="Semana" 
              onClick={() => setDateFilter('week')} 
              color={dateFilter === 'week' ? 'primary' : 'default'}
              variant={dateFilter === 'week' ? 'filled' : 'outlined'}
            />
          </Tooltip>
          <Tooltip title="Este mês">
            <Chip 
              icon={<DateRangeIcon />} 
              label="Mês" 
              onClick={() => setDateFilter('month')} 
              color={dateFilter === 'month' ? 'primary' : 'default'}
              variant={dateFilter === 'month' ? 'filled' : 'outlined'}
            />
          </Tooltip>
          <Tooltip title="Todos os eventos">
            <Chip 
              icon={<FilterIcon />} 
              label="Todos" 
              onClick={() => setDateFilter('all')} 
              color={dateFilter === 'all' ? 'primary' : 'default'}
              variant={dateFilter === 'all' ? 'filled' : 'outlined'}
            />
          </Tooltip>
        </Box>
      </Box>

      {sortedDates.length > 0 ? (
        <Paper elevation={2}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {sortedDates.map((dateKey) => {
              const isExpanded = expandedGroups[dateKey] !== false; // Expandido por padrão
              const formattedDate = moment(dateKey).format('dddd, D [de] MMMM [de] YYYY');
              const isToday = moment(dateKey).isSame(moment(), 'day');
              
              return (
                <React.Fragment key={dateKey}>
                  <ListItemButton 
                    onClick={() => toggleGroup(dateKey)}
                    sx={{ 
                      bgcolor: isToday ? 'rgba(33, 150, 243, 0.08)' : 'inherit',
                      borderLeft: isToday ? '4px solid #2196f3' : 'none',
                      pl: isToday ? 2 : 2
                    }}
                  >
                    <ListItemIcon>
                      <DateIcon color={isToday ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="subtitle1" fontWeight={isToday ? 'bold' : 'normal'}>
                        {formattedDate}
                      </Typography>} 
                      secondary={`${groupedEvents[dateKey].length} evento${groupedEvents[dateKey].length !== 1 ? 's' : ''}`}
                    />
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {groupedEvents[dateKey].map((event) => (
                        <ListItem 
                          key={event.id} 
                          sx={{ 
                            pl: 4, 
                            borderLeft: `4px solid ${event.color || eventTypeColors[event.type] || '#757575'}`,
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                          }}
                          secondaryAction={
                            <Box>
                              {renderRecurrenceInfo(event)}
                            </Box>
                          }
                          onClick={() => onSelectEvent(event)}
                        >
                          <ListItemIcon>
                            {eventTypeIcons[event.type]}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {event.title}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <TimeIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {event.allDay 
                                      ? 'Dia todo' 
                                      : `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`}
                                  </Typography>
                                </Box>
                                {event.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <LocationIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{event.location}</Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            Nenhum evento encontrado para os filtros selecionados.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CalendarAgendaView;
