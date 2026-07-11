import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts, getCategories } from './apiCore.js';
import Card from './Card.jsx';
import Search from './Search';
import Copyright from './Copyright.jsx';
import { Box, Container, Typography, Button, Grid, Divider, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [error, setError] = useState([]);

  const loadProductsBySell = () => {
    getProducts('sold').then((data) => {
      if (data.error) setError(data.error);
      else setProductsBySell(data);
    });
  };

  const loadProductsByArrival = () => {
    getProducts('createdAt').then((data) => {
      if (data.error) setError(data.error);
      else setProductsByArrival(data);
    });
  };

  const loadCategories = () => {
    getCategories().then((data) => {
      if (data.error) setError(data.error);
      else setCategories(data);
    });
  };

  useEffect(() => {
    loadProductsByArrival();
    loadProductsBySell();
    loadCategories();
  }, []);

  return (
    <Layout
      title="Welcome to ShopZone"
      description="Premium products, delivered fast"
    >
      {/* Flipkart-Style Category Quick Navigation */}
      {categories.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2.5, sm: 4, md: 6 },
            py: 2.5,
            px: 3,
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'background.paper',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {categories.map((c) => {
            let icon = '📦';
            const name = c.name.toLowerCase();
            if (name.includes('electron')) icon = '💻';
            else if (name.includes('book')) icon = '📚';
            else if (name.includes('cloth')) icon = '👕';
            else if (name.includes('home') || name.includes('kitchen')) icon = '🏠';
            else if (name.includes('shoe') || name.includes('foot')) icon = '👟';
            
            return (
              <Box
                key={c._id}
                onClick={() => navigate('/shop', { state: { category: c._id } })}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    color: 'primary.main',
                  },
                  minWidth: 80,
                }}
              >
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {icon}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  {c.name}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Compact promo strip */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: 'white',
          borderRadius: 2,
          px: { xs: 3, md: 6 },
          py: { xs: 2.5, md: 3 },
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <Box sx={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            New Season Arrivals 🎉
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.88 }}>
            Fresh drops every week — limited stock, shop now!
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/shop"
          variant="contained"
          size="medium"
          sx={{
            bgcolor: 'white',
            color: 'primary.dark',
            fontWeight: 700,
            '&:hover': { bgcolor: 'grey.100' },
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Shop Now →
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <Search />
      </Box>

      <Container maxWidth="lg" disableGutters>
        {/* New Arrivals */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              🆕 New Arrivals
            </Typography>
            <Button component={Link} to="/shop" size="small" sx={{ color: 'primary.main' }}>
              View all →
            </Button>
          </Box>
          <Grid container spacing={2.5}>
            {productsByArrival.map((product, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ mb: 5 }} />

        {/* Best Sellers */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              🔥 Best Sellers
            </Typography>
            <Button component={Link} to="/shop" size="small" sx={{ color: 'secondary.main' }}>
              View all →
            </Button>
          </Box>
          <Grid container spacing={2.5}>
            {productsBySell.map((product, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Box sx={{ mt: 4, py: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Copyright />
      </Box>
    </Layout>
  );
};

export default Home;
