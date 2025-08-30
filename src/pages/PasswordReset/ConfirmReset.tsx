import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
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
import { LockOutlined } from '@mui/icons-material';
import { PasswordResetConfirm } from '../../services/auth';
import { useAppDispatch } from '../../hooks';
import { confirmPasswordReset } from '../../store/slices/authSlice';

const ConfirmReset: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useParams<{ token: string }>();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!token) {
      setError('Token de redefinição de senha inválido ou ausente');
    }
  }, [token]);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.newPassword) errors.newPassword = 'Nova senha é obrigatória';
    if (formData.newPassword.length < 6) errors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirme sua nova senha';
    if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const resetData: PasswordResetConfirm = {
        token,
        newPassword: formData.newPassword,
      };
      
      // Usa o thunk do Redux para confirmar a nova senha
      const result = await dispatch(confirmPasswordReset(resetData));
      
      if (confirmPasswordReset.fulfilled.match(result)) {
        setSuccess(true);
        
        // Redirecionar para a página de login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (confirmPasswordReset.rejected.match(result)) {
        // Tratar erro retornado pelo Redux
        const errorMessage = result.payload as string;
        setError(errorMessage || 'Ocorreu um erro ao redefinir a senha');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao redefinir a senha');
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
          <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Redefinir Senha
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Senha redefinida com sucesso! Você será redirecionado para a página de login.
            </Alert>
          )}
          
          {!success && token && (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Nova senha"
                type="password"
                id="newPassword"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.newPassword}
                helperText={formErrors.newPassword}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar nova senha"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirmar Nova Senha'}
              </Button>
            </Box>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Voltar para o login
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ConfirmReset;
