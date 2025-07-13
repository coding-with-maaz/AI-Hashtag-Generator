# Production Installation Script for AI Hashtag Generator Backend (PowerShell)
# This script handles dependency installation and fixes common issues on Windows

Write-Host "🚀 Starting production installation..." -ForegroundColor Green

# Set production environment variables
$env:NODE_ENV = "production"
$env:ONLINE_SERVER = "true"

Write-Host "📦 Installing base dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🔧 Installing Puppeteer dependencies..." -ForegroundColor Cyan
npm install puppeteer@latest
npm install puppeteer-core@latest
npm install puppeteer-extra@latest
npm install puppeteer-extra-plugin-stealth@latest

Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "📋 Verifying installations..." -ForegroundColor Yellow
Write-Host "Checking puppeteer installation..." -ForegroundColor White
node -e "try { require('puppeteer'); console.log('✅ puppeteer installed'); } catch(e) { console.log('❌ puppeteer error:', e.message); }"

Write-Host "Checking puppeteer-core installation..." -ForegroundColor White
node -e "try { require('puppeteer-core'); console.log('✅ puppeteer-core installed'); } catch(e) { console.log('❌ puppeteer-core error:', e.message); }"

Write-Host "Checking puppeteer-extra installation..." -ForegroundColor White
node -e "try { require('puppeteer-extra'); console.log('✅ puppeteer-extra installed'); } catch(e) { console.log('❌ puppeteer-extra error:', e.message); }"

Write-Host "Checking puppeteer-extra-plugin-stealth installation..." -ForegroundColor White
node -e "try { require('puppeteer-extra-plugin-stealth'); console.log('✅ puppeteer-extra-plugin-stealth installed'); } catch(e) { console.log('❌ puppeteer-extra-plugin-stealth error:', e.message); }"

Write-Host "🔍 Checking for missing dependencies..." -ForegroundColor Yellow
npm ls puppeteer puppeteer-core puppeteer-extra puppeteer-extra-plugin-stealth

Write-Host "📊 Installation Summary:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host "Node version: $(node --version)"
Write-Host "NPM version: $(npm --version)"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "ONLINE_SERVER: $env:ONLINE_SERVER"

Write-Host "✅ Production installation completed!" -ForegroundColor Green
Write-Host "You can now run: npm start" -ForegroundColor Yellow 