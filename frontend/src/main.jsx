import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material'
import './index.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: {
      main: '#335fa0',
      light: '#5f84bc',
      dark: '#24477a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5bacc3',
      light: '#83c2d4',
      dark: '#3f8ea5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f2f7ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f1e35',
      secondary: '#5a6c8a',
    },
    warning: {
      main: '#db1a10',
      light: '#ffad42',
      dark: '#bb4d00',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'primary',
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          boxShadow: 'none',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: ({ theme }) => ({
          boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`,
          '&:hover': {
            boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.28)}`,
          },
        }),
        containedSecondary: ({ theme }) => ({
          boxShadow: `0 8px 18px ${alpha(theme.palette.secondary.main, 0.24)}`,
          '&:hover': {
            boxShadow: `0 10px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
          },
        }),
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiTextField: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.light, 0.08),
          '& fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.34),
          },
          '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderWidth: 2,
          },
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
        filledError: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.dark,
        }),
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)