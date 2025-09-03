import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  Security,
  Speed,
  Support,
  Verified,
  LocalOffer,
  Timer,
  People,
  MonetizationOn,
  Business,
  Rocket,
  Diamond,
  Crown,
  Flash,
  Shield,
  Headset,
  Analytics,
  Api,
  Palette,
  Priority,
  Group,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PreOrderModal from '../components/PreOrderModal';

const Pricing = () => {
  const theme = useTheme();
  const [isYearly, setIsYearly] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 23, seconds: 45 });
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [socialProof, setSocialProof] = useState({
    totalUsers: 3247,
    recentSignups: 89,
    savings: 'ZiG 4,850',
  });

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update social proof periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSocialProof(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3) + 1,
        recentSignups: Math.floor(Math.random() * 15) + 75,
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfect for new businesses',
      monthlyPrice: isYearly ? 79 : 99,
      yearlyPrice: 948,
      originalMonthly: 149,
      originalYearly: 1788,
      discount: isYearly ? '47% OFF' : '34% OFF',
      popular: false,
      color: 'success',
      icon: <Rocket />,
      badge: '💎 Best Value',
      features: [
        { text: 'Up to 50 bookings/month', icon: <Business /> },
        { text: 'Basic profile & gallery', icon: <Palette /> },
        { text: 'Customer messaging', icon: <Headset /> },
        { text: 'Mobile app access', icon: <Flash /> },
        { text: 'PayNow & EcoCash payments', icon: <MonetizationOn /> },
        { text: 'Basic analytics', icon: <Analytics /> },
        { text: 'Email support', icon: <Support /> },
        { text: '5% platform commission', icon: <LocalOffer /> },
      ],
      limitations: [
        'Limited customization',
        'Standard search ranking',
        'Basic support only',
      ],
      cta: 'Start Free Trial',
      guarantee: '14-day free trial',
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'Most popular for growing businesses',
      monthlyPrice: isYearly ? 149 : 199,
      yearlyPrice: 1788,
      originalMonthly: 299,
      originalYearly: 3588,
      discount: isYearly ? '50% OFF' : '33% OFF',
      popular: true,
      color: 'primary',
      icon: <Diamond />,
      badge: '🚀 Most Popular',
      features: [
        { text: 'Unlimited bookings', icon: <Business /> },
        { text: 'Premium profile & branding', icon: <Palette /> },
        { text: 'Priority search ranking', icon: <Priority /> },
        { text: 'Advanced analytics dashboard', icon: <Analytics /> },
        { text: 'Multi-currency pricing', icon: <MonetizationOn /> },
        { text: 'Customer review management', icon: <Star /> },
        { text: 'WhatsApp & SMS notifications', icon: <Flash /> },
        { text: 'Priority customer support', icon: <Headset /> },
        { text: 'API access for integrations', icon: <Api /> },
        { text: '3% platform commission', icon: <LocalOffer /> },
        { text: 'Marketing tools & promotions', icon: <TrendingUp /> },
        { text: 'Advanced booking management', icon: <Speed /> },
      ],
      limitations: [],
      cta: 'Start Professional',
      guarantee: '30-day money back guarantee',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'For established businesses & franchises',
      monthlyPrice: isYearly ? 299 : 399,
      yearlyPrice: 3588,
      originalMonthly: 599,
      originalYearly: 7188,
      discount: isYearly ? '50% OFF' : '33% OFF',
      popular: false,
      color: 'secondary',
      icon: <Crown />,
      badge: '👑 Premium',
      features: [
        { text: 'Everything in Professional', icon: <CheckCircle /> },
        { text: 'Multiple location management', icon: <Group /> },
        { text: 'Custom branding & white-label', icon: <Palette /> },
        { text: 'Dedicated account manager', icon: <Headset /> },
        { text: 'Advanced reporting & insights', icon: <Analytics /> },
        { text: 'Custom integrations & API', icon: <Api /> },
        { text: 'Priority phone support', icon: <Support /> },
        { text: '1% platform commission', icon: <LocalOffer /> },
        { text: 'Marketing campaign management', icon: <TrendingUp /> },
        { text: 'Staff management tools', icon: <Group /> },
        { text: 'Custom payment terms', icon: <MonetizationOn /> },
        { text: 'SLA guarantee', icon: <Shield /> },
      ],
      limitations: [],
      cta: 'Contact Sales',
      guarantee: 'Custom terms & SLA',
    },
  ];

  const testimonials = [
    {
      name: 'Tendai Mukamuri',
      business: 'TM Plumbing Services',
      location: 'Harare',
      rating: 5,
      text: "Helensvale Connect transformed my business. I went from 5 jobs per month to 45+ jobs. The ZiG payment system is a game-changer!",
      revenue: '+780% revenue increase',
      avatar: 'TM',
    },
    {
      name: 'Grace Chivasa',
      business: 'Grace Beauty Salon',
      location: 'Bulawayo',
      rating: 5,
      text: "The booking system saves me 3 hours daily. Customers love the convenience and I love the automatic payments.",
      revenue: 'ZiG 12,000/month saved',
      avatar: 'GC',
    },
    {
      name: 'Michael Nyoni',
      business: 'Nyoni Legal Services',
      location: 'Gweru',
      rating: 5,
      text: "Professional platform that matches my service quality. The analytics help me understand my clients better.",
      revenue: '95% client retention',
      avatar: 'MN',
    },
  ];

  const faqs = [
    {
      question: 'Why are the prices so low during pre-order?',
      answer: 'We\'re offering founder pricing to early adopters who help us build and improve the platform. This is a limited-time opportunity that won\'t be available after launch.',
    },
    {
      question: 'What happens if I\'m not satisfied?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied, we\'ll refund your entire payment, no questions asked.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.',
    },
    {
      question: 'Do you support all Zimbabwe payment methods?',
      answer: 'Yes! We support PayNow, EcoCash, ZiG, USD, and ZWL with real-time exchange rates and transparent fees.',
    },
  ];

  return (
    <Box>
      {/* Hero Section with Urgency */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Founder Pricing
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Join the first 5,000 Zimbabwe businesses to transform their service delivery
            </Typography>

            {/* Urgency Timer */}
            <Paper
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: 3,
                mb: 4,
              }}
            >
              <Timer />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Founder Pricing Ends In: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </Typography>
            </Paper>

            {/* Social Proof */}
            <Alert
              severity="success"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  🔥 {socialProof.totalUsers.toLocaleString()} founders joined
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  💰 Average savings: {socialProof.savings}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ⚡ {socialProof.recentSignups} joined in last 24h
                </Typography>
              </Box>
            </Alert>
          </Box>

          {/* Billing Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
            <Paper sx={{ p: 1, borderRadius: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isYearly}
                    onChange={(e) => setIsYearly(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Pay Yearly
                    </Typography>
                    <Chip
                      label="Save 50%"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                }
              />
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: 8, mt: -4 }}>
        <Grid container spacing={4}>
          {pricingPlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  border: plan.popular ? '3px solid' : '2px solid transparent',
                  borderColor: plan.popular ? 'primary.main' : 'transparent',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    transform: plan.popular ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {plan.popular && (
                  <Chip
                    label={plan.badge}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: `${plan.color}.main`,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {plan.icon}
                  </Avatar>

                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.subtitle}
                  </Typography>

                  {/* Pricing */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: `${plan.color}.main` }}>
                        ZiG {plan.monthlyPrice}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        /month
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      sx={{ 
                        textDecoration: 'line-through', 
                        color: 'text.secondary',
                        mb: 1 
                      }}
                    >
                      Was ZiG {plan.originalMonthly}/month
                    </Typography>
                    
                    <Chip
                      label={plan.discount}
                      color="error"
                      sx={{ fontWeight: 700 }}
                    />

                    {isYearly && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 600 }}>
                        Billed yearly: ZiG {plan.yearlyPrice} (Save ZiG {(plan.originalYearly - plan.yearlyPrice).toLocaleString()})
                      </Typography>
                    )}
                  </Box>

                  {/* Features */}
                  <List dense sx={{ mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.9rem',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    color={plan.color}
                    size="large"
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      mb: 2,
                    }}
                    onClick={() => setIsPreOrderOpen(true)}
                  >
                    {plan.cta}
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    {plan.guarantee}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Value Proposition */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Why Choose Helensvale Connect?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <Security />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Zimbabwe-First Platform
                </Typography>
                <Typography variant="body2">
                  Built specifically for Zimbabwe's market with ZiG currency, local payment methods, and understanding of local business needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Proven Results
                </Typography>
                <Typography variant="body2">
                  Our beta users report 300-800% increase in bookings and 40% reduction in administrative time.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <Support />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Local Support Team
                </Typography>
                <Typography variant="body2">
                  Dedicated Zimbabwe-based support team that understands your business and can help in English or Shona.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            What Zimbabwe Businesses Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.business} • {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'orange', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    "{testimonial.text}"
                  </Typography>
                  <Chip
                    label={testimonial.revenue}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Transform Your Business?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join {socialProof.totalUsers.toLocaleString()}+ Zimbabwe businesses already growing with Helensvale Connect
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setIsPreOrderOpen(true)}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 2,
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              🚀 Start Your Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/demo"
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
              Watch Demo
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            💳 No credit card required • 🔒 30-day money back guarantee • ⚡ Setup in 5 minutes
          </Typography>
        </Container>
      </Box>

      {/* Pre-Order Modal */}
      <PreOrderModal 
        open={isPreOrderOpen} 
        onClose={() => setIsPreOrderOpen(false)} 
      />
    </Box>
  );
};

export default Pricing;
