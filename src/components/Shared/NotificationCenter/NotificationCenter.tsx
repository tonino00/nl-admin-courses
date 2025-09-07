import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  Typography, 
  Box, 
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  DeleteSweep as ClearAllIcon
} from '@mui/icons-material';
import NotificationItem from './NotificationItem';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  removeNotification 
} from '../../../store/slices/notificationsSlice';
import { RootState } from '../../../store';

interface NotificationCenterProps {
  userType: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userType }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    // Somente busca notificações se não for um usuário convidado
    if (userType !== 'guest') {
      dispatch(fetchNotifications(userType));
    }
  }, [dispatch, userType]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton 
        color="inherit" 
        aria-label="notificações"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: '360px', 
            maxHeight: '500px', 
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificações</Typography>
          {unreadCount > 0 && (
            <Button 
              startIcon={<ClearAllIcon />}
              onClick={handleMarkAllAsRead}
              size="small"
            >
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {userType === 'guest' ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
              Faça login para ver notificações
            </Typography>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={30} />
            </Box>
          ) : notifications.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onRemove={handleRemoveNotification}
                />
              ))}
            </List>
          ) : (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
              Não há notificações
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationCenter;
