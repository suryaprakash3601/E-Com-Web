import React from 'react';
import Menu from './Menu';
import { Box, Typography, Container } from '@mui/material';

const Layout = ({
  title = 'Title',
  description = 'Description',
  className,
  children,
}) => (
  <Box>
    <Menu />
    {/* Compact page header — not a massive hero, just a tasteful title strip */}
    <Box
      sx={{
        position: 'relative',
        height: { xs: 120, md: 150 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pt: '64px',
        mb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          component="h1"
          fontWeight={700}
          sx={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)', lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            sx={{ mt: 0.5, opacity: 0.85, textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
          >
            {description}
          </Typography>
        )}
      </Container>
    </Box>

    <Box className={className} sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
      {children}
    </Box>
  </Box>
);

export default Layout;
