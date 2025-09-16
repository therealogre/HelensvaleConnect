# 🆓 Helensvale Connect - FREE Deployment Guide

## 🚀 Railway Deployment (Recommended)

### Step 1: Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Connect your GitHub repository

### Step 2: Deploy Application
1. Click "New Project" → "Deploy from GitHub repo"
2. Select `therealogre/HelensvaleConnect`
3. Railway will automatically detect Dockerfile

### Step 3: Add MongoDB Service
1. Click "New" → "Database" → "Add MongoDB"
2. Note the connection string from Variables tab

### Step 4: Configure Environment Variables
Add these in Railway dashboard → Variables:
```
NODE_ENV=production
PORT=3001
MONGODB_URI=[MongoDB connection string from step 3]
PAYNOW_INTEGRATION_ID=21545
PAYNOW_INTEGRATION_KEY=f073cc69-4438-418f-8b30-62779a5a2cb0
PAYNOW_RESULT_URL=https://helensvaleconnect.art/api/payments/paynow/result
PAYNOW_RETURN_URL=https://helensvaleconnect.art/payment/success
FRONTEND_URL=https://helensvaleconnect.art
BACKEND_URL=https://helensvaleconnect.art
JWT_ACCESS_SECRET=hc_jwt_access_2024_powerhouse_ventures_secure_key_zimbabwe_marketplace_production
JWT_REFRESH_SECRET=hc_jwt_refresh_2024_powerhouse_ventures_secure_refresh_zimbabwe_production
SESSION_SECRET=hc_session_2024_powerhouse_ventures_zimbabwe_marketplace_secure_production
BCRYPT_SALT_ROUNDS=12
COMPANY_NAME=PowerHouse Ventures
COMPANY_EMAIL=info@helensvaleconnect.art
```

### Step 5: Custom Domain
1. Go to Settings → Domains
2. Add custom domain: `helensvaleconnect.art`
3. Configure DNS records (provided by Railway)

---

## 🌐 Render Deployment (Alternative)

### Step 1: Setup Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account

### Step 2: Deploy Web Service
1. Click "New" → "Web Service"
2. Connect GitHub → Select `therealogre/HelensvaleConnect`
3. Configure:
   - Name: `helensvale-connect`
   - Environment: `Docker`
   - Dockerfile Path: `./Dockerfile`
   - Instance Type: `Free`

### Step 3: Add MongoDB Database
1. Click "New" → "PostgreSQL" (Free tier)
2. Or use MongoDB Atlas free tier
3. Get connection string

### Step 4: Environment Variables
Add in Render dashboard → Environment:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=[Your MongoDB connection string]
[... same variables as Railway above ...]
```

### Step 5: Custom Domain
1. Go to Settings → Custom Domains
2. Add `helensvaleconnect.art`
3. Configure DNS as instructed

---

## ☁️ Fly.io Deployment (Docker Native)

### Step 1: Install Fly CLI
```bash
# Windows
iwr https://fly.io/install.ps1 -useb | iex

# Or download from https://fly.io/docs/getting-started/installing-flyctl/
```

### Step 2: Login and Initialize
```bash
fly auth login
fly launch --no-deploy
```

### Step 3: Configure fly.toml
```toml
app = "helensvale-connect"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"
  PAYNOW_INTEGRATION_ID = "21545"
  PAYNOW_INTEGRATION_KEY = "f073cc69-4438-418f-8b30-62779a5a2cb0"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Step 4: Deploy
```bash
fly deploy
fly certs add helensvaleconnect.art
```

---

## 📊 Free Tier Comparison

| Platform | RAM | Storage | Bandwidth | Custom Domain | SSL |
|----------|-----|---------|-----------|---------------|-----|
| Railway  | 512MB | 1GB | Unlimited | ✅ Free | ✅ Free |
| Render   | 512MB | 1GB | 100GB/month | ✅ Free | ✅ Free |
| Fly.io   | 256MB | 3GB | 160GB/month | ✅ Free | ✅ Free |

## 🎯 Recommended: Railway

**Why Railway:**
- Easiest Docker deployment
- Built-in MongoDB service
- Generous free tier
- Excellent GitHub integration
- Automatic SSL certificates

**Deployment Time:** ~10 minutes
**Cost:** Free (with $5 monthly credit)
**Result:** `https://helensvaleconnect.art` fully functional

---

## 🔧 DNS Configuration (All Platforms)

After deployment, configure these DNS records:
```
Type: CNAME  Name: @    Value: [platform-provided-domain]
Type: CNAME  Name: www  Value: [platform-provided-domain]
```

## ✅ Verification Steps

1. **Health Check**: `curl https://helensvaleconnect.art/health`
2. **Frontend**: Visit `https://helensvaleconnect.art`
3. **API**: Test `https://helensvaleconnect.art/api/health`
4. **PayNow**: Test booking flow with payment

Your Zimbabwe marketplace will be live with full PayNow integration! 🇿🇼
