import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Business,
  Schedule,
  Star,
  TrendingUp,
  Add,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const recentBookings = [
    {
      id: 1,
      vendorName: "Bella's Beauty Salon",
      service: "Hair Cut & Style",
      date: "2025-09-05",
      time: "14:00",
      status: "confirmed",
    },
    {
      id: 2,
      vendorName: "TechFix Solutions",
      service: "Computer Repair",
      date: "2025-09-03",
      time: "10:30",
      status: "completed",
    },
  ];

  const vendorStats = {
    totalBookings: 45,
    totalRevenue: 2850,
    averageRating: 4.8,
    activeServices: 8,
  };

  const CustomerDashboard = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              {recentBookings.length > 0 ? (
                <List>
                  {recentBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Business />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={booking.vendorName}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {booking.service}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.date} at {booking.time}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={booking.status}
                          color={booking.status === 'confirmed' ? 'primary' : 'success'}
                          size="small"
                        />
                      </ListItem>
                      {index < recentBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No bookings yet
                  </Typography>
                  <Button
                    component={Link}
                    to="/vendors"
                    variant="contained"
                    startIcon={<Add />}
                  >
                    Book Your First Service
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  to="/vendors"
                  variant="contained"
                  startIcon={<Business />}
                  fullWidth
                >
                  Find Services
                </Button>
                <Button
                  component={Link}
                  to="/bookings"
                  variant="outlined"
                  startIcon={<Schedule />}
                  fullWidth
                >
                  My Bookings
                </Button>
                <Button
                  component={Link}
                  to="/profile"
                  variant="outlined"
                  startIcon={<Person />}
                  fullWidth
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const VendorDashboard = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {vendorStats.totalBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ${vendorStats.totalRevenue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {vendorStats.averageRating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {vendorStats.activeServices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Services
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              <List>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Customer Booking - ${booking.service}`}
                        secondary={`${booking.date} at ${booking.time}`}
                      />
                      <Chip
                        label={booking.status}
                        color={booking.status === 'confirmed' ? 'primary' : 'success'}
                        size="small"
                      />
                    </ListItem>
                    {index < recentBookings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  to="/vendor/profile"
                  variant="contained"
                  startIcon={<Business />}
                  fullWidth
                >
                  Manage Business
                </Button>
                <Button
                  component={Link}
                  to="/vendor/bookings"
                  variant="outlined"
                  startIcon={<Schedule />}
                  fullWidth
                >
                  View Bookings
                </Button>
                <Button
                  component={Link}
                  to="/vendor/services"
                  variant="outlined"
                  startIcon={<Add />}
                  fullWidth
                >
                  Manage Services
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.role === 'vendor' 
            ? 'Manage your business and track your performance'
            : 'Discover and book amazing local services'
          }
        </Typography>
      </Box>

      {user?.role === 'vendor' ? <VendorDashboard /> : <CustomerDashboard />}
    </Container>
  );
};

export default Dashboard;
