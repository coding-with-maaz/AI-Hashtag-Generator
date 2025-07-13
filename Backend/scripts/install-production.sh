#!/bin/bash

# Production Installation Script for AI Hashtag Generator Backend
# This script handles dependency installation and fixes common issues

echo "🚀 Starting production installation..."

# Set production environment variables
export NODE_ENV=production
export ONLINE_SERVER=true

echo "📦 Installing base dependencies..."
npm install

echo "🔧 Installing Puppeteer dependencies..."
npm install puppeteer@latest
npm install puppeteer-core@latest
npm install puppeteer-extra@latest
npm install puppeteer-extra-plugin-stealth@latest

echo "🧹 Cleaning npm cache..."
npm cache clean --force

echo "📋 Verifying installations..."
echo "Checking puppeteer installation..."
node -e "try { require('puppeteer'); console.log('✅ puppeteer installed'); } catch(e) { console.log('❌ puppeteer error:', e.message); }"

echo "Checking puppeteer-core installation..."
node -e "try { require('puppeteer-core'); console.log('✅ puppeteer-core installed'); } catch(e) { console.log('❌ puppeteer-core error:', e.message); }"

echo "Checking puppeteer-extra installation..."
node -e "try { require('puppeteer-extra'); console.log('✅ puppeteer-extra installed'); } catch(e) { console.log('❌ puppeteer-extra error:', e.message); }"

echo "Checking puppeteer-extra-plugin-stealth installation..."
node -e "try { require('puppeteer-extra-plugin-stealth'); console.log('✅ puppeteer-extra-plugin-stealth installed'); } catch(e) { console.log('❌ puppeteer-extra-plugin-stealth error:', e.message); }"

echo "🔍 Checking for missing dependencies..."
npm ls puppeteer puppeteer-core puppeteer-extra puppeteer-extra-plugin-stealth

echo "📊 Installation Summary:"
echo "========================"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "NODE_ENV: $NODE_ENV"
echo "ONLINE_SERVER: $ONLINE_SERVER"

echo "✅ Production installation completed!"
echo "You can now run: npm start" 