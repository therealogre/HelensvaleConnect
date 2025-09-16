import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setShowResendVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message);
        if (result.requiresVerification) {
          setShowResendVerification(true);
        }
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setError('Verification email sent! Please check your inbox.');
        setShowResendVerification(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <BusinessIcon sx={{ color: '#4CAF50', fontSize: 32 }} />,
      title: 'Grow Your Business',
      description: 'Connect with thousands of customers across Zimbabwe'
    },
    {
      icon: <SecurityIcon sx={{ color: '#2196F3', fontSize: 32 }} />,
      title: 'Secure Payments',
      description: 'Get paid instantly with EcoCash, OneMoney & PayNow'
    },
    {
      icon: <StarIcon sx={{ color: '#FF9800', fontSize: 32 }} />,
      title: 'Build Reputation',
      description: 'Earn reviews and build trust with verified customers'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mukamuri',
      business: 'Beauty Salon Owner',
      location: 'Harare',
      quote: 'Increased my bookings by 300% in just 2 months!',
      avatar: '/images/vendor-placeholder.jpg'
    },
    {
      name: 'Michael Chivasa',
      business: 'Home Services',
      location: 'Bulawayo',
      quote: 'Best platform for connecting with real customers.',
      avatar: '/images/vendor-placeholder.jpg'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: 3,
                maxWidth: 480,
                mx: 'auto',
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Logo and Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  src="/assets/logo.svg"
                  sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}
                />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your Helensvale Connect account
                </Typography>
                
                {/* Trust Badge */}
                <Chip
                  label="🇿🇼 Zimbabwe's Most Trusted Marketplace"
                  sx={{
                    mt: 2,
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity={showResendVerification ? 'warning' : 'error'} 
                  sx={{ mb: 3 }}
                  action={
                    showResendVerification && (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        Resend Email
                      </Button>
                    )
                  }
                >
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mb: 3,
                    bgcolor: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#5a67d8' }
                  }}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Links */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Button
                    component={Link}
                    to="/forgot-password"
                    variant="text"
                    sx={{ textTransform: 'none', color: '#667eea' }}
                  >
                    Forgot your password?
                  </Button>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Button
                      component={Link}
                      to="/register"
                      variant="text"
                      sx={{ 
                        textTransform: 'none', 
                        fontWeight: 'bold',
                        color: '#667eea'
                      }}
                    >
                      Sign up for free
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Benefits & Social Proof */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', pl: { md: 4 } }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', mb: 2, textAlign: { xs: 'center', md: 'left' } }}
              >
                Join 15,000+ Professionals
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, textAlign: { xs: 'center', md: 'left' } }}
              >
                Grow your business with Zimbabwe's leading service marketplace
              </Typography>

              {/* Benefits */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} key={index}>
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flexShrink: 0 }}>
                          {benefit.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {benefit.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {benefit.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Testimonials */}
              <Typography
                variant="h5"
                sx={{ fontWeight: 'bold', mb: 3, textAlign: { xs: 'center', md: 'left' } }}
              >
                What Our Users Say
              </Typography>
              
              <Grid container spacing={2}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            src={testimonial.avatar}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {testimonial.name}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {testimonial.business} • {testimonial.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: 'italic', opacity: 0.9 }}
                        >
                          "{testimonial.quote}"
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Trust Indicators */}
              <Box sx={{ mt: 4, textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    <Typography variant="body2">Bank-Level Security</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon />
                    <Typography variant="body2">4.9★ Average Rating</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon />
                    <Typography variant="body2">SSL Encrypted</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
