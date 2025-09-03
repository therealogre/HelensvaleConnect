import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Divider,
  LinearProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  BookmarkBorder,
  Bookmark,
  Notifications,
  Star,
  Schedule,
  Payment,
  Person,
  Settings,
  TrendingUp,
  LocalOffer,
  Share,
  ThumbUp,
  Comment,
  Favorite,
  FavoriteBorder,
  MoreVert,
  CheckCircle,
  Cancel,
  AccessTime,
  MonetizationOn,
  Business,
  Group,
  Chat,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Receipt,
  History,
  Loyalty,
  EmojiEvents,
  Verified,
  Speed,
  Security,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Facebook-inspired engagement features
  const [socialStats, setSocialStats] = useState({
    totalReviews: 0,
    helpfulVotes: 0,
    followers: 0,
    following: 0,
    profileViews: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        userResponse,
        bookingsResponse,
        favoritesResponse,
        notificationsResponse,
        activityResponse,
        loyaltyResponse,
      ] = await Promise.all([
        axios.get('/api/auth/profile'),
        axios.get('/api/bookings/my-bookings'),
        axios.get('/api/users/favorites'),
        axios.get('/api/notifications'),
        axios.get('/api/users/activity-feed'),
        axios.get('/api/users/loyalty'),
      ]);

      setUser(userResponse.data.data);
      setBookings(bookingsResponse.data.data.bookings || []);
      setFavorites(favoritesResponse.data.data || []);
      setNotifications(notificationsResponse.data.data || []);
      setActivityFeed(activityResponse.data.data || []);
      setLoyaltyPoints(loyaltyResponse.data.data.points || 0);
      setAchievements(loyaltyResponse.data.data.achievements || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const DashboardOverview = () => (
    <Grid container spacing={3}>
      {/* Welcome Card with Social Proof */}
      <Grid item xs={12}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 80, height: 80, border: '3px solid white' }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  You're part of Zimbabwe's fastest-growing service community
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {loyaltyPoints.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Loyalty Points</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {bookings.length}
                    </Typography>
                    <Typography variant="body2">Total Bookings</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {socialStats.totalReviews}
                    </Typography>
                    <Typography variant="body2">Reviews Written</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {socialStats.helpfulVotes}
                    </Typography>
                    <Typography variant="body2">Helpful Votes</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/vendors"
                  variant="outlined"
                  fullWidth
                  startIcon={<Business />}
                  sx={{ py: 2, flexDirection: 'column', height: 80 }}
                >
                  Find Services
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/bookings"
                  variant="outlined"
                  fullWidth
                  startIcon={<Schedule />}
                  sx={{ py: 2, flexDirection: 'column', height: 80 }}
                >
                  My Bookings
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/favorites"
                  variant="outlined"
                  fullWidth
                  startIcon={<Favorite />}
                  sx={{ py: 2, flexDirection: 'column', height: 80 }}
                >
                  Favorites
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/profile"
                  variant="outlined"
                  fullWidth
                  startIcon={<Person />}
                  sx={{ py: 2, flexDirection: 'column', height: 80 }}
                >
                  Profile
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Loyalty & Achievements */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Loyalty Status
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <EmojiEvents />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Gold Member
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loyaltyPoints} points
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" textAlign="center">
              250 points to Platinum
            </Typography>
            
            {achievements.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Achievements
                </Typography>
                {achievements.slice(0, 3).map((achievement, index) => (
                  <Chip
                    key={index}
                    icon={<EmojiEvents />}
                    label={achievement.name}
                    size="small"
                    color="primary"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity Feed - Facebook-inspired */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Your Activity Feed
            </Typography>
            <List>
              {activityFeed.slice(0, 5).map((activity, index) => (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {activity.type === 'booking' && <Schedule />}
                      {activity.type === 'review' && <Star />}
                      {activity.type === 'favorite' && <Favorite />}
                      {activity.type === 'achievement' && <EmojiEvents />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            {activityFeed.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent activity. Start booking services to see your activity here!
                </Typography>
                <Button
                  component={Link}
                  to="/vendors"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Find Services
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Notifications */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Notifications
              </Typography>
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <Notifications />
              </Badge>
            </Box>
            <List dense>
              {notifications.slice(0, 5).map((notification, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: notification.read ? 400 : 600,
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {notifications.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No new notifications
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const BookingsTab = () => (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item xs={12} md={6} key={booking._id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={booking.vendor?.photos?.[0]}
                  sx={{ width: 50, height: 50 }}
                >
                  <Business />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {booking.vendor?.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.service?.name}
                  </Typography>
                </Box>
                <Chip
                  label={booking.status}
                  color={
                    booking.status === 'completed' ? 'success' :
                    booking.status === 'confirmed' ? 'primary' :
                    booking.status === 'cancelled' ? 'error' : 'default'
                  }
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </Typography>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  {booking.scheduledTime}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <MonetizationOn fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ZiG {booking.totalAmount}
                </Typography>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2">
                  {booking.location?.address}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {booking.status === 'completed' && !booking.reviewed && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Star />}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setReviewDialogOpen(true);
                    }}
                  >
                    Write Review
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Chat />}
                  component={Link}
                  to={`/bookings/${booking._id}/chat`}
                >
                  Message
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Receipt />}
                  component={Link}
                  to={`/bookings/${booking._id}/receipt`}
                >
                  Receipt
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const FavoritesTab = () => (
    <Grid container spacing={3}>
      {favorites.map((vendor) => (
        <Grid item xs={12} sm={6} md={4} key={vendor._id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={vendor.photos?.[0]}
                  sx={{ width: 50, height: 50 }}
                >
                  <Business />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {vendor.businessName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={vendor.averageRating} size="small" readOnly />
                    <Typography variant="body2">
                      ({vendor.totalReviews})
                    </Typography>
                  </Box>
                </Box>
                <IconButton color="error">
                  <Favorite />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {vendor.description}
              </Typography>

              <Button
                component={Link}
                to={`/vendors/${vendor._id}`}
                variant="contained"
                fullWidth
                size="small"
              >
                View & Book
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={200} />
                  <Skeleton variant="text" height={32} sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box>
      <SEO
        title="My Dashboard - Helensvale Connect"
        description="Manage your bookings, favorites, and profile on Zimbabwe's premier service marketplace."
        noIndex={true}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          My Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Dashboard />} label="Overview" />
            <Tab icon={<Schedule />} label="Bookings" />
            <Tab icon={<Favorite />} label="Favorites" />
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <DashboardOverview />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <BookingsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <FavoritesTab />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5">Profile Settings</Typography>
          <Typography variant="body1">Profile management coming soon...</Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Typography variant="h5">Account Settings</Typography>
          <Typography variant="body1">Settings panel coming soon...</Typography>
        </TabPanel>
      </Container>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.vendor?.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Service: {selectedBooking.service?.name}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Overall Rating
                </Typography>
                <Rating size="large" />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Write your review"
                placeholder="Share your experience with other customers..."
                sx={{ mb: 2 }}
              />

              <Alert severity="info">
                Your review helps other customers make informed decisions and helps businesses improve their services.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDashboard;
