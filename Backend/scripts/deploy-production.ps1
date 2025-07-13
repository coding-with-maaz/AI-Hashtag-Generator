# Production Deployment Script for AI Hashtag Generator Backend (PowerShell)
# This script sets up the environment for production deployment on Windows

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Set production environment variables
$env:NODE_ENV = "production"
$env:ONLINE_SERVER = "true"

# Database configuration (adjust as needed)
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "hashtag_generator"
$env:DB_USER = "root"
$env:DB_PASSWORD = ""

# Server configuration
$env:PORT = "3000"
$env:HOST = "0.0.0.0"

# Scraping configuration for production
$env:MAX_ALPHABET_REQUESTS = "10"
$env:MAX_QUESTION_REQUESTS = "10"
$env:REQUEST_DELAY = "200"
$env:TIMEOUT = "10000"
$env:MAX_RETRIES = "2"

Write-Host "📋 Environment Configuration:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "ONLINE_SERVER: $env:ONLINE_SERVER"
Write-Host "PORT: $env:PORT"
Write-Host "HOST: $env:HOST"
Write-Host "MAX_ALPHABET_REQUESTS: $env:MAX_ALPHABET_REQUESTS"
Write-Host "MAX_QUESTION_REQUESTS: $env:MAX_QUESTION_REQUESTS"
Write-Host "REQUEST_DELAY: $env:REQUEST_DELAY ms"
Write-Host "TIMEOUT: $env:TIMEOUT ms"
Write-Host "MAX_RETRIES: $env:MAX_RETRIES"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Run database migrations (if using Sequelize)
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npx sequelize-cli db:migrate

# Test the configuration
Write-Host "🧪 Testing platform configuration..." -ForegroundColor Cyan
node scripts/test-all-platforms.js

# Start the server
Write-Host "🌟 Starting production server..." -ForegroundColor Green
Write-Host "Server will be available at: http://$env:HOST:$env:PORT" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the server with production settings
$env:NODE_ENV = "production"
$env:ONLINE_SERVER = "true"
npm start 