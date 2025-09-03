import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Close,
  Star,
  CheckCircle,
  TrendingUp,
  People,
  Schedule,
  MonetizationOn,
  Security,
  Speed,
  Support,
  Verified,
  LocalOffer,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone number is required').matches(/^(\+263|0)[0-9]{9}$/, 'Invalid Zimbabwe phone number'),
  businessType: yup.string().required('Please select your business type'),
  expectedRevenue: yup.string().required('Please select expected monthly revenue'),
  referralSource: yup.string().required('Please tell us how you heard about us'),
});

const PreOrderModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [socialProof, setSocialProof] = useState({
    preOrders: 1247,
    savings: 'ZiG 2,450',
    timeLeft: '72 hours',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Update social proof every few seconds
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setSocialProof(prev => ({
          ...prev,
          preOrders: prev.preOrders + Math.floor(Math.random() * 3) + 1,
        }));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const pricingTiers = [
    {
      id: 'founder',
      name: 'Founder Access',
      originalPrice: 'ZiG 299',
      preOrderPrice: 'ZiG 99',
      discount: '67% OFF',
      popular: true,
      features: [
        'Lifetime access to platform',
        'Zero commission for first 6 months',
        'Priority customer support',
        'Advanced analytics dashboard',
        'Custom branding options',
        'API access for integrations',
        'Exclusive founder badge',
        'Direct line to founders',
      ],
      badge: '🚀 Most Popular',
      color: 'primary',
    },
    {
      id: 'early-bird',
      name: 'Early Bird',
      originalPrice: 'ZiG 199',
      preOrderPrice: 'ZiG 79',
      discount: '60% OFF',
      features: [
        '12 months platform access',
        '2% commission (vs 5% regular)',
        'Priority listing in search',
        'Basic analytics',
        'Email support',
        'Mobile app access',
      ],
      badge: '⚡ Limited Time',
      color: 'secondary',
    },
    {
      id: 'supporter',
      name: 'Supporter',
      originalPrice: 'ZiG 99',
      preOrderPrice: 'ZiG 39',
      discount: '61% OFF',
      features: [
        '6 months platform access',
        '3% commission (vs 5% regular)',
        'Standard listing',
        'Basic support',
        'Mobile app access',
      ],
      badge: '💎 Best Value',
      color: 'success',
    },
  ];

  const businessTypes = [
    'Home Services (Plumbing, Electrical, etc.)',
    'Beauty & Wellness',
    'Professional Services (Legal, Accounting, etc.)',
    'Automotive Services',
    'Food & Catering',
    'Construction & Renovation',
    'Technology Services',
    'Health & Medical',
    'Education & Training',
    'Other',
  ];

  const revenueRanges = [
    'Just starting out (ZiG 0 - 500/month)',
    'Small business (ZiG 500 - 2,000/month)',
    'Growing business (ZiG 2,000 - 10,000/month)',
    'Established business (ZiG 10,000 - 50,000/month)',
    'Large business (ZiG 50,000+/month)',
  ];

  const referralSources = [
    'Google Search',
    'Facebook/Social Media',
    'Word of mouth/Referral',
    'Local advertising',
    'Business network',
    'Other',
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('🎉 Pre-order successful! Welcome to the founder community!');
      setStep(3);
      
      // Reset form after success
      setTimeout(() => {
        reset();
        setStep(1);
        onClose();
      }, 3000);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 Join the Revolution
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Be among the first 2,000 founders to transform Zimbabwe's service industry
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="large">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Social Proof Bar */}
        <Alert
          severity="success"
          sx={{
            mb: 3,
            bgcolor: 'success.light',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {socialProof.preOrders.toLocaleString()} founders already joined
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MonetizationOn />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Average savings: {socialProof.savings}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Schedule />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                Only {socialProof.timeLeft} left!
              </Typography>
            </Box>
          </Box>
        </Alert>

        {step === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
              Choose Your Founder Package
            </Typography>
            
            <Grid container spacing={3}>
              {pricingTiers.map((tier) => (
                <Grid item xs={12} md={4} key={tier.id}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: tier.popular ? '3px solid' : '2px solid transparent',
                      borderColor: tier.popular ? 'primary.main' : 'transparent',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      },
                    }}
                    onClick={() => setStep(2)}
                  >
                    {tier.popular && (
                      <Chip
                        label={tier.badge}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: 700,
                          zIndex: 1,
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        {tier.name}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: tier.color + '.main' }}
                        >
                          {tier.preOrderPrice}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          {tier.originalPrice}
                        </Typography>
                        <Chip
                          label={tier.discount}
                          color="error"
                          size="small"
                          sx={{ mt: 1, fontWeight: 700 }}
                        />
                      </Box>

                      <List dense>
                        {tier.features.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontSize: '0.85rem',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 2, fontWeight: 700 }}
                        color={tier.color}
                        onClick={() => setStep(2)}
                      >
                        Select Package
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                🎯 Why Pre-Order Now?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalOffer color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Massive Early Bird Discounts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Verified color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Lifetime Founder Benefits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Speed color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Priority Access & Support
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Shape Platform Development
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
              Complete Your Pre-Order
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="+263 or 0..."
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.businessType}>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      {...register('businessType')}
                      label="Business Type"
                    >
                      {businessTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.expectedRevenue}>
                    <InputLabel>Expected Monthly Revenue</InputLabel>
                    <Select
                      {...register('expectedRevenue')}
                      label="Expected Monthly Revenue"
                    >
                      {revenueRanges.map((range) => (
                        <MenuItem key={range} value={range}>
                          {range}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.referralSource}>
                    <InputLabel>How did you hear about us?</InputLabel>
                    <Select
                      {...register('referralSource')}
                      label="How did you hear about us?"
                    >
                      {referralSources.map((source) => (
                        <MenuItem key={source} value={source}>
                          {source}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  🔒 Your Investment is Protected
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security />
                      <Typography variant="body2">30-day money back</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Support />
                      <Typography variant="body2">24/7 founder support</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Verified />
                      <Typography variant="body2">Lifetime benefits</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setStep(1)}
                  size="large"
                  sx={{ flex: 1 }}
                >
                  Back to Packages
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ flex: 2, fontWeight: 700 }}
                >
                  {loading ? 'Processing...' : 'Complete Pre-Order 🚀'}
                </Button>
              </Box>
            </form>
          </Box>
        )}

        {step === 3 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'success.main',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
              🎉 Welcome to the Founder Community!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              You're now part of an exclusive group shaping Zimbabwe's digital future
            </Typography>
            
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>What happens next:</strong>
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="You'll receive a confirmation email within 5 minutes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Access to exclusive founder WhatsApp group" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Platform launches in 30 days with your benefits active" />
                </ListItem>
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreOrderModal;
