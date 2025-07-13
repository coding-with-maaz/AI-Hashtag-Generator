# Production Deployment Guide

## 🚀 Quick Setup

### 1. Configure Backend for Production
```bash
cd backend
npm run deploy:production
```

### 2. Frontend Configuration
The frontend is already configured to use the production server:
- **API_BASE_URL**: `https://keywords.nazaarabox.com`
- **Vite Proxy**: Configured for production

## 📋 Configuration Summary

### Backend Production Settings
- **NODE_ENV**: `production`
- **ONLINE_SERVER**: `true`
- **API_RATE_LIMIT**: `50` (reduced from 100)
- **CACHE_TTL**: `1800` (30 minutes)
- **LOG_LEVEL**: `warn` (reduced logging)

### Scraping Optimizations
- **Alphabet Requests**: 26 → 10 (a-j only)
- **Question Requests**: 28 → 10 (most common)
- **Request Delay**: 100ms → 200ms
- **Timeout**: 15s → 10s
- **Retries**: 3 → 2

### Expected Results
- **Keyword Count**: 15-30 keywords (consistent)
- **Success Rate**: High (stable performance)
- **Server Load**: Reduced
- **Fallback**: 20+ keywords if scraping fails

## 🌐 Deployment Steps

### 1. Backend Deployment

#### Option A: Using the Script (Recommended)
```bash
cd backend
npm run deploy:production
npm install
npm start
```

#### Option B: Manual Configuration
Create `.env` file in backend directory:
```env
NODE_ENV=production
ONLINE_SERVER=true
PORT=3000
API_RATE_LIMIT=50
CACHE_TTL=1800
LOG_LEVEL=warn
```

### 2. Frontend Deployment

The frontend is already configured for production:
- `src/lib/api.ts`: Uses `https://keywords.nazaarabox.com`
- `vite.config.ts`: Proxy configured for production

### 3. Server Requirements

#### Minimum Requirements
- **Node.js**: >= 14.0.0
- **Memory**: 512MB RAM
- **Storage**: 1GB free space
- **Network**: Stable internet connection

#### Recommended Requirements
- **Node.js**: >= 16.0.0
- **Memory**: 1GB RAM
- **Storage**: 2GB free space
- **CPU**: 1 vCPU
- **Network**: High-speed internet

### 4. Database Configuration

Ensure your production database is configured:
```env
DB_HOST=s26.hosterpk.com
DB_PORT=3306
DB_USER=nazaarab_keywords
DB_PASSWORD=asdfqwer1234asdfqwer12341234
DB_NAME=nazaarab_keywords
```

## 🔧 Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error
**Cause**: Backend not running or misconfigured
**Solution**:
```bash
# Check if backend is running
curl https://keywords.nazaarabox.com/health

# Check logs
tail -f logs/app.log
```

#### 2. Few Keywords (15-30)
**Cause**: This is expected behavior for production
**Solution**: This is the optimized configuration for stability

#### 3. Rate Limiting
**Cause**: Too many requests
**Solution**: Production settings already reduce requests

#### 4. Database Connection Issues
**Cause**: Database not accessible
**Solution**:
```bash
# Test database connection
node checkDatabase.js
```

### Performance Monitoring

#### Check Server Health
```bash
# Health check
curl https://keywords.nazaarabox.com/health

# API test
curl "https://keywords.nazaarabox.com/api/google/all?query=test"
```

#### Monitor Logs
```bash
# Check application logs
tail -f logs/app.log

# Check error logs
grep "ERROR" logs/app.log
```

## 📊 Performance Metrics

### Expected Performance
- **Response Time**: 5-15 seconds
- **Success Rate**: >95%
- **Keyword Count**: 15-30 per search
- **Uptime**: >99%

### Monitoring Commands
```bash
# Test API response time
time curl "https://keywords.nazaarabox.com/api/google/all?query=test"

# Check server status
curl -I https://keywords.nazaarabox.com/health
```

## 🔄 Environment Switching

### Development Mode (Full Scraping)
```bash
export NODE_ENV=development
export ONLINE_SERVER=false
npm run dev
```

### Production Mode (Optimized Scraping)
```bash
export NODE_ENV=production
export ONLINE_SERVER=true
npm start
```

## 📝 Deployment Checklist

- [ ] Backend configured for production
- [ ] Database connection established
- [ ] Frontend pointing to production URL
- [ ] Server accessible at `https://keywords.nazaarabox.com`
- [ ] Health check endpoint responding
- [ ] API endpoints working
- [ ] Logs being generated
- [ ] Error monitoring in place

## 🎯 Best Practices

1. **Use Production Mode** for online servers
2. **Monitor server logs** regularly
3. **Set up error alerts** for critical issues
4. **Backup database** regularly
5. **Test API endpoints** after deployment
6. **Monitor performance** metrics
7. **Keep dependencies** updated

## 🔗 Related Files

- `scripts/deployProduction.js` - Production deployment script
- `controllers/googleController.js` - Main scraping logic
- `env.example` - Environment template
- `package.json` - Scripts and dependencies

---

**Note**: The production configuration prioritizes stability and consistency over maximum keyword count. This ensures reliable service while still providing valuable keyword suggestions. 