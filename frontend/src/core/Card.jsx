import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import ShowImage from './ShowImage';
import moment from 'moment';

// MUI imports
import Button from '@mui/material/Button';
import CardM from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { addItem, updateItem, removeItem } from './cartHelpers';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const Card = ({
  product,
  showViewProductButton = true,
  showAddToCartButton = true,
  cartUpdate = false,
  showRemoveProductButton = false,
  setRun = (f) => f,
  run = undefined,
}) => {
  const [redirect, setRedirect] = useState(false);
  const [count, setCount] = useState(product.count);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showViewButton = (showViewProductButton) => {
    return (
      showViewProductButton && (
        <Button
          href={`/product/${product._id}`}
          variant='contained'
          color='primary'
          sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
        >
          View Item
        </Button>
      )
    );
  };

  const addToCart = () => {
    addItem(product, () => {
      setSnackbarMessage(`${product.name} added to cart!`);
      setOpenSnackbar(true);
      setRun(!run); // Trigger updates
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const shouldRedirect = (redirect) => {
    if (redirect) {
      return <Navigate to='/cart' />;
    }
  };

  const showAddToCartBtn = (showAddToCartButton) => {
    return (
      showAddToCartButton && (
        <Button
          onClick={addToCart}
          variant='contained'
          color='secondary'
          startIcon={<ShoppingCartIcon />}
          disabled={product.quantity < 1}
          sx={{ flexGrow: 1, color: 'white', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
        >
          Add to Cart
        </Button>
      )
    );
  };

  const showStock = (quantity) => {
    return quantity > 0 ? (
      <Chip label='In Stock' color='success' size='small' sx={{ mb: 1, fontWeight: 600 }} />
    ) : (
      <Chip label='Out of Stock' color='error' size='small' sx={{ mb: 1, fontWeight: 600 }} />
    );
  };

  const handleChange = (productId) => (event) => {
    const val = event.target.value < 1 ? 1 : event.target.value;
    setCount(val);
    updateItem(productId, val);
    setRun(!run);
    setSnackbarMessage('Quantity updated!');
    setOpenSnackbar(true);
  };

  const showCartUpdateOptions = (cartUpdate) => {
    return (
      cartUpdate && (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Adjust Quantity</InputLabel>
            <TextField
              type='number'
              variant='outlined'
              size="small"
              value={count}
              onChange={handleChange(product._id)}
              sx={{ mt: 1 }}
              inputProps={{ min: 1, max: product.quantity }}
            />
          </FormControl>
        </Box>
      )
    );
  };

  const showRemoveButton = (showRemoveProductButton) => {
    return (
      showRemoveProductButton && (
        <Button
          onClick={() => {
            removeItem(product._id);
            setRun(!run);
            setSnackbarMessage(`${product.name} removed from cart!`);
            setOpenSnackbar(true);
          }}
          variant='contained'
          color='error'
          startIcon={<DeleteIcon />}
          sx={{ mt: 1.5, width: '100%', borderRadius: 2 }}
        >
          Remove
        </Button>
      )
    );
  };

  // Generate a deterministic rating/review count for visuals
  const seedRating = 4.0 + ((product.name.length % 10) / 10);
  const reviewCount = (product.price.toString().charCodeAt(0) * 3) % 200 + 15;

  return (
    <>
      <CardM
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
          },
        }}
      >
        {shouldRedirect(redirect)}

        {/* Dynamic absolute badges on top of card */}
        {product.quantity <= 15 && product.quantity > 0 && (
          <Chip
            label={`Only ${product.quantity} Left!`}
            size="small"
            color="error"
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 700 }}
          />
        )}
        {product.price >= 150 && product.quantity > 15 && (
          <Chip
            label="Free Delivery"
            size="small"
            color="info"
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 700 }}
          />
        )}
        {product.quantity > 15 && product.price < 150 && (product.price % 3 === 0) && (
          <Chip
            label="Best Seller"
            size="small"
            color="warning"
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 700, color: 'white' }}
          />
        )}

        <ShowImage item={product} url='product' />

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
          <Typography gutterBottom variant='h6' component='h2' fontWeight={700} noWrap sx={{ mb: 0.5 }}>
            {product.name}
          </Typography>

          {/* Flipkart/Amazon ratings style */}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" sx={{ color: '#ff9900' }}>
              <StarIcon sx={{ fontSize: 16 }} />
              <StarIcon sx={{ fontSize: 16 }} />
              <StarIcon sx={{ fontSize: 16 }} />
              <StarIcon sx={{ fontSize: 16 }} />
              <StarIcon sx={{ fontSize: 16, opacity: seedRating >= 4.5 ? 1 : 0.4 }} />
            </Stack>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {seedRating.toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              ({reviewCount} reviews)
            </Typography>
          </Stack>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
              fontSize: '0.825rem'
            }}
          >
            {product.description}
          </Typography>

          <Stack direction='row' spacing={1} alignItems="center" sx={{ mb: 1.5, mt: 'auto' }}>
            <Typography variant='h6' fontWeight='800' color="primary.main">
              ${product.price.toFixed(2)}
            </Typography>
            {showStock(product.quantity)}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 0.5, sm: 0 }}
            sx={{ mb: 2 }}
          >
            <Typography variant='caption' color='text.secondary'>
              Category: <strong>{product.category?.name || 'General'}</strong>
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {moment(product.createdAt).fromNow()}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              width: '100%'
            }}
          >
            {showViewButton(showViewProductButton)}
            {showAddToCartBtn(showAddToCartButton)}
          </Box>

          {showCartUpdateOptions(cartUpdate)}
          {showRemoveButton(showRemoveProductButton)}
        </CardContent>
      </CardM>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Card;
