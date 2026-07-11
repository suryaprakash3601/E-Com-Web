import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Chip, Paper } from '@mui/material';

const CategoriesFilter = ({ categories, handleFilters, initialChecked = [] }) => {
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);

  const handleToggle = (categoryId) => {
    const currentIndex = checked.indexOf(categoryId);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(categoryId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    handleFilters(newChecked);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant='h6' fontWeight="700" sx={{ mb: 2 }}>
        Categories
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Chip
            key={category._id}
            label={category.name}
            clickable
            color={checked.includes(category._id) ? 'primary' : 'default'}
            variant={checked.includes(category._id) ? 'filled' : 'outlined'}
            onClick={() => handleToggle(category._id)}
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

export default CategoriesFilter;
