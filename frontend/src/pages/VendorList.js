import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Rating,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search,
  Business,
  LocationOn,
  Star,
  FilterList,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const VendorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Mock data - in real app, this would come from API
  const vendors = [
    {
      id: 1,
      businessName: "Bella's Beauty Salon",
      businessType: 'beauty',
      description: 'Professional hair styling, coloring, and beauty treatments in the heart of Helensvale.',
      location: { address: { city: 'Helensvale', state: 'QLD' } },
      ratings: { average: 4.9, count: 127 },
      services: [
        { name: 'Hair Cut & Style', price: 65 },
        { name: 'Hair Coloring', price: 120 },
        { name: 'Facial Treatment', price: 85 }
      ],
      isVerified: true,
    },
    {
      id: 2,
      businessName: 'TechFix Solutions',
      businessType: 'service',
      description: 'Computer repair, IT support, and technology solutions for home and business.',
      location: { address: { city: 'Helensvale', state: 'QLD' } },
      ratings: { average: 4.8, count: 89 },
      services: [
        { name: 'Computer Repair', price: 80 },
        { name: 'Data Recovery', price: 150 },
        { name: 'IT Consultation', price: 100 }
      ],
      isVerified: true,
    },
    {
      id: 3,
      businessName: 'Green Thumb Gardens',
      businessType: 'service',
      description: 'Professional landscaping, garden design, and maintenance services.',
      location: { address: { city: 'Helensvale', state: 'QLD' } },
      ratings: { average: 4.7, count: 156 },
      services: [
        { name: 'Garden Design', price: 200 },
        { name: 'Lawn Maintenance', price: 60 },
        { name: 'Tree Pruning', price: 120 }
      ],
      isVerified: false,
    },
    {
      id: 4,
      businessName: 'Fitness First Personal Training',
      businessType: 'fitness',
      description: 'Personal training, group fitness classes, and nutrition coaching.',
      location: { address: { city: 'Helensvale', state: 'QLD' } },
      ratings: { average: 4.6, count: 73 },
      services: [
        { name: 'Personal Training Session', price: 75 },
        { name: 'Group Fitness Class', price: 25 },
        { name: 'Nutrition Consultation', price: 90 }
      ],
      isVerified: true,
    },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'fitness', label: 'Fitness & Health' },
    { value: 'service', label: 'Professional Services' },
    { value: 'restaurant', label: 'Food & Dining' },
    { value: 'retail', label: 'Retail & Shopping' },
  ];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || vendor.businessType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.ratings.average - a.ratings.average;
      case 'reviews':
        return b.ratings.count - a.ratings.count;
      case 'name':
        return a.businessName.localeCompare(b.businessName);
      default:
        return 0;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Local Businesses in Helensvale
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover and connect with amazing local services in your community
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="reviews">Most Reviews</MenuItem>
                <MenuItem value="name">Name A-Z</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="body2">
                {sortedVendors.length} results
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Vendor Cards */}
      <Grid container spacing={3}>
        {sortedVendors.map((vendor) => (
          <Grid item xs={12} sm={6} md={4} key={vendor.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Business sx={{ fontSize: 60, color: 'grey.400' }} />
                {vendor.isVerified && (
                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  />
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {vendor.businessName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {vendor.location.address.city}, {vendor.location.address.state}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating
                    value={vendor.ratings.average}
                    readOnly
                    precision={0.1}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {vendor.ratings.average} ({vendor.ratings.count} reviews)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {vendor.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {vendor.services.slice(0, 2).map((service, index) => (
                    <Chip
                      key={index}
                      label={`${service.name} - $${service.price}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {vendor.services.length > 2 && (
                    <Chip
                      label={`+${vendor.services.length - 2} more`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  to={`/vendors/${vendor.id}`}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  View Details
                </Button>
                <Button
                  component={Link}
                  to={`/book/${vendor.id}`}
                  variant="contained"
                  size="small"
                  fullWidth
                >
                  Book Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedVendors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Business sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No businesses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or browse all categories
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default VendorList;
