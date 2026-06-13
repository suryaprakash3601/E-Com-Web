import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import Menu from '../core/Menu.jsx';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Copyright from '../core/Copyright.jsx';
import { signup, isAuthenticated } from '../auth/index.js';

export default function Signup() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    error: '',
    success: false,
    loading: false,
  });

  const { name, email, password, success, error, loading } = values;
  const authData = isAuthenticated();
  const user = authData && authData.user;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: '', [name]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: '', loading: true });
    signup({ name, email, password }).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, success: false, loading: false });
      } else {
        setValues({
          ...values,
          name: '',
          email: '',
          password: '',
          error: '',
          success: true,
          loading: false,
        });
      }
    });
  };

  const showError = () =>
    error && (
      <Alert severity='error' sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );

  const showSuccess = () =>
    success && (
      <Alert severity='success' sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        New account created successfully! Please <Link component={RouterLink} to='/signin' sx={{ fontWeight: 'bold' }}>Sign In</Link>.
      </Alert>
    );

  const redirectUser = () => {
    if (user) {
      return <Navigate to='/' />;
    }
  };

  return (
    <>
      <Menu />
      <Grid container component='main' sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <CssBaseline />
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=80)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            px: 6,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0))'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: '500px', width: '100%' }}>
            <Typography variant="h2" fontWeight="800" gutterBottom>
              Join Us Today
            </Typography>
            <Typography variant="h5" sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Create an account and start shopping for exclusive premium items.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, sm: 6, md: 8 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '450px',
            }}
          >
            {redirectUser()}
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component='h1' variant='h4' fontWeight="700" sx={{ mb: 3 }}>
              Sign up
            </Typography>

            {showSuccess()}
            {showError()}

            <Box component='form' noValidate onSubmit={clickSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin='normal'
                required
                fullWidth
                id='name'
                label='Full Name'
                name='name'
                autoComplete='name'
                autoFocus
                value={name}
                onChange={handleChange('name')}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                autoComplete='email'
                value={email}
                onChange={handleChange('email')}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                autoComplete='new-password'
                value={password}
                onChange={handleChange('password')}
                inputProps={{ minLength: 6 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to='/signin' variant='body2' sx={{ fontWeight: 500 }}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
