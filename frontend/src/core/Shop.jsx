import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import Button from '@mui/material/Button';
import Card from './Card.jsx';
import { getCategories, getFilteredProducts } from './apiCore.js';
import CategoriesFilter from './CategoriesFilter';
import PriceRangeFilter from './PriceRangeFilter';
import { Box, Grid, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

import Search from './Search';
import { prices } from './fixedPrices.js';
import Copyright from './Copyright';

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  borderRadius: theme.shape.borderRadius,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 20px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
  },
  transition: 'all 0.3s'
}));

const Shop = () => {
  const location = useLocation();
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(false);
  const [limit, setLimit] = useState(6);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const init = () => {
    getCategories().then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setCategories(data);
      }
    });
  };

  const loadFilteredResults = (newFilters) => {
    setLoading(true);
    getFilteredProducts(skip, limit, newFilters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults(data.data);
        setSize(data.size);
        setSkip(0);
      }
      setLoading(false);
    });
  };

  const loadMore = () => {
    let toSkip = skip + limit;
    getFilteredProducts(toSkip, limit, myFilters.filters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults([...filteredResults, ...data.data]);
        setSize(data.size);
        setSkip(toSkip);
      }
    });
  };

  const loadMoreButton = () => {
    return (
      size > 0 &&
      size >= limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <GradientButton onClick={loadMore} variant='contained'>
            Load more products
          </GradientButton>
        </Box>
      )
    );
  };

  useEffect(() => {
    init();
    const initialCategory = location.state?.category ? [location.state.category] : [];
    const newFilters = {
      filters: { category: initialCategory, price: [] }
    };
    setMyFilters(newFilters);
    loadFilteredResults(newFilters.filters);
    // eslint-disable-next-line
  }, [location.state]);

  const handleFilters = (filters, filterBy) => {
    const newFilters = { ...myFilters };
    newFilters.filters[filterBy] = filters;

    if (filterBy === 'price') {
      let priceValues = handlePrice(filters);
      newFilters.filters[filterBy] = priceValues;
    }
    loadFilteredResults(myFilters.filters);
    setMyFilters(newFilters);
  };

  const handlePrice = (value) => {
    const data = prices;
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value)) {
        array = data[key].array;
      }
    }
    return array;
  };

  return (
    <Layout
      title='Shop Collection'
      description='Explore our exclusive catalog.'
      className='container-fluid'
    >
      <Box sx={{ mb: 4 }}>
        <Search />
      </Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
            <CategoriesFilter
              categories={categories}
              handleFilters={(filters) => handleFilters(filters, 'category')}
              initialChecked={myFilters.filters.category}
            />
            <PriceRangeFilter
              prices={prices}
              handleFilters={(filters) => handleFilters(filters, 'price')}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant='h6' fontWeight="700" sx={{ mb: 2, pb: 0.5, borderBottom: '2px solid', borderColor: 'secondary.main', display: 'inline-block' }}>
            Products
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2.5,
              mb: 3,
            }}
          >
            {loading ? (
              Array.from(new Array(6)).map((_, index) => (
                <Box key={index} sx={{ height: '100%', pt: 0.5 }}>
                  <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
                  <Skeleton width="60%" sx={{ mt: 2 }} />
                  <Skeleton width="40%" />
                  <Skeleton width="80%" sx={{ mt: 2 }} />
                </Box>
              ))
            ) : filteredResults.length > 0 ? (
              filteredResults.map((product, i) => (
                 <Box sx={{ height: '100%', transform: 'translateZ(0)' }} key={i}>
                    <Card product={product} />
                 </Box>
              ))
            ) : (
               <Typography variant="h6" color="text.secondary" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                 No products found matching your criteria.
               </Typography>
            )}
          </Box>
          {loadMoreButton()}
        </Grid>
      </Grid>
      <Box sx={{ mt: 8, py: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'grey.200' }}>
         <Copyright />
      </Box>
    </Layout>
  );
};

export default Shop;
