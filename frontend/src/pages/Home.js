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
  CardActions,
  Avatar,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Search,
  Star,
  Business,
  Schedule,
  Payment,
  Security,
  Speed,
  Support,
  TrendingUp,
  People,
  CheckCircle,
  LocalOffer,
  Home as HomeIcon,
  Build,
  DirectionsCar,
  Restaurant,
  Computer,
  School,
  LocalHospital,
  Gavel,
  Face,
  Warning,
  MonetizationOn,
  Verified,
  AccessTime,
  CurrencyExchange,
} from '@mui/icons-material';
import PreOrderModal from '../components/PreOrderModal';
import axios from 'axios';

const Home = () => {
  const theme = useTheme();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [preOrderCount, setPreOrderCount] = useState(2847);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);

  // Problem-Solution data inspired by Amazon's customer obsession
  const problemSolutions = [
    {
      icon: <Warning />,
      title: "Unreliable Service Providers",
      problem: "No way to verify if a service provider is legitimate or skilled",
      solution: "Comprehensive verification system with ID checks, skill tests, and customer reviews",
      description: "Every vendor goes through our 5-step verification process including background checks, skill assessments, and reference verification.",
      stats: "98% customer satisfaction rate"
    },
    {
      icon: <MonetizationOn />,
      title: "Payment Challenges",
      problem: "Limited payment options and currency confusion",
      solution: "Multi-currency support with PayNow, EcoCash, and real-time ZiG exchange rates",
      description: "Pay in ZiG, USD, or ZWL with transparent exchange rates updated every 30 seconds. No hidden fees.",
      stats: "3 currencies supported"
    },
    {
      icon: <AccessTime />,
      title: "Booking Difficulties",
      problem: "Hard to schedule services and track appointments",
      solution: "Smart calendar system with instant booking and automated reminders",
      description: "Book services 24/7 with real-time availability. Get SMS and WhatsApp reminders automatically.",
      stats: "Average 2-minute booking time"
    },
    {
      icon: <Verified />,
      title: "Trust Issues",
      problem: "No guarantee of service quality or reliability",
      solution: "Money-back guarantee with comprehensive insurance coverage",
      description: "All services backed by our satisfaction guarantee. If you're not happy, we'll refund 100% and find you a better provider.",
      stats: "99.2% positive feedback"
    }
  ];

  // Value propositions inspired by Bezos' customer-centric approach
  const valueProps = [
    {
      icon: <CurrencyExchange />,
      title: "Zimbabwe-First Design",
      description: "Built specifically for Zimbabwe's unique market with ZiG currency integration and local payment methods",
      benefit: "Native ZiG support"
    },
    {
      icon: <Speed />,
      title: "Lightning Fast",
      description: "Find and book services in under 2 minutes. No more calling around or waiting for callbacks.",
      benefit: "2-minute average booking"
    }
  ];

  // Featured categories with Zimbabwe-specific services
  const featuredCategories = [
    {
      id: 'home-services',
      name: 'Home Services',
      description: 'Plumbing, electrical, cleaning, and maintenance',
      icon: <HomeIcon />,
      vendors: 234,
      avgPrice: 'ZiG 50',
      popular: true
    },
    {
      id: 'automotive',
      name: 'Automotive',
      description: 'Car repairs, maintenance, and detailing',
      icon: <DirectionsCar />,
      vendors: 156,
      avgPrice: 'ZiG 75',
      popular: false
    },
    {
      id: 'food-catering',
      name: 'Food & Catering',
      description: 'Restaurants, catering, and food delivery',
      icon: <Restaurant />,
      vendors: 189,
      avgPrice: 'ZiG 35',
      popular: true
    },
    {
      id: 'tech-services',
      name: 'Tech Services',
      description: 'Computer repair, web design, and IT support',
      icon: <Computer />,
      vendors: 98,
      avgPrice: 'ZiG 60',
      popular: false
    },
    {
      id: 'education',
      name: 'Education & Tutoring',
      description: 'Private tutoring, training, and skill development',
      icon: <School />,
      vendors: 145,
      avgPrice: 'ZiG 40',
      popular: true
    },
    {
      id: 'health-wellness',
      name: 'Health & Wellness',
      description: 'Healthcare, fitness, beauty, and wellness services',
      icon: <LocalHospital />,
      vendors: 167,
      avgPrice: 'ZiG 55',
      popular: false
    },
    {
      id: 'legal-professional',
      name: 'Legal & Professional',
      description: 'Legal advice, accounting, and business services',
      icon: <Gavel />,
      vendors: 78,
      avgPrice: 'ZiG 120',
      popular: false
    },
    {
      id: 'personal-services',
      name: 'Personal Services',
      description: 'Beauty, grooming, and personal care services',
      icon: <Face />,
      vendors: 201,
      avgPrice: 'ZiG 45',
      popular: true
    }
  ];

  useEffect(() => {
    // Fetch real-time exchange rates
    const fetchRates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/currency/rates');
        setExchangeRates(response.data);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Fallback rates
        setExchangeRates({
          ZIG: 1,
          USD: 0.000076,
          ZWL: 1300,
          lastUpdated: new Date().toISOString()
        });
      }
    };
    fetchRates();

    // Simulate real-time pre-order count updates
    const interval = setInterval(() => {
      setPreOrderCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Social proof data
  const socialProof = [
    { metric: preOrderCount.toLocaleString(), label: 'Early Access Members', trend: '+12% today' },
    { metric: '847', label: 'Verified Vendors Ready', trend: '+23 this week' },
    { metric: 'ZiG 2.4M', label: 'Total Transactions Ready', trend: 'Growing daily' },
    { metric: '4.9/5', label: 'Pre-Launch Rating', trend: 'From beta users' }
  ];

  return (
    <>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden'
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
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  Zimbabwe's Premier Service Marketplace
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Connect with verified local service providers. Pay in ZiG, USD, or EcoCash. 
                  Book instantly, get guaranteed results.
                </Typography>

                {/* Live Exchange Rate Display */}
                {exchangeRates && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                      🔄 Live Exchange Rates (Updated every 30s)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Typography variant="body1">
                        <strong>1 ZiG = ${(exchangeRates.USD || 0).toFixed(6)} USD</strong>
                      </Typography>
                      <Typography variant="body1">
                        <strong>1 ZiG = ZWL {(exchangeRates.ZWL || 0).toFixed(2)}</strong>
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* CTA Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setIsPreOrderOpen(true)}
                    sx={{
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'warning.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    🚀 Join Early Access
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
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Browse Services
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Social Proof Metrics */}
                <Grid container spacing={2}>
                  {socialProof.map((item, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {item.metric}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
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

        {/* Problem-Solution Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Solving Zimbabwe's Service Challenges
            </Typography>
            <Typography variant="h6" color="text.secondary">
              We understand the unique challenges of finding reliable services in Zimbabwe
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {problemSolutions.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'error.main',
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="error.main" sx={{ mb: 2, fontWeight: 'medium' }}>
                      ❌ Problem: {item.problem}
                    </Typography>
                    
                    <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 'medium' }}>
                      ✅ Our Solution: {item.solution}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    
                    <Chip
                      label={item.stats}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Featured Categories */}
        <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Popular Service Categories
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Find the right service provider for your needs
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {featuredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {category.popular && (
                      <Chip
                        label="Popular"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      />
                    )}
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {category.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {category.vendors} vendors
                        </Typography>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          from {category.avgPrice}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Value Propositions */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Why Choose Helensvale Connect?
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {valueProps.map((prop, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      mr: 3,
                      width: 56,
                      height: 56
                    }}
                  >
                    {prop.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {prop.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {prop.description}
                    </Typography>
                    <Chip
                      label={prop.benefit}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Final CTA Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 8,
            textAlign: 'center'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Transform Your Service Experience?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join {preOrderCount.toLocaleString()}+ Zimbabweans who've already secured their early access
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setIsPreOrderOpen(true)}
              sx={{
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'warning.dark',
                  transform: 'scale(1.05)'
                }
              }}
            >
              🚀 Get Early Access Now
            </Button>
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
