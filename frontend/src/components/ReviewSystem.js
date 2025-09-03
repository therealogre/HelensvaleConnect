import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
  Collapse,
} from '@mui/material';
import {
  Star,
  ThumbUp,
  ThumbDown,
  Flag,
  Verified,
  CheckCircle,
  Schedule,
  MonetizationOn,
  Business,
  Person,
  ExpandMore,
  ExpandLess,
  FilterList,
  Sort,
  TrendingUp,
  Security,
  Award,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewSystem = ({ vendorId, reviews = [], averageRating = 0, totalReviews = 0, onReviewSubmit }) => {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Trust indicators and verification badges
  const trustIndicators = {
    verified_purchase: { icon: <CheckCircle />, label: 'Verified Booking', color: 'success' },
    repeat_customer: { icon: <Star />, label: 'Repeat Customer', color: 'warning' },
    verified_reviewer: { icon: <Verified />, label: 'Verified Reviewer', color: 'primary' },
    top_reviewer: { icon: <Award />, label: 'Top Reviewer', color: 'secondary' },
  };

  // Rating breakdown
  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(filterRating));
    }

    // Sort reviews
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, sortBy, filterRating]);

  const handleReviewSubmit = async (data) => {
    try {
      const reviewData = {
        ...data,
        vendorId,
        rating: data.rating,
      };

      await axios.post('/api/reviews', reviewData);
      toast.success('Review submitted successfully!');
      setReviewDialogOpen(false);
      reset();
      
      if (onReviewSubmit) {
        onReviewSubmit();
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleHelpfulVote = async (reviewId, isHelpful) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`, { helpful: isHelpful });
      setHelpfulVotes(prev => ({
        ...prev,
        [reviewId]: isHelpful
      }));
      toast.success(isHelpful ? 'Marked as helpful' : 'Marked as not helpful');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const ReviewSummary = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} precision={0.1} size="large" readOnly />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {totalReviews.toLocaleString()} reviews
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Rating Breakdown
            </Typography>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {rating}
                </Typography>
                <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                <LinearProgress
                  variant="determinate"
                  value={totalReviews > 0 ? (ratingBreakdown[rating] / totalReviews) * 100 : 0}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                  {ratingBreakdown[rating]}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        {/* Trust Metrics */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Trust Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {Math.round((reviews.filter(r => r.badges?.includes('verified_purchase')).length / totalReviews) * 100) || 0}%
                </Typography>
                <Typography variant="body2">Verified Bookings</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round((reviews.filter(r => r.badges?.includes('repeat_customer')).length / totalReviews) * 100) || 0}%
                </Typography>
                <Typography variant="body2">Repeat Customers</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {reviews.filter(r => r.rating >= 4).length}
                </Typography>
                <Typography variant="body2">4+ Star Reviews</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {Math.round(reviews.reduce((acc, r) => acc + (r.helpfulVotes || 0), 0) / totalReviews) || 0}
                </Typography>
                <Typography variant="body2">Avg Helpful Votes</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Star />}
            onClick={() => setReviewDialogOpen(true)}
            size="large"
          >
            Write a Review
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filter & Sort
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const ReviewFilters = () => (
    <Collapse in={filterOpen}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Filter by Rating
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="All"
                onClick={() => setFilterRating('all')}
                color={filterRating === 'all' ? 'primary' : 'default'}
                variant={filterRating === 'all' ? 'filled' : 'outlined'}
              />
              {[5, 4, 3, 2, 1].map((rating) => (
                <Chip
                  key={rating}
                  label={`${rating} Stars`}
                  onClick={() => setFilterRating(rating.toString())}
                  color={filterRating === rating.toString() ? 'primary' : 'default'}
                  variant={filterRating === rating.toString() ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Sort by
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'highest', label: 'Highest Rated' },
                { value: 'lowest', label: 'Lowest Rated' },
                { value: 'helpful', label: 'Most Helpful' },
              ].map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => setSortBy(option.value)}
                  color={sortBy === option.value ? 'primary' : 'default'}
                  variant={sortBy === option.value ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Collapse>
  );

  const ReviewItem = ({ review }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar src={review.user?.avatar} sx={{ width: 50, height: 50 }}>
            {review.user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {review.user?.name}
              </Typography>
              {review.badges?.map((badge) => (
                <Chip
                  key={badge}
                  icon={trustIndicators[badge]?.icon}
                  label={trustIndicators[badge]?.label}
                  size="small"
                  color={trustIndicators[badge]?.color}
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={review.rating} size="small" readOnly />
              <Typography variant="body2" color="text.secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
              {review.service && (
                <Chip
                  label={review.service.name}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {review.comment}
            </Typography>

            {review.response && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Response from Business Owner:
                </Typography>
                <Typography variant="body2">
                  {review.response}
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => handleHelpfulVote(review._id, true)}
                color={helpfulVotes[review._id] === true ? 'primary' : 'inherit'}
              >
                Helpful ({review.helpfulVotes || 0})
              </Button>
              <Button
                size="small"
                startIcon={<ThumbDown />}
                onClick={() => handleHelpfulVote(review._id, false)}
                color={helpfulVotes[review._id] === false ? 'error' : 'inherit'}
              >
                Not Helpful
              </Button>
              <IconButton size="small">
                <Flag />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <ReviewSummary />
      <ReviewFilters />
      
      {filteredReviews.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No reviews found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filterRating !== 'all' || sortBy !== 'newest'
              ? 'Try adjusting your filters'
              : 'Be the first to write a review!'
            }
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Customer Reviews ({filteredReviews.length})
          </Typography>
          {filteredReviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </Box>
      )}

      {/* Write Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Write a Review
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit(handleReviewSubmit)}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your honest feedback helps other customers make informed decisions and helps businesses improve their services.
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Overall Rating *
              </Typography>
              <Rating
                size="large"
                {...register('rating', { required: 'Rating is required' })}
              />
              {errors.rating && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {errors.rating.message}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              placeholder="Share your experience with this service provider..."
              {...register('comment', { 
                required: 'Review comment is required',
                minLength: { value: 10, message: 'Review must be at least 10 characters' }
              })}
              error={!!errors.comment}
              helperText={errors.comment?.message}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Quality of Service
                </Typography>
                <Rating {...register('qualityRating')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Communication
                </Typography>
                <Rating {...register('communicationRating')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Value for Money
                </Typography>
                <Rating {...register('valueRating')} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" size="large">
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReviewSystem;
