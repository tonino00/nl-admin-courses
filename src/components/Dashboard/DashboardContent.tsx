import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
import ListCard from './ListCard';
import CalendarCard from './CalendarCard';
import { DashboardMetric, DashboardCard, UserDashboard } from '../../types/dashboard';

interface DashboardContentProps {
  dashboard: UserDashboard;
  loading?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ dashboard, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard || !dashboard.metrics || !dashboard.cards) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Nenhum dado disponível para o dashboard</Typography>
      </Box>
    );
  }

  // Renderizar um card do dashboard baseado no seu tipo
  const renderDashboardCard = (card: DashboardCard) => {
    switch (card.type) {
      case 'chart':
        return <ChartCard card={card} />;
      case 'list':
        return <ListCard card={card} />;
      case 'calendar':
        return <CalendarCard card={card} />;
      case 'stats':
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>Conteúdo de estatísticas</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  // Obter o tamanho do grid com base no tamanho do card
  const getCardSize = (size: string): number => {
    switch (size) {
      case 'small':
        return 4;
      case 'medium':
        return 6;
      case 'large':
        return 12;
      default:
        return 6;
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboard.metrics.map((metric: DashboardMetric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <MetricCard metric={metric} />
          </Grid>
        ))}
      </Grid>
      
      {/* Cards */}
      <Grid container spacing={3}>
        {dashboard.cards.map((card: DashboardCard) => (
          <Grid 
            item 
            xs={12} 
            md={getCardSize(card.size)} 
            key={card.id}
            sx={{ mb: 3 }}
          >
            {renderDashboardCard(card)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardContent;
