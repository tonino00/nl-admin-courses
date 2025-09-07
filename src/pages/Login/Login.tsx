import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigate, Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { loginUser } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { LoginCredentials } from '../../types';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, loading, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  // Removendo o redirecionamento automático que estava causando loops
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Adicionar logs para debug
      console.log('Iniciando processo de login');
      
      const resultAction = await dispatch(loginUser(credentials));
      console.log('Resultado da ação de login:', resultAction);
      
      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login bem-sucedido, redirecionando para /');
        
        // Usar timeout para garantir que o estado seja atualizado antes do redirecionamento
        setTimeout(() => {
          console.log('Executando redirecionamento após timeout');
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error('Falha na autenticação:', error);
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
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sistema de Gestão Acadêmica
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nome de usuário"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
            
            {/* <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Credenciais para teste:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Admin: username: admin / senha: admin123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Professor: username: teacher1 / senha: teacher123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - Aluno: username: student1 / senha: student123
              </Typography>
            </Box> */}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Criar nova conta
                </Typography>
              </Link>
              
              <Link to="/reset-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Esqueci minha senha
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
