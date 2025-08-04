import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { EmojiPicker } from './EmojiPicker';
import moment from 'moment';
import 'moment/locale/pt-br';
import { chatService, ChatMessage, Conversation, Attachment, Reaction } from '../../services/chatService';
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
  const [typingUsers, setTypingUsers] = useState<{userId: number; name: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [addingReaction, setAddingReaction] = useState<number | null>(null); // Para armazenar o ID da mensagem sendo reagida
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Scroll to bottom of messages whenever messages or typing status changes
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();
  }, [messages, typingUsers]);

  // Função para adicionar ou remover reação
  const handleAddReaction = async (messageId: number | undefined, emoji: string) => {
    if (!messageId || !currentUser?.id) return;
    
    try {
      const updatedMessage = await chatService.addReaction(
        messageId,
        emoji,
        currentUser.id,
        currentUser.name
      );
      
      // Atualizar a mensagem na lista de mensagens
      setMessages(messages.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    }
  };

  // Função para verificar se o usuário atual já reagiu com um emoji específico
  const hasUserReacted = (reactions: Reaction[] | undefined, emoji: string): boolean => {
    if (!reactions || !currentUser?.id) return false;
    return reactions.some(r => r.userId === currentUser.id && r.emoji === emoji);
  };

  // Função para contar quantas reações de um determinado emoji existem
  const countReactions = (reactions: Reaction[] | undefined, emoji: string): number => {
    if (!reactions) return 0;
    return reactions.filter(r => r.emoji === emoji).length;
  };

  // Função para obter emojis únicos usados em uma mensagem
  const getUniqueEmojis = (reactions: Reaction[] | undefined): string[] => {
    if (!reactions || reactions.length === 0) return [];
    // Usando método de filtro para remover duplicatas em vez de Set para maior compatibilidade
    return reactions
      .map(r => r.emoji)
      .filter((emoji, index, self) => self.indexOf(emoji) === index);
  };

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

  // Check for users who are typing
  useEffect(() => {
    if (!conversation?.id) return;
    
    // Set up interval to check for typing users
    const checkTypingInterval = setInterval(() => {
      if (conversation?.id) {
        const activeTypers = chatService.getTypingUsers(conversation.id)
          .filter(user => user.userId !== currentUser?.id); // Não mostrar o usuário atual
        
        setTypingUsers(activeTypers);
      }
    }, 1000); // Verificar a cada 1 segundo
    
    return () => {
      clearInterval(checkTypingInterval);
    };
  }, [conversation?.id, currentUser?.id]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Atualizar status de digitação
    if (!isTyping && conversation?.id && currentUser?.id) {
      setIsTyping(true);
      chatService.updateTypingStatus(currentUser.id, currentUser.name, conversation.id, true);
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (conversation?.id && currentUser?.id) {
        setIsTyping(false);
        chatService.updateTypingStatus(currentUser.id, currentUser.name, conversation.id, false);
      }
    }, 2000); // Considerar que parou de digitar após 2 segundos sem atividade
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
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '& .reaction-button': {
          opacity: 0
        },
        '& .MuiPaper-root:hover .reaction-button': {
          opacity: 0.7,
          '&:hover': {
            opacity: 1
          }
        }
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
          overflowY: 'auto',
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
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser?.id;
                const showDateDivider = renderDateDivider(
                  message.timestamp,
                  index > 0 ? messages[index - 1].timestamp : null
                );

                return (
                  <React.Fragment key={message.id}>
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
                          {moment(message.timestamp).format('DD [de] MMMM, YYYY')}
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
                        {message.message && (
                          <Typography variant="body1">
                            {message.hasLinks ? (
                              <>
                                {message.message.split(' ').map((word, i) => {
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
                              message.message
                            )}
                          </Typography>
                        )}
                        
                        {/* Render attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {message.attachments.map((attachment) => {
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
                                  <Box 
                                    key={attachment.id} 
                                    sx={{ 
                                      mt: 1,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => setPreviewAttachment(attachment)}
                                  >
                                    {attachment.fileType.startsWith('image/') && attachment.thumbnailUrl ? (
                                      <Box sx={{ mb: 1 }}>
                                        <Card elevation={0}>
                                          <CardMedia
                                            component="img"
                                            height="120"
                                            image={attachment.thumbnailUrl}
                                            alt={attachment.fileName}
                                            sx={{ 
                                              borderRadius: 1,
                                              maxWidth: 200,
                                              objectFit: 'cover',
                                              cursor: 'pointer',
                                              border: '1px solid rgba(0, 0, 0, 0.1)',
                                              '&:hover': { opacity: 0.9 }
                                            }}
                                          />
                                        </Card>
                                      </Box>
                                    ) : (
                                      <Box 
                                        sx={{ 
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          p: 1,
                                          border: '1px solid rgba(0, 0, 0, 0.1)',
                                          borderRadius: 1,
                                          bgcolor: 'rgba(0, 0, 0, 0.03)',
                                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
                                          maxWidth: 'fit-content'
                                        }}
                                      >
                                        {attachment.fileType.includes('pdf') ? (
                                          <PictureAsPdfIcon color="error" />
                                        ) : attachment.fileType.includes('word') ? (
                                          <DescriptionIcon color="primary" />
                                        ) : attachment.fileType.includes('sheet') || attachment.fileType.includes('excel') ? (
                                          <TableChartIcon color="success" />
                                        ) : (
                                          <InsertDriveFileIcon />
                                        )}
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            color: isCurrentUser ? 'primary.contrastText' : 'primary.main',
                                            fontWeight: 500
                                          }}
                                        >
                                          {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              }
                            })}
                          </Box>
                        )}
                        
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 0.5,
                            mt: 0.5
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: isCurrentUser ? 'primary.contrastText' : 'text.secondary', opacity: 0.8 }}
                          >
                            {moment(message.timestamp).format('HH:mm')}
                          </Typography>
                          
                          {/* Indicador de lido/entregue (apenas para mensagens enviadas pelo usuário atual) */}
                          {isCurrentUser && (
                            message.read ? (
                              <DoneAllIcon sx={{ fontSize: '0.8rem', color: 'primary.contrastText', opacity: 0.9 }} />
                            ) : (
                              <DoneIcon sx={{ fontSize: '0.8rem', color: 'primary.contrastText', opacity: 0.7 }} />
                            )
                          )}
                          
                          {/* Botão para adicionar reação */}
                          <Box 
                            sx={{ 
                              ml: 0.5,
                              opacity: 0, 
                              transition: 'opacity 0.2s',
                              '&:hover': { opacity: 1 }
                            }}
                            className="reaction-button"
                          >
                            <EmojiPicker onEmojiSelect={(emoji) => handleAddReaction(message.id, emoji)} />
                          </Box>
                        </Box>
                        
                        {/* Exibição de reações */}
                        {message.reactions && message.reactions.length > 0 && (
                          <Box 
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 0.5,
                              mt: 1
                            }}
                          >
                            {getUniqueEmojis(message.reactions).map(emoji => {
                              const count = countReactions(message.reactions, emoji);
                              const hasReacted = hasUserReacted(message.reactions, emoji);
                              
                              return (
                                <Tooltip 
                                  key={emoji} 
                                  title={
                                    <>
                                      {message.reactions
                                        ?.filter(r => r.emoji === emoji)
                                        .map(r => r.userName)
                                        .join(', ')}
                                    </>
                                  }
                                >
                                  <Chip
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <span style={{ fontSize: '16px' }}>{emoji}</span>
                                        {count > 1 && <span style={{ fontSize: '12px' }}>{count}</span>}
                                      </Box>
                                    }
                                    size="small"
                                    onClick={() => handleAddReaction(message.id, emoji)}
                                    sx={{
                                      height: 24,
                                      backgroundColor: hasReacted ? 'primary.light' : 'action.hover',
                                      color: hasReacted ? 'primary.contrastText' : 'text.primary',
                                      '&:hover': { backgroundColor: hasReacted ? 'primary.main' : 'action.selected' }
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })
            )}
            {/* Indicador de digitação */}
            {typingUsers.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  ml: 2,
                  mt: 1,
                  maxWidth: '75%',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 24,
                    width: 40,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#6b6b6b',
                      marginRight: 4,
                      animation: 'typing 1s infinite',
                      animationDelay: '0s'
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#6b6b6b',
                      marginRight: 4,
                      animation: 'typing 1s infinite',
                      animationDelay: '0.2s'
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#6b6b6b',
                      animation: 'typing 1s infinite',
                      animationDelay: '0.4s'
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0].name} está digitando...`
                    : `${typingUsers.length} pessoas estão digitando...`
                  }
                </Typography>
              </Box>
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

      {/* Dialog de Preview de Anexo */}
      <Dialog 
        open={!!previewAttachment} 
        onClose={() => setPreviewAttachment(null)}
        maxWidth="md"
        fullWidth
      >
        {previewAttachment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{previewAttachment.fileName}</Typography>
                <IconButton onClick={() => setPreviewAttachment(null)} size="small">
                  <ClearIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {previewAttachment.fileType.startsWith('image/') ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 2 
                  }}
                >
                  <img 
                    src={previewAttachment.fileUrl} 
                    alt={previewAttachment.fileName}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '70vh',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              ) : previewAttachment.fileType.includes('pdf') ? (
                <Box sx={{ height: '70vh', width: '100%' }}>
                  <iframe 
                    src={`${previewAttachment.fileUrl}#view=fitH`} 
                    width="100%" 
                    height="100%"
                    title={previewAttachment.fileName}
                    style={{ border: 'none' }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>Visualização não disponível para este tipo de arquivo.</Typography>
                  <Button 
                    variant="contained" 
                    href={previewAttachment.fileUrl} 
                    target="_blank"
                    startIcon={<CloudDownloadIcon />}
                    sx={{ mt: 2 }}
                  >
                    Baixar Arquivo
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ChatMessages;
