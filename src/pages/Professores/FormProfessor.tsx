import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Chip,
  Stack,
  OutlinedInput,
} from '@mui/material';
// Removido DatePicker devido a problemas de compatibilidade
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { RootState } from '../../store';
import {
  fetchTeacherById,
  createTeacher,
  updateTeacher,
  clearCurrentTeacher,
} from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { Teacher, Address } from '../../types';

// Validação com Yup
const schema = yup.object().shape({
  fullName: yup.string().required('Nome completo é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato de CPF inválido (000.000.000-00)'),
  birthDate: yup.string().required('Data de nascimento é obrigatória'),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      'Formato de telefone inválido ((00) 00000-0000)'
    ),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  status: yup.string().oneOf(['active', 'inactive']).required('Status é obrigatório'),
  bio: yup.string().required('Biografia é obrigatória'),
  education: yup.string().required('Formação acadêmica é obrigatória'),
  specializations: yup.array().of(yup.string()),
  address: yup.object().shape({
    street: yup.string().required('Rua é obrigatória'),
    number: yup.string().required('Número é obrigatório'),
    complement: yup.string(),
    district: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
    zipCode: yup
      .string()
      .required('CEP é obrigatório')
      .matches(/^\d{5}-\d{3}$/, 'Formato de CEP inválido (00000-000)'),
  }),
});

// Define explicitamente todos os campos para evitar problemas de tipagem
interface TeacherFormData {
  fullName: string;
  cpf: string;
  birthDate: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  bio: string;
  education: string;
  specializations: string[];
  status: 'active' | 'inactive';
  // Campos opcionais
  id?: number;
  rg?: string;
  documents?: Document[];
}

const initialFormState = {
  fullName: '',
  cpf: '',
  birthDate: '',
  address: {
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    zipCode: '',
  },
  phone: '',
  email: '',
  bio: '',
  education: '',
  specializations: [] as string[],
  status: 'active' as const,
};

// Áreas de especialização comuns para professores
const availableSpecializations = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Física',
  'Química',
  'Biologia',
  'Educação Física',
  'Inglês',
  'Espanhol',
  'Artes',
  'Música',
  'Filosofia',
  'Sociologia',
  'Programação',
  'Desenvolvimento Web',
  'Banco de Dados',
  'UX/UI Design',
  'Marketing Digital',
  'Gestão de Projetos',
];

const FormProfessor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentTeacher, loading, error } = useSelector(
    (state: RootState) => state.teachers
  );
  const { courses } = useSelector(
    (state: RootState) => state.courses
  );
  
  const [newSpecialization, setNewSpecialization] = useState('');
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    register,
  } = useForm<TeacherFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialFormState as TeacherFormData,
    // Registrar campos que podem não estar no schema
    shouldUnregister: false,
  });
  
  // Registrar o campo specializations explicitamente
  register('specializations');
  register('address.complement');
  
  const watchSpecializations = watch('specializations') as string[] || [];
  
  // Buscar dados do professor para edição
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchTeacherById(Number(id)));
    }
    
    dispatch(fetchCourses());
    
    return () => {
      dispatch(clearCurrentTeacher());
    };
  }, [dispatch, id, isEditMode]);
  
  // Preencher formulário com dados do professor em modo de edição
  useEffect(() => {
    if (isEditMode && currentTeacher) {
      // Reset form with current teacher data
      const formData: TeacherFormData = {
        fullName: currentTeacher.fullName,
        cpf: currentTeacher.cpf,
        birthDate: currentTeacher.birthDate,
        address: currentTeacher.address,
        phone: currentTeacher.phone,
        email: currentTeacher.email,
        bio: currentTeacher.bio,
        education: currentTeacher.education,
        specializations: currentTeacher.specializations || [],
        status: currentTeacher.status,
      };
      
      reset(formData);
    }
  }, [currentTeacher, isEditMode, reset]);
  
  // Adicionar nova especialização
  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      const currentSpecializations = (watchSpecializations || []) as string[];
      if (!currentSpecializations.includes(newSpecialization)) {
        setValue('specializations', [...currentSpecializations, newSpecialization] as any);
      }
      setNewSpecialization('');
    }
  };
  
  // Remover especialização
  const handleRemoveSpecialization = (specializationToDelete: string) => {
    const currentSpecializations = (watchSpecializations || []) as string[];
    setValue(
      'specializations' as any,
      currentSpecializations.filter((spec) => spec !== specializationToDelete) as any
    );
  };
  
  // Submeter formulário
  const onSubmit = async (data: TeacherFormData) => {
    try {
      if (isEditMode && currentTeacher) {
        // Update existing teacher
        const updatedTeacher: Teacher = {
          ...currentTeacher,
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: data.birthDate,
          address: data.address,
          phone: data.phone,
          email: data.email,
          bio: data.bio,
          education: data.education,
          specializations: data.specializations || [],
          status: data.status,
          // Manter os valores existentes para campos que não estão no formulário
          rg: currentTeacher.rg,
          documents: currentTeacher.documents
        };
        
        await dispatch(updateTeacher(updatedTeacher));
      } else {
        // Create new teacher
        const newTeacher: Omit<Teacher, 'id'> = {
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: data.birthDate,
          address: data.address,
          phone: data.phone,
          email: data.email,
          bio: data.bio,
          education: data.education,
          specializations: data.specializations || [],
          status: data.status,
          // Valores padrão para campos obrigatórios não incluídos no formulário
          rg: '',
          documents: [],
          courses: []
        };
        
        await dispatch(createTeacher(newTeacher));
      }
      
      navigate('/professores');
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
    }
  };
  
  const handleCancel = () => {
    navigate('/professores');
  };
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton color="primary" onClick={() => navigate('/professores')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Editar Professor' : 'Novo Professor'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit as any)}>
            <Grid container spacing={3}>
              {/* Dados Pessoais */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Dados Pessoais
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      variant="outlined"
                      fullWidth
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="CPF"
                      variant="outlined"
                      fullWidth
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      type="date"
                      fullWidth
                      label="Data de Nascimento"
                      margin="normal"
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="active">Ativo</MenuItem>
                        <MenuItem value="inactive">Inativo</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              {/* Endereço */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Endereço
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Rua"
                      fullWidth
                      error={!!errors.address?.street}
                      helperText={errors.address?.street?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Controller
                  name="address.number"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      error={!!errors.address?.number}
                      helperText={errors.address?.number?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name={"address.complement" as any}
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Complemento"
                      fullWidth
                      value={field.value || ''}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.district"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Bairro"
                      fullWidth
                      error={!!errors.address?.district}
                      helperText={errors.address?.district?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Cidade"
                      fullWidth
                      error={!!errors.address?.city}
                      helperText={errors.address?.city?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Estado"
                      fullWidth
                      error={!!errors.address?.state}
                      helperText={errors.address?.state?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Controller
                  name="address.zipCode"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      placeholder="00000-000"
                      fullWidth
                      error={!!errors.address?.zipCode}
                      helperText={errors.address?.zipCode?.message}
                    />
                  )}
                />
              </Grid>
              
              {/* Informações Profissionais */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informações Profissionais
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="education"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Formação Acadêmica"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.education}
                      helperText={errors.education?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Biografia"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Especializações
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2} gap={1}>
                  <FormControl sx={{ flexGrow: 1 }}>
                    <InputLabel>Adicionar Especialização</InputLabel>
                    <Select
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      input={<OutlinedInput label="Adicionar Especialização" />}
                    >
                      {availableSpecializations.map((spec: string) => (
                        <MenuItem 
                          key={spec} 
                          value={spec}
                          disabled={watchSpecializations?.includes(spec)}
                        >
                          {spec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSpecialization}
                    disabled={!newSpecialization}
                  >
                    Adicionar
                  </Button>
                </Box>
                
                <Stack 
                  direction="row" 
                  spacing={1} 
                  sx={{ flexWrap: 'wrap', gap: 1, display: 'flex' }}
                >
                  {Array.isArray(watchSpecializations) && watchSpecializations.map((spec, index) => {
                    const specStr = typeof spec === 'string' ? spec : `Especialização ${index + 1}`;
                    return (
                      <Chip
                        key={`spec-${index}`}
                        label={specStr}
                        onDelete={() => handleRemoveSpecialization(specStr)}
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </Stack>
              </Grid>
              
              {/* Buttons */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default FormProfessor;
