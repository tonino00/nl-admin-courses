import React, { useState, useEffect } from 'react';
import { Grid, Box, Paper, Typography, Button, Divider, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ConversationsList from './ConversationsList';
import ChatMessages from './ChatMessages';
import { Conversation, chatService } from '../../services/chatService';
import NewConversationDialog from './NewConversationDialog';
import { useSelector } from 'react-redux';

const ChatInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const currentUser = useSelector((state: any) => state.auth.user);
  
  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle new conversation creation
  const handleCreateConversation = async (userId: number, userName: string, userRole: string) => {
    try {
      if (!currentUser?.id) return;
      
      // Check if conversation already exists
      const existingConversations = await chatService.getConversationsByUserId(currentUser.id);
      const existingConversation = existingConversations.find((conv: Conversation) => 
        conv.participants.some((p: { userId: number }) => p.userId === userId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        setOpenNewDialog(false);
        return;
      }
      
      // Create new conversation
      const newConversation: Conversation = {
        id: Math.floor(Date.now() / 1000), // Gerando ID temporário
        participants: [
          {
            userId: currentUser.id,
            name: currentUser.name,
            role: currentUser.role
          },
          {
            userId,
            name: userName,
            role: userRole
          }
        ],
        lastMessage: "",
        lastMessageTimestamp: new Date().toISOString(),
        unreadCount: 0
      };
      
      const createdConversation = await chatService.createConversation(newConversation);
      setSelectedConversation(createdConversation);
      setOpenNewDialog(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 2,
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Chat
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenNewDialog(true)}
        >
          Nova Conversa
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{ flexGrow: 1, height: 'calc(100% - 70px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
          <ConversationsList 
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </Grid>
        
        {/* Chat Messages */}
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
          <ChatMessages conversation={selectedConversation} />
        </Grid>
      </Grid>

      {/* New Conversation Dialog */}
      <NewConversationDialog 
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        onCreateConversation={handleCreateConversation}
      />
    </Paper>
  );
};

export default ChatInterface;
