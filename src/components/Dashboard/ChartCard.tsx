import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DashboardCard } from '../../types/dashboard';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  card: DashboardCard;
}

const ChartCard: React.FC<ChartCardProps> = ({ card }) => {
  const renderChart = () => {
    // Verificar qual tipo de gráfico deve ser renderizado
    if (!card.data || !card.data.chartType) return null;

    switch (card.data.chartType) {
      case 'line':
        return (
          <Line 
            data={card.data.chartData} 
            options={card.data.chartOptions || {
              responsive: true,
              maintainAspectRatio: false
            }} 
          />
        );
      case 'bar':
        return (
          <Bar 
            data={card.data.chartData} 
            options={card.data.chartOptions || {
              responsive: true,
              maintainAspectRatio: false
            }} 
          />
        );
      case 'pie':
        return (
          <Pie 
            data={card.data.chartData}
            options={card.data.chartOptions || {
              responsive: true,
              maintainAspectRatio: false
            }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        title={card.title}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: card.size === 'small' ? 150 : 
                    card.size === 'medium' ? 250 : 350
        }}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          {renderChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
