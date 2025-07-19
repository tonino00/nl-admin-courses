import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
} from '@mui/material';
// Removido DatePicker devido a problemas de compatibilidade
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { RootState } from '../../store';
import {
  fetchStudentById,
  createStudent,
  updateStudent,
  clearCurrentStudent,
} from '../../store/slices/studentsSlice';
import { Student, Address } from '../../types';
import {
  maskCPF,
  maskPhone,
  formatDateToBR,
  parseDateFromBR,
  maskDate,
  maskCEP,
} from '../../utils/masks';

// Validação com Yup
const schema = yup.object().shape({
  fullName: yup.string().required('Nome completo é obrigatório'),
  mothersName: yup.string().required('Nome da mãe é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .matches(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'Formato de CPF inválido (000.000.000-00)'
    ),
  rg: yup.string().required('RG é obrigatório'),
  birthDate: yup.string().required('Data de nascimento é obrigatória'),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      'Formato de telefone inválido ((00) 00000-0000)'
    ),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'])
    .required('Status é obrigatório'),
  address: yup.object().shape({
    street: yup.string().required('Rua é obrigatória'),
    number: yup.string().required('Número é obrigatório'),
    district: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
    zipCode: yup
      .string()
      .required('CEP é obrigatório')
      .matches(/^\d{5}-\d{3}$/, 'Formato de CEP inválido (00000-000)'),
  }),
});

type StudentFormData = Omit<
  Student,
  'id' | 'documents' | 'enrollments' | 'grades' | 'certificates'
> & {
  id?: number;
};

const initialFormState: StudentFormData = {
  fullName: '',
  mothersName: '',
  cpf: '',
  rg: '',
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
  status: 'active',
};

const FormAluno: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentStudent, loading, error } = useAppSelector(
    (state) => state.students
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<StudentFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialFormState,
  });

  // Buscar dados do aluno para edição
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchStudentById(Number(id)));
    }

    return () => {
      dispatch(clearCurrentStudent());
    };
  }, [dispatch, id, isEditMode]);

  // Preencher formulário com dados do aluno em modo de edição
  useEffect(() => {
    if (isEditMode && currentStudent) {
      // Reset form with current student data
      const formData: StudentFormData = {
        fullName: currentStudent.fullName,
        mothersName: currentStudent.mothersName,
        cpf: currentStudent.cpf,
        rg: currentStudent.rg,
        birthDate: currentStudent.birthDate,
        address: currentStudent.address,
        phone: currentStudent.phone,
        email: currentStudent.email,
        status: currentStudent.status,
      };

      reset(formData);

      // Populate document previews if any
      if (currentStudent.documents && currentStudent.documents.length > 0) {
        const documentUrls = currentStudent.documents.map((doc) => doc.url);
        setPreviewUrls(documentUrls);
      }
    }
  }, [currentStudent, isEditMode, reset]);

  // Configuração do Dropzone para upload de documentos
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

      // Create preview URLs
      const newPreviewUrls = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    },
  });

  // Buscar dados de endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remover caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        // Preencher os campos de endereço
        setValue('address.street', data.logradouro);
        setValue('address.district', data.bairro);
        setValue('address.city', data.localidade);
        setValue('address.state', data.uf);
        
        // Focar no campo de número após preencher os dados
        setTimeout(() => {
          const numberField = document.querySelector('input[name="address.number"]') as HTMLInputElement;
          if (numberField) numberField.focus();
        }, 0);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Submeter formulário
  const onSubmit = async (data: StudentFormData) => {
    try {
      if (isEditMode && currentStudent) {
        // Update existing student
        const updatedStudent: Student = {
          ...currentStudent,
          ...data,
        };

        await dispatch(updateStudent(updatedStudent));
      } else {
        // Create new student
        const newStudent = {
          ...data,
          documents: [],
          enrollments: [],
          grades: [],
          certificates: [],
        };

        await dispatch(createStudent(newStudent as Omit<Student, 'id'>));
      }

      navigate('/alunos');
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    }
  };

  const handleCancel = () => {
    navigate('/alunos');
  };

  // Remover preview de arquivo
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => {
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          color="primary"
          onClick={() => navigate('/alunos')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Editar Aluno' : 'Novo Aluno'}
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      fullWidth
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="mothersName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome da Mãe"
                      fullWidth
                      error={!!errors.mothersName}
                      helperText={errors.mothersName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CPF"
                      placeholder="000.000.000-00"
                      fullWidth
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="rg"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="RG"
                      fullWidth
                      error={!!errors.rg}
                      helperText={errors.rg?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      fullWidth
                      label="Data de Nascimento"
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message || 'DD/MM/AAAA'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={field.value ? formatDateToBR(field.value) : ''}
                      onChange={(e) => {
                        const maskedValue = maskDate(e.target.value);
                        const parsedDate =
                          maskedValue.length === 10
                            ? parseDateFromBR(maskedValue)
                            : '';
                        field.onChange(parsedDate || maskedValue);
                      }}
                      inputProps={{ maxLength: 10 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
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
                  render={({ field }) => (
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
                  render={({ field }) => (
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rua"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.street}
                      helperText={errors.address?.street?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="address.number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.number}
                      helperText={errors.address?.number?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="address.complement"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Complemento" 
                      fullWidth 
                      margin="normal"
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="address.district"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bairro"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.district}
                      helperText={errors.address?.district?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cidade"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.city}
                      helperText={errors.address?.city?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Estado"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.state}
                      helperText={errors.address?.state?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="address.zipCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      placeholder="00000-000"
                      fullWidth
                      required
                      margin="normal"
                      error={!!errors.address?.zipCode}
                      helperText={errors.address?.zipCode?.message}
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

              {/* Upload de Documentos */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Documentos
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    mb: 2,
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>
                    Arraste e solte arquivos aqui ou clique para selecionar
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Documentos, foto, comprovantes (JPG, PNG, PDF)
                  </Typography>
                </Box>

                {previewUrls.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {previewUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: 100,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          {url.includes('.pdf') ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                bgcolor: 'grey.100',
                              }}
                            >
                              <Typography variant="body2">PDF</Typography>
                            </Box>
                          ) : (
                            <img
                              src={url}
                              alt={`Documento ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'background.paper',
                            }}
                            onClick={() => handleRemoveFile(index)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
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

export default FormAluno;
