# Frontend Dockerfile for MebelPlace
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for client
COPY client/package*.json ./client/
# Copy shared package files if exists
COPY shared/package*.json ./shared/ 2>/dev/null || true

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Copy shared modules
WORKDIR /app
COPY shared ./shared

# Copy client source code
COPY client ./client

# Build the application
WORKDIR /app/client
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/client/dist /var/www/html

# Copy nginx configuration
COPY client/nginx.docker.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

