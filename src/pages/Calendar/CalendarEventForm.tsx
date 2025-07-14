import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Stack,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import 'moment/locale/pt-br';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Repeat as RepeatIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  addCalendarEvent, 
  updateCalendarEvent, 
  removeCalendarEvent 
} from '../../store/slices/calendarSlice';
import { CalendarEvent, CalendarEventFormData, CalendarEventType, RecurrenceRule, RecurrenceType, RecurrenceDaysOfWeek } from '../../types/calendar';
import { RootState } from '../../store';

// Opções de tipos de eventos
const eventTypes: { value: CalendarEventType; label: string; color: string }[] = [
  { value: 'class', label: 'Aula', color: '#4caf50' },
  { value: 'exam', label: 'Prova', color: '#f44336' },
  { value: 'assignment', label: 'Trabalho', color: '#ff9800' },
  { value: 'meeting', label: 'Reunião', color: '#2196f3' },
  { value: 'holiday', label: 'Feriado', color: '#9c27b0' },
  { value: 'other', label: 'Outro', color: '#757575' },
];

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
}

const CalendarEventForm: React.FC<Props> = ({ event, onClose }) => {
  const dispatch = useAppDispatch();
  const { courses } = useAppSelector((state: RootState) => state.courses);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { students } = useAppSelector((state: RootState) => state.students);
  
  const isNewEvent = !event?.id;
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Configurar formulário com react-hook-form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CalendarEventFormData & { useRecurrence: boolean, recurrence: RecurrenceRule }>({
    defaultValues: {
      id: event?.id || undefined,
      title: event?.title || '',
      start: event?.start || null,
      end: event?.end || null,
      allDay: event?.allDay || false,
      type: event?.type || 'class',
      description: event?.description || '',
      location: event?.location || '',
      courseId: event?.courseId || null,
      teacherId: event?.teacherId || null,
      studentIds: event?.studentIds || [],
      color: event?.color || eventTypes.find(t => t.value === (event?.type || 'class'))?.color || '#4caf50',
      useRecurrence: !!event?.recurrence,
      recurrence: event?.recurrence || {
        type: 'none',
        interval: 1,
        daysOfWeek: [],
        endDate: null,
        occurrences: null,
      },
    }
  });

  // Observe o tipo de evento para atualizar a cor
  const selectedType = watch('type');
  useEffect(() => {
    const defaultColor = eventTypes.find(t => t.value === selectedType)?.color;
    if (defaultColor && !event?.color) {
      setValue('color', defaultColor);
    }
  }, [selectedType, setValue, event]);

  // Handler para salvar evento
  const onSubmit = async (data: CalendarEventFormData & { useRecurrence: boolean, recurrence: RecurrenceRule }) => {
    setLoading(true);
    try {
      // Certificar que start e end são válidos
      if (!data.start || !data.end) {
        throw new Error('Datas inválidas');
      }

      // Criar objeto de evento com tipos corretos
      const eventData: Omit<CalendarEvent, 'createdAt' | 'id'> = {
        ...data,
        start: data.start,
        end: data.end,
        courseId: data.courseId || undefined, // Converter null para undefined
        teacherId: data.teacherId || undefined, // Converter null para undefined
        recurrence: data.useRecurrence ? data.recurrence : null,
        ...(isNewEvent ? {} : { id: event!.id }),
        updatedAt: new Date(),
      };

      // Despachar ação apropriada (adicionar ou atualizar)
      if (isNewEvent) {
        await dispatch(addCalendarEvent(eventData));
      } else {
        await dispatch(updateCalendarEvent(eventData as CalendarEvent));
      }

      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para remover evento
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (event?.id) {
      setLoading(true);
      try {
        await dispatch(removeCalendarEvent(event.id));
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isNewEvent ? 'Adicionar Evento' : 'Editar Evento'}
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }} noValidate>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Título é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Título"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="start"
                  control={control}
                  rules={{ required: 'Data de início é obrigatória' }}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Início"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!errors.start,
                          helperText: errors.start?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="end"
                  control={control}
                  rules={{ required: 'Data de término é obrigatória' }}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Término"
                      value={field.value}
                      onChange={field.onChange}
                      minDateTime={watch('start') || undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!errors.end,
                          helperText: errors.end?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Tipo é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type} variant="outlined">
                      <InputLabel>Tipo</InputLabel>
                      <Select {...field} label="Tipo">
                        {eventTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: type.color,
                                  mr: 1,
                                }}
                              />
                              {type.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="allDay"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Duração</InputLabel>
                      <Select
                        {...field}
                        label="Duração"
                        value={field.value ? "true" : "false"}
                        onChange={(e) => field.onChange(e.target.value === "true")}
                      >
                        <MenuItem value="false">Com horário específico</MenuItem>
                        <MenuItem value="true">Dia inteiro</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Local"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cor"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: field.value || '#4caf50',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      type="color"
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
                      fullWidth
                      label="Descrição"
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Curso</InputLabel>
                      <Select
                        {...field}
                        label="Curso"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      >
                        <MenuItem value="">
                          <em>Nenhum</em>
                        </MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="teacherId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Professor</InputLabel>
                      <Select
                        {...field}
                        label="Professor"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      >
                        <MenuItem value="">
                          <em>Nenhum</em>
                        </MenuItem>
                        {teachers.map((teacher) => (
                          <MenuItem key={teacher.id} value={teacher.id}>
                            {teacher.fullName || `Professor ${teacher.id}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="studentIds"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={students}
                      getOptionLabel={(option) => option.fullName || `Aluno ${option.id}`}
                      value={students.filter(student => field.value.includes(Number(student.id)))}
                      onChange={(_, newValue) => {
                        field.onChange(newValue.map(student => Number(student.id)));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.fullName || `Aluno ${option.id}`}
                            {...getTagProps({ index })}
                            key={option.id}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Alunos"
                          placeholder="Selecionar alunos"
                          fullWidth
                          variant="outlined"
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="recurrence-content"
                    id="recurrence-header"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RepeatIcon sx={{ mr: 1 }} />
                      <Typography>Configurar Recorrência</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>                      
                      <Grid item xs={12}>
                        <Controller
                          name="useRecurrence"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                />
                              }
                              label="Este é um evento recorrente"
                            />
                          )}
                        />
                      </Grid>
                      
                      {watch('useRecurrence') && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="recurrence.type"
                              control={control}
                              rules={{ required: 'Selecione o tipo de recorrência' }}
                              render={({ field, fieldState: { error } }) => (
                                <FormControl fullWidth error={!!error}>
                                  <InputLabel>Repetir</InputLabel>
                                  <Select
                                    {...field}
                                    label="Repetir"
                                  >
                                    <MenuItem value="daily">Diariamente</MenuItem>
                                    <MenuItem value="weekly">Semanalmente</MenuItem>
                                    <MenuItem value="monthly">Mensalmente</MenuItem>
                                    <MenuItem value="yearly">Anualmente</MenuItem>
                                  </Select>
                                  {error && <FormHelperText>{error.message}</FormHelperText>}
                                </FormControl>
                              )}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="recurrence.interval"
                              control={control}
                              rules={{
                                required: 'Obrigatório',
                                min: { value: 1, message: 'Mínimo 1' },
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  label="A cada"
                                  fullWidth
                                  InputProps={{ inputProps: { min: 1 } }}
                                  error={!!error}
                                  helperText={error?.message || `A cada ${field.value} ${watch('recurrence.type') === 'daily' ? 'dias' : 
                                  watch('recurrence.type') === 'weekly' ? 'semanas' : 
                                  watch('recurrence.type') === 'monthly' ? 'meses' : 'anos'}`}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              )}
                            />
                          </Grid>

                          {watch('recurrence.type') === 'weekly' && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom>
                                Repetir nos dias:
                              </Typography>
                              <Controller
                                name="recurrence.daysOfWeek"
                                control={control}
                                render={({ field }) => (
                                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {[
                                      { value: 'sunday', label: 'Dom' },
                                      { value: 'monday', label: 'Seg' },
                                      { value: 'tuesday', label: 'Ter' },
                                      { value: 'wednesday', label: 'Qua' },
                                      { value: 'thursday', label: 'Qui' },
                                      { value: 'friday', label: 'Sex' },
                                      { value: 'saturday', label: 'Sáb' }
                                    ].map((day) => (
                                      <Chip
                                        key={day.value}
                                        label={day.label}
                                        onClick={() => {
                                          const currentDays = [...field.value || []];
                                          const dayValue = day.value as RecurrenceDaysOfWeek;
                                          if (currentDays.includes(dayValue)) {
                                            field.onChange(currentDays.filter(d => d !== dayValue));
                                          } else {
                                            field.onChange([...currentDays, dayValue]);
                                          }
                                        }}
                                        color={field.value?.includes(day.value as RecurrenceDaysOfWeek) ? 'primary' : 'default'}
                                        variant={field.value?.includes(day.value as RecurrenceDaysOfWeek) ? 'filled' : 'outlined'}
                                      />
                                    ))}
                                  </Stack>
                                )}
                              />
                            </Grid>
                          )}

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Termina:
                            </Typography>
                            <Controller
                              name="recurrence.endDate"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="date"
                                  label="Data final"
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  value={field.value ? moment(new Date(field.value)).format('YYYY-MM-DD') : ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      field.onChange(new Date(e.target.value));
                                    } else {
                                      field.onChange(null);
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Controller
                              name="recurrence.occurrences"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  label="Número de ocorrências (opcional)"
                                  fullWidth
                                  InputProps={{ inputProps: { min: 1 } }}
                                  helperText="Deixe em branco para repetir indefinidamente ou até a data final"
                                  value={field.value || ''}
                                  onChange={e => {
                                    const val = e.target.value ? parseInt(e.target.value) : null;
                                    field.onChange(val);
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Box>
          {!isNewEvent && (
            <Button
              onClick={handleDelete}
              color="error"
              disabled={loading}
              variant={confirmDelete ? 'contained' : 'text'}
            >
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {isNewEvent ? 'Adicionar' : 'Salvar'}
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default CalendarEventForm;
