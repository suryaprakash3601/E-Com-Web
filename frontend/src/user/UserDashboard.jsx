import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Avatar,
  Paper,
} from '@mui/material';
import { isAuthenticated } from '../auth';
import { getPurchaseHistory } from './apiUser';
import moment from 'moment';
import Layout from '../core/Layout';
import UserSidebar from '../components/UserSidebar';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    user: { _id, name, email, role },
  } = isAuthenticated();

  const token = isAuthenticated().token;

  const init = (userId, token) => {
    getPurchaseHistory(userId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setHistory(data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    init(_id, token);
  }, [_id, token]);

  const UserInfoCard = () => (
    <Card elevation={0} sx={{ borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ height: 120, bgcolor: 'primary.main', background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)' }} />
      <CardContent sx={{ px: 4, pb: 4, position: 'relative' }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            fontSize: '2.5rem',
            bgcolor: 'secondary.main',
            border: '4px solid white',
            position: 'absolute',
            top: -50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ mt: 6 }}>
          <Typography variant='h4' fontWeight="800" gutterBottom>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', color: 'text.secondary', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailOutlinedIcon fontSize="small" />
              <Typography variant='body1'>{email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeOutlinedIcon fontSize="small" />
              <Chip
                label={role === 1 ? 'Admin' : 'Registered User'}
                color={role === 1 ? 'primary' : 'default'}
                size='small'
                variant={role === 1 ? "filled" : "outlined"}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const PurchaseHistoryCard = () => (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagOutlinedIcon color="primary" />
            <Typography variant='h6' fontWeight="bold">Recent Orders</Typography>
          </Box>
        }
        sx={{ bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}
      />
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {loading ? (
          <Typography>Loading history...</Typography>
        ) : history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
             <ShoppingBagOutlinedIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
             <Typography variant="h6">No orders yet</Typography>
             <Typography variant="body2">When you purchase items, they will appear here.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {history.map((h, i) => (
              <React.Fragment key={i}>
                <Box sx={{ mb: 4 }}>
                   <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                     Order Placed: {moment(h.createdAt).format('MMMM Do YYYY, h:mm a')}
                   </Typography>
                  {h.products.map((p, j) => (
                    <Paper
                      key={j}
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'background.default',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'white' },
                      }}
                    >
                      <Grid container spacing={2} alignItems='center'>
                        <Grid item xs={12} sm={8}>
                          <Typography variant='h6' fontWeight='600' color="primary.dark">
                            {p.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Quantity: {p.count || 1}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={4}
                          sx={{ textAlign: { xs: 'left', sm: 'right' } }}
                        >
                          <Typography variant='h6' color='text.primary' fontWeight="700">
                            ${p.price.toFixed(2)}
                          </Typography>
                          <Chip label="Processing" size="small" color="info" sx={{ mt: 1 }} />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
                {i !== history.length - 1 && <Divider sx={{ my: 4 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout title='My Dashboard' description={`Manage your account and view orders.`}>
      <Grid container spacing={4} sx={{ mt: 2, mb: 8, maxWidth: 1200, mx: 'auto' }}>
        {/* LEFT SIDEBAR */}
        <UserSidebar userId={_id} />

        {/* MAIN CONTENT */}
        <Grid item xs={12} md={9}>
          <UserInfoCard />
          <PurchaseHistoryCard />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
