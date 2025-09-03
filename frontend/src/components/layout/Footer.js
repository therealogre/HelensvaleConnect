import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Helensvale Connect
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.300' }}>
              Connecting local businesses with the Helensvale community. 
              Discover, book, and support local services.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="grey.300" underline="hover">
                Home
              </Link>
              <Link href="/vendors" color="grey.300" underline="hover">
                Find Vendors
              </Link>
              <Link href="/register" color="grey.300" underline="hover">
                Join as Vendor
              </Link>
              <Link href="/about" color="grey.300" underline="hover">
                About Us
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="grey.300" underline="hover">
                Help Center
              </Link>
              <Link href="/contact" color="grey.300" underline="hover">
                Contact Us
              </Link>
              <Link href="/privacy" color="grey.300" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="grey.300" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  Helensvale, QLD, Australia
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  +61 XXX XXX XXX
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  hello@helensvaleconnect.art
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © 2025 Helensvale Connect. All rights reserved.
          </Typography>
          <Typography variant="body2" color="grey.400">
            Built with ❤️ for the Helensvale community
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
