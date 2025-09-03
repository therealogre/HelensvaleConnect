import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Slider,
  Paper,
  Divider,
  IconButton,
  Collapse,
  Alert,
  Pagination,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Star,
  Verified,
  LocationOn,
  Phone,
  Schedule,
  MonetizationOn,
  TrendingUp,
  LocalOffer,
  ExpandMore,
  ExpandLess,
  Favorite,
  FavoriteBorder,
  Share,
  Business,
  CheckCircle,
  Speed,
  Security,
  Support,
  Award,
  Flash,
  Crown,
  Diamond,
} from '@mui/icons-material';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SEO, { SEOConfigs } from '../components/SEO';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorMarketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);

  // Filter options
  const categories = [
    { value: 'home-services', label: 'Home Services', count: 234 },
    { value: 'automotive', label: 'Automotive', count: 156 },
    { value: 'beauty-wellness', label: 'Beauty & Wellness', count: 189 },
    { value: 'professional', label: 'Professional Services', count: 98 },
    { value: 'construction', label: 'Construction', count: 167 },
    { value: 'technology', label: 'Technology', count: 78 },
    { value: 'education', label: 'Education', count: 145 },
    { value: 'health', label: 'Health & Medical', count: 67 },
  ];

  const locations = [
    { value: 'harare', label: 'Harare', count: 456 },
    { value: 'bulawayo', label: 'Bulawayo', count: 234 },
    { value: 'chitungwiza', label: 'Chitungwiza', count: 123 },
    { value: 'mutare', label: 'Mutare', count: 89 },
    { value: 'gweru', label: 'Gweru', count: 67 },
    { value: 'kwekwe', label: 'Kwekwe', count: 45 },
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'distance', label: 'Nearest First' },
  ];

  const badges = {
    verified: { icon: <Verified />, color: 'primary', label: 'Verified' },
    top_rated: { icon: <Star />, color: 'warning', label: 'Top Rated' },
    fast_response: { icon: <Speed />, color: 'success', label: 'Fast Response' },
    premium: { icon: <Diamond />, color: 'secondary', label: 'Premium' },
    trusted: { icon: <Security />, color: 'info', label: 'Trusted' },
    featured: { icon: <Crown />, color: 'error', label: 'Featured' },
  };

  // Fetch vendors with filters
  useEffect(() => {
    fetchVendors();
  }, [searchTerm, selectedCategory, selectedLocation, sortBy, currentPage, priceRange]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLocation && { location: selectedLocation }),
        ...(sortBy && { sort: sortBy }),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });

      const response = await axios.get(`/api/vendors?${params}`);
      setVendors(response.data.data.vendors || []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalVendors(response.data.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedLocation, sortBy, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVendors();
  };

  const handleFavorite = (vendorId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(vendorId)) {
      newFavorites.delete(vendorId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(vendorId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const VendorCard = ({ vendor }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={vendor.photos?.[0] || '/images/vendor-placeholder.jpg'}
          alt={vendor.businessName}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {vendor.badges?.map((badge) => (
            <Chip
              key={badge}
              icon={badges[badge]?.icon}
              label={badges[badge]?.label}
              size="small"
              color={badges[badge]?.color}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          ))}
        </Box>

        {/* Favorite & Share */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handleFavorite(vendor._id)}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            {favorites.has(vendor._id) ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <Share />
          </IconButton>
        </Box>

        {/* Price Badge */}
        {vendor.averagePrice && (
          <Chip
            label={`From ZiG ${vendor.averagePrice}`}
            color="success"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            src={vendor.owner?.avatar}
            sx={{ width: 32, height: 32 }}
          >
            {vendor.owner?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {vendor.businessName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {vendor.owner?.name}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
          {vendor.description}
        </Typography>

        {/* Rating & Reviews */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating value={vendor.averageRating || 0} precision={0.1} size="small" readOnly />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {vendor.averageRating?.toFixed(1) || 'New'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({vendor.totalReviews || 0} reviews)
          </Typography>
        </Box>

        {/* Location & Response Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {vendor.location?.city}
            </Typography>
          </Box>
          {vendor.responseTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {vendor.responseTime}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Services */}
        <Box sx={{ mb: 2 }}>
          {vendor.services?.slice(0, 3).map((service, index) => (
            <Chip
              key={index}
              label={service.name}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
            />
          ))}
          {vendor.services?.length > 3 && (
            <Chip
              label={`+${vendor.services.length - 3} more`}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
            {vendor.completedJobs || 0} jobs completed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Joined {new Date(vendor.createdAt).getFullYear()}
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          component={Link}
          to={`/vendors/${vendor._id}`}
          variant="contained"
          fullWidth
          sx={{ fontWeight: 600 }}
        >
          View Profile & Book
        </Button>
      </Box>
    </Card>
  );

  const FilterSidebar = () => (
    <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        Filters
      </Typography>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Category
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label} ({category.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Location Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Location
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((location) => (
              <MenuItem key={location.value} value={location.value}>
                {location.label} ({location.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Price Range (ZiG)
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          marks={[
            { value: 0, label: '0' },
            { value: 500, label: '500' },
            { value: 1000, label: '1000+' },
          ]}
        />
      </Box>

      {/* Quick Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Filters
        </Typography>
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Verified Only"
          sx={{ display: 'block', mb: 1 }}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Top Rated (4.5+)"
          sx={{ display: 'block', mb: 1 }}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Fast Response"
          sx={{ display: 'block', mb: 1 }}
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Available Today"
          sx={{ display: 'block' }}
        />
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={() => {
          setSelectedCategory('');
          setSelectedLocation('');
          setPriceRange([0, 1000]);
          setSearchTerm('');
          setCurrentPage(1);
        }}
      >
        Clear All Filters
      </Button>
    </Paper>
  );

  return (
    <Box>
      <SEO {...SEOConfigs.vendors} />

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">Service Providers</Typography>
        </Breadcrumbs>
      </Container>

      {/* Header */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Find Trusted Service Providers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {totalVendors.toLocaleString()} verified professionals ready to serve you across Zimbabwe
        </Typography>

        {/* Search & Sort Bar */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  placeholder="Search for services, businesses, or professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </form>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<Sort sx={{ mr: 1 }} />}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Mobile Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
            <FilterSidebar />
          </Box>
        </Collapse>

        {/* Results */}
        <Grid container spacing={4}>
          {/* Desktop Filters */}
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <FilterSidebar />
          </Grid>

          {/* Vendor Grid */}
          <Grid item xs={12} md={9}>
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(6)].map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={32} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : vendors.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  No service providers found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search criteria or filters
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedLocation('');
                    setPriceRange([0, 1000]);
                  }}
                >
                  Clear All Filters
                </Button>
              </Paper>
            ) : (
              <>
                <Grid container spacing={3}>
                  {vendors.map((vendor) => (
                    <Grid item xs={12} sm={6} lg={4} key={vendor._id}>
                      <VendorCard vendor={vendor} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VendorMarketplace;
