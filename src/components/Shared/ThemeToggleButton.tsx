import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';

const ThemeToggleButton: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <Tooltip title={themeMode === 'light' ? 'Modo escuro' : 'Modo claro'}>
      <IconButton 
        color="inherit" 
        onClick={handleToggleTheme} 
        aria-label="alternar tema"
        sx={{ ml: 1 }}
      >
        {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
