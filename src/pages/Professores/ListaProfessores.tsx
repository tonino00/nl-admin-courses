import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchTeachers, deleteTeacher } from '../../store/slices/teachersSlice';
import { Teacher } from '../../types';

const ListaProfessores: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { teachers, loading } = useSelector((state: RootState) => state.teachers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  
  useEffect(() => {
    dispatch(fetchTeachers());
  }, [dispatch]);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = teachers.filter(
        (teacher: Teacher) =>
          teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (teacher.specializations && 
            teacher.specializations.some((spec: string) => 
              spec.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [teachers, searchTerm]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleAddTeacher = () => {
    navigate('/professores/cadastro');
  };
  
  const handleEditTeacher = (id: number) => {
    navigate(`/professores/editar/${id}`);
  };
  
  const handleViewTeacher = (id: number) => {
    navigate(`/professores/${id}`);
  };
  
  const handleDeleteClick = (id: number) => {
    setTeacherToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (teacherToDelete) {
      await dispatch(deleteTeacher(teacherToDelete));
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };
  
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'Nome Completo', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Telefone', width: 150 },
    {
      field: 'specializations',
      headerName: 'Especializações',
      width: 300,
      renderCell: (params: GridRenderCellParams) => {
        const renderSpecializations = (teacher: Teacher) => {
          if (!teacher.specializations || teacher.specializations.length === 0) {
            return <Chip label="Sem especialização" size="small" color="default" />;
          }

          return teacher.specializations.map((spec: string) => (
            <Chip 
              key={spec} 
              label={spec} 
              size="small" 
              color="primary" 
              sx={{ marginRight: 0.5, marginBottom: 0.5 }} 
            />
          ));
        };

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {renderSpecializations(params.row as Teacher)}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={params.value === 'active' ? <ActiveIcon /> : <InactiveIcon />}
          label={params.value === 'active' ? 'Ativo' : 'Inativo'}
          color={params.value === 'active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewTeacher(params.row.id)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleEditTeacher(params.row.id)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Professores</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTeacher}
        >
          Novo Professor
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, email ou especialização..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ height: 400, width: '100%' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={filteredTeachers}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaProfessores;
