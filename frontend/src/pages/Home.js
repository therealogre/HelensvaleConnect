import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  Divider,
  Paper,
  IconButton,
  Fade,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    navigate(`/vendors?${params.toString()}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Featured categories with African market focus
  const featuredCategories = [
    { name: 'Beauty & Wellness', icon: '💄', count: '2,400+', color: '#FF6B9D' },
    { name: 'Home Services', icon: '🏠', count: '1,800+', color: '#4ECDC4' },
    { name: 'Automotive', icon: '🚗', count: '950+', color: '#45B7D1' },
    { name: 'Food & Catering', icon: '🍽️', count: '1,200+', color: '#FFA726' },
    { name: 'Health & Fitness', icon: '💪', count: '680+', color: '#66BB6A' },
    { name: 'Education', icon: '📚', count: '540+', color: '#AB47BC' },
    { name: 'Technology', icon: '💻', count: '420+', color: '#42A5F5' },
    { name: 'Events', icon: '🎉', count: '890+', color: '#EF5350' }
  ];

  // Success stories with African context
  const successStories = [
    {
      name: 'Tendai Mukamuri',
      business: 'Mukamuri Beauty Salon',
      location: 'Harare',
      image: '/images/vendor-placeholder.jpg',
      rating: 4.9,
      reviews: 234,
      story: 'Increased bookings by 300% in 3 months',
      revenue: '$2,400/month'
    },
    {
      name: 'Grace Chivasa',
      business: 'Grace\'s Catering',
      location: 'Bulawayo',
      image: '/images/vendor-placeholder.jpg',
      rating: 4.8,
      reviews: 187,
      story: 'Expanded to 5 new areas with online presence',
      revenue: '$1,800/month'
    },
    {
      name: 'Michael Sibanda',
      business: 'AutoFix Garage',
      location: 'Gweru',
      image: '/images/vendor-placeholder.jpg',
      rating: 4.9,
      reviews: 156,
      story: 'Built trust with 200+ repeat customers',
      revenue: '$3,200/month'
    }
  ];

  // Platform benefits with psychological triggers
  const platformBenefits = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Secure Payments',
      description: 'EcoCash, OneMoney & PayNow integration with bank-level security',
      highlight: 'Zimbabwe\'s most trusted'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Mobile-First Design',
      description: 'Optimized for African mobile networks and data-conscious users',
      highlight: 'Works on any device'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: 'Local Community',
      description: 'Connect with verified local service providers in your area',
      highlight: '15,000+ active users'
    },
    {
      icon: <MoneyIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Fair Pricing',
      description: 'Transparent pricing with no hidden fees. Pay what you see.',
      highlight: 'Save up to 40%'
    }
  ];

  return (
    <Box>
      {/* Hero Section with Psychological Optimization */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in={heroVisible} timeout={1000}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  {/* Trust Badge */}
                  <Chip
                    label="🇿🇼 Zimbabwe's #1 Marketplace"
                    sx={{
                      mb: 3,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  />
                  
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Find Local Services
                    <Box component="span" sx={{ color: '#FFD700', display: 'block' }}>
                      You Can Trust
                    </Box>
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      maxWidth: '500px',
                      mx: { xs: 'auto', md: 0 }
                    }}
                  >
                    Connect with verified local professionals. Book instantly. Pay securely with EcoCash, OneMoney, or PayNow.
                  </Typography>

                  {/* Social Proof */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Box sx={{ display: 'flex', mr: 2 }}>
                      {[1,2,3,4,5].map((star) => (
                        <StarIcon key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      4.9/5 from 12,000+ reviews
                    </Typography>
                  </Box>

                  {/* CTA Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/vendors')}
                      sx={{
                        bgcolor: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        '&:hover': { bgcolor: '#FFC107', transform: 'translateY(-2px)' },
                        transition: 'all 0.3s ease'
                      }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Find Services Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/vendor-onboarding')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 'bold',
                        py: 2,
                        px: 4,
                        '&:hover': { 
                          borderColor: '#FFD700',
                          bgcolor: 'rgba(255,215,0,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Start Selling
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* Search Widget */}
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                    What service do you need?
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="e.g. Hair salon, plumber, car repair..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                    />
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    sx={{
                      bgcolor: '#667eea',
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#5a67d8', transform: 'translateY(-1px)' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Search Services
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Trust Statistics */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Slide in={statsVisible} direction="up" timeout={800}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: '#f8f9fa',
              mt: -6,
              position: 'relative',
              zIndex: 3
            }}
          >
            <Grid container spacing={4} textAlign="center">
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                  15,000+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Active Users
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                  3,200+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Service Providers
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                  45,000+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bookings Completed
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                  4.9★
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Average Rating
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Slide>
      </Container>

      {/* Featured Categories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}
        >
          Popular Services
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
        >
          Discover the most in-demand services in your area
        </Typography>

        <Grid container spacing={3}>
          {featuredCategories.map((category, index) => (
            <Grid item xs={6} md={3} key={category.name}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  },
                  borderRadius: 3,
                  overflow: 'visible',
                  position: 'relative'
                }}
                onClick={() => navigate(`/vendors?category=${encodeURIComponent(category.name)}`)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography
                    variant="h2"
                    sx={{ mb: 2, fontSize: '3rem' }}
                  >
                    {category.icon}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', mb: 1, color: category.color }}
                  >
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} providers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Platform Benefits */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}
          >
            Why Choose Helensvale Connect?
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
          >
            Built specifically for the African market with local payment methods and mobile-first design
          </Typography>

          <Grid container spacing={4}>
            {platformBenefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={benefit.title}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexShrink: 0 }}>
                      {benefit.icon}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {benefit.title}
                        </Typography>
                        <Chip
                          label={benefit.highlight}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}
        >
          Success Stories
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
        >
          Real businesses achieving real results with Helensvale Connect
        </Typography>

        <Grid container spacing={4}>
          {successStories.map((story, index) => (
            <Grid item xs={12} md={4} key={story.name}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={story.image}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {story.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {story.business} • {story.location}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Rating value={story.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({story.reviews} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      mb: 2,
                      color: '#667eea',
                      fontWeight: 'bold'
                    }}
                  >
                    "{story.story}"
                  </Typography>
                  
                  <Box
                    sx={{
                      bgcolor: '#f0f4ff',
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                      {story.revenue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Monthly Revenue
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          bgcolor: '#667eea',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Join thousands of satisfied customers and service providers
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/vendors')}
              sx={{
                bgcolor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: '#FFC107', transform: 'translateY(-2px)' },
                transition: 'all 0.3s ease'
              }}
            >
              Book a Service
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/vendor-onboarding')}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 'bold',
                py: 2,
                px: 4,
                '&:hover': {
                  borderColor: '#FFD700',
                  bgcolor: 'rgba(255,215,0,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Become a Provider
            </Button>
          </Box>
          
          {/* Trust indicators */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon />
              <Typography variant="body2">Verified Providers</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              <Typography variant="body2">Secure Payments</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon />
              <Typography variant="body2">Quality Guaranteed</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
