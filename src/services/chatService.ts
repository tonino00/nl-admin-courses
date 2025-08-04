import axios from 'axios';
import { API_URL } from '../utils/constants';

export interface ChatMessage {
  id?: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  senderRole: string;
  receiverRole: string;
  senderName: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
  hasLinks?: boolean;
}

export interface Attachment {
  id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
}

export interface Participant {
  userId: number;
  role: string;
  name: string;
}

export interface Conversation {
  id: number;
  participants: Participant[];
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

// Regex para detectar links em mensagens
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

// Função para detectar links em uma mensagem
const detectLinks = (message: string): boolean => {
  return URL_REGEX.test(message);
};

// Ativa o modo offline para testes sem backend
const OFFLINE_MODE = true;

// Dados mockados para modo offline
const mockData: {
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  users: any[];
} = {
  conversations: [
    {
      id: 1,
      participants: [
        { userId: 3, name: "Fernanda Lima", role: "teacher" },
        { userId: 4, name: "João Silva", role: "student" }
      ],
      lastMessage: "Dei uma olhada no seu exercício. Está quase perfeito!",
      lastMessageTimestamp: "2025-08-03T15:00:00-03:00",
      unreadCount: 0
    },
    {
      id: 2,
      participants: [
        { userId: 3, name: "Fernanda Lima", role: "teacher" },
        { userId: 5, name: "Ana Costa", role: "student" }
      ],
      lastMessage: "Ana, lembre-se que temos prova na próxima semana.",
      lastMessageTimestamp: "2025-08-03T15:10:00-03:00",
      unreadCount: 1
    }
  ],
  chatMessages: [
    {
      id: 1,
      conversationId: 1,
      senderId: 3,
      receiverId: 4,
      senderRole: "teacher",
      receiverRole: "student",
      senderName: "Fernanda Lima",
      receiverName: "João Silva",
      message: "Olá João, como você está se saindo no curso?",
      timestamp: "2025-08-03T14:30:00-03:00",
      read: true
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 4,
      receiverId: 3,
      senderRole: "student",
      receiverRole: "teacher",
      senderName: "João Silva",
      receiverName: "Fernanda Lima",
      message: "Olá professora, estou gostando bastante do curso. Tenho uma dúvida sobre o último exercício.",
      timestamp: "2025-08-03T14:35:00-03:00",
      read: true
    },
    {
      id: 7,
      conversationId: 1,
      senderId: 3,
      receiverId: 4,
      senderRole: "teacher",
      receiverRole: "student",
      senderName: "Fernanda Lima",
      receiverName: "João Silva",
      message: "Olá João! Fico feliz que esteja gostando. Sobre o exercício, você pode verificar a documentação em https://www.exemplo.com/documentacao. Lá tem vários exemplos que podem te ajudar.",
      timestamp: "2025-08-03T14:40:00-03:00",
      read: false,
      hasLinks: true
    },
    {
      id: 8,
      conversationId: 1,
      senderId: 4,
      receiverId: 3,
      senderRole: "student",
      receiverRole: "teacher",
      senderName: "João Silva",
      receiverName: "Fernanda Lima",
      message: "Estou tentando resolver este problema usando a biblioteca que vimos na aula.",
      timestamp: "2025-08-03T14:45:00-03:00",
      read: false,
      attachments: [
        {
          id: "file123",
          fileName: "exercicio_resolvido.pdf",
          fileType: "application/pdf",
          fileSize: 245000,
          fileUrl: "/uploads/exercicio_resolvido.pdf"
        }
      ]
    },
    {
      id: 9,
      conversationId: 1,
      senderId: 3,
      receiverId: 4,
      senderRole: "teacher",
      receiverRole: "student",
      senderName: "Fernanda Lima",
      receiverName: "João Silva",
      message: "Dei uma olhada no seu exercício. Está quase perfeito! Apenas falta ajustar a função de cálculo. Veja este exemplo e mais recursos em https://www.exemplo.com/recursos-adicionais",
      timestamp: "2025-08-03T15:00:00-03:00",
      read: false,
      hasLinks: true,
      attachments: [
        {
          id: "file456",
          fileName: "exemplo_corrigido.jpg",
          fileType: "image/jpeg",
          fileSize: 125000,
          fileUrl: "/uploads/exemplo_corrigido.jpg",
          thumbnailUrl: "/uploads/thumbnails/exemplo_corrigido.jpg"
        },
        {
          id: "file789",
          fileName: "solucao.docx",
          fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileSize: 35000,
          fileUrl: "/uploads/solucao.docx"
        }
      ]
    },
    {
      id: 3,
      conversationId: 2,
      senderId: 3,
      receiverId: 5,
      senderRole: "teacher",
      receiverRole: "student",
      senderName: "Fernanda Lima",
      receiverName: "Ana Costa",
      message: "Ana, lembre-se que temos prova na próxima semana.",
      timestamp: "2025-08-03T15:10:00-03:00",
      read: false
    }
  ],
  users: [
    {
      id: 1,
      username: "admin",
      password: "admin@0040",
      name: "Administrador",
      role: "admin"
    },
    {
      id: 3,
      username: "teacher2",
      password: "teacher123",
      name: "Fernanda Lima",
      role: "teacher",
      teacherId: 2
    },
    {
      id: 4,
      username: "student1",
      password: "student123",
      name: "João Silva",
      role: "student",
      studentId: 1
    },
    {
      id: 5,
      username: "student2",
      password: "student123",
      name: "Ana Costa",
      role: "student",
      studentId: 2
    }
  ]
};

// Exportação nomeada para manter compatibilidade com imports existentes
export const chatService = {
  // Busca usuários para criar novas conversas
  async getChatUsers(currentUserId: number): Promise<{ userId: number; name: string; role: string }[]> {
    try {
      console.log('Buscando usuários para chat. Modo offline:', OFFLINE_MODE);
      
      if (OFFLINE_MODE) {
        // Usando dados mockados no modo offline
        console.log('Modo offline: retornando usuários estáticos');
        return mockData.users
          .filter(user => user.id !== currentUserId && user.role !== 'admin')
          .map(user => ({
            userId: user.id,
            name: user.name,
            role: user.role
          }));
      }

      // Modo online - busca da API
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data;
      
      console.log(`Usuários encontrados na API: ${users.length}`);
      
      return users
        .filter((user: any) => user.id !== currentUserId && user.role !== 'admin')
        .map((user: any) => ({
          userId: user.id,
          name: user.name,
          role: user.role
        }));
    } catch (error) {
      console.error('Erro ao buscar usuários para chat:', error);
      
      // Fallback para dados mockados em caso de erro
      return mockData.users
        .filter(user => user.id !== currentUserId && user.role !== 'admin')
        .map(user => ({
          userId: user.id,
          name: user.name,
          role: user.role
        }));
    }
  },

  // Busca conversas por ID do usuário
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: retornando conversas estáticas');
        return mockData.conversations.filter(conversation =>
          conversation.participants.some(p => p.userId === userId)
        );
      }

      const response = await axios.get(`${API_URL}/conversations`);
      return response.data.filter((conversation: Conversation) =>
        conversation.participants.some(p => p.userId === userId)
      );
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return mockData.conversations.filter(conversation =>
        conversation.participants.some(p => p.userId === userId)
      );
    }
  },

  // Busca uma conversa específica por ID
  async getConversation(id: number): Promise<Conversation> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: retornando conversa estática');
        const conversation = mockData.conversations.find(c => c.id === id);
        if (!conversation) {
          throw new Error(`Conversa não encontrada: ${id}`);
        }
        return conversation;
      }

      const response = await axios.get(`${API_URL}/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar conversa ${id}:`, error);
      const conversation = mockData.conversations.find(c => c.id === id);
      if (!conversation) {
        throw new Error(`Conversa não encontrada: ${id}`);
      }
      return conversation;
    }
  },

  // Cria uma nova conversa
  async createConversation(conversation: Conversation): Promise<Conversation> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: simulando criação de conversa');
        
        // Simula um ID para a nova conversa
        const newConversation = {
          ...conversation,
          id: mockData.conversations.length + 1
        };
        
        // Adiciona a conversa ao mockData
        mockData.conversations.push(newConversation);
        
        return newConversation;
      }

      const response = await axios.post(`${API_URL}/conversations`, conversation);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      
      // Fallback para modo offline
      const newConversation = {
        ...conversation,
        id: mockData.conversations.length + 1
      };
      
      mockData.conversations.push(newConversation);
      
      return newConversation;
    }
  },

  // Atualiza uma conversa existente
  async updateConversation(conversation: Conversation): Promise<Conversation> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: simulando atualização de conversa');
        
        const index = mockData.conversations.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
          mockData.conversations[index] = conversation;
        }
        
        return conversation;
      }

      const response = await axios.put(`${API_URL}/conversations/${conversation.id}`, conversation);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      
      // Fallback para modo offline
      const index = mockData.conversations.findIndex(c => c.id === conversation.id);
      if (index >= 0) {
        mockData.conversations[index] = conversation;
      }
      
      return conversation;
    }
  },

  // Busca mensagens por ID da conversa
  async getMessagesByConversationId(conversationId: number): Promise<ChatMessage[]> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: retornando mensagens estáticas');
        return mockData.chatMessages.filter(msg => msg.conversationId === conversationId);
      }

      const response = await axios.get(`${API_URL}/chatMessages?conversationId=${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return mockData.chatMessages.filter(msg => msg.conversationId === conversationId);
    }
  },

  // Envia uma nova mensagem
  async sendMessage(messageData: ChatMessage): Promise<ChatMessage> {
    try {
      // Detecta links na mensagem
      if (messageData.message) {
        messageData.hasLinks = detectLinks(messageData.message);
      }

      if (OFFLINE_MODE) {
        console.log('Modo offline: simulando envio de mensagem');
        
        // Gera um novo ID para a mensagem
        const newId = mockData.chatMessages.length > 0 
          ? Math.max(...mockData.chatMessages.map(msg => msg.id || 0)) + 1 
          : 1;
        
        const newMessage: ChatMessage = {
          ...messageData,
          id: newId,
          timestamp: new Date().toISOString()
        };
        
        // Adiciona a mensagem ao mockData
        mockData.chatMessages.push(newMessage);
        
        // Atualiza a última mensagem da conversa
        const conversationIndex = mockData.conversations.findIndex(c => c.id === messageData.conversationId);
        if (conversationIndex >= 0) {
          mockData.conversations[conversationIndex].lastMessage = messageData.message;
          mockData.conversations[conversationIndex].lastMessageTimestamp = newMessage.timestamp;
        }
        
        return newMessage;
      }

      const response = await axios.post(`${API_URL}/chatMessages`, messageData);
      const message = response.data;

      // Atualiza a conversa com a última mensagem
      const conversation = await this.getConversation(message.conversationId);
      conversation.lastMessage = message.message;
      conversation.lastMessageTimestamp = message.timestamp;
      await this.updateConversation(conversation);

      return message;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Fallback para modo offline
      const newId = mockData.chatMessages.length > 0 
        ? Math.max(...mockData.chatMessages.map(msg => msg.id || 0)) + 1 
        : 1;
      
      const newMessage: ChatMessage = {
        ...messageData,
        id: newId,
        timestamp: new Date().toISOString()
      };
      
      mockData.chatMessages.push(newMessage);
      
      const conversationIndex = mockData.conversations.findIndex(c => c.id === messageData.conversationId);
      if (conversationIndex >= 0) {
        mockData.conversations[conversationIndex].lastMessage = messageData.message;
        mockData.conversations[conversationIndex].lastMessageTimestamp = newMessage.timestamp;
      }
      
      return newMessage;
    }
  },

  // Marca mensagens como lidas
  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    try {
      if (OFFLINE_MODE) {
        console.log('Modo offline: simulando marcar mensagens como lidas');
        
        mockData.chatMessages.forEach((msg, index) => {
          if (msg.conversationId === conversationId && msg.receiverId === userId && !msg.read) {
            mockData.chatMessages[index] = { ...msg, read: true };
          }
        });
        
        return;
      }

      // Busca mensagens não lidas para o usuário
      const response = await axios.get(
        `${API_URL}/chatMessages?conversationId=${conversationId}&receiverId=${userId}&read=false`
      );
      
      const unreadMessages = response.data;
      
      // Marca cada mensagem como lida
      for (const msg of unreadMessages) {
        await axios.patch(`${API_URL}/chatMessages/${msg.id}`, { read: true });
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      
      // Fallback para modo offline
      mockData.chatMessages.forEach((msg, index) => {
        if (msg.conversationId === conversationId && msg.receiverId === userId && !msg.read) {
          mockData.chatMessages[index] = { ...msg, read: true };
        }
      });
    }
  },

  // Simula o upload de um arquivo para anexo
  async uploadFile(file: File): Promise<Attachment> {
    // Simula o processamento e upload do arquivo
    return new Promise(resolve => {
      // Cria um ID único para o arquivo
      const fileId = `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Determina o tipo de miniatura para imagens
      const isThumbnailable = file.type.startsWith('image/');
      
      const attachment: Attachment = {
        id: fileId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: `/uploads/${fileId}-${file.name}`,
        thumbnailUrl: isThumbnailable ? `/uploads/thumbnails/${fileId}-${file.name}` : undefined
      };

      // Simula um delay de processamento
      setTimeout(() => resolve(attachment), 500);
    });
  }
};

// Mantém exportação default para compatibilidade com possíveis imports futuros
export default chatService;
