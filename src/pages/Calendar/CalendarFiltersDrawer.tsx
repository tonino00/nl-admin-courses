import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Button,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as ExamIcon,
  Group as MeetingIcon,
  Celebration as HolidayIcon,
} from '@mui/icons-material';

import { useAppSelector } from '../../hooks';
import { CalendarEventType } from '../../types/calendar';
import { RootState } from '../../store';

interface CalendarFilters {
  types: CalendarEventType[];
  courses: number[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: CalendarFilters) => void;
  filters: CalendarFilters;
}

const CalendarFiltersDrawer: React.FC<Props> = ({ open, onClose, onApply, filters }) => {
  const { courses } = useAppSelector((state: RootState) => state.courses);
  const [localFilters, setLocalFilters] = useState<CalendarFilters>(filters);

  // Reset local filters when drawer opens or when filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleEventTypeToggle = (type: CalendarEventType) => {
    setLocalFilters(prev => {
      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      } else {
        return { ...prev, types: [...prev.types, type] };
      }
    });
  };

  const handleCourseToggle = (courseId: number) => {
    setLocalFilters(prev => {
      if (prev.courses.includes(courseId)) {
        return { ...prev, courses: prev.courses.filter(id => id !== courseId) };
      } else {
        return { ...prev, courses: [...prev.courses, courseId] };
      }
    });
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({ types: [], courses: [] });
  };

  // Configuração de cores por tipo de evento
  const eventTypeColors: Record<CalendarEventType, string> = {
    class: '#4caf50',      // Verde
    exam: '#f44336',       // Vermelho
    assignment: '#ff9800', // Laranja
    meeting: '#2196f3',    // Azul
    holiday: '#9c27b0',    // Roxo
    other: '#757575',      // Cinza
  };

  // Configuração de ícones por tipo de evento
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
    class: 'Aulas',
    exam: 'Provas',
    assignment: 'Trabalhos',
    meeting: 'Reuniões',
    holiday: 'Feriados',
    other: 'Outros',
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, p: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
        Tipos de Eventos
      </Typography>

      <FormGroup sx={{ mb: 3 }}>
        {(Object.keys(eventTypeLabels) as CalendarEventType[]).map((type) => (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                checked={localFilters.types.includes(type)}
                onChange={() => handleEventTypeToggle(type)}
                sx={{
                  color: eventTypeColors[type],
                  '&.Mui-checked': {
                    color: eventTypeColors[type],
                  },
                }}
                icon={React.cloneElement(eventTypeIcons[type], { color: 'inherit' })}
                checkedIcon={React.cloneElement(eventTypeIcons[type], { color: 'inherit' })}
              />
            }
            label={eventTypeLabels[type]}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
        Cursos
      </Typography>

      <List>
        {courses.length > 0 ? (
          courses.map((course) => (
            <ListItem
              key={course.id}
              dense
              button
              onClick={() => handleCourseToggle(Number(course.id))}
              selected={localFilters.courses.includes(Number(course.id))}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={localFilters.courses.includes(Number(course.id))}
                  disableRipple
                  sx={{ padding: 0 }}
                />
              </ListItemIcon>
              <ListItemText primary={course.name} />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Nenhum curso disponível
          </Typography>
        )}
      </List>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          pt: 2,
          pb: 1,
          mt: 3,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button variant="text" onClick={handleClear}>
          Limpar
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleApply}>
            Aplicar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CalendarFiltersDrawer;
