import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Avatar,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Phone,
  Email,
  Schedule,
  Star,
  Verified,
  Facebook,
  Instagram,
  Language,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const VendorProfile = () => {
  const { id } = useParams();

  // Mock data - in real app, this would come from API
  const vendor = {
    id: 1,
    businessName: "Bella's Beauty Salon",
    businessType: 'beauty',
    description: 'Professional hair styling, coloring, and beauty treatments in the heart of Helensvale. Our experienced stylists are passionate about helping you look and feel your best.',
    location: {
      address: {
        street: '123 Main Street',
        city: 'Helensvale',
        state: 'QLD',
        zipCode: '4212',
        country: 'Australia'
      },
      coordinates: { latitude: -27.8629, longitude: 153.3267 }
    },
    contact: {
      phone: '+61 7 5555 0123',
      email: 'hello@bellasbeauty.com.au',
      website: 'https://bellasbeauty.com.au',
      socialMedia: {
        facebook: 'https://facebook.com/bellasbeauty',
        instagram: 'https://instagram.com/bellasbeauty'
      }
    },
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
      { day: 'sunday', isOpen: false, openTime: '', closeTime: '' }
    ],
    services: [
      { id: 1, name: 'Hair Cut & Style', description: 'Professional cut and styling', price: 65, duration: 60 },
      { id: 2, name: 'Hair Coloring', description: 'Full color treatment with premium products', price: 120, duration: 120 },
      { id: 3, name: 'Facial Treatment', description: 'Relaxing facial with organic products', price: 85, duration: 75 },
      { id: 4, name: 'Manicure & Pedicure', description: 'Complete nail care service', price: 55, duration: 45 }
    ],
    ratings: { average: 4.9, count: 127 },
    verification: { isVerified: true },
    images: [
      { url: '/api/placeholder/400/300', caption: 'Salon Interior' },
      { url: '/api/placeholder/400/300', caption: 'Hair Styling Station' }
    ]
  };

  const reviews = [
    {
      id: 1,
      customerName: 'Sarah M.',
      rating: 5,
      comment: 'Amazing service! The staff is so professional and friendly. My hair looks fantastic!',
      date: '2025-08-28'
    },
    {
      id: 2,
      customerName: 'Emma L.',
      rating: 5,
      comment: 'Best salon in Helensvale! Always leave feeling beautiful and confident.',
      date: '2025-08-25'
    },
    {
      id: 3,
      customerName: 'Jessica R.',
      rating: 4,
      comment: 'Great experience overall. The facial was very relaxing and my skin feels amazing.',
      date: '2025-08-20'
    }
  ];

  const formatOperatingHours = (hours) => {
    return hours.map(hour => {
      const day = hour.day.charAt(0).toUpperCase() + hour.day.slice(1);
      if (!hour.isOpen) {
        return `${day}: Closed`;
      }
      return `${day}: ${hour.openTime} - ${hour.closeTime}`;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Header */}
          <Card sx={{ mb: 3 }}>
            <Box
              sx={{
                height: 200,
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Business sx={{ fontSize: 80, color: 'white', opacity: 0.3 }} />
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    mr: 2,
                    mt: -6,
                    border: '4px solid white',
                  }}
                >
                  {vendor.businessName.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {vendor.businessName}
                    </Typography>
                    {vendor.verification.isVerified && (
                      <Verified color="primary" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Rating value={vendor.ratings.average} readOnly precision={0.1} />
                    <Typography variant="body2">
                      {vendor.ratings.average} ({vendor.ratings.count} reviews)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {vendor.location.address.street}, {vendor.location.address.city}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  component={Link}
                  to={`/book/${vendor.id}`}
                  variant="contained"
                  size="large"
                  sx={{ ml: 2 }}
                >
                  Book Now
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                About Us
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {vendor.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Services */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Our Services
              </Typography>
              <Grid container spacing={2}>
                {vendor.services.map((service) => (
                  <Grid item xs={12} sm={6} key={service.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                          ${service.price}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {service.description}
                      </Typography>
                      <Chip
                        label={`${service.duration} minutes`}
                        size="small"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Customer Reviews
              </Typography>
              <List>
                {reviews.map((review, index) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            {review.customerName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {review.customerName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {review.date}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {review.comment}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < reviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Contact Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Information
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <Phone fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={vendor.contact.phone} />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Email fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={vendor.contact.email} />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <LocationOn fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary={`${vendor.location.address.street}`}
                    secondary={`${vendor.location.address.city}, ${vendor.location.address.state} ${vendor.location.address.zipCode}`}
                  />
                </ListItem>
              </List>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <IconButton size="small" color="primary">
                  <Facebook />
                </IconButton>
                <IconButton size="small" color="primary">
                  <Instagram />
                </IconButton>
                <IconButton size="small" color="primary">
                  <Language />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Operating Hours
              </Typography>
              <List dense>
                {formatOperatingHours(vendor.operatingHours).map((hours, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText 
                      primary={hours}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VendorProfile;
