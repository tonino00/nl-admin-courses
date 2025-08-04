import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  Badge,
  Box,
  Paper,
  CircularProgress
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import moment from 'moment';
import { chatService, Conversation } from '../../services/chatService';

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: number;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (currentUser?.id) {
          const userConversations = await chatService.getConversationsByUserId(currentUser.id);
          setConversations(userConversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser?.id]);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== currentUser?.id) || conversation.participants[0];
  };

  const formatTime = (timestamp: string) => {
    const messageDate = moment(timestamp);
    const now = moment();

    if (now.diff(messageDate, 'days') === 0) {
      return messageDate.format('HH:mm');
    } else if (now.diff(messageDate, 'days') === 1) {
      return 'Ontem';
    } else if (now.diff(messageDate, 'days') < 7) {
      return messageDate.format('ddd');
    } else {
      return messageDate.format('DD/MM/YYYY');
    }
  };

  return (
    <Paper sx={{ height: '100%', maxHeight: 'calc(100vh - 200px)', overflow: 'auto', bgcolor: 'background.default' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <List disablePadding>
          {conversations.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhuma conversa encontrada
              </Typography>
            </Box>
          ) : (
            conversations.map((conversation, index) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversationId === conversation.id;

              return (
                <React.Fragment key={conversation.id}>
                  <ListItem
                    alignItems="flex-start"
                    button
                    selected={isSelected}
                    onClick={() => onSelectConversation(conversation)}
                    sx={{
                      bgcolor: isSelected ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="error"
                        badgeContent={conversation.unreadCount}
                        invisible={conversation.unreadCount === 0}
                      >
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" color="text.primary">
                          {otherParticipant.name}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ float: 'right' }}
                          >
                            {conversation.lastMessageTimestamp && formatTime(conversation.lastMessageTimestamp)}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color={conversation.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                          sx={{
                            display: 'block',
                            fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < conversations.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })
          )}
        </List>
      )}
    </Paper>
  );
};

export default ConversationsList;
