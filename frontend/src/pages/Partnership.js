import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Box,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  Campaign, 
  MonetizationOn,
  Share,
  Analytics,
  Star,
  EmojiEvents,
  Instagram,
  Facebook,
  Twitter,
  LinkedIn
} from '@mui/icons-material';
import './Partnership.css';

const Partnership = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [applicationData, setApplicationData] = useState({
    personalInfo: {},
    socialMedia: {},
    experience: {},
    motivation: ''
  });
  const [showApplication, setShowApplication] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [ambassadorStats, setAmbassadorStats] = useState(null);

  const steps = ['Personal Info', 'Social Media', 'Experience', 'Motivation', 'Review'];

  const tierBenefits = {
    bronze: {
      name: 'Bronze Ambassador',
      commission: '5%',
      color: '#CD7F32',
      benefits: ['Custom referral code', 'Marketing materials', 'Basic analytics'],
      minReferrals: 0
    },
    silver: {
      name: 'Silver Ambassador',
      commission: '8%',
      color: '#C0C0C0',
      benefits: ['Priority support', 'Advanced analytics', 'Exclusive webinars'],
      minReferrals: 10
    },
    gold: {
      name: 'Gold Ambassador',
      commission: '12%',
      color: '#FFD700',
      benefits: ['Exclusive events', 'Co-marketing opportunities', 'Personal account manager'],
      minReferrals: 25
    },
    platinum: {
      name: 'Platinum Ambassador',
      commission: '15%',
      color: '#E5E4E2',
      benefits: ['Revenue sharing', 'Product input', 'VIP support'],
      minReferrals: 50
    },
    diamond: {
      name: 'Diamond Ambassador',
      commission: '20%',
      color: '#B9F2FF',
      benefits: ['Equity participation', 'Board advisory role', 'Global recognition'],
      minReferrals: 100
    }
  };

  useEffect(() => {
    // Fetch leaderboard data
    setLeaderboard([
      { rank: 1, name: 'Sarah M.', tier: 'diamond', referrals: 145, earnings: 'R12,340', badge: '🏆' },
      { rank: 2, name: 'Mike T.', tier: 'platinum', referrals: 89, earnings: 'R8,950', badge: '🥈' },
      { rank: 3, name: 'Lisa K.', tier: 'gold', referrals: 67, earnings: 'R6,780', badge: '🥉' },
      { rank: 4, name: 'John D.', tier: 'gold', referrals: 45, earnings: 'R4,560', badge: '⭐' },
      { rank: 5, name: 'Emma R.', tier: 'silver', referrals: 32, earnings: 'R3,200', badge: '⭐' }
    ]);
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleApplicationSubmit = () => {
    // Submit application logic
    console.log('Application submitted:', applicationData);
    setShowApplication(false);
    // Show success message
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              value={applicationData.personalInfo.name || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                personalInfo: { ...applicationData.personalInfo, name: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={applicationData.personalInfo.email || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                personalInfo: { ...applicationData.personalInfo, email: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              value={applicationData.personalInfo.phone || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                personalInfo: { ...applicationData.personalInfo, phone: e.target.value }
              })}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Instagram Handle"
              margin="normal"
              InputProps={{ startAdornment: '@' }}
              value={applicationData.socialMedia.instagram || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                socialMedia: { ...applicationData.socialMedia, instagram: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Facebook Page/Profile"
              margin="normal"
              value={applicationData.socialMedia.facebook || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                socialMedia: { ...applicationData.socialMedia, facebook: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="TikTok Handle"
              margin="normal"
              InputProps={{ startAdornment: '@' }}
              value={applicationData.socialMedia.tiktok || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                socialMedia: { ...applicationData.socialMedia, tiktok: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Total Followers (All Platforms)"
              type="number"
              margin="normal"
              value={applicationData.socialMedia.totalFollowers || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                socialMedia: { ...applicationData.socialMedia, totalFollowers: e.target.value }
              })}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="Previous Marketing Experience"
              multiline
              rows={3}
              margin="normal"
              value={applicationData.experience.marketing || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                experience: { ...applicationData.experience, marketing: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Referral/Affiliate Experience"
              multiline
              rows={3}
              margin="normal"
              value={applicationData.experience.referral || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                experience: { ...applicationData.experience, referral: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Content Creation Skills"
              multiline
              rows={2}
              margin="normal"
              value={applicationData.experience.content || ''}
              onChange={(e) => setApplicationData({
                ...applicationData,
                experience: { ...applicationData.experience, content: e.target.value }
              })}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <TextField
              fullWidth
              label="Why do you want to become a HelensvaleConnect Ambassador?"
              multiline
              rows={5}
              margin="normal"
              value={applicationData.motivation}
              onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
            />
            <TextField
              fullWidth
              label="How will you promote HelensvaleConnect?"
              multiline
              rows={4}
              margin="normal"
              value={applicationData.promotionStrategy || ''}
              onChange={(e) => setApplicationData({ ...applicationData, promotionStrategy: e.target.value })}
            />
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Your Application</Typography>
            <Typography><strong>Name:</strong> {applicationData.personalInfo.name}</Typography>
            <Typography><strong>Email:</strong> {applicationData.personalInfo.email}</Typography>
            <Typography><strong>Social Media:</strong> {Object.keys(applicationData.socialMedia).length} platforms</Typography>
            <Typography><strong>Total Followers:</strong> {applicationData.socialMedia.totalFollowers}</Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="partnership-page">
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box className="hero-section" textAlign="center" py={8}>
          <Typography variant="h2" className="hero-title" gutterBottom>
            Join the HelensvaleConnect Ambassador Program
          </Typography>
          <Typography variant="h5" className="hero-subtitle" color="textSecondary" paragraph>
            Earn up to 20% commission while helping your community discover amazing local services
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            className="cta-button"
            onClick={() => setShowApplication(true)}
            startIcon={<Campaign />}
          >
            Become an Ambassador
          </Button>
        </Box>

        {/* Benefits Overview */}
        <Grid container spacing={4} className="benefits-section">
          <Grid item xs={12} md={3}>
            <Card className="benefit-card">
              <CardContent>
                <MonetizationOn className="benefit-icon" />
                <Typography variant="h6">Earn Commission</Typography>
                <Typography>Up to 20% on every successful referral</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className="benefit-card">
              <CardContent>
                <Campaign className="benefit-icon" />
                <Typography variant="h6">Marketing Support</Typography>
                <Typography>Professional materials and templates</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className="benefit-card">
              <CardContent>
                <Analytics className="benefit-icon" />
                <Typography variant="h6">Real-time Analytics</Typography>
                <Typography>Track your performance and earnings</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className="benefit-card">
              <CardContent>
                <EmojiEvents className="benefit-icon" />
                <Typography variant="h6">Exclusive Rewards</Typography>
                <Typography>Bonuses, events, and recognition</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tier System */}
        <Box className="tier-section" py={6}>
          <Typography variant="h3" textAlign="center" gutterBottom>
            Ambassador Tier System
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(tierBenefits).map(([key, tier]) => (
              <Grid item xs={12} md={2.4} key={key}>
                <Card className={`tier-card tier-${key}`}>
                  <CardContent>
                    <Box textAlign="center">
                      <Typography variant="h6" style={{ color: tier.color }}>
                        {tier.name}
                      </Typography>
                      <Typography variant="h4" className="commission-rate">
                        {tier.commission}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Commission Rate
                      </Typography>
                      <Typography variant="body2" className="min-referrals">
                        {tier.minReferrals}+ referrals
                      </Typography>
                    </Box>
                    <Box mt={2}>
                      {tier.benefits.map((benefit, index) => (
                        <Chip 
                          key={index} 
                          label={benefit} 
                          size="small" 
                          className="benefit-chip"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Leaderboard */}
        <Box className="leaderboard-section" py={6}>
          <Typography variant="h3" textAlign="center" gutterBottom>
            Top Ambassadors This Month
          </Typography>
          <Card className="leaderboard-card">
            <CardContent>
              {leaderboard.map((ambassador) => (
                <Box key={ambassador.rank} className="leaderboard-item">
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" className="rank">
                      #{ambassador.rank}
                    </Typography>
                    <Avatar className="ambassador-avatar">
                      {ambassador.badge}
                    </Avatar>
                    <Box ml={2}>
                      <Typography variant="h6">{ambassador.name}</Typography>
                      <Chip 
                        label={tierBenefits[ambassador.tier].name} 
                        size="small"
                        style={{ backgroundColor: tierBenefits[ambassador.tier].color }}
                      />
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6">{ambassador.earnings}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {ambassador.referrals} referrals
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Success Stories */}
        <Box className="success-stories-section" py={6}>
          <Typography variant="h3" textAlign="center" gutterBottom>
            Success Stories
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="story-card">
                <CardContent>
                  <Avatar className="story-avatar">S</Avatar>
                  <Typography variant="h6">Sarah M.</Typography>
                  <Typography variant="body2" color="textSecondary">Diamond Ambassador</Typography>
                  <Typography paragraph>
                    "In just 6 months, I've earned over R50,000 in commissions! The platform makes it so easy to share with my network."
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Star className="star-icon" />
                    <Typography>R50,000+ earned</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="story-card">
                <CardContent>
                  <Avatar className="story-avatar">M</Avatar>
                  <Typography variant="h6">Mike T.</Typography>
                  <Typography variant="body2" color="textSecondary">Platinum Ambassador</Typography>
                  <Typography paragraph>
                    "The marketing materials are professional and my audience loves the service recommendations. It's a win-win!"
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <People className="people-icon" />
                    <Typography>89 successful referrals</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="story-card">
                <CardContent>
                  <Avatar className="story-avatar">L</Avatar>
                  <Typography variant="h6">Lisa K.</Typography>
                  <Typography variant="body2" color="textSecondary">Gold Ambassador</Typography>
                  <Typography paragraph>
                    "The exclusive events and co-marketing opportunities have helped grow my own business significantly."
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TrendingUp className="trending-icon" />
                    <Typography>300% growth</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* How It Works */}
        <Box className="how-it-works-section" py={6}>
          <Typography variant="h3" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box className="step-number">1</Box>
                <Typography variant="h6">Apply</Typography>
                <Typography>Submit your ambassador application</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box className="step-number">2</Box>
                <Typography variant="h6">Get Approved</Typography>
                <Typography>Receive your unique referral code</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box className="step-number">3</Box>
                <Typography variant="h6">Start Sharing</Typography>
                <Typography>Use our marketing materials to promote</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Box className="step-number">4</Box>
                <Typography variant="h6">Earn Commission</Typography>
                <Typography>Get paid for every successful referral</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Application Dialog */}
        <Dialog 
          open={showApplication} 
          onClose={() => setShowApplication(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Ambassador Application</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box mt={3}>
              {renderStepContent(activeStep)}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowApplication(false)}>Cancel</Button>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleApplicationSubmit}>
                Submit Application
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default Partnership;
