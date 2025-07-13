import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  SaveAlt as SaveAltIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTeacherById, updateTeacher } from '../../store/slices/teachersSlice';
import { Teacher, TimeClockRecord } from '../../types';
import { formatDateToBR } from '../../utils/masks';

const RegistroPonto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teacherId = id ? parseInt(id, 10) : 0;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { currentTeacher, loading } = useAppSelector((state) => state.teachers);
  
  const [comment, setComment] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Carregar dados do professor
  useEffect(() => {
    if (teacherId) {
      dispatch(fetchTeacherById(teacherId));
    }
  }, [dispatch, teacherId]);

  // Função para obter a data e hora atual formatada
  const getCurrentDateTime = (): { date: string, time: string } => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return { date, time };
  };
  
  // Verificar se existe um registro para o dia atual sem checkout
  const hasOpenRecord = (): TimeClockRecord | undefined => {
    if (!currentTeacher?.timeClockRecords) return undefined;
    
    const { date } = getCurrentDateTime();
    return currentTeacher.timeClockRecords.find(
      (record) => record.date === date && record.checkOut === null
    );
  };
  
  // Registrar entrada
  const handleCheckIn = async () => {
    if (!currentTeacher) return;
    
    try {
      const { date, time } = getCurrentDateTime();
      
      // Verificar se já existe um registro aberto para hoje
      const openRecord = hasOpenRecord();
      if (openRecord) {
        setErrorMessage('Já existe um registro de entrada para hoje sem saída registrada.');
        return;
      }
      
      // Criar novo registro
      const newRecord: TimeClockRecord = {
        id: Date.now(),  // Usar timestamp como ID
        date: date,
        checkIn: time,
        checkOut: null,
        comments: comment.trim() || undefined
      };
      
      // Adicionar ao array de registros existente ou criar novo array
      const updatedRecords = currentTeacher.timeClockRecords 
        ? [...currentTeacher.timeClockRecords, newRecord]
        : [newRecord];
      
      // Atualizar o professor com o novo registro
      const updatedTeacher: Teacher = {
        ...currentTeacher,
        timeClockRecords: updatedRecords
      };
      
      await dispatch(updateTeacher(updatedTeacher));
      setSuccessMessage('Entrada registrada com sucesso!');
      setComment('');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      setErrorMessage('Erro ao registrar entrada. Tente novamente.');
      console.error('Erro ao registrar entrada:', error);
    }
  };
  
  // Registrar saída
  const handleCheckOut = async () => {
    if (!currentTeacher) return;
    
    try {
      const { time } = getCurrentDateTime();
      
      // Verificar se existe um registro aberto
      const openRecord = hasOpenRecord();
      if (!openRecord) {
        setErrorMessage('Não há registro de entrada aberto para hoje.');
        return;
      }
      
      // Atualizar registro existente com horário de saída e comentários adicionais
      const updatedRecords = currentTeacher.timeClockRecords!.map(record => {
        if (record.id === openRecord.id) {
          return {
            ...record,
            checkOut: time,
            comments: comment.trim() ? 
              (record.comments ? `${record.comments}; ${comment}` : comment) : 
              record.comments
          };
        }
        return record;
      });
      
      // Atualizar o professor com o registro atualizado
      const updatedTeacher: Teacher = {
        ...currentTeacher,
        timeClockRecords: updatedRecords
      };
      
      await dispatch(updateTeacher(updatedTeacher));
      setSuccessMessage('Saída registrada com sucesso!');
      setComment('');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      setErrorMessage('Erro ao registrar saída. Tente novamente.');
      console.error('Erro ao registrar saída:', error);
    }
  };
  
  // Calcular a duração entre entrada e saída
  const calculateDuration = (checkIn: string, checkOut: string | null): string => {
    if (!checkOut) return 'Em andamento';
    
    const [inHours, inMinutes] = checkIn.split(':').map(Number);
    const [outHours, outMinutes] = checkOut.split(':').map(Number);
    
    let minutes = outMinutes - inMinutes;
    let hours = outHours - inHours;
    
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    return `${hours}h ${minutes}min`;
  };
  
  if (loading || !currentTeacher) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  const openRecord = hasOpenRecord();
  const todayRecords = currentTeacher.timeClockRecords?.filter(
    record => record.date === getCurrentDateTime().date
  ) || [];
  
  const pastRecords = currentTeacher.timeClockRecords?.filter(
    record => record.date !== getCurrentDateTime().date
  ) || [];
  
  // Ordenar registros por data, do mais recente para o mais antigo
  pastRecords.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: isMobile ? 1 : 2 }}>
      <Box display="flex" alignItems="center" mb={3} flexDirection={isMobile ? 'column' : 'row'}>
        <Box display="flex" alignItems="center" mb={isMobile ? 1 : 0}>
          <IconButton color="primary" onClick={() => navigate(`/professores/${teacherId}`)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <PersonIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant={isMobile ? 'h6' : 'h5'} component="h1">
            {currentTeacher.fullName}
          </Typography>
        </Box>
        <Box sx={{ ml: isMobile ? 0 : 'auto', mt: isMobile ? 1 : 0, display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Registro de Ponto
          </Typography>
        </Box>
      </Box>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Registro de Ponto - Hoje ({formatDateToBR(getCurrentDateTime().date)})
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Comentários (opcional)"
              fullWidth
              multiline
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adicione informações relevantes sobre o registro de ponto..."
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={<CheckCircleIcon />}
              onClick={handleCheckIn}
              disabled={!!openRecord}
            >
              Registrar Entrada
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<SaveAltIcon />}
              onClick={handleCheckOut}
              disabled={!openRecord}
            >
              Registrar Saída
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {todayRecords.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <HistoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Registros de Hoje
            </Typography>
          </Box>
          
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Entrada</TableCell>
                  <TableCell>Saída</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Comentários</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>
                      {record.checkOut || (
                        <Chip label="Em andamento" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {calculateDuration(record.checkIn, record.checkOut)}
                    </TableCell>
                    <TableCell>
                      {record.comments || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {pastRecords.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <HistoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Histórico de Registros
            </Typography>
          </Box>
          
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Entrada</TableCell>
                  <TableCell>Saída</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Comentários</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDateToBR(record.date)}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>
                      {record.checkOut || (
                        <Chip label="Sem registro" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {calculateDuration(record.checkIn, record.checkOut)}
                    </TableCell>
                    <TableCell>
                      {record.comments || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default RegistroPonto;
