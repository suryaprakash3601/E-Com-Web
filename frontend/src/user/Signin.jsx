import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import Menu from '../core/Menu.jsx';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Copyright from '../core/Copyright.jsx';
import { signin, authenticate, isAuthenticated } from '../auth/index.js';

export default function Signin() {
  const [values, setValues] = useState({
    email: '',
    password: '',
    error: '',
    loading: false,
    redirectToReferrer: false,
    rememberMe: false,
  });

  const { email, password, loading, error, redirectToReferrer, rememberMe } = values;
  const authData = isAuthenticated();
  const user = authData && authData.user;

  const handleChange = (name) => (event) => {
    const value = name === 'rememberMe' ? event.target.checked : event.target.value;
    setValues({ ...values, error: '', [name]: value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: '', loading: true });

    signin({ email, password, rememberMe }).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, loading: false });
      } else {
        authenticate(data, () => {
          setValues({ ...values, redirectToReferrer: true });
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

  const showLoading = () =>
    loading && (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress color='primary' />
      </Box>
    );

  const redirectUser = () => {
    if (redirectToReferrer) {
      if (user && user.role === 1) {
        return <Navigate to='/admin/dashboard' />;
      } else {
        return <Navigate to='/user/dashboard' />;
      }
    }
    if (isAuthenticated()) {
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80)',
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
              Welcome Back
            </Typography>
            <Typography variant="h5" sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Discover the latest trends and premium quality products.
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
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component='h1' variant='h4' fontWeight="700" sx={{ mb: 3 }}>
              Sign in
            </Typography>

            {showError()}
            {showLoading()}

            <Box component='form' noValidate onSubmit={clickSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                autoComplete='email'
                autoFocus
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
                autoComplete='current-password'
                value={password}
                onChange={handleChange('password')}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <FormControlLabel
                control={<Checkbox value='remember' color='primary' checked={rememberMe} onChange={handleChange('rememberMe')} />}
                label='Remember me'
                sx={{ mt: 1 }}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link component={RouterLink} to='/forgot-password' variant='body2' sx={{ fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to='/signup' variant='body2' sx={{ fontWeight: 500 }}>
                    {"Don't have an account? Sign Up"}
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
