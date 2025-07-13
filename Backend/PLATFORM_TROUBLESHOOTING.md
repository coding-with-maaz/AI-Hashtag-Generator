# Platform Troubleshooting Guide

## Issue: Platform-Specific Errors on Production Server

### Problem Description
- Google platform works fine on production
- Other platforms (Bing, YouTube, Play Store, App Store) give 500 errors
- Local development works for all platforms
- Error: `Cannot find module 'puppeteer-core'`

### Root Cause Analysis

#### 1. Missing Dependencies
The main issue is missing `puppeteer-core` dependency on the production server.

**Error:**
```
❌ YouTube scraper error: Error: Cannot find module 'puppeteer-core'
```

**Solution:**
```bash
# Install missing dependencies
npm install puppeteer-core@latest
npm install puppeteer@latest
npm install puppeteer-extra@latest
npm install puppeteer-extra-plugin-stealth@latest
```

#### 2. Environment-Based Configuration
Different platforms had different request patterns:
- **Google**: Had environment-based configuration (reduced requests on production)
- **Other platforms**: Made too many requests too quickly (55+ requests per search)

**Before Fix:**
- Alphabet requests: 26 per platform
- Question requests: 28 per platform
- Total: 54+ requests per search
- No delays between requests

**After Fix:**
- Alphabet requests: 10 per platform (production)
- Question requests: 10 per platform (production)
- Total: 20+ requests per search
- 200ms delay between requests

### Solutions Implemented

#### 1. Shared Configuration System
Created `backend/config/scrapingConfig.js` with environment-based settings:

```javascript
const SCRAPING_CONFIG = {
  production: {
    maxAlphabetRequests: 10,    // Reduced from 26
    maxQuestionRequests: 10,     // Reduced from 28
    requestDelay: 200,          // Increased delay
    timeout: 10000,             // Reduced timeout
    maxRetries: 2,              // Reduced retries
    enableFallback: true
  },
  development: {
    maxAlphabetRequests: 26,
    maxQuestionRequests: 28,
    requestDelay: 100,
    timeout: 15000,
    maxRetries: 3,
    enableFallback: true
  }
};
```

#### 2. Updated All Controllers
- ✅ Google Controller (already had optimization)
- ✅ Bing Controller (added optimization)
- ✅ YouTube Controller (added optimization)
- ✅ Play Store Controller (added optimization)
- ✅ App Store Controller (added optimization)

#### 3. Installation Scripts
Created production installation scripts:

**Linux/Mac:**
```bash
chmod +x scripts/install-production.sh
./scripts/install-production.sh
```

**Windows:**
```powershell
.\scripts\install-production.ps1
```

### Step-by-Step Fix for Production Server

#### Step 1: Install Missing Dependencies
```bash
# SSH into your production server
ssh user@your-server.com

# Navigate to backend directory
cd /path/to/backend

# Install missing dependencies
npm install puppeteer-core@latest
npm install puppeteer@latest
npm install puppeteer-extra@latest
npm install puppeteer-extra-plugin-stealth@latest

# Or use the installation script
chmod +x scripts/install-production.sh
./scripts/install-production.sh
```

#### Step 2: Set Environment Variables
```bash
# Set production environment variables
export NODE_ENV=production
export ONLINE_SERVER=true

# Or add to your .env file
echo "NODE_ENV=production" >> .env
echo "ONLINE_SERVER=true" >> .env
```

#### Step 3: Test All Platforms
```bash
# Test all platforms
node scripts/test-all-platforms.js
```

#### Step 4: Restart the Server
```bash
# Restart your application
pm2 restart your-app-name
# or
systemctl restart your-service
```

### Verification Steps

#### 1. Check Dependencies
```bash
npm ls puppeteer puppeteer-core puppeteer-extra puppeteer-extra-plugin-stealth
```

#### 2. Test Individual Platforms
```bash
# Test Google
curl "https://your-domain.com/api/google/keywords?query=javascript"

# Test Bing
curl "https://your-domain.com/api/bing/keywords?query=javascript"

# Test YouTube
curl "https://your-domain.com/api/youtube/keywords?query=javascript"

# Test Play Store
curl "https://your-domain.com/api/playstore/keywords?query=javascript"

# Test App Store
curl "https://your-domain.com/api/appstore/keywords?query=javascript"
```

#### 3. Check Logs
```bash
# Check application logs
pm2 logs your-app-name
# or
tail -f /var/log/your-app.log
```

### Expected Results After Fix

#### Production Environment:
- **Google**: 500+ keywords (works as before)
- **Bing**: 200-300 keywords (reduced but stable)
- **YouTube**: 200-300 keywords (reduced but stable)
- **Play Store**: 100-200 keywords (reduced but stable)
- **App Store**: 100-200 keywords (reduced but stable)

#### Development Environment:
- **All platforms**: 500+ keywords (full scraping)

### Troubleshooting Common Issues

#### Issue 1: Still Getting "Cannot find module 'puppeteer-core'"
**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm install puppeteer-core@latest
```

#### Issue 2: "Resource temporarily unavailable" Error
**Solution:**
```bash
# This is a system resource issue
# Check available memory
free -h

# Check disk space
df -h

# Restart the server with more resources
pm2 restart your-app-name --max-memory-restart 1G
```

#### Issue 3: Timeout Errors
**Solution:**
```bash
# Increase timeout in production
export TIMEOUT=15000
# or modify the config file
```

#### Issue 4: Rate Limiting
**Solution:**
```bash
# Increase delays between requests
export REQUEST_DELAY=300
# or modify the config file
```

### Monitoring and Maintenance

#### 1. Regular Health Checks
```bash
# Create a cron job to test platforms daily
0 2 * * * cd /path/to/backend && node scripts/test-all-platforms.js >> /var/log/platform-tests.log
```

#### 2. Log Monitoring
```bash
# Monitor for errors
tail -f /var/log/your-app.log | grep -i error

# Monitor response times
tail -f /var/log/your-app.log | grep "Response time"
```

#### 3. Performance Monitoring
- Monitor CPU usage during scraping
- Monitor memory usage
- Monitor network requests
- Set up alerts for high error rates

### Environment Variables Reference

| Variable | Development | Production | Purpose |
|----------|-------------|------------|---------|
| `NODE_ENV` | `development` | `production` | Environment mode |
| `ONLINE_SERVER` | `false` | `true` | Server type |
| `MAX_ALPHABET_REQUESTS` | `26` | `10` | Alphabet variations |
| `MAX_QUESTION_REQUESTS` | `28` | `10` | Question variations |
| `REQUEST_DELAY` | `100` | `200` | Delay between requests (ms) |
| `TIMEOUT` | `15000` | `10000` | Request timeout (ms) |
| `MAX_RETRIES` | `3` | `2` | Retry attempts |

### Quick Commands Reference

```bash
# Install production dependencies
npm run install:production

# Test all platforms
npm run test:platforms

# Deploy to production
./scripts/deploy-production.sh

# Check platform status
curl -s "https://your-domain.com/api/google/keywords?query=test" | jq '.success'
```

### Support

If you continue to experience issues:

1. **Check the logs** for specific error messages
2. **Run the test script** to identify which platforms are failing
3. **Verify dependencies** are properly installed
4. **Check system resources** (memory, CPU, disk space)
5. **Contact support** with specific error messages and logs

### Files Modified

- `backend/package.json` - Added missing dependencies
- `backend/config/scrapingConfig.js` - Shared configuration
- `backend/controllers/*.js` - Updated all controllers
- `backend/scripts/install-production.sh` - Installation script
- `backend/scripts/install-production.ps1` - Windows installation script
- `backend/scripts/test-all-platforms.js` - Testing script
- `backend/scripts/deploy-production.sh` - Deployment script
- `backend/scripts/deploy-production.ps1` - Windows deployment script 