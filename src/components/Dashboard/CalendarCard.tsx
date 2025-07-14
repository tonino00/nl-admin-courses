import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { DashboardCard } from '../../types/dashboard';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarCardProps {
  card: DashboardCard;
}

const CalendarCard: React.FC<CalendarCardProps> = ({ card }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <IconButton onClick={prevMonth}>
          <PrevIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </Typography>
        <IconButton onClick={nextMonth}>
          <NextIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEEEE';
    const days = [];

    const start = startOfMonth(currentMonth);
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <Grid item xs key={i}>
          <Typography variant="caption" align="center" sx={{ fontWeight: 'bold', display: 'block' }}>
            {format(addDays(start, i), dateFormat, { locale: ptBR }).toUpperCase()}
          </Typography>
        </Grid>
      );
    }

    return <Grid container>{days}</Grid>;
  };

  // Função auxiliar para adicionar dias
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    // Encontrar eventos para o dia
    const getEventsForDay = (date: Date) => {
      if (!card.data || !card.data.events) return [];
      return card.data.events.filter((event: any) => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, date);
      });
    };

    // Adicionar dias ao calendário
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const events = getEventsForDay(day);
        days.push(
          <Grid item xs key={day.toString()}>
            <Paper
              sx={{
                height: 50,
                p: 1,
                bgcolor: isToday(day) ? '#e3f2fd' : 
                         !isSameMonth(day, monthStart) ? '#f5f5f5' : 'white',
                display: 'flex',
                flexDirection: 'column',
                border: events.length > 0 ? '2px solid #4caf50' : 'none',
                position: 'relative',
                cursor: events.length > 0 ? 'pointer' : 'default'
              }}
            >
              <Typography variant="body2" sx={{ 
                color: !isSameMonth(day, monthStart) ? '#bdbdbd' : 'inherit',
                fontWeight: isToday(day) ? 'bold' : 'normal'
              }}>
                {formattedDate}
              </Typography>
              {events.length > 0 && (
                <Box sx={{ 
                  height: 8, 
                  width: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#4caf50',
                  position: 'absolute',
                  bottom: 4,
                  right: 4
                }} />
              )}
            </Paper>
          </Grid>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <Grid container spacing={1} key={day.toString()}>
          {days}
        </Grid>
      );
      days = [];
    }
    return <Box sx={{ px: 2, pb: 2 }}>{rows}</Box>;
  };

  // Funções auxiliares para iniciar e terminar a semana
  const startOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  };

  const endOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() + (6 - day);
    return new Date(result.setDate(diff));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={card.title}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        {renderHeader()}
        <Divider />
        <Box sx={{ p: 2 }}>
          {renderDays()}
        </Box>
        <Divider />
        {renderCells()}
      </CardContent>
    </Card>
  );
};

export default CalendarCard;
