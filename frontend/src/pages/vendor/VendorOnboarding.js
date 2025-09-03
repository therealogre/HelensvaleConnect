import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Schedule,
  AttachMoney,
  PhotoCamera,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = ['Business Info', 'Location & Contact', 'Services & Pricing', 'Operating Hours', 'Review & Submit'];

const businessTypes = [
  'restaurant', 'retail', 'service', 'health', 'beauty', 
  'fitness', 'education', 'entertainment', 'other'
];

const serviceCategories = [
  'Food & Dining', 'Health & Wellness', 'Beauty & Personal Care',
  'Fitness & Sports', 'Education & Training', 'Home Services',
  'Professional Services', 'Entertainment', 'Retail', 'Other'
];

const schema = yup.object({
  businessName: yup.string().required('Business name is required').min(2, 'Business name must be at least 2 characters'),
  businessType: yup.string().required('Business type is required'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('Zip code is required'),
  }),
  contact: yup.object({
    phone: yup.string().required('Phone number is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    website: yup.string().url('Invalid website URL').nullable(),
  }),
  services: yup.array().min(1, 'At least one service is required'),
  operatingHours: yup.object().required('Operating hours are required'),
});

const VendorOnboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState([]);
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      businessName: '',
      businessType: '',
      description: '',
      address: {
        street: '',
        city: 'Helensvale',
        state: 'QLD',
        zipCode: '',
      },
      contact: {
        phone: '',
        email: user?.email || '',
        website: '',
      },
      services: [],
      operatingHours: operatingHours,
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['businessName', 'businessType', 'description'];
      case 1:
        return ['address', 'contact'];
      case 2:
        return ['services'];
      case 3:
        return ['operatingHours'];
      default:
        return [];
    }
  };

  const addService = () => {
    setServices([...services, {
      name: '',
      category: '',
      description: '',
      price: '',
      duration: 60,
    }]);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const updateOperatingHours = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const onSubmit = async (data) => {
    try {
      const vendorData = {
        ...data,
        services,
        operatingHours,
        user: user.id,
      };

      // API call to create vendor profile
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(vendorData),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Failed to create vendor profile');
      }
    } catch (error) {
      console.error('Error creating vendor profile:', error);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                    InputProps={{
                      startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.businessType}>
                    <InputLabel>Business Type</InputLabel>
                    <Select {...field} label="Business Type">
                      {businessTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
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
                    placeholder="Describe your business, services, and what makes you unique..."
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Business Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street Address"
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="City"
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="State"
                    error={!!errors.address?.state}
                    helperText={errors.address?.state?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="address.zipCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Zip Code"
                    error={!!errors.address?.zipCode}
                    helperText={errors.address?.zipCode?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Business Phone"
                    error={!!errors.contact?.phone}
                    helperText={errors.contact?.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Business Email"
                    error={!!errors.contact?.email}
                    helperText={errors.contact?.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="contact.website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Website (Optional)"
                    placeholder="https://www.yourbusiness.com"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Services & Pricing</Typography>
              <Button variant="outlined" onClick={addService}>
                Add Service
              </Button>
            </Box>
            {services.map((service, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Service Name"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          label="Category"
                        >
                          {serviceCategories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Service Description"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Price (AUD)"
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', e.target.value)}
                        InputProps={{
                          startAdornment: '$',
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Duration (minutes)"
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(index, 'duration', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeService(index)}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            {services.length === 0 && (
              <Alert severity="info">
                Add at least one service to continue. Click "Add Service" to get started.
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Operating Hours
            </Typography>
            {Object.entries(operatingHours).map(([day, hours]) => (
              <Card key={day} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {day}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        type="time"
                        label="Open"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                        disabled={hours.closed}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        type="time"
                        label="Close"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                        disabled={hours.closed}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant={hours.closed ? "contained" : "outlined"}
                        onClick={() => updateOperatingHours(day, 'closed', !hours.closed)}
                        fullWidth
                      >
                        {hours.closed ? 'Closed' : 'Open'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 4:
        const formData = getValues();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Business Information</Typography>
                <Typography><strong>Name:</strong> {formData.businessName}</Typography>
                <Typography><strong>Type:</strong> {formData.businessType}</Typography>
                <Typography><strong>Description:</strong> {formData.description}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Location & Contact</Typography>
                <Typography><strong>Address:</strong> {formData.address?.street}, {formData.address?.city}, {formData.address?.state} {formData.address?.zipCode}</Typography>
                <Typography><strong>Phone:</strong> {formData.contact?.phone}</Typography>
                <Typography><strong>Email:</strong> {formData.contact?.email}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Services ({services.length})</Typography>
                {services.map((service, index) => (
                  <Typography key={index}>• {service.name} - ${service.price} ({service.duration} min)</Typography>
                ))}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Vendor Onboarding
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Set up your business profile to start connecting with customers
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained">
                  Create Profile
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VendorOnboarding;
