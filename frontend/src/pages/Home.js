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
import SEO, { SEOConfigs } from '../components/SEO';
import axios from 'axios';

const Home = () => {
  const theme = useTheme();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [preOrderCount, setPreOrderCount] = useState(2847); // Starting count for social proof
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
      icon: <Security />,
      title: "Trust & Safety Concerns",
      problem: "No protection against fraud or poor service quality",
      solution: "Escrow payments, insurance coverage, and money-back guarantee",
      description: "Your payment is held securely until service completion. Full insurance coverage and 100% money-back guarantee.",
      stats: "ZiG 2.5M+ in protected transactions"
    }
  ];

  // Value propositions inspired by Bezos' customer-centric approach
  const valueProps = [
    {
      icon: <CurrencyExchange />,
      title: "Zimbabwe-First Design",
      description: "Built specifically for Zimbabwe's unique economic environment with ZiG currency support and local payment methods.",
      benefit: "Save 40% on transaction fees"
    },
    {
      icon: <Verified />,
      title: "Trust & Verification",
      description: "Every service provider is thoroughly vetted with ID verification, skill tests, and background checks.",
      benefit: "99.2% verified providers"
    },
    {
      icon: <Speed />,
      title: "Instant Everything",
      description: "Book services instantly, get real-time updates, and receive immediate support when you need it.",
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
      avgPrice: 'ZiG 120',
      popular: false
    },
    {
      id: 'beauty-wellness',
      name: 'Beauty & Wellness',
      description: 'Salons, spas, fitness, and health services',
      icon: <Face />,
      vendors: 189,
      avgPrice: 'ZiG 35',
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional Services',
      description: 'Legal, accounting, consulting, and business',
      icon: <Gavel />,
      vendors: 98,
      avgPrice: 'ZiG 200',
      popular: false
    },
    {
      id: 'construction',
      name: 'Construction',
      description: 'Building, renovation, and repair services',
      icon: <Build />,
      vendors: 167,
      avgPrice: 'ZiG 300',
      popular: true
    },
    {
      id: 'technology',
      name: 'Technology',
      description: 'IT support, web design, and digital services',
      icon: <Computer />,
      vendors: 78,
      avgPrice: 'ZiG 150',
      popular: false
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Tutoring, training, and skill development',
      icon: <School />,
      vendors: 145,
      avgPrice: 'ZiG 80',
      popular: false
    },
    {
      id: 'health',
      name: 'Health & Medical',
      description: 'Healthcare, therapy, and medical services',
      icon: <LocalHospital />,
      vendors: 67,
      avgPrice: 'ZiG 100',
      popular: false
    }
  ];

  useEffect(() => {
    // Fetch exchange rates
    const fetchRates = async () => {
      try {
        const response = await axios.get('/api/payments/exchange-rates');
        setExchangeRates(response.data.data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates');
      }
    };
    fetchRates();

    // Simulate real-time pre-order count updates (Musk-style urgency)
    const interval = setInterval(() => {
      setPreOrderCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Amazon-inspired problem-solution features
  const problemSolutions = [
    {
      problem: "Can't find reliable local services in Zimbabwe",
      solution: "Verified vendor network with real reviews",
      icon: <Security />,
      title: 'Verified Local Services',
      description: 'Every vendor is verified with proper documentation. No more guessing - find trusted professionals in your area.',
      stats: '500+ Verified Vendors'
    },
    {
      problem: "Payment challenges with ZiG and foreign currency",
      solution: "Multi-currency support with real-time rates",
      icon: <CurrencyExchange />,
      title: 'Smart Payment Solutions',
      description: 'Pay in ZiG, USD, or EcoCash. Real-time exchange rates ensure fair pricing for everyone.',
      stats: 'Live Exchange Rates'
    },
    {
      problem: "Difficult to book services without calling",
      solution: "One-click booking with instant confirmation",
      icon: <Speed />,
      title: 'Instant Booking',
      description: 'Book any service in under 30 seconds. No phone calls, no waiting - just instant confirmation.',
      stats: '< 30 Second Booking'
    },
    {
      problem: "No way to track service quality",
      solution: "Comprehensive review and rating system",
      icon: <Star />,
      title: 'Quality Assurance',
      description: 'Real reviews from real customers. Rate services and help others make informed decisions.',
      stats: '4.9/5 Avg Rating'
    }
  ];

  // Bezos-inspired value propositions
  const valueProps = [
    {
      icon: <LocalAtm />,
      title: 'Save Money',
      description: 'Compare prices across vendors. Get the best deals with our price matching guarantee.',
      benefit: 'Up to 30% savings'
    },
    {
      icon: <Speed />,
      title: 'Save Time',
      description: 'Find, compare, and book services in minutes instead of hours of calling around.',
      benefit: '10x faster booking'
    },
    {
      icon: <Security />,
      title: 'Peace of Mind',
      description: 'All vendors are verified, insured, and rated by real customers. Your satisfaction guaranteed.',
      benefit: '100% satisfaction guarantee'
    }
  ];

  // Zuckerberg-inspired social proof
  const socialProof = [
    { metric: preOrderCount.toLocaleString(), label: 'Early Access Members', trend: '+12% today' },
    { metric: '847', label: 'Verified Vendors Ready', trend: '+23 this week' },
    { metric: 'ZiG 2.4M', label: 'Total Transactions Ready', trend: 'Growing daily' },
    { metric: '4.9/5', label: 'Pre-Launch Rating', trend: 'From beta users' }
  ];

  // Musk-inspired urgency features
  const urgencyFeatures = [
    {
      title: 'Early Bird Pricing',
      description: 'Lock in 50% off for life. Price increases after 1000 more sign-ups.',
      remaining: 1000 - (preOrderCount % 1000),
      color: 'error'
    },
    {
      title: 'Founder Access',
      description: 'Direct line to founders + exclusive features for first 5000 members.',
      remaining: 5000 - preOrderCount,
      color: 'warning'
    }
  ];

  const featuredCategories = [
    {
      id: 1,
      name: 'Home Services',
      description: 'Plumbing, electrical, cleaning, repairs',
      vendors: 127,
      avgPrice: 'ZiG 45',
      icon: <Business />,
      popular: true
    },
    {
      id: 2,
      name: 'Beauty & Wellness',
      description: 'Salons, spas, fitness, healthcare',
      vendors: 89,
      avgPrice: 'ZiG 35',
      icon: <Star />,
      popular: false
    },
    {
      id: 3,
      name: 'Professional Services',
      description: 'Legal, accounting, consulting, IT',
      vendors: 156,
      avgPrice: 'ZiG 85',
      icon: <AccountBalance />,
      popular: true
    }
  ];

  return (
    <Box>
      <SEO {...SEOConfigs.home} />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Urgency Banner */}
        <Box sx={{ bgcolor: 'error.main', py: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            🔥 EARLY ACCESS: {urgencyFeatures[0].remaining} spots left at 50% off • Price increases in 24 hours
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="🇿🇼 Made for Zimbabwe" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }}
              />
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  lineHeight: 1.1,
                  background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Zimbabwe's First Smart Service Marketplace
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                Find, book & pay for local services in ZiG, USD or EcoCash. 
                <strong> No more calling around.</strong>
              </Typography>

              {/* Social Proof */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="body1">
                  <strong>{preOrderCount.toLocaleString()}</strong> Zimbabweans already joined • 
                  <strong> 847</strong> verified vendors ready
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setIsPreOrderOpen(true)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  🚀 Join Early Access - Save 60%
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 2,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Watch Demo (2 min)
                </Button>
              </Box>

              {/* Trust indicators */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 3, opacity: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security fontSize="small" />
                  <Typography variant="body2">Bank-level security</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Smartphone fontSize="small" />
                  <Typography variant="body2">EcoCash integrated</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Support fontSize="small" />
                  <Typography variant="body2">24/7 support</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={20}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'text.primary'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                  🔥 Live Platform Stats
                </Typography>
                <Grid container spacing={3}>
                  {socialProof.map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {stat.metric}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stat.label}
                        </Typography>
                        <Chip 
                          label={stat.trend} 
                          size="small" 
                          color="success" 
                          sx={{ mt: 0.5, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Live exchange rate display */}
                {exchangeRates && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      💱 Live Exchange Rates
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">1 USD = ZiG {(1/exchangeRates.USD).toFixed(2)}</Typography>
                      <Typography variant="body2" color="success.main">Live</Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Problem-Solution Section - Amazon-inspired */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            We Solve Zimbabwe's Biggest Service Problems
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Every feature we built addresses a real problem Zimbabweans face daily
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {problemSolutions.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'error.light',
                      width: 56,
                      height: 56,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ mb: 2, fontWeight: 600 }}>
                      ❌ Problem: {item.problem}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 600 }}>
                      ✅ Our Solution: {item.solution}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Chip 
                      label={item.stats} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Value Proposition Section - Bezos-inspired */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            The Zimbabwe Advantage
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
          >
            Built specifically for Zimbabwe's unique challenges and opportunities
          </Typography>

          <Grid container spacing={4}>
            {valueProps.map((prop, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'primary.light',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    {prop.icon}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    {prop.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {prop.description}
                  </Typography>
                  <Chip
                    label={prop.benefit}
                    color="success"
                    sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Categories Section - Amazon-inspired marketplace */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Popular Service Categories
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          From home repairs to professional services - we've got Zimbabwe covered
        </Typography>

        <Grid container spacing={3}>
          {featuredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {category.popular && (
                  <Chip
                    label="🔥 Popular"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontWeight: 700
                    }}
                  />
                )}
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {category.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {category.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {category.vendors} vendors
                    </Typography>
                    <Chip
                      label={`From ${category.avgPrice}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/categories/${category.id}`}
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{ m: 1 }}
                  >
                    Explore Category
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

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

      {/* Pre-Order Modal */}
      <PreOrderModal 
        open={isPreOrderOpen} 
        onClose={() => setIsPreOrderOpen(false)} 
      />
    </Box>
  );
};

export default Home;
