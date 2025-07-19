import React, { useEffect, useState, memo, useCallback, useMemo } from 'react';
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

// Componente de célula para especializações memoizado
interface SpecializationCellProps {
  teacher: Teacher;
}

const SpecializationCell = memo(({ teacher }: SpecializationCellProps) => {
  const renderSpecializations = () => {
    if (!teacher.specializations || teacher.specializations.length === 0) {
      return <Chip label="Sem especialização" size="small" color="default" />;
    }

    return teacher.specializations.map((spec: string) => {
      // Criar o objeto props sem a key para evitar o warning
      const chipProps = {
        label: spec,
        size: "small" as const,
        color: "primary" as const,
        sx: { marginRight: 0.5, marginBottom: 0.5 }
      };
      
      // Passar a key separadamente e espalhar o resto das props
      return <Chip key={spec} {...chipProps} />;
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {renderSpecializations()}
    </Box>
  );
});

// Componente de célula para status memoizado
interface StatusCellProps {
  value: string;
}

const StatusCell = memo(({ value }: StatusCellProps) => {
  return (
    <Chip
      icon={value === 'active' ? <ActiveIcon /> : <InactiveIcon />}
      label={value === 'active' ? 'Ativo' : 'Inativo'}
      color={value === 'active' ? 'success' : 'error'}
      size="small"
    />
  );
});

// Componente de célula para ações memoizado
interface ActionsCellProps {
  id: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ActionsCell = memo(({ id, onView, onEdit, onDelete }: ActionsCellProps) => {
  const handleView = useCallback(() => onView(id), [id, onView]);
  const handleEdit = useCallback(() => onEdit(id), [id, onEdit]);
  const handleDelete = useCallback(() => onDelete(id), [id, onDelete]);
  
  return (
    <Box>
      <Tooltip title="Visualizar">
        <IconButton
          size="small"
          color="primary"
          onClick={handleView}
        >
          <ViewIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Editar">
        <IconButton
          size="small"
          color="secondary"
          onClick={handleEdit}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Excluir">
        <IconButton
          size="small"
          color="error"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

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
  
  // Memoizar a lógica de filtragem para melhor desempenho
  useEffect(() => {
    // Usar uma função memoizada para filtragem
    const filterTeachers = () => {
      if (searchTerm) {
        return teachers.filter(
          (teacher: Teacher) =>
            teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (teacher.specializations && 
              teacher.specializations.some((spec: string) => 
                spec.toLowerCase().includes(searchTerm.toLowerCase())
              ))
        );
      } else {
        return teachers;
      }
    };
    
    // Aplicar filtragem apenas se os dados ou termo de busca mudarem
    setFilteredTeachers(filterTeachers());
  }, [teachers, searchTerm]);
  
  // Memoizar callbacks para evitar recriá-los a cada renderização
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);
  
  const handleAddTeacher = useCallback(() => {
    navigate('/professores/cadastro');
  }, [navigate]);
  
  const handleEditTeacher = useCallback((id: number) => {
    navigate(`/professores/editar/${id}`);
  }, [navigate]);
  
  const handleViewTeacher = useCallback((id: number) => {
    navigate(`/professores/${id}`);
  }, [navigate]);
  
  const handleDeleteClick = useCallback((id: number) => {
    setTeacherToDelete(id);
    setDeleteDialogOpen(true);
  }, []);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (teacherToDelete) {
      await dispatch(deleteTeacher(teacherToDelete));
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  }, [teacherToDelete, dispatch]);
  
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  }, []);
  
  // Memoizar as colunas para evitar recriá-las a cada renderização
  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'Nome Completo', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Telefone', width: 150 },
    {
      field: 'specializations',
      headerName: 'Especializações',
      width: 300,
      renderCell: (params: GridRenderCellParams) => {
        return <SpecializationCell teacher={params.row as Teacher} />;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <StatusCell value={params.value as string} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <ActionsCell 
          id={params.row.id} 
          onView={handleViewTeacher} 
          onEdit={handleEditTeacher} 
          onDelete={handleDeleteClick} 
        />
      ),
    },
  ], [handleViewTeacher, handleEditTeacher, handleDeleteClick]);
  
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
