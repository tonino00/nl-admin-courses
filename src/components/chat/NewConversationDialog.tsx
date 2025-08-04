import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { chatService } from '../../services/chatService';
import { useSelector } from 'react-redux';

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateConversation: (userId: number, userName: string, userRole: string) => void;
}

interface ChatUser {
  userId: number;
  name: string;
  role: string;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  onClose,
  onCreateConversation
}) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state: any) => state.auth.user);

  // Fetch available users to chat with
  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser?.id || !open) return;
      
      setLoading(true);
      try {
        const chatUsers = await chatService.getChatUsers(currentUser.id);
        setUsers(chatUsers);
        setFilteredUsers(chatUsers);
      } catch (error) {
        console.error('Error loading chat users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser?.id, open]);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectUser = (user: ChatUser) => {
    onCreateConversation(user.userId, user.name, user.role);
  };

  const getUserRoleLabel = (role: string) => {
    return role === 'teacher' ? 'Professor(a)' : 'Aluno(a)';
  };

  const getUserIcon = (role: string) => {
    return role === 'teacher' ? <SchoolIcon /> : <PersonIcon />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Conversa</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          placeholder="Buscar usuário..."
          value={searchQuery}
          onChange={handleSearchChange}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <CircularProgress />
          </div>
        ) : (
          <List sx={{ mt: 2 }}>
            {filteredUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                {users.length === 0 
                  ? 'Nenhum usuário disponível para chat'
                  : 'Nenhum usuário encontrado com esse nome'}
              </Typography>
            ) : (
              filteredUsers.map((user, index) => (
                <React.Fragment key={user.userId}>
                  <ListItem 
                    button 
                    onClick={() => handleSelectUser(user)}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' } 
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {getUserIcon(user.role)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.name}
                      secondary={getUserRoleLabel(user.role)}
                    />
                  </ListItem>
                  {index < filteredUsers.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversationDialog;
