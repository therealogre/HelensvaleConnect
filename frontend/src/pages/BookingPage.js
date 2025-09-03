import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  Person,
  Payment,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const BookingPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service: '',
    date: null,
    timeSlot: '',
    participants: 1,
    notes: '',
    paymentMethod: 'card',
  });

  // Mock data - in real app, this would come from API
  const vendor = {
    id: 1,
    businessName: "Bella's Beauty Salon",
    services: [
      { id: 1, name: 'Hair Cut & Style', price: 65, duration: 60 },
      { id: 2, name: 'Hair Coloring', price: 120, duration: 120 },
      { id: 3, name: 'Facial Treatment', price: 85, duration: 75 },
      { id: 4, name: 'Manicure & Pedicure', price: 55, duration: 45 }
    ],
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
      { day: 'sunday', isOpen: false, openTime: '', closeTime: '' }
    ]
  };

  const steps = ['Select Service', 'Choose Date & Time', 'Your Details', 'Payment', 'Confirmation'];

  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const selectedService = vendor.services.find(s => s.id === bookingData.service);
  const totalAmount = selectedService ? selectedService.price * bookingData.participants : 0;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBookingSubmit = () => {
    // In real app, this would submit to API
    console.log('Booking submitted:', bookingData);
    handleNext();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Service
            </Typography>
            <Grid container spacing={2}>
              {vendor.services.map((service) => (
                <Grid item xs={12} key={service.id}>
                  <Card
                    variant={bookingData.service === service.id ? "outlined" : "elevation"}
                    sx={{
                      cursor: 'pointer',
                      borderColor: bookingData.service === service.id ? 'primary.main' : 'transparent',
                      borderWidth: 2,
                      '&:hover': { boxShadow: 2 }
                    }}
                    onClick={() => setBookingData({ ...bookingData, service: service.id })}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">{service.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {service.duration} minutes
                          </Typography>
                        </Box>
                        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
                          ${service.price}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Date & Time
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={bookingData.date}
                    onChange={(newValue) => setBookingData({ ...bookingData, date: newValue })}
                    minDate={dayjs()}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Slot</InputLabel>
                  <Select
                    value={bookingData.timeSlot}
                    label="Time Slot"
                    onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                  >
                    {availableTimeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Participants"
                  value={bookingData.participants}
                  onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Special Notes or Requests"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  placeholder="Any special requirements or notes for the service provider..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={bookingData.paymentMethod}
                label="Payment Method"
                onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
              >
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="cash">Cash (Pay at venue)</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>

            {bookingData.paymentMethod === 'card' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You will be redirected to a secure payment page to complete your booking.
              </Alert>
            )}

            {bookingData.paymentMethod === 'cash' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please bring exact change or card as backup. Payment is due at the time of service.
              </Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your booking has been successfully submitted. You will receive a confirmation email shortly.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
              >
                View My Bookings
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/vendors')}
              >
                Book Another Service
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
        Book with {vendor.businessName}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {renderStepContent(activeStep)}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 2 ? handleBookingSubmit : handleNext}
              disabled={
                (activeStep === 0 && !bookingData.service) ||
                (activeStep === 1 && (!bookingData.date || !bookingData.timeSlot)) ||
                activeStep === steps.length - 1
              }
            >
              {activeStep === steps.length - 2 ? 'Confirm Booking' : 'Next'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedService && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Service</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedService.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {selectedService.duration} minutes
                  </Typography>
                </Box>
              )}

              {bookingData.date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Date & Time</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bookingData.date.format('MMMM D, YYYY')}
                  </Typography>
                  {bookingData.timeSlot && (
                    <Typography variant="body2" color="text.secondary">
                      {bookingData.timeSlot}
                    </Typography>
                  )}
                </Box>
              )}

              {bookingData.participants > 1 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Participants</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bookingData.participants} people
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  ${totalAmount}
                </Typography>
              </Box>

              {bookingData.paymentMethod && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Payment: ${bookingData.paymentMethod.replace('_', ' ').toUpperCase()}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingPage;
