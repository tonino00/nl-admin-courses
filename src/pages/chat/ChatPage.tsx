import React from 'react';
import { Container } from '@mui/material';
import ChatInterface from '../../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <ChatInterface />
    </Container>
  );
};

export default ChatPage;
