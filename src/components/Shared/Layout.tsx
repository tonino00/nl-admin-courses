import React, { useState, useEffect, useTransition } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as StudentIcon,
  LocalLibrary as TeacherIcon,
  MenuBook as CourseIcon,
  Assessment as ReportIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import NotificationCenter from './NotificationCenter/NotificationCenter';
import ThemeToggleButton from './ThemeToggleButton';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Usar useTransition para evitar suspensão durante navegação
  const [isPending, startTransition] = useTransition();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Removemos o redirecionamento dentro do Layout para evitar loops
  // O redirecionamento agora é gerenciado apenas pelo ProtectedRoute

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(logoutUser());
    // Usar startTransition para evitar suspensão durante navegação
    startTransition(() => {
      navigate('/login');
    });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Alunos', icon: <StudentIcon />, path: '/alunos' },
    { text: 'Professores', icon: <TeacherIcon />, path: '/professores' },
    { text: 'Cursos', icon: <CourseIcon />, path: '/cursos' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendario' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Relatórios', icon: <ReportIcon />, path: '/relatorios' },
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {/* Gestão Acadêmica */}
            V 1.0.25
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              // Usar startTransition para evitar suspensão durante navegação
              startTransition(() => {
                navigate(item.path);
              });
              if (mobileOpen) setMobileOpen(false);
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
              },
              // Indicador visual para transição pendente
              opacity: isPending ? 0.7 : 1,
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Sistema de Gestão Acadêmica
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Centro de Notificações */}
            <NotificationCenter userType={user?.role || 'guest'} />
            
            {/* Botão de alternância de tema */}
            <ThemeToggleButton />
            
            <Tooltip title="Configurações do perfil">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 32,
                    height: 32,
                  }}
                >
                  {user?.name ? user.name.charAt(0) : '?'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sair</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menu items"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          overflow: 'auto',
        }}
      >
        <Box sx={{ maxWidth: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
