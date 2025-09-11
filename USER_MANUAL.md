# HelensvaleConnect - Complete User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [System Architecture](#system-architecture)
4. [User Roles & Features](#user-roles--features)
5. [Social Media Integration](#social-media-integration)
6. [Ambassador Program](#ambassador-program)
7. [Payment Systems](#payment-systems)
8. [Deployment Guide](#deployment-guide)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

## Introduction

HelensvaleConnect is a comprehensive marketplace platform designed for the South African market, connecting customers with local service providers. The platform features advanced booking systems, integrated payments, social media marketing tools, and a robust ambassador referral program.

### Key Features
- **Multi-role Authentication**: Customers, Vendors, and Administrators
- **Advanced Booking System**: Real-time availability, pricing calculations, notifications
- **Payment Integration**: EcoCash, OneMoney, Credit Cards, Bank Transfers, Cash on Service
- **Social Media Marketing**: Automated posting to Facebook, Instagram, TikTok, Twitter, LinkedIn
- **Ambassador Program**: Multi-tier referral system with special features
- **Mobile-First Design**: Optimized for African mobile usage patterns

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Git
- Modern web browser

### Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/therealogre/HelensvaleConnect.git
   cd HelensvaleConnect
   ```

2. **Start all services (Windows):**
   ```bash
   start-all.bat
   ```

3. **Start all services (Mac/Linux):**
   ```bash
   chmod +x start-all.sh
   ./start-all.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

### Manual Setup
If the automated scripts don't work:

1. **Start MongoDB:**
   ```bash
   mongod --dbpath ./data/db
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## System Architecture

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with retry logic
│   │   └── security.js          # Security configurations
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── vendorController.js  # Vendor management
│   │   └── bookingController.js # Booking operations
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Vendor.js           # Vendor schema
│   │   └── Booking.js          # Booking schema
│   ├── routes/
│   │   ├── auth.js             # Auth endpoints
│   │   ├── vendors.js          # Vendor endpoints
│   │   └── bookings.js         # Booking endpoints
│   └── services/
│       ├── VendorService.js    # Vendor business logic
│       ├── BookingService.js   # Booking business logic
│       ├── PaymentService.js   # Payment processing
│       ├── SocialMediaService.js # Social media integration
│       └── AmbassadorService.js # Referral program
├── test/
│   ├── auth.test.js           # Authentication tests
│   └── services.test.js       # Service integration tests
└── app.js                     # Express server setup
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   ├── contexts/             # React contexts
│   ├── pages/
│   │   ├── Home.js           # Landing page
│   │   ├── Login.js          # User authentication
│   │   ├── Dashboard.js      # User dashboard
│   │   └── VendorProfile.js  # Vendor management
│   ├── services/             # API service layer
│   └── utils/                # Helper functions
└── public/                   # Static assets
```

## User Roles & Features

### 1. Customers
**Registration & Authentication:**
- Email/password registration with validation
- JWT-based authentication
- Password reset functionality
- Email verification

**Service Discovery:**
- Browse services by category
- Advanced filtering (location, price, rating, availability)
- Geolocation-based recommendations
- Search functionality

**Booking Process:**
- Select service and time slot
- Real-time availability checking
- Pricing calculation with discounts
- Multiple payment options
- Booking confirmation and notifications

**Account Management:**
- Profile management
- Booking history
- Review and rating system
- Favorite vendors

### 2. Vendors
**Profile Setup:**
- Business information and verification
- Service listings with pricing
- Operating hours and availability
- Photo gallery and portfolio
- Location and service area

**Booking Management:**
- View incoming bookings
- Accept/decline requests
- Manage availability calendar
- Update booking status
- Customer communication

**Social Media Marketing:**
- Automated post generation
- Multi-platform publishing (Facebook, Instagram, TikTok, Twitter, LinkedIn)
- Campaign analytics
- Content templates
- Hashtag optimization

**Analytics & Insights:**
- Booking statistics
- Revenue tracking
- Customer feedback analysis
- Social media performance
- Growth recommendations

### 3. Administrators
**User Management:**
- User account oversight
- Vendor verification
- Content moderation
- Support ticket management

**Platform Analytics:**
- System-wide metrics
- Revenue reporting
- User engagement analysis
- Performance monitoring

**Ambassador Program Management:**
- Ambassador approval process
- Tier management
- Commission tracking
- Marketing material generation

## Social Media Integration

### Supported Platforms
- **Facebook**: Business page posting, event creation
- **Instagram**: Photo/video posts, stories, reels
- **TikTok**: Video content, trending hashtags
- **Twitter/X**: Text posts, image sharing
- **LinkedIn**: Professional content, company updates

### Content Types
1. **Promotional Posts**: Service offers, discounts, special deals
2. **Showcase Posts**: Portfolio display, before/after photos
3. **Testimonial Posts**: Customer reviews and success stories
4. **Educational Content**: Tips, tutorials, industry insights
5. **Behind-the-Scenes**: Work process, team introductions

### Automation Features
- **Scheduled Posting**: Plan content in advance
- **Auto-Generated Content**: AI-powered post creation
- **Hashtag Optimization**: Trending and relevant hashtags
- **Cross-Platform Publishing**: One-click multi-platform sharing
- **Performance Analytics**: Engagement tracking and insights

### How to Use Social Media Features

1. **Connect Social Accounts:**
   - Go to Vendor Dashboard → Social Media
   - Click "Connect Account" for each platform
   - Authorize HelensvaleConnect access

2. **Create a Campaign:**
   - Select "Create Campaign"
   - Choose platforms and content type
   - Customize message and images
   - Schedule or publish immediately

3. **View Analytics:**
   - Access Social Media → Analytics
   - Review reach, engagement, and conversion metrics
   - Optimize future campaigns based on performance

## Ambassador Program

### Tier System
1. **Bronze** (0+ referrals): 5% commission, basic features
2. **Silver** (10+ referrals): 8% commission, priority support
3. **Gold** (25+ referrals): 12% commission, exclusive events
4. **Platinum** (50+ referrals): 15% commission, co-marketing opportunities
5. **Diamond** (100+ referrals): 20% commission, revenue sharing

### Ambassador Features
- **Custom Referral Codes**: Unique tracking codes
- **Marketing Materials**: Social media templates, banners, email templates
- **Custom Landing Pages**: Personalized referral pages
- **Real-time Analytics**: Track clicks, conversions, earnings
- **Automated Payouts**: Monthly commission payments
- **Tier Progression**: Automatic upgrades based on performance

### How to Become an Ambassador

1. **Apply:**
   - Complete ambassador application form
   - Provide social media handles and audience size
   - Submit content samples and motivation statement

2. **Approval Process:**
   - Application review (1-3 business days)
   - Background check and verification
   - Welcome package and onboarding

3. **Start Promoting:**
   - Receive unique referral code
   - Access marketing materials
   - Begin sharing and earning commissions

### Marketing Materials Available
- **Social Media Posts**: Platform-specific templates
- **Email Templates**: Professional referral emails
- **Banner Ads**: Various sizes for websites/blogs
- **Custom Landing Pages**: Personalized conversion pages
- **Video Scripts**: TikTok and Instagram content ideas

## Payment Systems

### Supported Payment Methods

1. **EcoCash** (Most Popular)
   - Instant mobile money payments
   - 2.5% processing fee
   - Instructions: Dial *151# and follow prompts

2. **OneMoney**
   - Mobile money alternative
   - 2.5% processing fee
   - Send to merchant code with reference

3. **Credit/Debit Cards**
   - Visa, Mastercard, American Express
   - 3.2% processing fee
   - Instant processing via Stripe

4. **Bank Transfer (EFT)**
   - Direct bank transfers
   - No processing fees
   - 1-2 business day processing

5. **Cash on Service**
   - Pay when service is delivered
   - No processing fees
   - Popular for local services

### Payment Flow
1. **Service Selection**: Customer chooses service and time
2. **Price Calculation**: Base price + taxes + fees
3. **Payment Method**: Customer selects preferred option
4. **Processing**: Payment processed based on method
5. **Confirmation**: Booking confirmed upon payment success
6. **Vendor Notification**: Automatic notification sent

### Fee Structure
```
EcoCash/OneMoney: 2.5% of transaction
Credit Cards: 3.2% of transaction
Bank Transfer: Free
Cash on Service: Free
```

## Deployment Guide

### Squarespace Domain Integration

1. **Domain Setup:**
   - Purchase domain through Squarespace Domains
   - Access DNS settings in domain manager
   - Delete default Squarespace records

2. **DNS Configuration:**
   ```
   Type: CNAME
   Host: www
   Data: apex-loadbalancer.netlify.com
   
   Type: A
   Host: @
   Data: 75.2.60.5
   ```

3. **Netlify Deployment:**
   - Connect GitHub repository to Netlify
   - Configure build settings:
     ```
     Build command: npm run build
     Publish directory: build
     ```
   - Add custom domain: helensvaleconnect.art

### Environment Variables
Create `.env` files in both backend and frontend:

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/helensvale_connect
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
STRIPE_SECRET_KEY=your_stripe_key
FRONTEND_URL=https://helensvaleconnect.art
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://api.helensvaleconnect.art
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups scheduled
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Monitoring and logging setup
- [ ] Error tracking implemented
- [ ] Performance optimization completed

## Testing Guide

### Running Tests

1. **Backend Tests:**
   ```bash
   cd backend
   npm test
   ```

2. **Frontend Tests:**
   ```bash
   cd frontend
   npm test
   ```

3. **Integration Tests:**
   ```bash
   npm run test:integration
   ```

### Test Coverage
- **Authentication**: Registration, login, password reset
- **Vendor Services**: Profile creation, service management
- **Booking System**: Availability, pricing, notifications
- **Payment Processing**: All payment methods
- **Social Media**: Content generation, posting
- **Ambassador Program**: Referral tracking, commissions

### Manual Testing Checklist

**User Registration & Authentication:**
- [ ] User can register with valid email
- [ ] Password validation works correctly
- [ ] Email verification process
- [ ] Login with correct credentials
- [ ] Password reset functionality

**Vendor Features:**
- [ ] Vendor profile creation
- [ ] Service listing and pricing
- [ ] Availability calendar management
- [ ] Social media account connection
- [ ] Campaign creation and publishing

**Booking Process:**
- [ ] Service search and filtering
- [ ] Real-time availability checking
- [ ] Booking creation and confirmation
- [ ] Payment processing for all methods
- [ ] Email/SMS notifications

**Ambassador Program:**
- [ ] Ambassador application process
- [ ] Referral code generation
- [ ] Commission tracking
- [ ] Marketing material access
- [ ] Tier progression system

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongoNetworkError: failed to connect to server
```
**Solution:**
- Ensure MongoDB service is running
- Check connection string in .env file
- Verify database permissions
- Try manual MongoDB start: `mongod --dbpath ./data/db`

**2. Frontend Build Errors**
```
Error: Module not found
```
**Solution:**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check for version conflicts in package.json
- Clear npm cache: `npm cache clean --force`

**3. Payment Processing Issues**
```
Error: Payment method not supported
```
**Solution:**
- Verify payment service configuration
- Check API keys in environment variables
- Ensure payment method is enabled
- Test with different payment amounts

**4. Social Media Connection Failed**
```
Error: Invalid access token
```
**Solution:**
- Refresh social media access tokens
- Re-authorize platform connections
- Check API permissions and scopes
- Verify platform-specific requirements

**5. Ambassador Referral Not Tracking**
```
Error: Referral code not found
```
**Solution:**
- Verify referral code format
- Check ambassador status (active/approved)
- Ensure proper URL parameter passing
- Clear browser cookies and try again

### Performance Optimization

**Database Optimization:**
- Index frequently queried fields
- Implement connection pooling
- Use aggregation pipelines for complex queries
- Regular database maintenance

**Frontend Optimization:**
- Implement code splitting
- Optimize images and assets
- Use React.memo for expensive components
- Implement lazy loading

**API Optimization:**
- Implement caching strategies
- Use compression middleware
- Optimize database queries
- Implement rate limiting

### Monitoring & Logging

**Backend Logging:**
- Error logs: `backend/logs/error.log`
- Combined logs: `backend/logs/combined.log`
- Database queries logged in development

**Frontend Monitoring:**
- Browser console for client-side errors
- Network tab for API request monitoring
- Performance tab for loading analysis

**Production Monitoring:**
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track user engagement metrics
- Database performance monitoring

### Support & Maintenance

**Regular Maintenance Tasks:**
- Database backups (daily)
- Security updates (monthly)
- Performance monitoring (weekly)
- User feedback review (weekly)
- Ambassador program management (bi-weekly)

**Emergency Procedures:**
- Database recovery process
- Service restart procedures
- Rollback deployment process
- Security incident response

**Contact Information:**
- Technical Support: support@helensvaleconnect.art
- Ambassador Program: ambassadors@helensvaleconnect.art
- General Inquiries: info@helensvaleconnect.art

---

## Conclusion

HelensvaleConnect is a comprehensive marketplace platform designed to revolutionize local service discovery in South Africa. With its advanced features, social media integration, and ambassador program, it provides a complete solution for both service providers and customers.

For additional support or feature requests, please contact our development team or submit an issue on our GitHub repository.

**Version:** 2.0.1  
**Last Updated:** January 2025  
**Documentation Maintained By:** HelensvaleConnect Development Team
