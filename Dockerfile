# Multi-stage Dockerfile for Helensvale Connect
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --production=false

COPY frontend/ ./
ENV REACT_APP_API_URL=https://api.helensvaleconnect.art
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production=true

COPY backend/ ./

# Stage 3: Production Runtime
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy backend files
COPY --from=backend-build /app/backend ./backend
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# Create uploads directory and set permissions
RUN mkdir -p /app/backend/uploads \
    && mkdir -p /var/log/supervisor \
    && chown -R node:node /app \
    && chmod -R 755 /app

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
