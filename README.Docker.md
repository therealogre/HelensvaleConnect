# Helensvale Connect - Docker Deployment Guide

## 🚀 Quick Start

```bash
# 1. Clone and navigate to project
git clone https://github.com/therealogre/HelensvaleConnect.git
cd HelensvaleConnect

# 2. Configure environment
cp .env.production .env
# Edit .env with your credentials (see Configuration section)

# 3. Deploy
docker-compose up -d

# 4. Verify deployment
docker-compose ps
curl http://localhost/health
```

## 🏗️ Architecture

**Multi-Container Setup:**
- **App Container**: React frontend + Node.js backend + Nginx proxy
- **MongoDB**: Database with optimized indexes
- **Redis**: Session storage and caching

**Production Features:**
- Multi-stage Docker builds for optimization
- Nginx reverse proxy with rate limiting
- SSL-ready configuration
- Health checks and monitoring
- Automated database initialization

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- 2GB+ RAM available
- Port 80, 443, 27017, 6379 available
- Domain pointed to server (for SSL)

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database Passwords
MONGO_ROOT_PASSWORD=your_secure_mongo_password
REDIS_PASSWORD=your_secure_redis_password

# JWT Secrets (generate new ones)
JWT_ACCESS_SECRET=your_jwt_access_secret_64_chars_minimum
JWT_REFRESH_SECRET=your_jwt_refresh_secret_64_chars_minimum
SESSION_SECRET=your_session_secret_64_chars_minimum

# Email (Gmail App Password)
SMTP_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### PayNow Integration (Pre-configured)
- Integration ID: 21545 (PowerHouse Ventures)
- Integration Key: f073cc69-4438-418f-8b30-62779a5a2cb0
- Supports EcoCash, OneMoney, and web payments

## 🚀 Deployment Steps

### 1. Initial Deployment

```bash
# Start all services
docker-compose up -d

# Monitor startup
docker-compose logs -f app

# Check all containers
docker-compose ps
```

### 2. SSL Configuration (Production)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d helensvaleconnect.art -d api.helensvaleconnect.art

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. DNS Configuration

Point your domain to server IP:
```
A    helensvaleconnect.art     → YOUR_SERVER_IP
A    api.helensvaleconnect.art → YOUR_SERVER_IP
```

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl http://localhost/health

# Database connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis connection
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f redis

# Nginx access logs
docker-compose exec app tail -f /var/log/nginx/access.log
```

### Performance Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Database stats
docker-compose exec mongodb mongosh --eval "db.stats()"
```

## 🔧 Maintenance

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clean old images
docker image prune -f
```

### Backups

```bash
# Database backup
docker-compose exec mongodb mongodump --out /tmp/backup
docker-compose cp mongodb:/tmp/backup ./backup-$(date +%Y%m%d)

# Restore database
docker-compose cp ./backup-20240916 mongodb:/tmp/restore
docker-compose exec mongodb mongorestore /tmp/restore
```

### Scaling

```bash
# Scale app containers
docker-compose up -d --scale app=3

# Load balancer configuration needed for multiple app instances
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs app

# Check disk space
df -h

# Check memory
free -h
```

**Database connection failed:**
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
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

# Restart services
docker-compose restart
```

**Slow response times:**
```bash
# Check Nginx access logs
docker-compose exec app tail -f /var/log/nginx/access.log

# Monitor database performance
docker-compose exec mongodb mongosh --eval "db.currentOp()"
```

## 🌍 Zimbabwe Mobile Money Support

### Supported Payment Methods
- **EcoCash**: Zimbabwe's leading mobile money platform
- **OneMoney**: NetOne's mobile money service  
- **Web Payments**: Credit/debit card processing

### Test Numbers (Development)
- EcoCash: +263771234567
- OneMoney: +263731234567

### Production Configuration
- Real PayNow credentials configured
- Platform fee: 10% (configurable)
- Vendor payout: 90% (configurable)
- Currency: USD (primary), ZWL (supported)

## 📱 Mobile Optimization

- Mobile-first responsive design
- Optimized for African connectivity
- Progressive Web App (PWA) ready
- Offline capability for core features
- Low-data mode for slow connections

## 🔒 Security Features

- Rate limiting (API: 10 req/s, Login: 5 req/min)
- CSRF protection
- XSS protection headers
- Content Security Policy
- Secure cookie configuration
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization

## 📈 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] DNS records pointed correctly
- [ ] Database backups scheduled
- [ ] Monitoring alerts configured
- [ ] PayNow integration tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimization completed
- [ ] Security audit passed
- [ ] Load testing completed

## 🆘 Support

For deployment issues or questions:
- Email: support@helensvaleconnect.art
- GitHub Issues: https://github.com/therealogre/HelensvaleConnect/issues
- Documentation: https://helensvaleconnect.art/docs

---

**Helensvale Connect** - Connecting Zimbabwe's Digital Marketplace 🇿🇼
