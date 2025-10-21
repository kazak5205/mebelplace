# Multi-stage build для MebelPlace MVP

# Stage 1: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
# Copy shared modules and install dependencies
COPY shared ./shared
WORKDIR /app/shared
RUN if [ -f package.json ]; then npm install --production; fi
# Copy and build frontend
WORKDIR /app
COPY client/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci
WORKDIR /app
COPY client ./frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Build mobile (Android APK)
FROM node:18-alpine AS mobile-builder
WORKDIR /app/mobile
RUN apk add --no-cache openjdk11-jdk
COPY mobile/package*.json ./
RUN npm ci
COPY mobile/ ./
RUN npx react-native build-android --mode=release

# Stage 4: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    ffmpeg \
    nginx \
    supervisor

# Copy backend
COPY --from=backend-builder /app/backend ./server
WORKDIR /app/server
RUN npm install

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy mobile APK (commented out for now - build separately if needed)
# COPY --from=mobile-builder /app/mobile/android/app/build/outputs/apk/release/app-release.apk ./mobile/mebelplace.apk

# Copy nginx config
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor config
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create upload directories
RUN mkdir -p /app/uploads/videos /app/uploads/thumbnails /app/uploads/avatars /app/uploads/order-photos /app/uploads/chat-files

# Create log directories
RUN mkdir -p /var/log/supervisor /var/log/nginx

# Create startup script
COPY docker/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 80 443 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start services
CMD ["/app/start.sh"]

