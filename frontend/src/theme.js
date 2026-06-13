import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Vibrant Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f43f5e', // Vibrant Rose/Pink
      light: '#fb7185',
      dark: '#e11d48',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Very soft slate blue-tinted white
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '7px 18px',
          boxShadow: 'none',
          fontSize: '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 14px -6px rgba(99, 102, 241, 0.45)',
          },
        },
        sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem' },
        sizeLarge: { padding: '10px 24px', fontSize: '0.9375rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
          },
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation6: {
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', // Deeper, softer shadow
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.07)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px -6px rgba(0, 0, 0, 0.12)',
          },
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              borderWidth: '2px'
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px -4px rgba(99, 102, 241, 0.2)',
            }
          },
        },
      },
    },
  },
});

export default theme;
