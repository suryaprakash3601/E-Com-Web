import React, { useState, useEffect } from 'react';
import { API } from '../config';
import { updateItem, removeItem } from './cartHelpers';
import {
  Box,
  Typography,
  IconButton,
  Card,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CartItem = ({ product, setRun = (f) => f, run = undefined }) => {
  const [count, setCount] = useState(product.count);
  const [imgSrc, setImgSrc] = useState(`${API}/product/photo/${product._id}`);

  useEffect(() => {
    setCount(product.count);
  }, [product.count]);

  const handleImageError = () => {
    setImgSrc(`https://picsum.photos/seed/${product._id}/150/150`);
  };

  const handleIncrement = () => {
    if (count < product.quantity) {
      const newCount = count + 1;
      setCount(newCount);
      updateItem(product._id, newCount);
      setRun(!run);
    }
  };

  const handleDecrement = () => {
    if (count > 1) {
      const newCount = count - 1;
      setCount(newCount);
      updateItem(product._id, newCount);
      setRun(!run);
    }
  };

  const handleRemove = () => {
    removeItem(product._id);
    setRun(!run);
  };

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'background.paper',
        transition: 'all 0.25s ease-in-out',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Product Image Thumbnail */}
      <Box
        sx={{
          width: { xs: '100%', sm: 80 },
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.100',
          flexShrink: 0,
        }}
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Product Details (Middle) */}
      <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          sx={{ mb: 0.5, color: 'text.primary' }}
        >
          {product.name}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={{ xs: 'center', sm: 'flex-start' }}
          sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}
        >
          {product.category?.name && (
            <Chip
              label={product.category.name}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem', borderColor: 'grey.300', color: 'text.secondary' }}
            />
          )}
          {product.quantity > 0 ? (
            <Chip
              label="In Stock"
              color="success"
              size="small"
              variant="light"
              sx={{ height: 20, fontSize: '0.75rem', bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }}
            />
          ) : (
            <Chip
              label="Out of Stock"
              color="error"
              size="small"
              variant="light"
              sx={{ height: 20, fontSize: '0.75rem', bgcolor: 'error.light', color: 'error.dark', fontWeight: 600 }}
            />
          )}
        </Stack>
      </Box>

      {/* Action Controls & Price (Right) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2.5}
        sx={{ width: { xs: '100%', sm: 'auto' }, borderTop: { xs: '1px solid', sm: 'none' }, pt: { xs: 1.5, sm: 0 }, borderColor: 'grey.100' }}
      >
        {/* Quantity adjustment controls */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            border: '1.5px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
            bgcolor: 'grey.50',
            overflow: 'hidden',
          }}
        >
          <IconButton
            size="small"
            onClick={handleDecrement}
            disabled={count <= 1}
            sx={{ borderRadius: 0, p: 0.5, '&:hover': { bgcolor: 'grey.200' } }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ px: 2, minWidth: 30, textAlign: 'center', userSelect: 'none' }}
          >
            {count}
          </Typography>

          <IconButton
            size="small"
            onClick={handleIncrement}
            disabled={count >= product.quantity}
            sx={{ borderRadius: 0, p: 0.5, '&:hover': { bgcolor: 'grey.200' } }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Pricing */}
        <Box sx={{ textAlign: 'right', minWidth: 70 }}>
          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
            ${(product.price * count).toFixed(2)}
          </Typography>
          {count > 1 && (
            <Typography variant="caption" color="text.secondary">
              ${product.price.toFixed(2)} each
            </Typography>
          )}
        </Box>

        {/* Delete button */}
        <Tooltip title="Remove item">
          <IconButton
            onClick={handleRemove}
            color="error"
            size="medium"
            sx={{
              border: '1px solid',
              borderColor: 'error.light',
              borderRadius: 2,
              p: 1,
              bgcolor: 'error.lighter',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white',
              },
              transition: 'all 0.2s',
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
};

export default CartItem;
