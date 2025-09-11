import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Badge,
  Divider,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  WhatsApp as WhatsAppIcon,
  Payment as PaymentIcon,
  LocalOffer as OfferIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Helensvale, Borrowdale, Harare');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [stats, setStats] = useState({
    totalVendors: 2850,
    totalBookings: 47200,
    averageRating: 4.9,
    activeUsers: 18500,
    savedAmount: '$240K USD',
    responseTime: '< 15min'
  });

  useEffect(() => {
    // Simulate fetching featured services
    setFeaturedServices([
      { id: 1, name: 'Hair & Beauty', icon: '💇‍♀️', count: 485, trending: true, avgPrice: '$8-25 USD', description: 'Salons, barbershops, nail care' },
      { id: 2, name: 'Home Services', icon: '🏠', count: 389, trending: false, avgPrice: '$15-45 USD', description: 'Plumbing, electrical, cleaning' },
      { id: 3, name: 'Health & Wellness', icon: '🏥', count: 256, trending: true, avgPrice: '$18-35 USD', description: 'Massage, therapy, fitness' },
      { id: 4, name: 'Automotive', icon: '🚗', count: 234, trending: false, avgPrice: '$25-85 USD', description: 'Car wash, repairs, maintenance' },
      { id: 5, name: 'Food & Catering', icon: '🍽️', count: 398, trending: true, avgPrice: '$5-18 USD', description: 'Catering, chefs, food delivery' },
      { id: 6, name: 'Business Services', icon: '💼', count: 187, trending: true, avgPrice: '$25-75 USD', description: 'Accounting, legal, consulting' }
    ]);
  }, []);

  const handleSearch = () => {
    // Navigate to search results
    console.log('Searching for:', searchQuery, 'in', location);
  };

  return (
    <Box className="homepage-container">
      {/* Hero Section with Smart Search */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Box className="hero-content">
            {/* Trust Badges */}
            <Stack direction="row" spacing={2} justifyContent="center" className="trust-badges">
              <Chip 
                icon={<VerifiedIcon />}
                label={`${stats.totalVendors.toLocaleString()}+ Verified Businesses`}
                className="trust-badge primary"
                color="primary"
                variant="filled"
              />
              <Chip 
                icon={<CheckIcon />}
                label="100% Satisfaction Guaranteed"
                className="trust-badge success"
                color="success"
                variant="filled"
              />
            </Stack>
            
            {/* Main Headline - Optimized for African Market */}
            <Typography variant="h1" className="hero-title">
              Transform Your Business with
              <Box component="span" className="gradient-text"> Digital Marketplace</Box>
            </Typography>
            
            <Typography variant="h5" className="hero-subtitle">
              Join 18,500+ Zimbabweans connecting with trusted local professionals in Helensvale, Borrowdale and across Harare. 
              <Box component="span" className="highlight-text">Book instantly, pay with EcoCash USD, save up to 40%</Box>
            </Typography>
            
            {/* Social Proof Bar */}
            <Box className="social-proof-bar">
              <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
                <Box className="proof-item">
                  <Typography variant="h6" color="primary">{stats.savedAmount}</Typography>
                  <Typography variant="caption">Saved by customers</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="proof-item">
                  <Typography variant="h6" color="primary">{stats.responseTime}</Typography>
                  <Typography variant="caption">Avg response time</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="proof-item">
                  <Typography variant="h6" color="primary">{stats.averageRating}★</Typography>
                  <Typography variant="caption">Customer rating</Typography>
                </Box>
              </Stack>
            </Box>

            {/* Smart Search Bar */}
            <Box className="search-container">
              <Box className="search-bar">
                <TextField
                  fullWidth
                  placeholder="What service do you need? (e.g., haircut, plumber, massage)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  className="search-input"
                />
                <TextField
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  className="location-input"
                />
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleSearch}
                  className="search-button"
                >
                  Search
                </Button>
              </Box>
            </Box>

            {/* Popular Searches - African Context */}
            <Box className="popular-searches">
              <Typography variant="body2" color="text.secondary">
                Trending in Helensvale & Borrowdale: 
              </Typography>
              {['Hair Braiding', 'Domestic Worker', 'Kombi Services', 'Mobile Mechanic', 'Catering', 'Security Services'].map((term) => (
                <Chip 
                  key={term} 
                  label={term} 
                  size="small" 
                  onClick={() => setSearchQuery(term)}
                  className="popular-chip"
                  variant="outlined"
                />
              ))}
            </Box>
            
            {/* Urgency Banner */}
            <Box className="urgency-banner">
              <Chip 
                icon={<OfferIcon />}
                label="LIMITED TIME: First booking 20% OFF - Ends in 48 hours!"
                color="error"
                variant="filled"
                className="urgency-chip"
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Service Categories */}
      <Container maxWidth="lg" className="categories-section">
        <Typography variant="h3" align="center" className="section-title">
          Browse by Category
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" className="section-subtitle">
          Discover trusted professionals across all service categories
        </Typography>
        
        <Grid container spacing={3} className="categories-grid">
          {featuredServices.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card className="category-card" elevation={2}>
                <CardContent className="category-content">
                  <Box className="category-header">
                    <Typography variant="h2" className="category-icon">
                      {service.icon}
                    </Typography>
                    {service.trending && (
                      <Chip 
                        icon={<TrendingIcon />} 
                        label="Trending" 
                        size="small" 
                        color="secondary"
                        className="trending-badge"
                      />
                    )}
                  </Box>
                  <Typography variant="h6" className="category-name">
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="category-description">
                    {service.description}
                  </Typography>
                  <Box className="category-stats">
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {service.count} providers • {service.avgPrice}
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small" 
                    className="category-button"
                    onClick={() => setSearchQuery(service.name)}
                    fullWidth
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trust & Safety Section */}
      <Box className="trust-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" className="section-title">
                Your Safety is Our Priority
              </Typography>
              <Typography variant="h6" color="text.secondary" className="section-subtitle">
                Every professional on our platform is verified, insured, and committed to excellence.
              </Typography>
              
              <Box className="trust-features">
                <Box className="trust-feature">
                  <VerifiedIcon color="primary" className="trust-icon" />
                  <Box>
                    <Typography variant="h6">Verified Professionals</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Background checks, license verification, and insurance validation
                    </Typography>
                  </Box>
                </Box>
                <Box className="trust-feature">
                  <SecurityIcon color="primary" className="trust-icon" />
                  <Box>
                    <Typography variant="h6">Secure USD Payments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      EcoCash USD, NetOne OneMoney, and international card payments with buyer protection
                    </Typography>
                  </Box>
                </Box>
                <Box className="trust-feature">
                  <StarIcon color="primary" className="trust-icon" />
                  <Box>
                    <Typography variant="h6">Quality Guarantee</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Satisfaction guaranteed or your money back
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="stats-container">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card className="stat-card">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {stats.averageRating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Rating
                        </Typography>
                        <Rating value={stats.averageRating} readOnly size="small" />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card className="stat-card">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {(stats.totalBookings / 1000).toFixed(1)}K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bookings Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card className="stat-card">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {(stats.totalVendors / 1000).toFixed(1)}K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Verified Providers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card className="stat-card">
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {(stats.activeUsers / 1000).toFixed(1)}K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Happy Customers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Providers */}
      <Container maxWidth="lg" className="featured-section">
        <Typography variant="h3" align="center" className="section-title">
          Top-Rated Professionals
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" className="section-subtitle">
          Discover highly-rated professionals in your area
        </Typography>
        
        <Grid container spacing={3} className="providers-grid">
          {[
            {
              id: 1,
              name: "Sarah's Hair Studio",
              category: "Hair & Beauty",
              rating: 4.9,
              reviews: 127,
              image: "/images/provider-1.jpg",
              verified: true,
              responseTime: "< 1 hour",
              location: "Helensvale, Borrowdale",
              price: "From $8 USD"
            },
            {
              id: 2,
              name: "Elite Home Services",
              category: "Home Maintenance",
              rating: 4.8,
              reviews: 89,
              image: "/images/provider-2.jpg",
              verified: true,
              responseTime: "< 2 hours",
              location: "Borrowdale, Harare",
              price: "From $15 USD"
            },
            {
              id: 3,
              name: "Wellness Massage Therapy",
              category: "Health & Wellness",
              rating: 5.0,
              reviews: 156,
              image: "/images/provider-3.jpg",
              verified: true,
              responseTime: "< 30 mins",
              location: "Helensvale Shopping Centre",
              price: "From $18 USD"
            }
          ].map((provider) => (
            <Grid item xs={12} sm={6} md={4} key={provider.id}>
              <Card className="provider-card" elevation={3}>
                <Box className="provider-image">
                  <img src={provider.image} alt={provider.name} />
                  {provider.verified && (
                    <Chip 
                      icon={<VerifiedIcon />} 
                      label="Verified" 
                      size="small" 
                      color="primary"
                      className="verified-badge"
                    />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" className="provider-name">
                    {provider.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {provider.category} • {provider.location}
                  </Typography>
                  
                  <Box className="provider-rating">
                    <Rating value={provider.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {provider.rating} ({provider.reviews} reviews)
                    </Typography>
                  </Box>
                  
                  <Box className="provider-details">
                    <Chip 
                      icon={<SpeedIcon />} 
                      label={provider.responseTime} 
                      size="small" 
                      variant="outlined"
                    />
                    <Typography variant="body2" className="provider-price">
                      {provider.price}
                    </Typography>
                  </Box>
                  
                  <Box className="provider-actions">
                    <Button variant="outlined" size="small" startIcon={<ChatIcon />}>
                      Message
                    </Button>
                    <Button variant="contained" size="small">
                      Book Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box textAlign="center" className="view-all-section">
          <Button variant="outlined" size="large">
            View All Providers
          </Button>
        </Box>
      </Container>

      {/* How It Works */}
      <Box className="how-it-works-section">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" className="section-title">
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" className="section-subtitle">
            Book trusted local services in just a few clicks
          </Typography>
          
          <Grid container spacing={4} className="steps-grid">
            {[
              {
                step: 1,
                title: "Search & Compare",
                description: "Find local professionals, compare prices, and read reviews from real customers",
                icon: "🔍"
              },
              {
                step: 2,
                title: "Book Instantly",
                description: "Choose your preferred time slot and book instantly with our secure booking system",
                icon: "📅"
              },
              {
                step: 3,
                title: "Pay Securely",
                description: "Pay with EcoCash USD, NetOne OneMoney, or international card. Your payment is protected until service completion",
                icon: "💳"
              },
              {
                step: 4,
                title: "Enjoy Service",
                description: "Relax and enjoy professional service. Rate your experience to help others",
                icon: "⭐"
              }
            ].map((step) => (
              <Grid item xs={12} sm={6} md={3} key={step.step}>
                <Box className="step-card">
                  <Box className="step-number">{step.step}</Box>
                  <Typography variant="h2" className="step-icon">
                    {step.icon}
                  </Typography>
                  <Typography variant="h6" className="step-title">
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Dual CTA Section */}
      <Box className="dual-cta-section">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* For Customers */}
            <Grid item xs={12} md={6}>
              <Card className="cta-card customer-cta" elevation={4}>
                <CardContent>
                  <Typography variant="h4" className="cta-title">
                    Need a Service?
                  </Typography>
                  <Typography variant="h6" color="text.secondary" className="cta-subtitle">
                    Find trusted professionals in your area and book instantly
                  </Typography>
                  <Box className="cta-features">
                    <Typography variant="body2">✓ Verified professionals</Typography>
                    <Typography variant="body2">✓ Instant booking</Typography>
                    <Typography variant="body2">✓ Secure payments</Typography>
                    <Typography variant="body2">✓ Satisfaction guarantee</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    className="cta-button"
                    onClick={handleSearch}
                  >
                    Find Services Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* For Providers */}
            <Grid item xs={12} md={6}>
              <Card className="cta-card provider-cta" elevation={4}>
                <CardContent>
                  <Typography variant="h4" className="cta-title">
                    Grow Your Business
                  </Typography>
                  <Typography variant="h6" color="text.secondary" className="cta-subtitle">
                    Join hundreds of professionals in Helensvale, Borrowdale earning USD with Helensvale Connect
                  </Typography>
                  <Box className="cta-features">
                    <Typography variant="body2">✓ More customers</Typography>
                    <Typography variant="body2">✓ Easy booking management</Typography>
                    <Typography variant="body2">✓ EcoCash USD integration</Typography>
                    <Typography variant="body2">✓ Marketing tools included</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    component={Link}
                    to="/vendor-onboarding"
                    className="cta-button provider-button"
                  >
                    Start Earning Today
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile App Download */}
      <Container maxWidth="lg" className="app-download-section">
        <Box className="app-download-content">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" className="section-title">
                Get the Mobile App
              </Typography>
              <Typography variant="h6" color="text.secondary" className="section-subtitle">
                Book services on the go with our mobile-optimized experience
              </Typography>
              <Box className="app-features">
                <Typography variant="body1">📱 Works offline</Typography>
                <Typography variant="body1">🔔 Real-time notifications</Typography>
                <Typography variant="body1">💬 In-app messaging</Typography>
                <Typography variant="body1">📍 GPS location services</Typography>
              </Box>
              <Box className="download-buttons">
                <Button 
                  variant="contained" 
                  size="large"
                  className="download-button"
                >
                  Install Web App
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Available as Progressive Web App - no app store needed!
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="phone-mockup">
                <img src="/images/phone-mockup.png" alt="Mobile App" />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
