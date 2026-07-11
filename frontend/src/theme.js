import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f172a', // Sleek Dark Slate
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9900', // Amazon-style Amber Gold
      light: '#ffb84d',
      dark: '#cc7a00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9', // Soft slate grey background
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 16, // Softer, modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          boxShadow: 'none',
          fontSize: '0.875rem',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1.5px)',
            boxShadow: '0 8px 20px -8px rgba(255, 153, 0, 0.4)',
          },
        },
        sizeSmall: { padding: '5px 14px', fontSize: '0.8125rem' },
        sizeLarge: { padding: '12px 28px', fontSize: '0.9375rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            boxShadow: '0 8px 20px -8px rgba(15, 23, 42, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #ff9900 0%, #ff5500 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ffaa1a 0%, #ff661a 100%)',
            boxShadow: '0 8px 20px -8px rgba(255, 85, 0, 0.5)',
          },
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation2: {
          boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        },
        elevation6: {
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 16px 32px -12px rgba(0, 0, 0, 0.12)',
          },
          border: '1px solid rgba(226, 232, 240, 0.7)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: '#cbd5e1' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': {
              borderColor: '#ff9900',
              borderWidth: '2px'
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 12px -6px rgba(255, 153, 0, 0.25)',
            }
          },
        },
      },
    },
  },
});

export default theme;
