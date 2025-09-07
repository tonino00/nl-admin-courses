import { Middleware } from '@reduxjs/toolkit';

// Interface para armazenar informações sobre as chamadas à API
interface ApiCallRecord {
  timestamp: number;
  inProgress: boolean;
}

// Cache para armazenar chamadas recentes à API
const apiCallsCache: Record<string, ApiCallRecord> = {};

// Tempo mínimo entre chamadas para a mesma URL (em milissegundos)
const DEBOUNCE_TIME = 5000; // 5 segundos para garantir que previna chamadas duplas mesmo com lag

// Função para extrair a URL da ação
const extractUrlFromAction = (action: any): string | null => {
  // Log para depuração
  console.log(`[ApiCallsMiddleware] Verificando ação: ${action.type}`);
  
  // Para thunks criados com createAsyncThunk
  if (action.type && action.type.endsWith('/pending')) {
    const baseType = action.type.replace('/pending', '');
    
    // Mapear tipos de ação para endpoints da API - usando os nomes exatos dos slices
    if (baseType === 'students/fetchAll') return '/api/alunos';
    if (baseType === 'courses/fetchAll') return '/api/cursos';
    if (baseType === 'teachers/fetchAll') return '/api/professores';
    if (baseType === 'enrollments/fetchAll') return '/api/matriculas';
    
    // Nomes alternativos que podem existir no código
    if (baseType.includes('students') && baseType.includes('fetch')) return '/api/alunos';
    if (baseType.includes('courses') && baseType.includes('fetch')) return '/api/cursos';
    if (baseType.includes('teachers') && baseType.includes('fetch')) return '/api/professores';
    if (baseType.includes('enrollments') && baseType.includes('fetch')) return '/api/matriculas';
    
    console.log(`[ApiCallsMiddleware] Mapeando ação ${baseType}`);
  }
  
  return null;
};

// Middleware para evitar chamadas duplicadas à API
export const apiCallsMiddleware: Middleware = ({ dispatch }) => (next) => (action) => {
  // Processar apenas ações 'pending' de thunks
  if (action.type && action.type.endsWith('/pending')) {
    const apiUrl = extractUrlFromAction(action);
    
    if (apiUrl) {
      const now = Date.now();
      const lastCall = apiCallsCache[apiUrl];
      
      // Verificar se esta API foi chamada recentemente ou está em andamento
      if (lastCall) {
        const timeSinceLastCall = now - lastCall.timestamp;
        
        // Se a API foi chamada recentemente ou ainda está em andamento, ignorar esta chamada
        if (timeSinceLastCall < DEBOUNCE_TIME || lastCall.inProgress) {
          console.log(`Ignorando chamada duplicada para ${apiUrl}`);
          return; // Não propagar a ação
        }
      }
      
      // Registrar a chamada em andamento
      apiCallsCache[apiUrl] = { timestamp: now, inProgress: true };
      
      // Interceptar ações 'fulfilled' e 'rejected' para atualizar o estado de progresso
      const baseType = action.type.replace('/pending', '');
      
      // Wrapper para atualizar o cache após a conclusão da chamada
      const handleCompletion = (result: any) => {
        if (apiUrl) {
          apiCallsCache[apiUrl] = { ...apiCallsCache[apiUrl], inProgress: false };
        }
        return result;
      };
      
      // Observar as ações de conclusão para esta chamada
      const originalPromise = action.payload;
      if (originalPromise && typeof originalPromise.then === 'function') {
        action.payload = originalPromise
          .then((result: any) => {
            handleCompletion(result);
            return result;
          })
          .catch((error: any) => {
            handleCompletion(error);
            throw error;
          });
      }
    }
  }
  
  return next(action);
};
