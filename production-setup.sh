#!/bin/bash

# Helensvale Connect - Production Server Setup Script
# Run this on your Ubuntu 20.04+ server

set -e

echo "=========================================="
echo "Helensvale Connect - Production Setup"
echo "=========================================="
echo

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "[2/8] Installing required packages..."
sudo apt install -y curl wget git htop ufw fail2ban

# Install Docker
echo "[3/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "[4/8] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Configure firewall
echo "[5/8] Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Install Certbot for SSL
echo "[6/8] Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Clone repository
echo "[7/8] Cloning Helensvale Connect repository..."
if [ ! -d "HelensvaleConnect" ]; then
    git clone https://github.com/therealogre/HelensvaleConnect.git
    cd HelensvaleConnect
else
    cd HelensvaleConnect
    git pull origin main
fi

# Setup environment file
echo "[8/8] Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo
    echo "=========================================="
    echo "IMPORTANT: Configure Environment Variables"
    echo "=========================================="
    echo
    echo "Please edit the .env file with your production credentials:"
    echo "- Database passwords (MONGO_ROOT_PASSWORD, REDIS_PASSWORD)"
    echo "- JWT secrets (generate new 64+ character secrets)"
    echo "- Email configuration (SMTP_PASS)"
    echo "- Cloudinary credentials (API_KEY, API_SECRET)"
    echo
    echo "PayNow integration is pre-configured with PowerHouse Ventures credentials."
    echo
    echo "Run: nano .env"
    echo
else
    echo "Environment file already exists"
fi

echo
echo "=========================================="
echo "Production Server Setup Complete!"
echo "=========================================="
echo
echo "Next steps:"
echo "1. Configure DNS: Point helensvaleconnect.art to this server's IP"
echo "2. Edit environment: nano .env"
echo "3. Deploy application: docker-compose up -d"
echo "4. Configure SSL: sudo certbot --nginx -d helensvaleconnect.art"
echo "5. Verify deployment: curl http://localhost/health"
echo
echo "For detailed instructions, see DEPLOYMENT.md"
echo
echo "IMPORTANT: You may need to log out and back in for Docker group changes to take effect."
echo
