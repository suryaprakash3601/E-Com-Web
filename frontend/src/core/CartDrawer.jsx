import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, Box, Typography, Divider, IconButton, Button, Stack, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { getCart } from './cartHelpers.js';
import Card from './Card.jsx';

const CartDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(getCart());
    }
  }, [open, run]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 0, display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartOutlinedIcon />
          <Typography variant="h6" fontWeight="bold">
            Your Cart ({items.length})
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default' }}>
        {items.length > 0 ? (
          <Stack spacing={3}>
            {items.map((product, i) => (
              <Box key={i} sx={{ position: 'relative' }}>
                <Card
                  product={product}
                  showAddToCartButton={false}
                  cartUpdate={true}
                  showRemoveProductButton={true}
                  setRun={setRun}
                  run={run}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6">Your cart is empty</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Looks like you haven't added anything yet.</Typography>
            <Button variant="contained" color="primary" onClick={onClose} component={Link} to="/shop">
              Start Shopping
            </Button>
          </Box>
        )}
      </Box>

      {items.length > 0 && (
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large" 
            component={Link} 
            to="/cart" 
            onClick={onClose}
            sx={{ mb: 2 }}
          >
            Review & Checkout
          </Button>
          <Button variant="outlined" color="inherit" fullWidth onClick={onClose}>
            Continue Shopping
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
