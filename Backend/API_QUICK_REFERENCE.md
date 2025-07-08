# API Quick Reference Card

## 🚀 Base URL: `http://localhost:3000`

## 🔍 Most Used Endpoints

### Google Search
```bash
# Keywords only
GET /api/google/keywords?query=fitness

# All data types
GET /api/google/all?query=fitness&save=true&location=New York
```

### YouTube Search
```bash
# Hashtags
GET /api/youtube/hashtags?query=fitness&hl=en&gl=US

# All data
GET /api/youtube/all?query=fitness
```

### Bing Search
```bash
# Keywords
GET /api/bing/keywords?query=fitness

# All data
GET /api/bing/all?query=fitness
```

### App Store / Play Store
```bash
# App Store keywords
GET /api/appstore/keywords?query=fitness&region=us&language=en

# Play Store apps
GET /api/playstore/apps?query=fitness&region=us&language=en
```

## 💾 Saved Keywords

```bash
# Save a search
POST /api/saved-keywords/save
{
  "platform": "google",
  "search_type": "keywords",
  "query": "fitness",
  "location": "New York"
}

# Get saved keywords
GET /api/saved-keywords?platform=google&limit=10

# Get favorites
GET /api/saved-keywords/favorites

# Get recent
GET /api/saved-keywords/recent
```

## 📱 AdMob Configuration

```bash
# Get test config
GET /api/admob/config?environment=test

# Get specific ad unit
GET /api/admob/ad-units/interstitial?environment=test

# Get all test IDs
GET /api/admob/test-ids
```

## 📤 Data Export

```bash
# Export to CSV
GET /api/export/keyword-searches/csv?startDate=2024-01-01&platform=google

# Get stats
GET /api/export/stats

# Get popular keywords
GET /api/export/popular-keywords?limit=10
```

## 🏥 System Health

```bash
# Health check
GET /health

# API documentation
GET /
```

## 📋 Common Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `query` | Search term (required) | `?query=fitness` |
| `hl` | Language code | `?hl=en` |
| `gl` | Country code | `?gl=US` |
| `region` | Store region | `?region=us` |
| `language` | Store language | `?language=en` |
| `save` | Save search to database | `?save=true` |
| `location` | Search location | `?location=New York` |
| `environment` | AdMob environment | `?environment=test` |
| `limit` | Result limit | `?limit=10` |
| `platform` | Filter by platform | `?platform=google` |

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Initialize database
npm run db:init

# Sync database models
npm run db:sync

# Seed test data
npm run db:seed
```

## 📊 Response Format

All endpoints return JSON with this structure:
```json
{
  "success": true,
  "data": {
    "keywords": [...],
    "questions": [...],
    "prepositions": [...],
    "hashtags": [...]
  },
  "metadata": {
    "query": "fitness",
    "platform": "google",
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

## ⚠️ Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

*For complete documentation, see `DASHBOARD_MANAGEMENT.md`* 