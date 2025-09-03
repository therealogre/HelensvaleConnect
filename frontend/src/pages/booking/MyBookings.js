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
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Tabs,
  Tab,
  Paper
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
  Cancel,
  CheckCircle,
  Schedule,
  MoreVert,
  Star,
  Feedback,
  Edit,
  Delete
} from '@mui/icons-material';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const feedbackSchema = yup.object().shape({
  rating: yup.number().required('Rating is required').min(1).max(5),
  comment: yup.string().max(500, 'Comment cannot exceed 500 characters')
});

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      comment: ''
    }
  });

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings by status
  const getFilteredBookings = () => {
    const now = new Date();
    switch (tabValue) {
      case 0: // Upcoming
        return bookings.filter(booking => 
          ['confirmed', 'pending'].includes(booking.status) && 
          isFuture(parseISO(booking.bookingDate))
        );
      case 1: // Past
        return bookings.filter(booking => 
          ['completed', 'cancelled', 'no_show'].includes(booking.status) || 
          isPast(parseISO(booking.bookingDate))
        );
      case 2: // All
        return bookings;
      default:
        return bookings;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle menu actions
  const handleMenuClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await axios.put(`/api/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason
      });
      
      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setCancelReason('');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
    handleMenuClose();
  };

  // Submit feedback
  const onSubmitFeedback = async (data) => {
    if (!selectedBooking) return;

    try {
      await axios.put(`/api/bookings/${selectedBooking._id}/feedback`, data);
      
      toast.success('Feedback submitted successfully');
      setFeedbackDialogOpen(false);
      reset();
      fetchBookings();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
    handleMenuClose();
  };

  // Check-in to booking
  const handleCheckIn = async (booking) => {
    try {
      await axios.put(`/api/bookings/${booking._id}/checkin`);
      
      toast.success('Checked in successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calendar />
        My Bookings
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="All" />
        </Tabs>
      </Paper>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Alert severity="info">
          No bookings found for the selected filter.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} md={6} lg={4} key={booking._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {booking.vendor?.businessName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, booking)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {booking.service?.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Calendar fontSize="small" />
                    <Typography variant="body2">
                      {format(parseISO(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AttachMoney fontSize="small" />
                    <Typography variant="body2">
                      ${booking.totalAmount}
                    </Typography>
                  </Box>

                  {booking.participants > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        {booking.participants} participants
                      </Typography>
                    </Box>
                  )}

                  {booking.vendor?.location?.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2" noWrap>
                        {booking.vendor.location.address.street}, {booking.vendor.location.address.city}
                      </Typography>
                    </Box>
                  )}

                  {booking.customerDetails?.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                      "{booking.customerDetails.notes}"
                    </Typography>
                  )}

                  {booking.feedback?.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Star fontSize="small" color="primary" />
                      <Rating value={booking.feedback.rating} size="small" readOnly />
                      <Typography variant="body2">
                        ({booking.feedback.rating}/5)
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {/* Action Buttons */}
                {booking.status === 'confirmed' && isFuture(parseISO(booking.bookingDate)) && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => handleCheckIn(booking)}
                    >
                      Check In
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedBooking?.status === 'completed' && !selectedBooking?.feedback?.rating && (
          <MenuItem onClick={() => {
            setFeedbackDialogOpen(true);
            handleMenuClose();
          }}>
            <Feedback sx={{ mr: 1 }} />
            Add Feedback
          </MenuItem>
        )}
        
        {selectedBooking?.status === 'pending' || selectedBooking?.status === 'confirmed' ? (
          <MenuItem onClick={() => {
            setCancelDialogOpen(true);
            handleMenuClose();
          }}>
            <Cancel sx={{ mr: 1 }} />
            Cancel Booking
          </MenuItem>
        ) : null}
      </Menu>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmitFeedback)}>
          <DialogTitle>Add Feedback</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedBooking?.vendor?.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedBooking?.service?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography component="legend" gutterBottom>
                Rating *
              </Typography>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Rating
                    {...field}
                    size="large"
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                    }}
                  />
                )}
              />
              {errors.rating && (
                <Typography variant="caption" color="error">
                  {errors.rating.message}
                </Typography>
              )}
            </Box>

            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Comment (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Share your experience..."
                  error={!!errors.comment}
                  helperText={errors.comment?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Submit Feedback
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this booking?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedBooking?.vendor?.businessName} - {selectedBooking?.service?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedBooking && format(parseISO(selectedBooking.bookingDate), 'EEEE, MMMM d, yyyy')} at {selectedBooking?.timeSlot?.startTime}
          </Typography>
          
          <TextField
            label="Reason for cancellation (Optional)"
            multiline
            rows={3}
            fullWidth
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Please let us know why you're cancelling..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
          >
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings;
