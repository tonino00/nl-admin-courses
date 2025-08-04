import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Avatar,
  Divider,
  InputAdornment,
  Button,
  Chip,
  Link,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import moment from 'moment';
import 'moment/locale/pt-br';
import { chatService, ChatMessage, Conversation, Attachment } from '../../services/chatService';
import { styled } from '@mui/material/styles';

moment.locale('pt-br');

interface ChatMessagesProps {
  conversation: Conversation | null;
}

// URL Regex para detectar links
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

// Componente estilizado para input de arquivo oculto
const VisuallyHiddenInput = styled('input')(`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`);

const ChatMessages: React.FC<ChatMessagesProps> = ({ conversation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useSelector((state: any) => state.auth.user);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?.id) return;

      setLoading(true);
      try {
        const conversationMessages = await chatService.getMessagesByConversationId(conversation.id);
        setMessages(conversationMessages);
        
        // Mark messages as read
        if (currentUser?.id) {
          await chatService.markMessagesAsRead(conversation.id, currentUser.id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.id, currentUser?.id]);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !conversation?.id || !currentUser?.id) return;

    setSending(true);
    try {
      // Get the receiver from conversation participants
      const receiver = conversation.participants.find(p => p.userId !== currentUser.id);
      if (!receiver) return;

      const message: ChatMessage = {
        conversationId: conversation.id,
        senderId: currentUser.id,
        receiverId: receiver.userId,
        senderRole: currentUser.role,
        receiverRole: receiver.role,
        senderName: currentUser.name,
        receiverName: receiver.name,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        attachments: attachments.length > 0 ? [...attachments] : undefined,
        hasLinks: URL_REGEX.test(newMessage)
      };

      const sentMessage = await chatService.sendMessage(message);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setAttachments([]);

      // Update the conversation with the new last message
      const conversationMessage = attachments.length > 0 
        ? `${newMessage.trim() || "Enviou um anexo"} ${attachments.length > 1 ? `(+${attachments.length} anexos)` : ''}` 
        : message.message;

      const updatedConversation = {
        ...conversation,
        lastMessage: conversationMessage,
        lastMessageTimestamp: message.timestamp,
        unreadCount: conversation.unreadCount + 1
      };
      await chatService.updateConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newAttachments: Attachment[] = [];
      
      // Process each file
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const attachment = await chatService.uploadFile(file);
        newAttachments.push(attachment);
      }
      
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatMessageDate = (timestamp: string) => {
    return moment(timestamp).format('DD/MM/YYYY HH:mm');
  };

  const renderDateDivider = (currentDate: string, previousDate: string | null) => {
    if (!previousDate) return true;
    
    const current = moment(currentDate).startOf('day');
    const previous = moment(previousDate).startOf('day');
    return !current.isSame(previous, 'day');
  };

  if (!conversation) {
    return (
      <Paper 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Selecione uma conversa para iniciar o chat
        </Typography>
      </Paper>
    );
  }

  // Find the other participant to display their name
  const otherParticipant = conversation.participants.find(
    p => p.userId !== currentUser?.id
  ) || conversation.participants[0];

  return (
    <Paper 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {/* Chat header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Avatar sx={{ mr: 2 }}>{otherParticipant.name.charAt(0)}</Avatar>
        <Box>
          <Typography variant="h6">{otherParticipant.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {otherParticipant.role === 'teacher' ? 'Professor(a)' : 'Aluno(a)'}
          </Typography>
        </Box>
      </Box>

      {/* Chat messages */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma mensagem encontrada. Envie a primeira mensagem!
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === currentUser?.id;
                const showDateDivider = renderDateDivider(
                  msg.timestamp,
                  index > 0 ? messages[index - 1].timestamp : null
                );

                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          my: 2
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'background.paper',
                            px: 2,
                            py: 0.5,
                            borderRadius: 4,
                            color: 'text.secondary'
                          }}
                        >
                          {moment(msg.timestamp).format('DD [de] MMMM, YYYY')}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 1,
                        mt: showDateDivider ? 0 : 1
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isCurrentUser ? 'primary.main' : 'background.paper',
                          color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                          boxShadow: 1
                        }}
                      >
                        {/* Render the message with clickable links */}
                        {msg.message && (
                          <Typography variant="body1">
                            {msg.hasLinks ? (
                              <>
                                {msg.message.split(' ').map((word, i) => {
                                  if (word.match(URL_REGEX)) {
                                    return (
                                      <React.Fragment key={i}>
                                        <Link 
                                          href={word} 
                                          target="_blank" 
                                          rel="noopener"
                                          sx={{ 
                                            color: isCurrentUser ? 'primary.contrastText' : 'primary.main',
                                            '&:hover': { textDecoration: 'underline' } 
                                          }}
                                        >
                                          {word}
                                        </Link>
                                        {' '}
                                      </React.Fragment>
                                    );
                                  }
                                  return <React.Fragment key={i}>{word}{' '}</React.Fragment>;
                                })}
                              </>
                            ) : (
                              msg.message
                            )}
                          </Typography>
                        )}
                        
                        {/* Render attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {msg.attachments.map((attachment) => {
                              const isImage = attachment.fileType.startsWith('image/');
                              
                              if (isImage) {
                                return (
                                  <Card key={attachment.id} sx={{ mb: 1, maxWidth: 200 }}>
                                    <CardMedia
                                      component="img"
                                      image={attachment.thumbnailUrl || attachment.fileUrl}
                                      alt={attachment.fileName}
                                      sx={{ maxHeight: 150, objectFit: 'contain' }}
                                    />
                                    <CardContent sx={{ py: 1, px: 1 }}>
                                      <Link 
                                        href={attachment.fileUrl} 
                                        target="_blank"
                                        sx={{ 
                                          fontSize: '0.75rem',
                                          color: isCurrentUser ? 'primary.contrastText' : 'primary.main',
                                        }}
                                      >
                                        {attachment.fileName}
                                      </Link>
                                    </CardContent>
                                  </Card>
                                );
                              } else {
                                // Escolher o ícone apropriado para o tipo de arquivo
                                let FileIcon = InsertDriveFileIcon;
                                if (attachment.fileType === 'application/pdf') {
                                  FileIcon = PictureAsPdfIcon;
                                } else if (attachment.fileType.includes('document') || 
                                           attachment.fileType.includes('text/')) {
                                  FileIcon = DescriptionIcon;
                                }
                                
                                return (
                                  <Box key={attachment.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FileIcon sx={{ mr: 1, color: isCurrentUser ? 'primary.contrastText' : 'primary.main' }} />
                                    <Link 
                                      href={attachment.fileUrl} 
                                      target="_blank"
                                      sx={{ 
                                        fontSize: '0.875rem',
                                        color: isCurrentUser ? 'primary.contrastText' : 'primary.main',
                                      }}
                                    >
                                      {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                    </Link>
                                  </Box>
                                );
                              }
                            })}
                          </Box>
                        )}
                        
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            opacity: 0.8
                          }}
                        >
                          {moment(msg.timestamp).format('HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message input */}
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <Box 
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {attachments.map(attachment => (
            <Chip
              key={attachment.id}
              label={attachment.fileName}
              onDelete={() => removeAttachment(attachment.id || '')}
              deleteIcon={<ClearIcon />}
              variant="outlined"
              sx={{ maxWidth: '100%' }}
            />
          ))}
        </Box>
      )}
      
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Button
          component="label"
          disabled={uploading || sending}
          sx={{ minWidth: 'auto' }}
        >
          {uploading ? <CircularProgress size={24} /> : <AttachFileIcon />}
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            multiple
            ref={fileInputRef}
          />
        </Button>

        <TextField
          fullWidth
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={((!newMessage.trim() && attachments.length === 0) || sending)}
                >
                  {sending ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default ChatMessages;
