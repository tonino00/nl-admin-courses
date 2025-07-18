import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { RootState } from '../store';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: themeMode === 'light' ? '#f5f5f5' : '#121212',
            paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: themeMode === 'light' ? '#1976d2' : '#272727',
              },
            },
          },
        },
      }),
    [themeMode],
  );

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline /> {/* Isso reseta o CSS para um estilo consistente e aplica o tema */}
      {children}
    </MUIThemeProvider>
  );
};

export default ThemeProvider;
