import { UserDashboard, DashboardMetric, DashboardCard } from '../types/dashboard';

// Dados mockados para os gráficos
const getChartData = (type: string) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIndex = new Date().getMonth();
  const last6Months = months.slice(currentMonthIndex - 5, currentMonthIndex + 1);
  
  if (type === 'enrollments') {
    return {
      chartType: 'line',
      chartData: {
        labels: last6Months,
        datasets: [
          {
            label: 'Matrículas',
            data: [65, 78, 62, 84, 95, 107],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Evolução de Matrículas'
          }
        }
      }
    };
  }
  
  if (type === 'attendance') {
    return {
      chartType: 'bar',
      chartData: {
        labels: last6Months,
        datasets: [
          {
            label: 'Presença',
            data: [90, 88, 92, 85, 87, 91],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          }
        ]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Taxa de Presença (%)'
          }
        }
      }
    };
  }
  
  if (type === 'grades') {
    return {
      chartType: 'bar',
      chartData: {
        labels: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Ed. Física'],
        datasets: [
          {
            label: 'Média da Turma',
            data: [7.5, 8.2, 6.8, 7.9, 8.5, 9.2],
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
          },
          {
            label: 'Média Aluno',
            data: [8.5, 7.8, 6.5, 8.3, 7.9, 9.5],
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
          }
        ]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Desempenho por Disciplina'
          }
        }
      }
    };
  }
  
  if (type === 'distribution') {
    return {
      chartType: 'pie',
      chartData: {
        labels: ['Abaixo da Média', 'Na Média', 'Acima da Média'],
        datasets: [
          {
            data: [15, 45, 40],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
          }
        ]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          }
        }
      }
    };
  }
  
  return {
    chartType: 'line',
    chartData: {
      labels: last6Months,
      datasets: [
        {
          label: 'Dados',
          data: [65, 78, 62, 84, 95, 107],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    }
  };
};

// Dados de exemplo para listas
const getListItems = (type: string) => {
  if (type === 'recentStudents') {
    return {
      items: [
        { 
          id: 1, 
          name: 'Ana Silva', 
          type: 'student',
          description: 'Matriculada em Matemática Avançada',
          date: '23/06/2025', 
          status: 'active',
          initial: 'A'
        },
        { 
          id: 2, 
          name: 'Pedro Santos', 
          type: 'student',
          description: 'Matriculado em História do Brasil',
          date: '22/06/2025', 
          status: 'active',
          initial: 'P'
        },
        { 
          id: 3, 
          name: 'Maria Oliveira', 
          type: 'student',
          description: 'Matriculada em Física Quântica',
          date: '20/06/2025', 
          status: 'inactive',
          initial: 'M'
        },
        { 
          id: 4, 
          name: 'João Pereira', 
          type: 'student',
          description: 'Matriculado em Literatura Brasileira',
          date: '18/06/2025', 
          status: 'active',
          initial: 'J'
        },
        { 
          id: 5, 
          name: 'Carla Mendes', 
          type: 'student',
          description: 'Matriculada em Programação Web',
          date: '15/06/2025', 
          status: 'active',
          initial: 'C'
        }
      ]
    };
  }
  
  if (type === 'recentTeachers') {
    return {
      items: [
        { 
          id: 1, 
          name: 'Roberto Almeida', 
          type: 'teacher',
          description: 'Professor de Matemática',
          date: '23/06/2025', 
          status: 'active',
          initial: 'R'
        },
        { 
          id: 2, 
          name: 'Juliana Martins', 
          type: 'teacher',
          description: 'Professora de História',
          date: '20/06/2025', 
          status: 'active',
          initial: 'J'
        },
        { 
          id: 3, 
          name: 'Marcelo Santos', 
          type: 'teacher',
          description: 'Professor de Física',
          date: '18/06/2025', 
          status: 'inactive',
          initial: 'M'
        },
        { 
          id: 4, 
          name: 'Patrícia Lima', 
          type: 'teacher',
          description: 'Professora de Literatura',
          date: '15/06/2025', 
          status: 'active',
          initial: 'P'
        }
      ]
    };
  }
  
  if (type === 'upcomingAssignments') {
    return {
      items: [
        { 
          id: 1, 
          name: 'Trabalho de Matemática', 
          type: 'task',
          description: 'Entrega: 25/06/2025',
          date: '25/06/2025', 
          status: 'pending',
          initial: 'M'
        },
        { 
          id: 2, 
          name: 'Apresentação de História', 
          type: 'task',
          description: 'Entrega: 27/06/2025',
          date: '27/06/2025', 
          status: 'pending',
          initial: 'H'
        },
        { 
          id: 3, 
          name: 'Prova de Física', 
          type: 'task',
          description: 'Data: 30/06/2025',
          date: '30/06/2025', 
          status: 'pending',
          initial: 'F'
        }
      ]
    };
  }
  
  if (type === 'recentCourses') {
    return {
      items: [
        { 
          id: 1, 
          name: 'Matemática Avançada', 
          type: 'course',
          description: 'Prof. Roberto Almeida',
          date: '23/06/2025', 
          status: 'inProgress',
          initial: 'M'
        },
        { 
          id: 2, 
          name: 'História do Brasil', 
          type: 'course',
          description: 'Prof. Juliana Martins',
          date: '20/06/2025', 
          status: 'inProgress',
          initial: 'H'
        },
        { 
          id: 3, 
          name: 'Física Quântica', 
          type: 'course',
          description: 'Prof. Marcelo Santos',
          date: '18/06/2025', 
          status: 'pending',
          initial: 'F'
        }
      ]
    };
  }
  
  return { items: [] };
};

// Eventos para o calendário
const getCalendarEvents = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return {
    events: [
      {
        id: 1,
        title: 'Aula de Matemática',
        date: new Date(currentYear, currentMonth, 15).toISOString(),
        type: 'class'
      },
      {
        id: 2,
        title: 'Aula de História',
        date: new Date(currentYear, currentMonth, 17).toISOString(),
        type: 'class'
      },
      {
        id: 3,
        title: 'Prova de Física',
        date: new Date(currentYear, currentMonth, 20).toISOString(),
        type: 'exam'
      },
      {
        id: 4,
        title: 'Entrega de Trabalho',
        date: new Date(currentYear, currentMonth, 25).toISOString(),
        type: 'assignment'
      }
    ]
  };
};

// Dashboard para administradores
export const getAdminDashboard = async (): Promise<UserDashboard> => {
  // Simular delay de carregamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const metrics: DashboardMetric[] = [
    {
      id: 'students',
      title: 'Total de Alunos',
      value: 352,
      icon: 'student',
      color: '#4caf50',
      change: 5.2,
      changeType: 'increase'
    },
    {
      id: 'teachers',
      title: 'Total de Professores',
      value: 42,
      icon: 'teacher',
      color: '#2196f3',
      change: 2.1,
      changeType: 'increase'
    },
    {
      id: 'courses',
      title: 'Cursos Ativos',
      value: 28,
      icon: 'course',
      color: '#ff9800',
      change: 0,
      changeType: 'stable'
    },
    {
      id: 'enrollments',
      title: 'Matrículas',
      value: 675,
      icon: 'enrollment',
      color: '#9c27b0',
      change: 8.3,
      changeType: 'increase'
    }
  ];
  
  const cards: DashboardCard[] = [
    {
      id: 'enrollments-chart',
      title: 'Evolução de Matrículas',
      type: 'chart',
      data: getChartData('enrollments'),
      size: 'medium'
    },
    {
      id: 'recent-students',
      title: 'Alunos Recentes',
      type: 'list',
      data: getListItems('recentStudents'),
      size: 'medium'
    },
    {
      id: 'student-distribution',
      title: 'Distribuição de Desempenho',
      type: 'chart',
      data: getChartData('distribution'),
      size: 'small'
    },
    {
      id: 'recent-teachers',
      title: 'Professores Recentes',
      type: 'list',
      data: getListItems('recentTeachers'),
      size: 'small'
    },
    {
      id: 'calendar',
      title: 'Calendário Acadêmico',
      type: 'calendar',
      data: getCalendarEvents(),
      size: 'medium'
    },
    {
      id: 'recent-courses',
      title: 'Cursos Recentes',
      type: 'list',
      data: getListItems('recentCourses'),
      size: 'medium'
    }
  ];
  
  return {
    metrics,
    cards,
    userType: 'admin'
  };
};

// Dashboard para professores
export const getTeacherDashboard = async (): Promise<UserDashboard> => {
  // Simular delay de carregamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const metrics: DashboardMetric[] = [
    {
      id: 'students',
      title: 'Meus Alunos',
      value: 87,
      icon: 'student',
      color: '#4caf50',
      change: 3.2,
      changeType: 'increase'
    },
    {
      id: 'courses',
      title: 'Meus Cursos',
      value: 5,
      icon: 'course',
      color: '#ff9800',
      change: 0,
      changeType: 'stable'
    },
    {
      id: 'hours',
      title: 'Horas Registradas',
      value: 126,
      icon: 'time',
      color: '#2196f3',
      change: 12.5,
      changeType: 'increase'
    },
    {
      id: 'attendance',
      title: 'Taxa de Presença',
      value: 91,
      icon: 'assessment',
      color: '#9c27b0',
      change: 2.3,
      changeType: 'increase'
    }
  ];
  
  const cards: DashboardCard[] = [
    {
      id: 'attendance-chart',
      title: 'Taxa de Presença dos Alunos',
      type: 'chart',
      data: getChartData('attendance'),
      size: 'medium'
    },
    {
      id: 'recent-students',
      title: 'Meus Alunos',
      type: 'list',
      data: getListItems('recentStudents'),
      size: 'medium'
    },
    {
      id: 'calendar',
      title: 'Minha Agenda',
      type: 'calendar',
      data: getCalendarEvents(),
      size: 'medium'
    },
    {
      id: 'grades-chart',
      title: 'Desempenho das Turmas',
      type: 'chart',
      data: getChartData('grades'),
      size: 'large'
    }
  ];
  
  return {
    metrics,
    cards,
    userType: 'teacher'
  };
};

// Dashboard para estudantes
export const getStudentDashboard = async (): Promise<UserDashboard> => {
  // Simular delay de carregamento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const metrics: DashboardMetric[] = [
    {
      id: 'courses',
      title: 'Meus Cursos',
      value: 6,
      icon: 'course',
      color: '#ff9800'
    },
    {
      id: 'attendance',
      title: 'Minha Presença',
      value: 88,
      icon: 'assessment',
      color: '#9c27b0',
      change: -2.1,
      changeType: 'decrease'
    },
    {
      id: 'assignments',
      title: 'Trabalhos Pendentes',
      value: 3,
      icon: 'enrollment',
      color: '#f44336'
    },
    {
      id: 'average',
      title: 'Média Geral',
      value: 8.2,
      icon: 'assessment',
      color: '#4caf50',
      change: 0.3,
      changeType: 'increase'
    }
  ];
  
  const cards: DashboardCard[] = [
    {
      id: 'grades-chart',
      title: 'Minhas Notas',
      type: 'chart',
      data: getChartData('grades'),
      size: 'medium'
    },
    {
      id: 'assignments',
      title: 'Próximas Entregas',
      type: 'list',
      data: getListItems('upcomingAssignments'),
      size: 'medium'
    },
    {
      id: 'calendar',
      title: 'Meu Calendário',
      type: 'calendar',
      data: getCalendarEvents(),
      size: 'medium'
    },
    {
      id: 'courses',
      title: 'Meus Cursos',
      type: 'list',
      data: getListItems('recentCourses'),
      size: 'medium'
    }
  ];
  
  return {
    metrics,
    cards,
    userType: 'student'
  };
};

// Função para obter o dashboard apropriado com base no tipo de usuário
export const getUserDashboard = async (userType: string): Promise<UserDashboard> => {
  switch (userType) {
    case 'teacher':
      return getTeacherDashboard();
    case 'student':
      return getStudentDashboard();
    case 'admin':
    default:
      return getAdminDashboard();
  }
};
