import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Search,
  Business,
  Schedule,
  Star,
  TrendingUp,
  People,
  LocationOn,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Search />,
      title: 'Discover Local Businesses',
      description: 'Find the best local services and businesses in Helensvale with our comprehensive directory.',
    },
    {
      icon: <Schedule />,
      title: 'Easy Booking',
      description: 'Book appointments and services online with just a few clicks. No phone calls needed.',
    },
    {
      icon: <Star />,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews and ratings from the community to make informed decisions.',
    },
    {
      icon: <Business />,
      title: 'For Businesses',
      description: 'Join our platform to reach more customers and grow your local business.',
    },
  ];

  const stats = [
    { number: '150+', label: 'Local Businesses' },
    { number: '2,500+', label: 'Happy Customers' },
    { number: '4.8', label: 'Average Rating' },
    { number: '24/7', label: 'Support' },
  ];

  const featuredVendors = [
    {
      id: 1,
      name: 'Bella\'s Beauty Salon',
      category: 'Beauty',
      rating: 4.9,
      reviews: 127,
      image: '/api/placeholder/300/200',
    },
    {
      id: 2,
      name: 'TechFix Solutions',
      category: 'Technology',
      rating: 4.8,
      reviews: 89,
      image: '/api/placeholder/300/200',
    },
    {
      id: 3,
      name: 'Green Thumb Gardens',
      category: 'Landscaping',
      rating: 4.7,
      reviews: 156,
      image: '/api/placeholder/300/200',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Connect with Local Businesses in Helensvale
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 300,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                Discover, book, and support amazing local services in your community
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/vendors"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Find Services
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Join as Business
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.number}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Why Choose Helensvale Connect?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Vendors Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            Featured Local Businesses
          </Typography>
          <Grid container spacing={4}>
            {featuredVendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Business sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {vendor.name}
                    </Typography>
                    <Chip
                      label={vendor.category}
                      size="small"
                      sx={{ mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ color: 'orange', fontSize: 20 }} />
                      <Typography variant="body2">
                        {vendor.rating} ({vendor.reviews} reviews)
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/vendors/${vendor.id}`}
                      size="small"
                      variant="contained"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/vendors"
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              View All Businesses
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of locals connecting with amazing businesses
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Sign Up Now
            </Button>
            <Button
              component={Link}
              to="/vendors"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Browse Services
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
