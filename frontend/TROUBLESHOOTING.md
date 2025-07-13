# Troubleshooting Guide

## 🚨 500 Internal Server Error

If you're getting 500 errors on all platforms, follow these steps:

### 1. Check Server Status

Run the API test script:
```bash
cd keywords_tools
npm run test:api
```

### 2. Frontend Debugging

The Search page now includes a **Server Status** component that shows:
- ✅ **Online**: Server is accessible
- ❌ **Offline**: Cannot connect to server
- ⚠️ **Error**: Server responding with errors

### 3. Common Issues & Solutions

#### Issue: 500 Internal Server Error
**Symptoms**: All API calls return 500 status
**Causes**:
- Backend server not running
- Database connection issues
- Environment configuration problems
- Missing dependencies

**Solutions**:
1. **Check if backend is running**:
   ```bash
   curl https://keywords.nazaarabox.com/health
   ```

2. **Verify database connection**:
   ```bash
   cd backend
   node checkDatabase.js
   ```

3. **Check environment configuration**:
   ```bash
   cd backend
   npm run deploy:production
   ```

#### Issue: Connection Timeout
**Symptoms**: Requests timeout after 30 seconds
**Solutions**:
- Check internet connection
- Verify server is accessible
- Try again later (server might be overloaded)

#### Issue: CORS Errors
**Symptoms**: Browser console shows CORS errors
**Solutions**:
- Backend CORS is already configured
- Check if server is running on correct port
- Verify API_BASE_URL is correct

### 4. Backend Debugging

#### Check Backend Logs
```bash
cd backend
npm start
# Look for error messages in console
```

#### Test Individual Endpoints
```bash
# Health check
curl https://keywords.nazaarabox.com/health

# Google API
curl "https://keywords.nazaarabox.com/api/google/all?query=test"

# Bing API
curl "https://keywords.nazaarabox.com/api/bing/all?query=test&mkt=en-US"
```

### 5. Environment Configuration

#### Frontend Configuration
Check `keywords_tools/src/lib/api.ts`:
```typescript
export const API_BASE_URL = "https://keywords.nazaarabox.com";
```

#### Backend Configuration
Check `backend/.env`:
```env
NODE_ENV=production
ONLINE_SERVER=true
PORT=3000
```

### 6. Database Issues

#### Check Database Connection
```bash
cd backend
node checkDatabase.js
```

#### Common Database Errors:
- **Connection refused**: Database server not running
- **Access denied**: Wrong credentials
- **Database not found**: Database doesn't exist

### 7. Network Issues

#### Test Network Connectivity
```bash
# Test DNS resolution
nslookup keywords.nazaarabox.com

# Test HTTP connectivity
curl -I https://keywords.nazaarabox.com
```

#### Firewall Issues
- Check if port 443 (HTTPS) is accessible
- Verify no firewall blocking requests
- Try from different network

### 8. Browser Debugging

#### Open Browser Developer Tools
1. Press `F12` or `Ctrl+Shift+I`
2. Go to **Network** tab
3. Make a search request
4. Check the failed request details

#### Common Browser Issues:
- **CORS errors**: Backend CORS configuration
- **SSL errors**: Certificate issues
- **Timeout errors**: Network/server issues

### 9. Production vs Development

#### Development Mode (Localhost)
```bash
# Frontend
cd keywords_tools
npm run dev

# Backend
cd backend
npm run dev
```

#### Production Mode (Online Server)
```bash
# Frontend already configured for production
# Backend needs to be deployed to server
```

### 10. Quick Fixes

#### Reset Frontend Configuration
```bash
cd keywords_tools
# Check if API_BASE_URL is correct
cat src/lib/api.ts
```

#### Reset Backend Configuration
```bash
cd backend
npm run deploy:production
npm start
```

#### Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Clear cache and cookies
3. Refresh page

### 11. Monitoring & Logs

#### Frontend Logs
- Open browser console (`F12`)
- Look for error messages
- Check network requests

#### Backend Logs
```bash
cd backend
npm start
# Watch console output for errors
```

### 12. Emergency Fallback

If the production server is down:

1. **Use Local Development**:
   ```bash
   # Update frontend to use localhost
   # Edit keywords_tools/src/lib/api.ts
   export const API_BASE_URL = "http://localhost:3000";
   ```

2. **Start Local Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Local Frontend**:
   ```bash
   cd keywords_tools
   npm run dev
   ```

### 13. Contact Support

If issues persist:
1. Check server status at `https://keywords.nazaarabox.com/health`
2. Review error logs
3. Test with different queries
4. Check server resources (CPU, memory, disk)

### 14. Performance Tips

#### For Better Performance:
- Use production mode for online servers
- Implement caching for repeated queries
- Monitor server resources
- Use CDN for static assets

#### For Development:
- Use development mode for full scraping
- Enable detailed logging
- Use local database for testing

---

**Note**: The 500 errors are likely due to the backend server not being properly configured or running. Follow the deployment guide to ensure the server is correctly set up for production. 