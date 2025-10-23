# MebelPlace Chat System Makefile
# Real programs for testing and deployment

.PHONY: help install dev start stop test-api test-websocket deploy clean logs

# Default target
help:
	@echo "MebelPlace Chat System Commands:"
	@echo "  install        - Install dependencies"
	@echo "  dev           - Start development server"
	@echo "  start         - Start production server with PM2"
	@echo "  stop          - Stop production server"
	@echo "  test-api      - Test API endpoints with curl"
	@echo "  test-websocket - Test WebSocket connection"
	@echo "  deploy        - Deploy to production"
	@echo "  clean         - Clean logs and temporary files"
	@echo "  logs          - Show application logs"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed successfully!"

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Start production server
start:
	@echo "Starting production server with PM2..."
	pm2 start ecosystem.config.js
	pm2 save
	@echo "Production server started!"

# Stop production server
stop:
	@echo "Stopping production server..."
	pm2 stop all
	@echo "Production server stopped!"

# Test API endpoints
test-api:
	@echo "Testing API endpoints..."
	@if [ -z "$$JWT_TOKEN" ]; then \
		echo "Error: JWT_TOKEN environment variable is required"; \
		echo "Usage: JWT_TOKEN=your_token make test-api"; \
		exit 1; \
	fi
	cd scripts && chmod +x test-api.sh && JWT_TOKEN=$$JWT_TOKEN ./test-api.sh

# Test WebSocket connection
test-websocket:
	@echo "Testing WebSocket connection..."
	@if [ -z "$$JWT_TOKEN" ]; then \
		echo "Error: JWT_TOKEN environment variable is required"; \
		echo "Usage: JWT_TOKEN=your_token make test-websocket"; \
		exit 1; \
	fi
	cd scripts && JWT_TOKEN=$$JWT_TOKEN node test-websocket.js

# Deploy to production
deploy:
	@echo "Deploying to production..."
	@if [ "$$(id -u)" -ne 0 ]; then \
		echo "Error: Deploy script requires root privileges"; \
		echo "Usage: sudo make deploy"; \
		exit 1; \
	fi
	chmod +x deploy.sh
	./deploy.sh

# Clean logs and temporary files
clean:
	@echo "Cleaning logs and temporary files..."
	rm -rf logs/*.log
	rm -rf uploads/*
	pm2 flush
	@echo "Cleanup completed!"

# Show application logs
logs:
	@echo "Showing application logs..."
	pm2 logs

# Health check
health:
	@echo "Checking application health..."
	curl -s https://mebelplace.com.kz/api/health | jq '.' || echo "Health check failed"

# Restart application
restart:
	@echo "Restarting application..."
	pm2 restart all
	@echo "Application restarted!"

# Show status
status:
	@echo "Application status:"
	pm2 status
