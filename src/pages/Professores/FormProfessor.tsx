import React, { useState, useEffect, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import {
  maskCEP,
  maskCPF,
  maskPhone,
  formatDateToBR,
  parseDateFromBR,
  maskDate,
  validateCPF,
  validateEmail,
} from '../../utils/masks';
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
// Removemos completamente o yup para evitar problemas de tipagem
import { RootState } from '../../store';
import {
  fetchTeacherById,
  createTeacher,
  updateTeacher,
  clearCurrentTeacher,
} from '../../store/slices/teachersSlice';
import { fetchCourses } from '../../store/slices/coursesSlice';
import { Teacher, Address } from '../../types';

// Removemos completamente os esquemas Yup para evitar erros de tipagem
// A validação agora é realizada diretamente pelo react-hook-form

// Define explicitamente todos os campos para evitar problemas de tipagem
interface TeacherFormData {
  fullName: string;
  cpf: string;
  birthDate: string;
  address: Address;
  phone: string;
  email: string;
  bio: string;
  education: string;
  specializations: string[];
  status: 'active' | 'inactive';
  type: 'volunteer' | 'employee';
  // Campos opcionais
  id?: number;
  rg?: string;
  documents?: Document[];
}

const initialFormState: TeacherFormData = {
  fullName: '',
  cpf: '',
  birthDate: '',
  type: 'volunteer',
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
  // const { courses } = useSelector((state: RootState) => state.courses);

  const [newSpecialization, setNewSpecialization] = useState('');

  // Usando useForm sem o resolver, com validação manual para evitar problemas de tipagem
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    register,
    getValues,
  } = useForm({
    defaultValues: initialFormState as any,
    shouldUnregister: false,
    mode: 'onBlur',
  });
  
  // Helper function to safely get nested error messages
  const getNestedErrorMessage = (obj: any, path: string) => {
    if (!obj) return '';
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return '';
      }
      current = current[part];
    }
    
    return current?.message || '';
  };
  
  // Helper function to check if a nested field has error
  const hasNestedError = (obj: any, path: string) => {
    if (!obj) return false;
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
    }
    
    return !!current;
  };

  // Configurando validações manuais para os campos do formulário
  useEffect(() => {
    // Nome completo
    register('fullName' as const, {
      required: 'Nome completo é obrigatório',
    });

    // CPF
    register('cpf' as const, {
      required: 'CPF é obrigatório',
      validate: (value) => validateCPF(value) || 'CPF inválido',
    });

    // Data de nascimento
    register('birthDate' as const, {
      required: 'Data de nascimento é obrigatória',
    });

    // Telefone
    register('phone' as const, {
      required: 'Telefone é obrigatório',
      pattern: {
        value: /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/,
        message: 'Formato de telefone inválido ((00) 0 0000-0000)',
      },
    });

    // Email
    register('email' as const, {
      required: 'Email é obrigatório',
      validate: (value) => validateEmail(value) || 'Email inválido',
    });

    // Demais campos principais
    register('status' as const, { required: 'Status é obrigatório' });
    register('type' as const, { required: 'Tipo do professor é obrigatório' });
    register('education' as const, { required: 'Formação acadêmica é obrigatória' });
    register('specializations' as const, {
      required: 'Especializações são obrigatórias',
    });

    // Campos do endereço
    register('address.street' as const, { required: 'Rua é obrigatória' });
    register('address.number' as const, { required: 'Número é obrigatório' });
    register('address.district' as const, { required: 'Bairro é obrigatório' });
    register('address.city' as const, { required: 'Cidade é obrigatória' });
    register('address.state' as const, { required: 'Estado é obrigatório' });
    register('address.zipCode' as const, {
      required: 'CEP é obrigatório',
      pattern: {
        value: /^\d{5}-\d{3}$/,
        message: 'Formato de CEP inválido (00000-000)',
      },
    });
  }, [register]);

  // Usando useState para rastrear especializações em vez de watch
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Atualiza o estado local quando o formulário é resetado
  useEffect(() => {
    if (isEditMode && currentTeacher?.specializations) {
      setSpecializations(currentTeacher.specializations);
    }
  }, [currentTeacher, isEditMode]);

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
        address: {
          ...currentTeacher.address,
          // Garantir que complement seja string vazia se for undefined
          complement: currentTeacher.address.complement || '',
        },
        phone: currentTeacher.phone,
        email: currentTeacher.email,
        bio: currentTeacher.bio,
        education: currentTeacher.education,
        specializations: currentTeacher.specializations || [],
        status: currentTeacher.status,
        type: currentTeacher.type || 'employee',
      };

      reset(formData);
    }
  }, [currentTeacher, isEditMode, reset]);

  // Atualizamos o estado inicial de especializações quando o formulário é carregado
  useEffect(() => {
    if (getValues) {
      // @ts-ignore - Ignorando verificação de tipagem
      const formSpecializations = getValues('specializations');
      if (Array.isArray(formSpecializations)) {
        setSpecializations(formSpecializations);
      }
    }
  }, [getValues]);

  // Adicionar nova especialização - versão extremamente simplificada
  const handleAddSpecialization = () => {
    if (!newSpecialization.trim()) {
      return;
    }

    if (!specializations.includes(newSpecialization)) {
      // Criando um novo array para evitar problemas de referência
      const updatedSpecs = [...specializations, newSpecialization];

      // Atualizar o estado local
      setSpecializations(updatedSpecs);

      // Atualizar o formulário usando uma função simples sem tipagem
      document
        .getElementById('specField')
        ?.setAttribute('data-specs', JSON.stringify(updatedSpecs));

      // Forçar atualização do valor no formulário sem usar setValue diretamente
      // para evitar problemas de tipagem
      setTimeout(() => {
        // @ts-ignore - Ignorando verificação de tipagem
        setValue('specializations', updatedSpecs, { shouldValidate: false });
      }, 0);
    }
    setNewSpecialization('');
  };

  // Remover especialização - versão extremamente simplificada
  const handleRemoveSpecialization = (specializationToDelete: string) => {
    // Filtrar o array para remover a especialização
    const updatedSpecs = specializations.filter(
      (spec) => spec !== specializationToDelete
    );

    // Atualizar o estado local
    setSpecializations(updatedSpecs);

    // Atualizar o formulário usando uma função simples sem tipagem
    document
      .getElementById('specField')
      ?.setAttribute('data-specs', JSON.stringify(updatedSpecs));

    // Forçar atualização do valor no formulário sem usar setValue diretamente
    // para evitar problemas de tipagem
    setTimeout(() => {
      // @ts-ignore - Ignorando verificação de tipagem
      setValue('specializations', updatedSpecs, { shouldValidate: false });
    }, 0);
  };

  // Buscar dados de endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remover caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        // Usar a abordagem alternativa para contornar problemas de tipagem
        // Cria um objeto com os valores do endereço
        const addressUpdate = {
          'address.street': data.logradouro,
          'address.district': data.bairro,
          'address.city': data.localidade,
          'address.state': data.uf,
        };

        // Atualiza cada campo do endereço
        for (const [key, value] of Object.entries(addressUpdate)) {
          // @ts-ignore - Ignorando verificação de tipagem para resolver o problema
          setValue(key, value);
        }

        // Focar no campo de número após preencher os dados
        setTimeout(() => {
          const numberField = document.querySelector(
            'input[name="address.number"]'
          ) as HTMLInputElement;
          if (numberField) numberField.focus();
        }, 0);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Submeter formulário
  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && currentTeacher) {
        // Update existing teacher
        const updatedTeacher: Teacher = {
          id: currentTeacher.id,
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: data.birthDate,
          address: {
            ...data.address,
            // Garantir que o complement seja um tipo válido para Address
            complement: data.address.complement || undefined,
          },
          phone: data.phone,
          email: data.email,
          bio: data.bio,
          education: data.education,
          specializations: data.specializations || [],
          status: data.status,
          type: data.type,
          // Manter os valores existentes para campos que não estão no formulário
          rg: currentTeacher.rg,
          documents: currentTeacher.documents,
          courses: currentTeacher.courses || [],
        };

        await dispatch(updateTeacher(updatedTeacher));
      } else {
        // Create new teacher
        const newTeacher: Omit<Teacher, 'id'> = {
          fullName: data.fullName,
          cpf: data.cpf,
          birthDate: data.birthDate,
          address: {
            ...data.address,
            // Garantir que o complement seja um tipo válido para Address
            complement: data.address.complement || undefined,
          },
          phone: data.phone,
          email: data.email,
          bio: data.bio,
          education: data.education,
          specializations: data.specializations || [],
          status: data.status,
          type: data.type,
          // Valores padrão para campos obrigatórios não incluídos no formulário
          rg: '',
          courses: [],
          documents: [],
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
        <IconButton
          color="primary"
          onClick={() => navigate('/professores')}
          sx={{ mr: 1 }}
        >
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
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
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
                      helperText={errors.fullName?.message as string}
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
                      required
                      error={
                        !!errors.cpf ||
                        (field.value && !validateCPF(field.value))
                      }
                      helperText={
                        errors.cpf?.message ||
                        (field.value && !validateCPF(field.value)
                          ? 'CPF inválido'
                          : '')
                      }
                      margin="normal"
                      placeholder="000.000.000-00"
                      onChange={(e) => {
                        const maskedValue = maskCPF(e.target.value);
                        field.onChange(maskedValue);
                      }}
                      inputProps={{ maxLength: 14 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      fullWidth
                      label="Data de Nascimento"
                      margin="normal"
                      required
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message as string}
                      InputLabelProps={{
                        shrink: true,
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
                      placeholder="(00) 0 0000-0000"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.phone}
                      helperText={errors.phone?.message as string}
                      onChange={(e) => {
                        const maskedValue = maskPhone(e.target.value);
                        field.onChange(maskedValue);
                      }}
                      inputProps={{ maxLength: 16 }}
                      sx={{ mb: 2 }} // Adicionando margem inferior para alinhar com outros campos
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
                      required
                      margin="normal"
                      error={!!errors.email}
                      helperText={errors.email?.message as string}
                      sx={{ mb: 2 }} // Adicionando margem inferior para alinhar com o campo de telefone
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <FormControl fullWidth error={Boolean(errors.status)}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="active">Ativo</MenuItem>
                        <MenuItem value="inactive">Inativo</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }: { field: any }) => (
                    <FormControl fullWidth error={Boolean(errors.type)} required>
                      <InputLabel>Tipo</InputLabel>
                      <Select {...field} label="Tipo">
                        <MenuItem value="volunteer">Voluntário</MenuItem>
                        <MenuItem value="employee">Funcionário</MenuItem>
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.street')}
                      helperText={getNestedErrorMessage(errors, 'address.street')}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.number')}
                      helperText={getNestedErrorMessage(errors, 'address.number')}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name={'address.complement' as any}
                  control={control}
                  render={({ field }: { field: any }) => (
                    <TextField
                      {...field}
                      label="Complemento"
                      fullWidth
                      margin="normal"
                      value={field.value || ''}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.district')}
                      helperText={getNestedErrorMessage(errors, 'address.district')}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.city')}
                      helperText={getNestedErrorMessage(errors, 'address.city')}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.state')}
                      helperText={getNestedErrorMessage(errors, 'address.state')}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={hasNestedError(errors, 'address.zipCode')}
                      helperText={getNestedErrorMessage(errors, 'address.zipCode')}
                      onChange={(e) => {
                        const maskedValue = maskCEP(e.target.value);
                        field.onChange(maskedValue);
                      }}
                      onBlur={(e) => {
                        // Quando o campo perder o foco, buscar o endereço
                        if (e.target.value.length === 9) {
                          fetchAddressByCep(e.target.value);
                        }
                        field.onBlur();
                      }}
                      inputProps={{ maxLength: 9 }}
                      sx={{ mb: 2 }}
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
                      required
                      margin="normal"
                      error={!!errors.education}
                      helperText={errors.education?.message}
                      sx={{ mb: 2 }} // Adicionando margem inferior para alinhar com o campo de biografia
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
                      margin="normal"
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                      sx={{ mb: 2 }} // Adicionando margem inferior para alinhar com outros campos
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Especializações
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Campo oculto para armazenar especializações e evitar problemas de tipagem */}
                <input
                  type="hidden"
                  id="specField"
                  {...register('specializations')}
                  data-specs={JSON.stringify(specializations)}
                />

                <Box display="flex" alignItems="center" mb={2} gap={1}>
                  <FormControl sx={{ width: 350 }}>
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
                          disabled={specializations?.includes(spec)}
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
                    sx={{ height: '56px' }}
                  >
                    Adicionar
                  </Button>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: 'wrap', gap: 1, display: 'flex' }}
                >
                  {Array.isArray(specializations) &&
                    specializations.map((spec, index) => {
                      const specStr =
                        typeof spec === 'string'
                          ? spec
                          : `Especialização ${index + 1}`;
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
                    {loading ? <CircularProgress size={24} /> : 'Salvar'}
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
