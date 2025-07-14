import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsContentProps {
  // Se necessário, adicione props específicas para esta análise
}

// Dados para gráficos e tabelas
const coursePerformanceData = [
  { nome: 'Matemática', aprovados: 85, reprovados: 15 },
  { nome: 'Português', aprovados: 78, reprovados: 22 },
  { nome: 'História', aprovados: 90, reprovados: 10 },
  { nome: 'Geografia', aprovados: 82, reprovados: 18 },
  { nome: 'Ciências', aprovados: 75, reprovados: 25 },
];

const enrollmentData = [
  { name: 'Matriculados', value: 350 },
  { name: 'Em lista de espera', value: 50 },
  { name: 'Desistências', value: 25 },
];

const teacherPerformanceData = [
  { id: 1, nome: 'Maria Silva', disciplina: 'Matemática', avaliacao: 4.8, alunos: 45 },
  { id: 2, nome: 'João Oliveira', disciplina: 'Português', avaliacao: 4.5, alunos: 38 },
  { id: 3, nome: 'Ana Santos', disciplina: 'História', avaliacao: 4.9, alunos: 42 },
  { id: 4, nome: 'Pedro Costa', disciplina: 'Geografia', avaliacao: 4.7, alunos: 36 },
  { id: 5, nome: 'Carla Mendes', disciplina: 'Ciências', avaliacao: 4.6, alunos: 40 },
];

// Cores para o gráfico de pizza
const COLORS = ['#0088FE', '#FF8042', '#FFBB28'];

const AnalyticsContent: React.FC<AnalyticsContentProps> = () => {
  return (
    <Box sx={{ py: 3, px: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Análise Detalhada
      </Typography>
      
      <Grid container spacing={3}>
        {/* Resumo Financeiro */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Receita Mensal
            </Typography>
            <Typography variant="h4" gutterBottom>
              R$ 75.850
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              +12% em relação ao mês anterior
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Despesas Mensais
            </Typography>
            <Typography variant="h4" gutterBottom>
              R$ 45.230
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
              +5% em relação ao mês anterior
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total de Alunos
            </Typography>
            <Typography variant="h4" gutterBottom>
              425
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              +8% em relação ao semestre anterior
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Taxa de Aprovação
            </Typography>
            <Typography variant="h4" gutterBottom>
              82%
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
              +3% em relação ao semestre anterior
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico de Desempenho por Curso */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Desempenho por Disciplina
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300, mt: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={coursePerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="aprovados" name="Aprovados (%)" fill="#4caf50" />
                  <Bar dataKey="reprovados" name="Reprovados (%)" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráfico de Pizza de Matrículas */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Distribuição de Matrículas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300, mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrollmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                {enrollmentData.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: COLORS[index % COLORS.length],
                        mr: 0.5,
                        borderRadius: '50%',
                      }}
                    />
                    <Typography variant="caption">{entry.name}: {entry.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabela de Desempenho dos Professores */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Desempenho dos Professores
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Professor</TableCell>
                    <TableCell>Disciplina</TableCell>
                    <TableCell>Avaliação Média</TableCell>
                    <TableCell>Alunos</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherPerformanceData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{row.disciplina}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={row.avaliacao * 20} 
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{row.avaliacao}/5</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{row.alunos}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            backgroundColor: row.avaliacao >= 4.5 ? 'success.light' : 'warning.light',
                            color: row.avaliacao >= 4.5 ? 'success.dark' : 'warning.dark',
                          }}
                        >
                          {row.avaliacao >= 4.5 ? 'Excelente' : 'Bom'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsContent;
