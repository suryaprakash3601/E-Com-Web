import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts, getCategories } from './apiCore.js';
import Card from './Card.jsx';
import Search from './Search';
import Copyright from './Copyright.jsx';
import { Box, Container, Typography, Button, Grid, Divider, Paper, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const HERO_SLIDES = [
  {
    title: "Vibrant Season Sale! 🌟",
    description: "Upgrade your lifestyle with up to 40% off on premium category electronics, clothes, and home accessories.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80",
    buttonText: "Explore Sale",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
  },
  {
    title: "Premium Sound Experience 🎧",
    description: "Industry leading noise-canceling headphones, gaming keyboards, and premium gadgets.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1000&q=80",
    buttonText: "Shop Audio",
    bg: "linear-gradient(135deg, #cc7a00 0%, #ff9900 100%)"
  },
  {
    title: "Breathe, Stretch, Excel 🧘",
    description: "Discover our all-new Fitness & Outdoors collection with eco-friendly yoga mats and bottles.",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=80",
    buttonText: "Get Active",
    bg: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [error, setError] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
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
            borderRadius: 4,
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
            let color = '#f1f5f9';
            const name = c.name.toLowerCase();
            if (name.includes('electron')) {
              icon = '💻';
              color = '#eff6ff';
            } else if (name.includes('book')) {
              icon = '📚';
              color = '#f0fdf4';
            } else if (name.includes('cloth')) {
              icon = '👕';
              color = '#faf5ff';
            } else if (name.includes('home') || name.includes('kitchen')) {
              icon = '🏠';
              color = '#fdf2f8';
            } else if (name.includes('fit') || name.includes('outdoor') || name.includes('sport')) {
              icon = '🚴';
              color = '#fffbeb';
            } else if (name.includes('beauty') || name.includes('personal')) {
              icon = '💄';
              color = '#fff1f2';
            }
            
            return (
              <Box
                key={c._id}
                onClick={() => navigate('/shop', { state: { category: c._id } })}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    '& .category-icon-bg': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 8px 20px -6px rgba(255, 153, 0, 0.2)',
                    },
                    '& .category-name': {
                      color: 'secondary.main',
                    }
                  },
                  minWidth: 90,
                  textAlign: 'center',
                }}
              >
                <Box
                  className="category-icon-bg"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1.2,
                    fontSize: '1.8rem',
                    transition: 'all 0.25s',
                    border: '1px solid rgba(0,0,0,0.03)',
                  }}
                >
                  {icon}
                </Box>
                <Typography className="category-name" variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.8rem', transition: 'color 0.2s' }}>
                  {c.name}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Dynamic Hero Carousel */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 260, md: 340 },
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
          boxShadow: '0 10px 35px -12px rgba(0,0,0,0.1)',
        }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: activeSlide === idx ? 1 : 0,
              visibility: activeSlide === idx ? 'visible' : 'hidden',
              transition: 'all 0.8s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              background: slide.bg,
              color: 'white',
              px: { xs: 4, md: 8 },
              py: 4,
            }}
          >
            {/* Slide Background Image overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: { xs: '100%', md: '50%' },
                height: '100%',
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: { xs: 0.15, md: 0.45 },
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                zIndex: 0,
              }}
            />
            {/* Slide Content */}
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.6rem', md: '2.6rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {slide.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, fontSize: { xs: '0.9rem', md: '1.05rem' } }}>
                {slide.description}
              </Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                }}
              >
                {slide.buttonText}
              </Button>
            </Box>
          </Box>
        ))}

        {/* Carousel Slide Indicators */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          {HERO_SLIDES.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setActiveSlide(idx)}
              sx={{
                width: activeSlide === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: activeSlide === idx ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 5 }}>
        <Search />
      </Box>

      <Container maxWidth="lg" disableGutters>
        {/* New Arrivals */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
              🆕 New Arrivals
            </Typography>
            <Button component={Link} to="/shop" size="small" variant="text" color="primary" sx={{ fontWeight: 700 }}>
              View all →
            </Button>
          </Box>
          <Grid container spacing={3}>
            {productsByArrival.map((product, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Best Sellers */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
              🔥 Best Sellers
            </Typography>
            <Button component={Link} to="/shop" size="small" variant="text" color="primary" sx={{ fontWeight: 700 }}>
              View all →
            </Button>
          </Box>
          <Grid container spacing={3}>
            {productsBySell.map((product, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Box sx={{ mt: 6, py: 4, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Copyright />
      </Box>
    </Layout>
  );
};

export default Home;
