import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { read, listRelated } from './apiCore';
import Card from './Card';
import ShowImage from './ShowImage';
import { addItem } from './cartHelpers';
import moment from 'moment';

import { Box, Grid, Typography, Button, Snackbar, Alert, Divider, Chip, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Product = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [added, setAdded] = useState(false);

  const { productId } = useParams();

  const loadSingleProduct = (productId) => {
    read(productId).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProduct(data);
        setError('');
        listRelated(data._id).then((relatedData) => {
          if (relatedData.error) {
            setError(relatedData.error);
          } else {
            setRelatedProducts(relatedData);
          }
        });
      }
    });
  };

  useEffect(() => {
    loadSingleProduct(productId);
    window.scrollTo(0, 0);
  }, [productId]);

  const addToCart = () => {
    addItem(product, () => {
      setOpenSnackbar(true);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <Layout
      title={product?.name || 'Product Details'}
      description={product?.description?.substring(0, 100) || 'Find exactly what you need.'}
      className='container-fluid'
    >
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Left Column - Large Image */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
              {product ? (
                 <Box sx={{ img: { width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.05)' } } }}>
                    <ShowImage item={product} url='product' />
                 </Box>
              ) : (
                <Typography>Loading image...</Typography>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Details & Actions */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: { md: 4 } }}>
              {product ? (
                <>
                  <Typography variant='h5' fontWeight="700" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant='h6' color="secondary.main" fontWeight="700" sx={{ mb: 1.5 }}>
                    ${product.price}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {product.quantity > 0 ? (
                      <Chip label='In Stock' color='success' />
                    ) : (
                      <Chip label='Out of Stock' color='error' />
                    )}
                    <Chip label={`Category: ${product.category?.name}`} variant="outlined" />
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5, lineHeight: 1.7 }}>
                    {product.description}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Added {moment(product.createdAt).fromNow()}
                  </Typography>

                  <Button
                    onClick={addToCart}
                    variant='contained'
                    color={added ? "success" : "primary"}
                    size="large"
                    disabled={product.quantity < 1}
                    startIcon={added ? <CheckCircleOutlineIcon /> : <ShoppingCartIcon />}
                    sx={{ 
                      transition: 'all 0.3s ease',
                      boxShadow: added ? '0 4px 14px 0 rgba(46, 125, 50, 0.39)' : '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                      transform: added ? 'scale(0.98)' : 'scale(1)'
                    }}
                  >
                    {added ? 'Added to Cart!' : 'Add to Cart'}
                  </Button>
                </>
              ) : (
                <Typography>Loading product details...</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Section - Related Products */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant='h6' fontWeight="700" sx={{ mb: 2.5, textAlign: 'center' }}>
            Products You May Like
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p, i) => (
                <Box sx={{ height: '100%' }} key={i}>
                   <Card product={p} />
                </Box>
              ))
            ) : (
              <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: 'text.secondary' }}>
                No related products found.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity='success' variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          Awesome! {product?.name} was added to your cart.
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Product;
