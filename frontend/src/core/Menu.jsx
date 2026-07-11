import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signout, isAuthenticated } from '../auth';
import { itemTotal } from './cartHelpers';
import CartDrawer from './CartDrawer';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Home,
  Storefront,
  Dashboard,
  AccountCircle,
  PersonAdd,
  ExitToApp,
  Store,
  Menu as MenuIcon,
} from '@mui/icons-material';

const MaterialAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const currentPath = location.pathname;

  const isMobileMenuOpen = Boolean(mobileAnchorEl);

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
    if (isMobileMenuOpen) {
      handleMobileMenuClose();
    }
  };

  const handleSignout = () => {
    signout(() => {
      navigate('/');
    });
    handleMobileMenuClose();
  };

  const isActive = (path) => currentPath === path;

  // Navigation items data
  const navItems = [
    { path: '/', label: 'Home', icon: <Home />, show: true },
    { path: '/shop', label: 'Shop', icon: <Storefront />, show: true },
    {
      action: toggleCart,
      label: 'Cart',
      icon: (
        <Badge badgeContent={itemTotal()} color='error'>
          <ShoppingCart />
        </Badge>
      ),
      show: true,
    },
    {
      path: '/user/dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      show: isAuthenticated() && isAuthenticated().user.role === 0,
    },
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      show: isAuthenticated() && isAuthenticated().user.role === 1,
    },
    {
      path: '/signin',
      label: 'Sign In',
      icon: <AccountCircle />,
      show: !isAuthenticated(),
    },
    {
      path: '/signup',
      label: 'Sign Up',
      icon: <PersonAdd />,
      show: !isAuthenticated(),
    },
  ];

  const renderDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {navItems.map(
        (item, i) =>
          item.show && (
            <Button
              key={i}
              component={item.path ? Link : 'button'}
              to={item.path}
              onClick={item.action}
              startIcon={item.icon}
              sx={{
                color: 'white',
                fontWeight: item.path && isActive(item.path) ? 'bold' : 'normal',
                backgroundColor: item.path && isActive(item.path)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          )
      )}
      {isAuthenticated() && (
        <Button
          onClick={handleSignout}
          startIcon={<ExitToApp />}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          Sign Out
        </Button>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileAnchorEl}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          width: 250,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
      }}
      MenuListProps={{
        sx: {
          padding: 0,
        },
      }}
    >
      {navItems.map(
        (item, i) =>
          item.show && (
            <MenuItem
              key={i}
              component={item.path ? Link : 'div'}
              to={item.path}
              onClick={item.action || handleMobileMenuClose}
              sx={{
                backgroundColor: item.path && isActive(item.path)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          )
      )}
      {isAuthenticated() && (
        <>
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <MenuItem
            onClick={handleSignout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary='Sign Out' />
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <>
      <AppBar
        position='fixed'
        elevation={4}
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge='start'
              color='inherit'
              aria-label='brand'
              component={Link}
              to='/'
              sx={{ mr: 1 }}
            >
              <Store />
            </IconButton>
            <Typography
              variant='h6'
              component={Link}
              to='/'
              sx={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: 'white',
              }}
            >
              ShopZone
            </Typography>
          </Box>

          {!isMobile ? (
            renderDesktopNav()
          ) : (
            <IconButton
              color='inherit'
              aria-label='open menu'
              onClick={handleMobileMenuOpen}
            >
              <Badge badgeContent={itemTotal()} color='error'>
                 <MenuIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>

        {isMobile && renderMobileMenu()}
      </AppBar>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default MaterialAppBar;
