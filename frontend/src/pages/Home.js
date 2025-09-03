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
  Avatar,
  Chip,
  Paper,
  useTheme,
  Rating,
  Divider,
} from '@mui/material';
import {
  Star,
  Security,
  Speed,
  TrendingUp,
  CheckCircle,
  Home as HomeIcon,
  DirectionsCar,
  Restaurant,
  Computer,
  School,
  LocalHospital,
  Gavel,
  Face,
  MonetizationOn,
  Verified,
  AccessTime,
  Rocket,
  Shield,
  Flash,
  Award,
  Users,
  Globe,
  PlayArrow,
  ArrowForward,
} from '@mui/icons-material';
import PreOrderModal from '../components/PreOrderModal';

const Home = () => {
  const theme = useTheme();
  const [preOrderCount, setPreOrderCount] = useState(12847);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

  // Compelling value propositions
  const valueProps = [
    {
      icon: <Shield />,
      title: "100% Verified Professionals",
      description: "Every service provider is background-checked, skill-tested, and customer-reviewed",
      benefit: "Zero risk guarantee"
    },
    {
      icon: <Flash />,
      title: "Instant Booking",
      description: "Book any service in under 60 seconds with real-time availability",
      benefit: "Same-day service"
    },
    {
      icon: <Award />,
      title: "Best Price Promise",
      description: "We'll match any competitor's price and beat it by 10%",
      benefit: "Save up to 40%"
    },
    {
      icon: <Users />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and service guarantee",
      benefit: "Always protected"
    }
  ];

  // Featured service categories with USD pricing
  const featuredCategories = [
    {
      id: 'home-services',
      name: 'Home Services',
      description: 'Plumbing, electrical, cleaning, and maintenance',
      icon: <HomeIcon />,
      vendors: 2340,
      avgPrice: '$25',
      popular: true,
      rating: 4.9
    },
    {
      id: 'automotive',
      name: 'Automotive',
      description: 'Car repairs, maintenance, and detailing',
      icon: <DirectionsCar />,
      vendors: 1560,
      avgPrice: '$45',
      popular: true,
      rating: 4.8
    },
    {
      id: 'food-catering',
      name: 'Food & Catering',
      description: 'Professional catering and meal services',
      icon: <Restaurant />,
      vendors: 890,
      avgPrice: '$15',
      popular: false,
      rating: 4.7
    },
    {
      id: 'tech-services',
      name: 'Tech Services',
      description: 'Computer repair, web design, and IT support',
      icon: <Computer />,
      vendors: 980,
      avgPrice: '$35',
      popular: true,
      rating: 4.9
    },
    {
      id: 'education',
      name: 'Education & Tutoring',
      description: 'Private tutoring and skill development',
      icon: <School />,
      vendors: 1450,
      avgPrice: '$20',
      popular: false,
      rating: 4.8
    },
    {
      id: 'health-wellness',
      name: 'Health & Wellness',
      description: 'Healthcare, fitness, and wellness services',
      icon: <LocalHospital />,
      vendors: 1670,
      avgPrice: '$30',
      popular: true,
      rating: 4.9
    },
    {
      id: 'legal-professional',
      name: 'Legal & Professional',
      description: 'Legal advice, accounting, and business services',
      icon: <Gavel />,
      vendors: 780,
      avgPrice: '$75',
      popular: false,
      rating: 4.8
    },
    {
      id: 'personal-services',
      name: 'Personal Services',
      description: 'Beauty, grooming, and personal care',
      icon: <Face />,
      vendors: 2010,
      avgPrice: '$25',
      popular: true,
      rating: 4.7
    }
  ];

  // Success stories and testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      rating: 5,
      text: "Found an amazing electrician in 2 minutes. Fixed my issue same day for 30% less than I expected!",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Business Owner",
      rating: 5,
      text: "Their catering service saved our corporate event. Professional, affordable, and absolutely delicious.",
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Parent",
      rating: 5,
      text: "The math tutor we found helped my daughter improve her grades from C to A+ in just 3 months!",
      avatar: "LR"
    }
  ];

  useEffect(() => {
    // Simulate real-time user count updates
    const interval = setInterval(() => {
      setPreOrderCount(prev => prev + Math.floor(Math.random() * 5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Social proof metrics
  const socialProof = [
    { metric: preOrderCount.toLocaleString(), label: 'Happy Customers', trend: '+15% this month' },
    { metric: '8,500+', label: 'Verified Professionals', trend: '+200 this week' },
    { metric: '$2.4M+', label: 'Services Completed', trend: 'Growing daily' },
    { metric: '4.9/5', label: 'Average Rating', trend: '99.2% satisfaction' }
  ];

  return (
    <>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            py: { xs: 10, md: 15 },
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
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)',
              backgroundSize: '50px 50px'
            }}
          />
          
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3
                  }}
                >
                  Find Perfect
                  <Box component="span" sx={{ color: 'warning.main', display: 'block' }}>
                    Service Providers
                  </Box>
                  in Minutes
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: '1.3rem', md: '1.6rem' },
                    fontWeight: 400,
                    lineHeight: 1.4
                  }}
                >
                  Connect with 8,500+ verified professionals. Book instantly, pay securely, 
                  and get guaranteed results. All backed by our 100% satisfaction promise.
                </Typography>

                {/* Key Benefits */}
                <Box sx={{ mb: 5 }}>
                  <Grid container spacing={2}>
                    {[
                      { icon: <CheckCircle />, text: "Instant booking" },
                      { icon: <Shield />, text: "100% verified" },
                      { icon: <MonetizationOn />, text: "Best prices" },
                      { icon: <Star />, text: "4.9/5 rated" }
                    ].map((benefit, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }}>
                            {React.cloneElement(benefit.icon, { sx: { fontSize: 14 } })}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {benefit.text}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* CTA Buttons */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    component={Link}
                    to="/vendors"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'warning.dark',
                        transform: 'translateY(-3px)',
                        boxShadow: 8
                      }
                    }}
                  >
                    Find Services Now
                  </Button>
                  <Button
                    onClick={() => setIsPreOrderOpen(true)}
                    variant="outlined"
                    size="large"
                    startIcon={<Rocket />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Join Premium
                  </Button>
                </Box>

                {/* Trust Indicators */}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ⭐ Trusted by {preOrderCount.toLocaleString()}+ customers • 💳 Secure payments • 🛡️ Money-back guarantee
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Social Proof Metrics */}
                <Grid container spacing={3}>
                  {socialProof.map((item, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 3,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)'
                          }
                        }}
                      >
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 1,
                            background: 'linear-gradient(45deg, #fff, #ffd700)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {item.metric}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.95, mb: 0.5, fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {item.trend}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Value Propositions Section */}
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 3
              }}
            >
              Why Choose Our Platform?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.2rem' }}
            >
              We've revolutionized how you find and book services. Here's what makes us different.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {valueProps.map((prop, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'grey.100',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {React.cloneElement(prop.icon, { sx: { fontSize: 40 } })}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {prop.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {prop.description}
                  </Typography>
                  <Chip
                    label={prop.benefit}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Featured Categories */}
        <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                variant="h2" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 3
                }}
              >
                Popular Services
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontSize: '1.2rem' }}
              >
                Browse our most requested service categories
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {featuredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                  <Card
                    component={Link}
                    to={`/vendors?category=${category.id}`}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: 8
                      }
                    }}
                  >
                    {category.popular && (
                      <Chip
                        label="Most Popular"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Avatar
                        sx={{
                          bgcolor: category.popular ? 'secondary.main' : 'primary.main',
                          width: 70,
                          height: 70,
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        {React.cloneElement(category.icon, { sx: { fontSize: 35 } })}
                      </Avatar>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
                        {category.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {category.vendors.toLocaleString()} providers
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          from {category.avgPrice}/hr
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Rating value={category.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          {category.rating}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 3
              }}
            >
              What Our Customers Say
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ fontSize: '1.2rem' }}
            >
              Real stories from real customers
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 4,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 50, height: 50 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{testimonial.text}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Final CTA Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 10,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'linear-gradient(45deg, transparent 40%, white 50%, transparent 60%)',
              animation: 'shine 3s infinite'
            }}
          />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 3
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 5, 
                opacity: 0.95,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Join {preOrderCount.toLocaleString()}+ satisfied customers who found their perfect service provider
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/vendors"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  px: 6,
                  py: 2.5,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                Browse Services
              </Button>
              <Button
                onClick={() => setIsPreOrderOpen(true)}
                variant="outlined"
                size="large"
                startIcon={<Rocket />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Join Premium
              </Button>
            </Box>
            
            <Typography variant="body2" sx={{ mt: 4, opacity: 0.8 }}>
              🔒 Secure payments • 💯 Money-back guarantee • ⚡ Instant booking
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Pre-Order Modal */}
      <PreOrderModal
        open={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
      />
    </>
  );
};

export default Home;
