import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Chip, Paper } from '@mui/material';

const PriceRangeFilter = ({ prices, handleFilters }) => {
  const [value, setValue] = useState('');

  const handleChange = (priceId) => {
    setValue(priceId);
    handleFilters(priceId);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant='h6' fontWeight="700" sx={{ mb: 2 }}>
        Price Range
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {prices.map((price) => (
          <Chip
            key={price._id}
            label={price.name}
            clickable
            color={value === price._id ? 'secondary' : 'default'}
            variant={value === price._id ? 'filled' : 'outlined'}
            onClick={() => handleChange(price._id)}
            sx={{
              fontWeight: 500,
              px: 1,
              py: 2.5,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default PriceRangeFilter;
