import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchCourses, deleteCourse } from '../../store/slices/coursesSlice';
import { Course } from '../../types';

const ListaCursos: React.FC = () => {
  const { courses, loading, error } = useAppSelector(
    (state: RootState) => state.courses
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Estado para controle do modal de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  // Estado para controle do modal de matrícula
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [courseToEnroll, setCourseToEnroll] = useState<number | null>(null);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    setCourseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      dispatch(deleteCourse(courseToDelete));
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleEnrollment = (id: number) => {
    setCourseToEnroll(id);
    setEnrollmentOpen(true);
  };

  const confirmEnrollment = () => {
    // Lógica para matricular aluno
    // Será implementada posteriormente quando criarmos o enrollmentSlice
    setEnrollmentOpen(false);
    setStudentId('');
  };

  const theme = useTheme();
  // Verificação responsável se é dispositivo móvel usando o hook useMediaQuery
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Definição das colunas
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, flex: 0.5 },
    { field: 'name', headerName: 'Nome', width: 230, flex: 1 },
    {
      field: 'workload',
      headerName: 'C.H.',
      width: 130,
      flex: 0.7,
      headerAlign: 'center',
      align: 'center',
      description: 'Carga Horária',
    },
    {
      field: 'shifts',
      headerName: 'Turnos',
      width: 200,
      flex: 1,
      renderCell: (params: GridRenderCellParams<Course>) => (
        <Box>
          {params.row.shifts.map((shift: string) => (
            <Chip
              key={shift}
              label={
                shift === 'morning' ? 'M' : shift === 'afternoon' ? 'T' : 'N'
              }
              size="small"
              color="primary"
              variant="outlined"
              style={{ margin: '0 2px' }}
              title={
                shift === 'morning'
                  ? 'Manhã'
                  : shift === 'afternoon'
                  ? 'Tarde'
                  : 'Noite'
              }
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'availableSpots',
      headerName: 'Vagas',
      description: 'Vagas disponíveis / Total de vagas',
      width: 120,
      flex: 0.7,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams<Course>) =>
        `${params.row.availableSpots} / ${params.row.totalSpots}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      flex: 0.7,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams<Course>) => (
        <Chip
          label={params.row.status === 'active' ? 'Ativo' : 'Inativo'}
          color={params.row.status === 'active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 200,
      flex: isMobile ? 1 : 0.8,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams<Course>) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 0.5 : 0,
          }}
        >
          <IconButton
            component={Link}
            to={`/cursos/${params.row.id}`}
            color="primary"
            size="small"
            title="Ver detalhes"
            sx={{ padding: isMobile ? '2px' : 'inherit' }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            component={Link}
            to={`/cursos/editar/${params.row.id}`}
            color="secondary"
            size="small"
            title="Editar curso"
            sx={{ padding: isMobile ? '2px' : 'inherit' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
            title="Excluir curso"
            sx={{ padding: isMobile ? '2px' : 'inherit' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => handleEnrollment(params.row.id)}
            title="Matricular aluno"
            sx={{ padding: isMobile ? '2px' : 'inherit' }}
          >
            <SchoolIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1}
          mb={3}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
          >
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Gerenciamento de Cursos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/cursos/cadastro"
            size={isMobile ? 'small' : 'medium'}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Novo Curso
          </Button>
        </Box>

        {error && (
          <Box my={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box
          sx={{
            height: { xs: 350, sm: 400 },
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <DataGrid
            rows={courses}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
              columns: {
                columnVisibilityModel: {
                  shifts: !isMobile,
                  availableSpots: !isMobile,
                },
              } as any,
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection={!isMobile}
            disableRowSelectionOnClick
            loading={loading}
            sx={{
              '& .MuiDataGrid-cell': {
                padding: { xs: '8px 4px', sm: '16px 8px' },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: (theme) => theme.palette.primary.light,
                color: (theme) => theme.palette.primary.contrastText,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              },
              '& .MuiDataGrid-virtualScroller': {
                minHeight: '200px',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
        sx={{ '& .MuiDialog-paper': { width: { xs: '100%', sm: '80%' } } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Tem certeza que deseja excluir este curso? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            size={isMobile ? 'small' : 'medium'}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            autoFocus
            size={isMobile ? 'small' : 'medium'}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de matrícula */}
      <Dialog
        open={enrollmentOpen}
        onClose={() => setEnrollmentOpen(false)}
        fullWidth
        maxWidth="xs"
        sx={{ '& .MuiDialog-paper': { width: { xs: '100%', sm: '80%' } } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Matricular Aluno
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Informe o ID do aluno para matriculá-lo neste curso.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID do Aluno"
            type="number"
            fullWidth
            variant="outlined"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
              },
              '& .MuiOutlinedInput-input': {
                padding: { xs: '12px 14px', sm: '16.5px 14px' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEnrollmentOpen(false)}
            size={isMobile ? 'small' : 'medium'}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmEnrollment}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          >
            Matricular
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListaCursos;
