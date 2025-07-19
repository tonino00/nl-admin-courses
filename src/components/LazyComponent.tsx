import React, { ReactNode, Suspense, useState, useCallback } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { CircularProgress, Box } from '@mui/material';

interface LazyComponentProps {
  children: ReactNode;
}

// Componente de loading para o Suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

/**
 * Componente que combina ErrorBoundary e Suspense para carregar componentes lazy de forma segura
 */
const LazyComponent: React.FC<LazyComponentProps> = ({ children }) => {
  const [key, setKey] = useState(0);

  // Função para tentar carregar novamente quando ocorrer um erro
  const handleRetry = useCallback(() => {
    // Regenerar a key para forçar o React a recriar o componente
    setKey(prevKey => prevKey + 1);

    // Opcionalmente, limpar o cache do navegador relacionado a chunks
    // Isso pode ajudar quando temos problemas com versões antigas de chunks
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('webpack') || cacheName.includes('chunk')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }, []);

  return (
    <ErrorBoundary key={key} onRetry={handleRetry}>
      <Suspense fallback={<LoadingComponent />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyComponent;
