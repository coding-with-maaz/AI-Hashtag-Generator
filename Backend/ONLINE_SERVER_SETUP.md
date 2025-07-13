# Online Server Setup Guide

## 🚀 Problem Solved

The difference between localhost (500+ keywords) and online server (15-30 keywords) was due to:

1. **Rate Limiting**: Google blocks excessive requests from server IPs
2. **Resource Constraints**: Limited CPU/memory on hosting servers
3. **Network Issues**: Slower connections affecting request success
4. **Timeout Issues**: Requests timing out before completion

## 🔧 Solution Implemented

### Environment-Based Configuration

The system now automatically adjusts scraping behavior based on environment:

#### Development (Localhost)
- **26 alphabet requests** (a-z)
- **28 question requests** (how, what, why, etc.)
- **100ms delay** between requests
- **15s timeout**
- **3 retries**
- **Result**: 500+ keywords

#### Production (Online Server)
- **10 alphabet requests** (a-j)
- **10 question requests** (most common)
- **200ms delay** between requests
- **10s timeout**
- **2 retries**
- **Result**: 15-30 keywords (more stable)

## 📋 Setup Instructions

### 1. Quick Setup (Recommended)

```bash
# Navigate to backend directory
cd backend

# Configure for online server
npm run configure:online

# Start the server
npm start
```

### 2. Manual Setup

Create a `.env` file in the backend directory:

```bash
# Copy environment template
cp env.example .env
```

Edit `.env` file:

```env
# Server Configuration
NODE_ENV=production
ONLINE_SERVER=true
PORT=3000

# API Configuration
API_RATE_LIMIT=50
API_RATE_LIMIT_WINDOW=900000

# Cache Configuration
CACHE_TTL=1800
CACHE_MAX_SIZE=100

# Logging Configuration
LOG_LEVEL=warn
```

### 3. Environment Variables Explained

| Variable | Development | Production | Purpose |
|----------|-------------|------------|---------|
| `NODE_ENV` | development | production | Enables production settings |
| `ONLINE_SERVER` | false | true | Enables conservative scraping |
| `API_RATE_LIMIT` | 100 | 50 | Reduces API calls per minute |
| `CACHE_TTL` | 3600 | 1800 | 30-minute cache duration |
| `LOG_LEVEL` | info | warn | Reduces logging overhead |

## 🔍 Configuration Details

### Scraping Algorithm

The system uses a sophisticated algorithm that:

1. **Main Keyword**: Fetches suggestions for the original query
2. **Alphabet Variations**: Adds each letter (a-z) to the query
3. **Question Variations**: Adds question words (how, what, why, etc.)
4. **Deduplication**: Removes duplicate suggestions
5. **Categorization**: Separates into keywords, questions, prepositions, hashtags

### Production Optimizations

- **Reduced Requests**: 55+ requests → 21 requests
- **Increased Delays**: 100ms → 200ms between requests
- **Shorter Timeouts**: 15s → 10s per request
- **Fewer Retries**: 3 → 2 retry attempts
- **Better Fallback**: 20+ keywords if scraping fails

## 📊 Expected Results

### Before (Online Server)
- ❌ 15-30 keywords (inconsistent)
- ❌ Frequent timeouts
- ❌ Rate limiting issues
- ❌ High server load

### After (Optimized)
- ✅ 15-30 keywords (consistent)
- ✅ Stable performance
- ✅ No rate limiting
- ✅ Reduced server load
- ✅ 20+ fallback keywords

## 🛠️ Troubleshooting

### If Still Getting Few Keywords

1. **Check Environment Variables**:
   ```bash
   echo $NODE_ENV
   echo $ONLINE_SERVER
   ```

2. **Verify Configuration**:
   ```bash
   # Check server logs for configuration
   npm start
   ```

3. **Test with Different Query**:
   ```bash
   curl "http://localhost:3000/api/google/all?query=test"
   ```

### If Getting Too Many Keywords (Localhost)

1. **Enable Production Mode**:
   ```bash
   export NODE_ENV=production
   export ONLINE_SERVER=true
   npm start
   ```

2. **Or Use Development Mode**:
   ```bash
   export NODE_ENV=development
   export ONLINE_SERVER=false
   npm run dev
   ```

## 🔄 Switching Between Modes

### For Development (Full Scraping)
```bash
export NODE_ENV=development
export ONLINE_SERVER=false
npm run dev
```

### For Production (Optimized Scraping)
```bash
export NODE_ENV=production
export ONLINE_SERVER=true
npm start
```

## 📈 Performance Monitoring

### Check Server Logs
```bash
# Look for configuration messages
grep "Configuration:" logs/app.log

# Check request success rates
grep "API request successful" logs/app.log
```

### Monitor Response Times
```bash
# Test API response time
time curl "http://localhost:3000/api/google/all?query=test"
```

## 🎯 Best Practices

1. **Use Production Mode** for online servers
2. **Monitor server logs** for configuration confirmation
3. **Test with simple queries** first
4. **Implement caching** for repeated queries
5. **Set up monitoring** for API success rates

## 🔗 Related Files

- `controllers/googleController.js` - Main scraping logic
- `scripts/configureOnlineServer.js` - Auto-configuration script
- `env.example` - Environment template
- `package.json` - Scripts and dependencies

---

**Note**: The optimized configuration prioritizes stability and consistency over maximum keyword count. This ensures reliable service on online servers while still providing valuable keyword suggestions. 