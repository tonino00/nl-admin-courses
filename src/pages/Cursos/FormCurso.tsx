import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Alert,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createCourse,
  updateCourse,
  fetchCourseById,
  clearCurrentCourse,
} from '../../store/slices/coursesSlice';
import { fetchTeachers } from '../../store/slices/teachersSlice';
import { Course, Teacher, CoursesState, TeachersState } from '../../types';
import { RootState } from '../../store';

// Schema de validação
const courseSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  workload: yup
    .number()
    .typeError('Carga horária deve ser um número')
    .required('Carga horária é obrigatória')
    .positive('Carga horária deve ser positiva'),
  shifts: yup.array().of(yup.string()).min(1, 'Selecione pelo menos um turno'),
  totalSpots: yup
    .number()
    .typeError('Total de vagas deve ser um número')
    .required('Total de vagas é obrigatório')
    .positive('Total de vagas deve ser positivo'),
  teacherId: yup
    .number()
    .typeError('Selecione um professor')
    .required('Professor é obrigatório'),
  status: yup.string().required('Status é obrigatório'),
  prerequisites: yup.array().of(yup.number()),
  schedule: yup.array().of(
    yup.object({
      day: yup.string().required('Dia é obrigatório'),
      start: yup.string().required('Horário inicial é obrigatório'),
      end: yup.string().required('Horário final é obrigatório'),
    })
  ),
});

// Tipo para o formulário
type CourseFormData = yup.InferType<typeof courseSchema>;

const FormCurso: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { currentCourse, loading, error } = useAppSelector(
    (state: RootState) => state.courses as CoursesState
  );
  const teachersState = useAppSelector(
    (state: RootState) => state.teachers as TeachersState
  );
  const { teachers } = teachersState;
  const { courses } = useAppSelector(
    (state: RootState) => state.courses as CoursesState
  );
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Configuração do formulário
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      name: '',
      description: '',
      workload: 0,
      shifts: [],
      totalSpots: 0,
      teacherId: 0,
      status: 'active',
      prerequisites: [],
      schedule: [{ day: 'Monday', start: '08:00', end: '10:00' }],
    },
  });

  // Field Array para gerenciar horários
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule',
  });

  // Carrega os dados do curso para edição
  useEffect(() => {
    setTeachersLoading(true);
    dispatch(fetchTeachers())
      .unwrap()
      .then(() => {
        console.log('Professores carregados com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao carregar professores:', error);
      })
      .finally(() => {
        setTeachersLoading(false);
      });

    if (id) {
      dispatch(fetchCourseById(Number(id)));
    } else {
      dispatch(clearCurrentCourse());
    }

    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, id]);

  // Preenche o formulário com os dados do curso
  useEffect(() => {
    if (currentCourse) {
      reset({
        name: currentCourse.name,
        description: currentCourse.description,
        workload: currentCourse.workload,
        shifts: currentCourse.shifts,
        totalSpots: currentCourse.totalSpots,
        teacherId: currentCourse.teacherId,
        status: currentCourse.status,
        prerequisites: currentCourse.prerequisites || [],
        schedule: currentCourse.schedule || [
          { day: 'Monday', start: '08:00', end: '10:00' },
        ],
      });
    }
  }, [currentCourse, reset]);

  // Manipuladores de eventos
  const onSubmit = async (data: CourseFormData) => {
    try {
      // Calcula as vagas disponíveis (para novos cursos igual ao total, para edição mantém a diferença)
      let availableSpots = data.totalSpots;
      if (currentCourse) {
        const spotsDifference =
          currentCourse.totalSpots - currentCourse.availableSpots;
        availableSpots = data.totalSpots - spotsDifference;
      }

      // Preparando o objeto com todos os campos necessários
      const courseData: Omit<Course, 'id'> = {
        name: data.name,
        description: data.description,
        workload: data.workload,
        shifts: data.shifts as ('morning' | 'afternoon' | 'night')[],
        totalSpots: data.totalSpots,
        availableSpots: availableSpots,
        // Filtrar valores undefined
        prerequisites: (data.prerequisites || []).filter(
          (p): p is number => p !== undefined
        ),
        schedule: data.schedule || [],
        teacherId: data.teacherId,
        status: data.status as 'active' | 'inactive',
      };

      if (id) {
        // Para atualização, passamos o id e os dados do curso
        const numericId = Number(id);
        // Para atender à assinatura do tipo, incluir o id no objeto courseData também
        await dispatch(
          updateCourse({
            id: numericId,
            courseData: {
              ...courseData,
              id: numericId,
            },
          })
        ).unwrap();
      } else {
        // Para criação, passamos apenas os dados do curso
        await dispatch(createCourse(courseData)).unwrap();
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/cursos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
    }
  };

  const handleAddSchedule = () => {
    append({ day: 'Monday', start: '08:00', end: '10:00' });
  };

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: isMobile ? 1 : 2 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          display="flex"
          alignItems="center"
          mb={isMobile ? 2 : 3}
          flexDirection={isMobile ? 'column' : 'row'}
          textAlign={isMobile ? 'center' : 'left'}
        >
          <ScheduleIcon
            color="primary"
            sx={{
              mr: isMobile ? 0 : 1,
              mb: isMobile ? 1 : 0,
              fontSize: isMobile ? 24 : 30,
            }}
          />
          <Typography variant={isMobile ? 'h6' : 'h5'} component="h1">
            {id ? 'Editar Curso' : 'Novo Curso'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Curso {id ? 'atualizado' : 'cadastrado'} com sucesso!
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={8}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Curso"
                    variant="outlined"
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="workload"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={isMobile ? 'Carga Horária' : 'Carga Horária (horas)'}
                    variant="outlined"
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    type="number"
                    error={!!errors.workload}
                    helperText={errors.workload?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 3}
                    size={isMobile ? 'small' : 'medium'}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.shifts}>
                <InputLabel id="shifts-label">Turnos</InputLabel>
                <Controller
                  name="shifts"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="shifts-label"
                      multiple
                      input={<OutlinedInput label="Turnos" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={
                                value === 'morning'
                                  ? 'Manhã'
                                  : value === 'afternoon'
                                  ? 'Tarde'
                                  : 'Noite'
                              }
                            />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="morning">Manhã</MenuItem>
                      <MenuItem value="afternoon">Tarde</MenuItem>
                      <MenuItem value="night">Noite</MenuItem>
                    </Select>
                  )}
                />
                {errors.shifts && (
                  <FormHelperText>{errors.shifts.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.teacherId}>
                    <InputLabel id="teacher-label">
                      Professor Responsável
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="teacher-label"
                      label="Professor Responsável"
                      value={field.value || ''}
                      disabled={teachersLoading}
                    >
                      {teachersLoading ? (
                        <MenuItem value="">Carregando professores...</MenuItem>
                      ) : teachers && teachers.length > 0 ? (
                        teachers.map((teacher: Teacher) => (
                          <MenuItem key={teacher.id} value={teacher.id}>
                            {teacher.fullName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="">
                          Nenhum professor encontrado
                        </MenuItem>
                      )}
                    </Select>
                    {errors.teacherId && (
                      <FormHelperText>
                        {errors.teacherId.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="totalSpots"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Total de Vagas"
                    variant="outlined"
                    fullWidth
                    type="number"
                    error={!!errors.totalSpots}
                    helperText={errors.totalSpots?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select {...field} labelId="status-label" label="Status">
                      <MenuItem value="active">Ativo</MenuItem>
                      <MenuItem value="inactive">Inativo</MenuItem>
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.prerequisites}>
                <InputLabel id="prerequisites-label">Pré-requisitos</InputLabel>
                <Controller
                  name="prerequisites"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="prerequisites-label"
                      multiple
                      input={<OutlinedInput label="Pré-requisitos" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {selected.map((value) => {
                            const prerequisiteCourse = courses.find(
                              (course: Course) => course.id === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={
                                  prerequisiteCourse?.name || `Curso ${value}`
                                }
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {courses
                        .filter(
                          (course: Course) => !id || course.id !== parseInt(id)
                        )
                        .map((course: Course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? 1 : 0,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Grade de Horários
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={handleAddSchedule}
                    sx={{ ml: isMobile ? 0 : 2 }}
                  >
                    {isMobile ? 'Add Horário' : 'Adicionar Horário'}
                  </Button>
                </Box>
              </Box>

              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 1 : 2,
                    mb: 2,
                    alignItems: isMobile ? 'stretch' : 'center',
                    '& .MuiTextField-root': {
                      width: isMobile ? '100%' : 'auto',
                    },
                    '& .MuiFormControl-root': {
                      width: isMobile ? '100%' : 'auto',
                    },
                  }}
                >
                  <Controller
                    name={`schedule.${index}.day`}
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!errors.schedule?.[index]?.day}
                      >
                        <InputLabel id={`day-label-${index}`}>Dia</InputLabel>
                        <Select
                          {...field}
                          labelId={`day-label-${index}`}
                          label="Dia"
                        >
                          <MenuItem value="Monday">Segunda-feira</MenuItem>
                          <MenuItem value="Tuesday">Terça-feira</MenuItem>
                          <MenuItem value="Wednesday">Quarta-feira</MenuItem>
                          <MenuItem value="Thursday">Quinta-feira</MenuItem>
                          <MenuItem value="Friday">Sexta-feira</MenuItem>
                          <MenuItem value="Saturday">Sábado</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name={`schedule.${index}.start`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Início"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.schedule?.[index]?.start}
                        helperText={errors.schedule?.[index]?.start?.message}
                        size={isMobile ? 'small' : 'medium'}
                        fullWidth={isMobile}
                      />
                    )}
                  />

                  <Controller
                    name={`schedule.${index}.end`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Término"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.schedule?.[index]?.end}
                        helperText={errors.schedule?.[index]?.end?.message}
                        size={isMobile ? 'small' : 'medium'}
                        fullWidth={isMobile}
                      />
                    )}
                  />

                  <IconButton
                    color="error"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                    sx={{ alignSelf: isMobile ? 'flex-end' : 'center' }}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={isMobile ? 1 : 2}
                justifyContent={isMobile ? 'stretch' : 'flex-end'}
                sx={{ mt: 3 }}
              >
                <Button
                  variant="outlined"
                  startIcon={!isMobile && <CancelIcon />}
                  onClick={() => navigate('/cursos')}
                  fullWidth={isMobile}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={!isMobile && <SaveIcon />}
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FormCurso;
