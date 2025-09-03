import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Business,
  Person,
  Verified,
  Payment,
  CheckCircle,
  Upload,
  Camera,
  Schedule,
  MonetizationOn,
  CloudUpload,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SEO from '../components/SEO';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorOnboarding = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const steps = [
    { label: 'Business Info', icon: <Business /> },
    { label: 'Services', icon: <MonetizationOn /> },
    { label: 'Photos', icon: <Camera /> },
    { label: 'Schedule', icon: <Schedule /> },
    { label: 'Verification', icon: <Verified /> },
    { label: 'Payment', icon: <Payment /> },
  ];

  const businessInfoSchema = yup.object({
    businessName: yup.string().required('Business name is required'),
    category: yup.string().required('Category is required'),
    description: yup.string().required('Description is required').min(50),
    phone: yup.string().required('Phone number is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
  });

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(businessInfoSchema),
    defaultValues: {
      businessName: '',
      category: '',
      description: '',
      phone: '',
      email: '',
    },
  });

  const categories = [
    'Home Services',
    'Automotive',
    'Beauty & Wellness',
    'Professional Services',
    'Construction',
    'Technology',
    'Education',
    'Health & Medical',
  ];

  useEffect(() => {
    const data = watch();
    const requiredFields = ['businessName', 'category', 'description', 'phone', 'email'];
    const completed = requiredFields.filter(field => data[field]?.trim()).length;
    const progress = (completed / requiredFields.length) * 100;
    setCompletionPercentage(Math.round(progress));
  }, [watch]);

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const BusinessInfoStep = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        🚀 Complete your profile in under 15 minutes and start receiving bookings today!
      </Alert>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="businessName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Business Name"
                error={!!errors.businessName}
                helperText={errors.businessName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select {...field} label="Category">
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Business Description"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return <BusinessInfoStep />;
      case 1: return <Typography>Services setup coming soon...</Typography>;
      case 2: return <Typography>Photo upload coming soon...</Typography>;
      case 3: return <Typography>Schedule setup coming soon...</Typography>;
      case 4: return <Typography>Verification coming soon...</Typography>;
      case 5: return <Typography>Payment setup coming soon...</Typography>;
      default: return 'Unknown step';
    }
  };

  return (
    <Box>
      <SEO
        title="Become a Service Provider - Helensvale Connect"
        description="Join Zimbabwe's premier service marketplace. Quick setup and start earning today."
      />

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Vendor Onboarding
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{completionPercentage}% Complete</Typography>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{ width: 200, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 4 }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? () => toast.success('Setup complete!') : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VendorOnboarding;
