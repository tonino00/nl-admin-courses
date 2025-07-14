import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  ArrowDropUp as ArrowUpIcon, 
  ArrowDropDown as ArrowDownIcon 
} from '@mui/icons-material';
import { DashboardMetric } from '../../types/dashboard';

// Mapeamento dinâmico de ícones
import {
  Group as StudentIcon,
  School as TeacherIcon,
  MenuBook as CourseIcon,
  AssignmentTurnedIn as EnrollmentIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as CalendarIcon,
  AccessTime as TimeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface MetricCardProps {
  metric: DashboardMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  // Mapeamento de ícones baseado na string do ícone
  const iconMap: {[key: string]: React.ReactElement} = {
    'student': <StudentIcon />,
    'teacher': <TeacherIcon />,
    'course': <CourseIcon />,
    'enrollment': <EnrollmentIcon />,
    'money': <MoneyIcon />,
    'calendar': <CalendarIcon />,
    'time': <TimeIcon />,
    'assessment': <AssessmentIcon />
  };

  // Função para formatar números grandes (ex: 1000 -> 1k)
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        borderRadius: 2,
        height: '100%',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {metric.title}
          </Typography>
          <Avatar 
            sx={{ 
              bgcolor: `${metric.color}20`, 
              width: 40, 
              height: 40 
            }}
          >
            <Box sx={{ color: metric.color }}>
              {iconMap[metric.icon] || <AssessmentIcon />}
            </Box>
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {formatValue(metric.value)}
        </Typography>
        
        {metric.change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: metric.changeType === 'increase' ? 'success.main' : 
                       metric.changeType === 'decrease' ? 'error.main' : 'text.secondary',
                mr: 1
              }}
            >
              {metric.changeType === 'increase' ? <ArrowUpIcon /> : 
              metric.changeType === 'decrease' ? <ArrowDownIcon /> : null}
              <Typography variant="body2" component="span">
                {Math.abs(metric.change)}%
              </Typography>
            </Box>
            <Tooltip title="Comparado ao mês anterior">
              <Typography variant="caption" color="textSecondary">
                desde o mês passado
              </Typography>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
