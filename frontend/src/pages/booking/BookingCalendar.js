import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Calendar,
  AccessTime,
  Person,
  LocationOn,
  Phone,
  Email,
  AttachMoney,
  EventAvailable,
  Schedule
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const bookingSchema = yup.object().shape({
  selectedDate: yup.date().required('Please select a date').min(new Date(), 'Cannot book for past dates'),
  selectedTimeSlot: yup.string().required('Please select a time slot'),
  selectedService: yup.string().required('Please select a service'),
  participants: yup.number().min(1, 'At least 1 participant required').max(10, 'Maximum 10 participants allowed'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
  contactPreference: yup.string().oneOf(['email', 'sms', 'phone'], 'Invalid contact preference')
});

const BookingCalendar = ({ vendor, onBookingComplete }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      participants: 1,
      contactPreference: 'email',
      notes: ''
    }
  });

  const watchedService = watch('selectedService');
  const watchedDate = watch('selectedDate');

  // Generate available dates (next 30 days, excluding vendor's closed days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      const dayName = format(date, 'EEEE').toLowerCase();
      
      // Check if vendor is open on this day
      const operatingHour = vendor.operatingHours?.find(oh => oh.day === dayName);
      if (operatingHour && operatingHour.isOpen) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Generate time slots based on vendor's operating hours and service duration
  const generateTimeSlots = (date, service) => {
    if (!date || !service) return [];

    const dayName = format(date, 'EEEE').toLowerCase();
    const operatingHour = vendor.operatingHours?.find(oh => oh.day === dayName);
    
    if (!operatingHour || !operatingHour.isOpen) return [];

    const slots = [];
    const serviceObj = vendor.services.find(s => s._id === service);
    const serviceDuration = serviceObj?.duration || 60;

    // Parse operating hours
    const [openHour, openMinute] = operatingHour.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = operatingHour.closeTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(openHour, openMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    while (currentTime.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      const slotStart = format(currentTime, 'HH:mm');
      const slotEnd = format(new Date(currentTime.getTime() + (serviceDuration * 60 * 1000)), 'HH:mm');
      
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: true // This would be checked against existing bookings
      });

      // Move to next slot (30-minute intervals)
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  };

  // Fetch available time slots for selected date and service
  const fetchAvailableSlots = async (date, serviceId) => {
    if (!date || !serviceId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/bookings/available-slots`, {
        params: {
          vendorId: vendor._id,
          date: format(date, 'yyyy-MM-dd'),
          serviceId: serviceId
        }
      });
      
      setAvailableSlots(response.data.slots || generateTimeSlots(date, serviceId));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback to generated slots
      setAvailableSlots(generateTimeSlots(date, serviceId));
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setValue('selectedDate', date);
    setSelectedTimeSlot('');
    setValue('selectedTimeSlot', '');
    
    if (watchedService) {
      fetchAvailableSlots(date, watchedService);
    }
  };

  // Handle service selection
  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setValue('selectedService', serviceId);
    setSelectedTimeSlot('');
    setValue('selectedTimeSlot', '');
    
    if (selectedDate) {
      fetchAvailableSlots(selectedDate, serviceId);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot.startTime);
    setValue('selectedTimeSlot', slot.startTime);
    setBookingDialogOpen(true);
  };

  // Submit booking
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const selectedServiceObj = vendor.services.find(s => s._id === data.selectedService);
      
      const bookingData = {
        vendor: vendor._id,
        service: {
          id: selectedServiceObj._id,
          name: selectedServiceObj.name,
          price: selectedServiceObj.price,
          duration: selectedServiceObj.duration
        },
        bookingDate: data.selectedDate,
        timeSlot: {
          startTime: data.selectedTimeSlot,
          endTime: availableSlots.find(slot => slot.startTime === data.selectedTimeSlot)?.endTime
        },
        participants: data.participants,
        totalAmount: selectedServiceObj.price * data.participants,
        customerDetails: {
          notes: data.notes,
          contactPreference: data.contactPreference
        },
        payment: {
          method: 'pending', // Will be set during payment process
          status: 'pending'
        }
      };

      const response = await axios.post('/api/bookings', bookingData);
      
      toast.success('Booking created successfully!');
      setBookingDialogOpen(false);
      reset();
      setSelectedDate(null);
      setSelectedService('');
      setSelectedTimeSlot('');
      
      if (onBookingComplete) {
        onBookingComplete(response.data.booking);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();
  const selectedServiceObj = vendor.services.find(s => s._id === selectedService);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar />
          Book with {vendor.businessName}
        </Typography>

        <Grid container spacing={3}>
          {/* Service Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Service
                </Typography>
                <List>
                  {vendor.services?.filter(service => service.isActive).map((service) => (
                    <ListItem
                      key={service._id}
                      button
                      selected={selectedService === service._id}
                      onClick={() => handleServiceSelect(service._id)}
                      sx={{
                        border: selectedService === service._id ? 2 : 1,
                        borderColor: selectedService === service._id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={service.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip
                                icon={<AttachMoney />}
                                label={`$${service.price}`}
                                size="small"
                                color="primary"
                              />
                              <Chip
                                icon={<AccessTime />}
                                label={`${service.duration} min`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Date Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Date
                </Typography>
                {selectedService ? (
                  <Box>
                    <DatePicker
                      label="Booking Date"
                      value={selectedDate}
                      onChange={handleDateSelect}
                      shouldDisableDate={(date) => !availableDates.some(availableDate => isSameDay(date, availableDate))}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), 30)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    
                    {selectedDate && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info">Please select a service first</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Time Slot Selection */}
          {selectedDate && selectedService && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Time Slots
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : availableSlots.length > 0 ? (
                    <Grid container spacing={1}>
                      {availableSlots.map((slot, index) => (
                        <Grid item key={index}>
                          <Button
                            variant={selectedTimeSlot === slot.startTime ? 'contained' : 'outlined'}
                            onClick={() => handleTimeSlotSelect(slot)}
                            disabled={!slot.available}
                            startIcon={<Schedule />}
                          >
                            {slot.startTime} - {slot.endTime}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="warning">
                      No available time slots for the selected date and service.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Booking Confirmation Dialog */}
        <Dialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {selectedServiceObj && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{selectedServiceObj.name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedServiceObj.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={`$${selectedServiceObj.price}`} size="small" color="primary" />
                      <Chip label={`${selectedServiceObj.duration} min`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                )}

                {selectedDate && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </Typography>
                )}

                {selectedTimeSlot && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Time:</strong> {selectedTimeSlot} - {availableSlots.find(slot => slot.startTime === selectedTimeSlot)?.endTime}
                  </Typography>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="participants"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Number of Participants"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1, max: 10 }}
                        error={!!errors.participants}
                        helperText={errors.participants?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="contactPreference"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Contact Preference</InputLabel>
                        <Select {...field} label="Contact Preference">
                          <MenuItem value="email">Email</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="phone">Phone</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Special Requests or Notes"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Any special requests or additional information..."
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {selectedServiceObj && watch('participants') && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6">
                    Total: ${selectedServiceObj.price * (watch('participants') || 1)}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <EventAvailable />}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default BookingCalendar;
