import React, { useState } from 'react';
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
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { RegisterCredentials } from '../../services/auth';
import { useAppDispatch } from '../../hooks';
import { registerUser } from '../../store/slices/authSlice';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    password: '',
    name: '',
    role: 'student', // Valor padrão
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) errors.username = 'Nome de usuário é obrigatório';
    if (formData.username.length < 4) errors.username = 'Nome de usuário deve ter pelo menos 4 caracteres';
    
    if (!formData.password) errors.password = 'Senha é obrigatória';
    if (formData.password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres';
    
    if (!confirmPassword) errors.confirmPassword = 'Confirme sua senha';
    if (formData.password !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem';
    
    if (!formData.name) errors.name = 'Nome é obrigatório';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Usa o thunk do Redux para registro e login automático
      const registerResult = await dispatch(registerUser(formData));
      
      if (registerUser.fulfilled.match(registerResult)) {
        // Registro e login bem-sucedidos
        navigate('/');
      } else if (registerUser.rejected.match(registerResult)) {
        // Tratar erro retornado pelo Redux
        const errorMessage = registerResult.payload as string;
        setError(errorMessage || 'Ocorreu um erro durante o registro');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro durante o registro');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 4,
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Criar Nova Conta
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
              value={formData.username}
              onChange={handleTextFieldChange}
              disabled={loading}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleTextFieldChange}
              disabled={loading}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Tipo de conta</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Tipo de conta"
                onChange={handleSelectChange}
                disabled={loading}
              >
                <MenuItem value="student">Aluno</MenuItem>
                <MenuItem value="teacher">Professor</MenuItem>
              </Select>
              <FormHelperText>
                Selecione o tipo de conta que deseja criar
              </FormHelperText>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleTextFieldChange}
              disabled={loading}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={loading}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Criar Conta'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Já possui uma conta? Faça login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
