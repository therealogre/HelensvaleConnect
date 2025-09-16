# Helensvale Connect - Production Deployment Guide

## 🚀 Quick Production Deployment

### Prerequisites
- Ubuntu 20.04+ server with 4GB+ RAM
- Docker and Docker Compose installed
- Domain `helensvaleconnect.art` pointed to server IP
- SSL certificate (Let's Encrypt recommended)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply Docker group changes
sudo reboot
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/therealogre/HelensvaleConnect.git
cd HelensvaleConnect

# Configure environment
cp .env.production .env
nano .env  # Update with production credentials

# Deploy with Docker
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost/health
```

### 3. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d helensvaleconnect.art -d api.helensvaleconnect.art

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Production Configuration

### Environment Variables (.env)

```bash
# Database Security
MONGO_ROOT_PASSWORD=your_secure_mongo_password_here
REDIS_PASSWORD=your_secure_redis_password_here

# JWT Security (Generate new 64+ character secrets)
JWT_ACCESS_SECRET=your_jwt_access_secret_64_chars_minimum
JWT_REFRESH_SECRET=your_jwt_refresh_secret_64_chars_minimum
SESSION_SECRET=your_session_secret_64_chars_minimum

# PayNow Integration (Production Ready)
PAYNOW_INTEGRATION_ID=21545
PAYNOW_INTEGRATION_KEY=f073cc69-4438-418f-8b30-62779a5a2cb0

# Email Service (Gmail App Password)
SMTP_PASS=your_gmail_app_password

# Cloudinary (Image Storage)
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### DNS Configuration

Point your domain to server IP:
```
A    helensvaleconnect.art     → YOUR_SERVER_IP
A    api.helensvaleconnect.art → YOUR_SERVER_IP
CNAME www.helensvaleconnect.art → helensvaleconnect.art
```

## 📊 Monitoring & Health Checks

### Application Health
```bash
# Health endpoint
curl https://helensvaleconnect.art/health

# Container status
docker-compose ps

# Application logs
docker-compose logs -f app
```

### Database Health
```bash
# MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis connection
docker-compose exec redis redis-cli ping

# Database stats
docker-compose exec mongodb mongosh --eval "db.stats()"
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Nginx access logs
docker-compose exec app tail -f /var/log/nginx/access.log

# System resources
htop
df -h
```

## 🔒 Security Features

### Implemented Security
- ✅ Rate limiting (API: 10 req/s, Login: 5 req/min)
- ✅ CSRF protection
- ✅ XSS protection headers
- ✅ Content Security Policy
- ✅ Secure cookie configuration
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation and sanitization
- ✅ HTTPS enforcement
- ✅ Security headers (HSTS, X-Frame-Options, etc.)

### Security Checklist
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Strong passwords for all services
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured

## 💰 PayNow Integration Status

### Production Configuration
- **Integration ID**: 21545 (PowerHouse Ventures)
- **Integration Key**: f073cc69-4438-418f-8b30-62779a5a2cb0
- **Supported Methods**: EcoCash, OneMoney, Credit Cards
- **Currency**: USD (primary), ZWL (supported)
- **Platform Fee**: 10% (configurable)
- **Vendor Payout**: 90% (configurable)

### Payment Flow
1. Customer selects service and books appointment
2. Payment page with PayNow integration
3. Redirect to PayNow for mobile money payment
4. Callback processing and booking confirmation
5. Automated vendor payout (90% of payment)
6. Email notifications to all parties

## 🌍 African Market Features

### Zimbabwe Optimization
- Mobile-first responsive design (70%+ mobile traffic)
- EcoCash and OneMoney payment priority
- Low-data optimization for poor connectivity
- Geolocation with 65+ Zimbabwe cities
- Local business categories and pricing
- USD currency with local context

### Mobile Money Support
- **EcoCash**: Zimbabwe's leading mobile money (70% market share)
- **OneMoney**: NetOne's mobile money service
- **Cross-platform**: Government mandated interoperability
- **Test Numbers**: +263771234567 (EcoCash), +263731234567 (OneMoney)

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mongodb mongodump --out /tmp/backup_$DATE
docker-compose cp mongodb:/tmp/backup_$DATE ./backups/
```

### Recovery Process
```bash
# Restore from backup
docker-compose cp ./backups/backup_20240916_120000 mongodb:/tmp/restore
docker-compose exec mongodb mongorestore /tmp/restore
```

## 📈 Scaling Considerations

### Current Capacity
- Single server deployment
- Handles 500+ concurrent users
- MongoDB with optimized indexes
- Redis for session management
- Nginx with caching and compression

### Scaling Options
1. **Horizontal Scaling**: Multiple app containers with load balancer
2. **Database Scaling**: MongoDB replica sets
3. **CDN Integration**: Cloudflare for static assets
4. **Microservices**: Split into payment, booking, user services

## 🆘 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs app

# Check resources
df -h && free -h

# Restart services
docker-compose restart
```

**Database connection failed:**
```bash
# Verify MongoDB
docker-compose ps mongodb
docker-compose logs mongodb

# Test connection
docker-compose exec app node -e "console.log(process.env.MONGODB_URI)"
```

**Payment integration issues:**
```bash
# Verify PayNow credentials
docker-compose exec app node -e "console.log(process.env.PAYNOW_INTEGRATION_ID)"

# Check payment logs
docker-compose logs app | grep -i paynow
```

### Performance Issues

**High memory usage:**
```bash
# Check container memory
docker stats --no-stream

# Optimize MongoDB
docker-compose exec mongodb mongosh --eval "db.runCommand({compact: 'users'})"
```

**Slow response times:**
```bash
# Check Nginx logs
docker-compose exec app tail -f /var/log/nginx/access.log

# Monitor database queries
docker-compose exec mongodb mongosh --eval "db.currentOp()"
```

## 📞 Support

### Production Support
- **Email**: support@helensvaleconnect.art
- **Emergency**: admin@helensvaleconnect.art
- **GitHub**: https://github.com/therealogre/HelensvaleConnect/issues

### Monitoring Alerts
- Server resource usage > 80%
- Application response time > 3 seconds
- Payment processing failures
- Database connection issues
- SSL certificate expiration (30 days)

---

**Helensvale Connect v2.0.1** - Production Ready for Zimbabwe's Digital Marketplace 🇿🇼

**Deployed by**: PowerHouse Ventures  
**Last Updated**: September 2024  
**Status**: Production Ready ✅
