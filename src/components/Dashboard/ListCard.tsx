import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DashboardCard } from '../../types/dashboard';

interface ListCardProps {
  card: DashboardCard;
}

const ListCard: React.FC<ListCardProps> = ({ card }) => {
  if (!card.data || !card.data.items || !Array.isArray(card.data.items)) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title={card.title} />
        <CardContent>
          <Typography variant="body2">Nenhum dado disponível</Typography>
        </CardContent>
      </Card>
    );
  }

  // Obter o avatar baseado no tipo do item
  const getAvatar = (type: string, initial: string) => {
    const colors: {[key: string]: string} = {
      student: '#4caf50',
      teacher: '#2196f3',
      course: '#ff9800',
      event: '#9c27b0',
      task: '#f44336',
      default: '#757575'
    };

    const color = colors[type] || colors.default;

    return (
      <Avatar sx={{ bgcolor: color }}>
        {initial}
      </Avatar>
    );
  };

  // Obter chip de status
  const getStatusChip = (status: string) => {
    const statusConfig: {[key: string]: {color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', label: string}} = {
      active: { color: 'success', label: 'Ativo' },
      inactive: { color: 'error', label: 'Inativo' },
      pending: { color: 'warning', label: 'Pendente' },
      completed: { color: 'success', label: 'Concluído' },
      inProgress: { color: 'info', label: 'Em andamento' },
      default: { color: 'default', label: status }
    };

    const config = statusConfig[status] || statusConfig.default;
    
    return (
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small" 
        sx={{ fontSize: '0.75rem' }}
      />
    );
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
      <CardContent sx={{ flexGrow: 1, px: 0, py: 0, overflowY: 'auto' }}>
        <List sx={{ width: '100%' }}>
          {card.data.items.map((item: any, index: number) => (
            <React.Fragment key={item.id || index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  {getAvatar(item.type, item.initial || item.name?.charAt(0) || '?')}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">{item.name}</Typography>
                      {item.status && getStatusChip(item.status)}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline', mr: 1 }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {item.description}
                      </Typography>
                      {item.date && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.date}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < card.data.items.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ListCard;
