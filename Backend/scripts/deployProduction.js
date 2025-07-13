#!/usr/bin/env node

/**
 * Production Deployment Script
 * This script helps configure the backend for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuring backend for production deployment...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created successfully');
} else {
  console.log('📝 .env file already exists');
}

// Read current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update environment variables for production
const updates = {
  'NODE_ENV=development': 'NODE_ENV=production',
  'ONLINE_SERVER=false': 'ONLINE_SERVER=true',
  'PORT=3000': 'PORT=3000',
  'API_RATE_LIMIT=100': 'API_RATE_LIMIT=50',
  'CACHE_TTL=3600': 'CACHE_TTL=1800',
  'LOG_LEVEL=info': 'LOG_LEVEL=warn'
};

let updated = false;
Object.entries(updates).forEach(([oldValue, newValue]) => {
  if (envContent.includes(oldValue)) {
    envContent = envContent.replace(oldValue, newValue);
    updated = true;
    console.log(`✅ Updated: ${oldValue} → ${newValue}`);
  }
});

if (updated) {
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Environment configured for production deployment');
} else {
  console.log('\nℹ️  Environment already configured for production');
}

console.log('\n📋 Production Configuration Summary:');
console.log('• NODE_ENV=production (enables production scraping settings)');
console.log('• ONLINE_SERVER=true (enables conservative scraping limits)');
console.log('• API_RATE_LIMIT=50 (reduced rate limit for stability)');
console.log('• CACHE_TTL=1800 (30 minutes cache duration)');
console.log('• LOG_LEVEL=warn (reduced logging for performance)');
console.log('\n🔧 Scraping Configuration Changes:');
console.log('• Reduced alphabet requests: 26 → 10');
console.log('• Reduced question requests: 28 → 10');
console.log('• Increased request delay: 100ms → 200ms');
console.log('• Reduced timeout: 15s → 10s');
console.log('• Reduced retries: 3 → 2');
console.log('\n💡 Expected Results:');
console.log('• More stable keyword generation (15-30 keywords)');
console.log('• Better success rate on production servers');
console.log('• Reduced server load and resource usage');
console.log('• Fallback to 20+ keywords if scraping fails');
console.log('\n🌐 Frontend Configuration:');
console.log('• API_BASE_URL=https://keywords.nazaarabox.com');
console.log('• Vite proxy configured for production');
console.log('\n🚀 To start the production server:');
console.log('npm start');
console.log('\n📝 To deploy to your hosting provider:');
console.log('1. Upload all files to your server');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. Ensure your server is accessible at: https://keywords.nazaarabox.com'); 