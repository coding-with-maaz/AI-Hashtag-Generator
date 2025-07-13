#!/bin/bash

# Production Deployment Script for AI Hashtag Generator Backend
# This script sets up the environment for production deployment

echo "🚀 Starting production deployment..."

# Set production environment variables
export NODE_ENV=production
export ONLINE_SERVER=true

# Database configuration (adjust as needed)
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=hashtag_generator
export DB_USER=root
export DB_PASSWORD=

# Server configuration
export PORT=3000
export HOST=0.0.0.0

# Scraping configuration for production
export MAX_ALPHABET_REQUESTS=10
export MAX_QUESTION_REQUESTS=10
export REQUEST_DELAY=200
export TIMEOUT=10000
export MAX_RETRIES=2

echo "📋 Environment Configuration:"
echo "============================="
echo "NODE_ENV: $NODE_ENV"
echo "ONLINE_SERVER: $ONLINE_SERVER"
echo "PORT: $PORT"
echo "HOST: $HOST"
echo "MAX_ALPHABET_REQUESTS: $MAX_ALPHABET_REQUESTS"
echo "MAX_QUESTION_REQUESTS: $MAX_QUESTION_REQUESTS"
echo "REQUEST_DELAY: ${REQUEST_DELAY}ms"
echo "TIMEOUT: ${TIMEOUT}ms"
echo "MAX_RETRIES: $MAX_RETRIES"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations (if using Sequelize)
echo "🗄️  Running database migrations..."
npx sequelize-cli db:migrate

# Test the configuration
echo "🧪 Testing platform configuration..."
node scripts/test-all-platforms.js

# Start the server
echo "🌟 Starting production server..."
echo "Server will be available at: http://$HOST:$PORT"
echo "Press Ctrl+C to stop the server"

# Start the server with production settings
NODE_ENV=production ONLINE_SERVER=true npm start 