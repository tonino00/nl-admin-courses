import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { PasswordResetRequest } from '../../services/auth';
import { useAppDispatch } from '../../hooks';
import { requestPasswordReset } from '../../store/slices/authSlice';

const RequestReset: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const validateEmail = () => {
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError(null);
    return true;
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Usa o thunk do Redux para solicitar recuperação de senha
      const result = await dispatch(requestPasswordReset({ email }));
      
      if (requestPasswordReset.fulfilled.match(result)) {
        setSuccess(true);
        setEmail(''); // Limpa o email após sucesso
      } else if (requestPasswordReset.rejected.match(result)) {
        // Tratar erro retornado pelo Redux
        const errorMessage = result.payload as string;
        setError(errorMessage || 'Ocorreu um erro ao solicitar a redefinição de senha');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao solicitar a redefinição de senha');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'warning.main' }}>
            <LockReset />
          </Avatar>
          <Typography component="h1" variant="h5">
            Recuperar Senha
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Um email foi enviado com instruções para redefinir sua senha. Por favor, verifique sua caixa de entrada.
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Insira seu email cadastrado para receber um link de redefinição de senha.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              disabled={loading || success}
              error={!!emailError}
              helperText={emailError}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="warning"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Recuperar Senha'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                  Voltar para o login
                </Typography>
              </Link>
              
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Criar nova conta
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RequestReset;
