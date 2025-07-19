import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = (): void => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Verificar se é um erro de carregamento de chunk
      const isChunkLoadError = 
        this.state.error?.name === 'ChunkLoadError' || 
        (this.state.error?.message && this.state.error.message.includes('Loading chunk'));

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}
        >
          <ReportProblemIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            {isChunkLoadError 
              ? 'Erro ao carregar componente' 
              : 'Ocorreu um erro'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
            {isChunkLoadError
              ? 'Ocorreu um problema ao carregar esta parte da aplicação. Isso pode ser devido a problemas de rede ou cache do navegador.'
              : this.state.error?.message || 'Um erro inesperado ocorreu na aplicação.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRetry}
          >
            Tentar Novamente
          </Button>
          {isChunkLoadError && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.875rem' }}>
              Se o problema persistir, tente limpar o cache do navegador ou recarregar a página.
            </Typography>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
