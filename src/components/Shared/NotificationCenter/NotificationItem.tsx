import React from 'react';
import { 
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { 
  Info as InfoIcon, 
  Warning as WarningIcon, 
  Check as SuccessIcon, 
  Error as ErrorIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { Notification } from '../../../types/notifications';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  onRemove
}) => {
  // Determinar o ícone com base no tipo de notificação
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <InfoIcon sx={{ color: '#2196f3' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'success':
        return <SuccessIcon sx={{ color: '#4caf50' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return <InfoIcon />;
    }
  };

  // Formatação relativa da data (ex: "há 5 minutos")
  const formattedDate = formatDistance(
    new Date(notification.createdAt),
    new Date(),
    { addSuffix: true, locale: ptBR }
  );

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <ListItem 
      alignItems="flex-start" 
      onClick={handleClick}
      sx={{
        borderLeft: `4px solid ${
          notification.type === 'info' ? '#2196f3' :
          notification.type === 'warning' ? '#ff9800' :
          notification.type === 'success' ? '#4caf50' :
          '#f44336'
        }`,
        backgroundColor: notification.read ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
        mb: 1,
        borderRadius: 1,
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.paper' }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.primary" component="span">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formattedDate}
            </Typography>
          </Box>
        }
      />
      <IconButton 
        edge="end" 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
};

export default NotificationItem;
