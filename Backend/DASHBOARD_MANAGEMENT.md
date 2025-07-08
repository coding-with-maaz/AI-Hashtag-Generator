# AI Hashtag Generator - Backend Dashboard Management

## 🏗️ System Architecture

### Technology Stack
- **Runtime**: Node.js (>=14.0.0)
- **Framework**: Express.js 4.18.2
- **Database**: MySQL with Sequelize ORM
- **Authentication**: bcryptjs (for future implementation)
- **Web Scraping**: Puppeteer with stealth plugin
- **HTTP Client**: Axios, node-fetch
- **Data Export**: CSV Writer
- **CORS**: Enabled for cross-origin requests

### Database Models
1. **User** - User management and authentication
2. **KeywordSearch** - Search history and results storage
3. **SavedKeyword** - User-saved keyword collections
4. **AdMobConfig** - AdMob configuration management

---

## 📊 API Endpoints Overview

### Base URL: `http://localhost:3000`

### 🔍 Core Search Endpoints

#### Google Search API (`/api/google`)
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keywords` | GET | Get keyword suggestions | `query` (required) |
| `/questions` | GET | Get question suggestions | `query` (required) |
| `/prepositions` | GET | Get preposition suggestions | `query` (required) |
| `/hashtags` | GET | Get hashtag suggestions | `query` (required) |
| `/all` | GET | Get all data types | `query` (required), `save`, `location` |

#### YouTube Search API (`/api/youtube`)
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keywords` | GET | Get YouTube keyword suggestions | `query` (required), `hl`, `gl` |
| `/questions` | GET | Get YouTube question suggestions | `query` (required), `hl`, `gl` |
| `/prepositions` | GET | Get YouTube preposition suggestions | `query` (required), `hl`, `gl` |
| `/hashtags` | GET | Get YouTube hashtag suggestions | `query` (required), `hl`, `gl` |
| `/all` | GET | Get all YouTube data | `query` (required), `hl`, `gl` |

#### Bing Search API (`/api/bing`)
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keywords` | GET | Get Bing keyword suggestions | `query` (required) |
| `/questions` | GET | Get Bing question suggestions | `query` (required) |
| `/prepositions` | GET | Get Bing preposition suggestions | `query` (required) |
| `/hashtags` | GET | Get Bing hashtag suggestions | `query` (required) |
| `/all` | GET | Get all Bing data | `query` (required) |

#### Play Store API (`/api/playstore`)
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keywords` | GET | Get Play Store keyword suggestions | `query` (required), `region`, `language` |
| `/apps` | GET | Get Play Store app suggestions | `query` (required), `region`, `language` |
| `/games` | GET | Get Play Store game suggestions | `query` (required), `region`, `language` |
| `/all` | GET | Get all Play Store data | `query` (required), `region`, `language` |

#### App Store API (`/api/appstore`)
| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keywords` | GET | Get App Store keyword suggestions | `query` (required), `region`, `language` |
| `/apps` | GET | Get App Store app suggestions | `query` (required), `region`, `language` |
| `/games` | GET | Get App Store game suggestions | `query` (required), `region`, `language` |
| `/all` | GET | Get all App Store data | `query` (required), `region`, `language` |

### 💾 Saved Keywords Management (`/api/saved-keywords`)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/save` | POST | Save a keyword search | `platform`, `search_type`, `query`, `location`, `data` |
| `/` | GET | Get all saved keywords | `platform`, `search_type`, `category`, `is_favorite`, `page`, `limit` |
| `/:id` | GET | Get specific saved keyword | `id` (path) |
| `/:id` | PUT | Update saved keyword | `id` (path), `title`, `description`, `tags` |
| `/:id/unsave` | DELETE | Delete saved keyword | `id` (path) |
| `/:id/toggle-favorite` | POST | Toggle favorite status | `id` (path) |
| `/:id/merge-data` | POST | Merge new data with existing | `id` (path), `data` |
| `/stats` | GET | Get saved keywords statistics | - |
| `/favorites` | GET | Get favorite keywords only | `platform`, `limit` |
| `/recent` | GET | Get recent keywords | `platform`, `limit` |
| `/by-platform/:platform` | GET | Get keywords by platform | `platform` (path) |
| `/by-category/:category` | GET | Get keywords by category | `category` (path) |

### 📱 AdMob Configuration (`/api/admob`)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/config` | GET | Get complete AdMob config | `environment` (test/production) |
| `/app-id` | GET | Get AdMob App ID | `environment` (test/production) |
| `/ad-units` | GET | Get all ad units | `environment` (test/production) |
| `/ad-units/:adType` | GET | Get specific ad unit | `environment`, `adType` (path) |
| `/ad-units/:adType/id` | GET | Get ad unit ID only | `environment`, `adType` (path) |
| `/test-ids` | GET | Get all test ad unit IDs | - |
| `/production-ids` | GET | Get all production ad unit IDs | - |
| `/validate` | GET | Validate ad unit configuration | `environment` |
| `/app-id` | PUT | Update AdMob App ID | `environment`, `appId` |
| `/ad-units/:adType` | PUT | Update specific ad unit | `environment`, `adType`, `adUnitId` |
| `/config` | PUT | Update complete config | `environment`, `config` |

**Valid Ad Types**: `appOpen`, `adaptiveBanner`, `fixedBanner`, `interstitial`, `rewarded`, `rewardedInterstitial`, `native`, `nativeVideo`

### 📤 Data Export (`/api/export`)

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/keyword-searches/csv` | GET | Export to CSV | `startDate`, `endDate`, `platform`, `searchType`, `status`, `country`, `language`, `userId`, `limit`, `includeMetadata` |
| `/keyword-searches/json` | GET | Export to JSON | `startDate`, `endDate`, `platform`, `searchType`, `status`, `country`, `language`, `userId`, `limit`, `includeFullData` |
| `/stats` | GET | Get export statistics | - |
| `/recent-searches` | GET | Get recent searches | `limit` |
| `/popular-keywords` | GET | Get popular keywords | `limit` |
| `/search-history` | GET | Get search history | `limit`, `days` |

### 🏥 System Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/` | GET | API documentation and endpoint list |

---

## 🗄️ Database Schema

### User Model
```sql
- id (Primary Key)
- username
- email
- password_hash
- role
- is_active
- created_at
- updated_at
```

### KeywordSearch Model
```sql
- id (Primary Key)
- user_id (Foreign Key)
- platform (google, youtube, bing, etc.)
- search_type (keywords, questions, prepositions, hashtags, all)
- query
- location
- country
- language
- status (success, error, partial)
- keywords_data (JSON)
- questions_data (JSON)
- prepositions_data (JSON)
- hashtags_data (JSON)
- metadata (JSON)
- created_at
- updated_at
```

### SavedKeyword Model
```sql
- id (Primary Key)
- user_id (Foreign Key)
- original_search_id (Foreign Key)
- platform
- search_type
- query
- title
- description
- tags (JSON)
- keywords_data (JSON)
- questions_data (JSON)
- prepositions_data (JSON)
- hashtags_data (JSON)
- is_favorite
- category
- location
- created_at
- updated_at
```

### AdMobConfig Model
```sql
- id (Primary Key)
- user_id (Foreign Key)
- created_by (Foreign Key)
- environment (test, production)
- app_id
- app_open_id
- adaptive_banner_id
- fixed_banner_id
- interstitial_id
- rewarded_id
- rewarded_interstitial_id
- native_id
- native_video_id
- is_active
- created_at
- updated_at
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14.0.0
- MySQL Database
- Environment variables configured

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

### Database Setup
```bash
# Initialize database
npm run db:init

# Sync models
npm run db:sync

# Seed test data
npm run db:seed
```

### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📈 Dashboard Features

### 1. Search Analytics
- Track search queries across all platforms
- Monitor success/error rates
- Analyze popular keywords and trends
- Geographic distribution of searches

### 2. Saved Keywords Management
- Save and organize keyword searches
- Categorize and tag saved keywords
- Favorite important searches
- Merge data from multiple searches

### 3. AdMob Configuration
- Manage test and production ad unit IDs
- Validate ad unit configurations
- Switch between environments
- Track ad performance metrics

### 4. Data Export
- Export search data to CSV/JSON
- Filter exports by date, platform, type
- Include metadata for analysis
- Generate reports and statistics

### 5. User Management
- User authentication and authorization
- Role-based access control
- User activity tracking
- Search history per user

---

## 🔧 API Usage Examples

### Basic Search
```bash
# Google keywords
curl "http://localhost:3000/api/google/keywords?query=fitness"

# YouTube hashtags
curl "http://localhost:3000/api/youtube/hashtags?query=fitness&hl=en&gl=US"

# Save search with location
curl "http://localhost:3000/api/google/all?query=fitness&save=true&location=New York"
```

### Saved Keywords
```bash
# Save a keyword search
curl -X POST "http://localhost:3000/api/saved-keywords/save" \
  -H "Content-Type: application/json" \
  -d '{"platform":"google","search_type":"keywords","query":"fitness","location":"New York"}'

# Get saved keywords
curl "http://localhost:3000/api/saved-keywords?platform=google&limit=10"
```

### AdMob Configuration
```bash
# Get test configuration
curl "http://localhost:3000/api/admob/config?environment=test"

# Get specific ad unit
curl "http://localhost:3000/api/admob/ad-units/interstitial?environment=test"
```

### Data Export
```bash
# Export to CSV
curl "http://localhost:3000/api/export/keyword-searches/csv?startDate=2024-01-01&platform=google"

# Get statistics
curl "http://localhost:3000/api/export/stats"
```

---

## 🛡️ Security & Performance

### Rate Limiting
- Configurable rate limits per endpoint
- IP-based throttling
- User-based limits (future)

### Error Handling
- Comprehensive error responses
- Logging and monitoring
- Graceful degradation

### Data Validation
- Input sanitization
- Query parameter validation
- SQL injection prevention

### Caching
- Response caching for static data
- Database query optimization
- CDN integration ready

---

## 📊 Monitoring & Analytics

### Health Checks
- Database connectivity
- External API status
- System resource usage

### Performance Metrics
- Response times
- Throughput rates
- Error rates
- User activity

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Audit trails

---

## 🔮 Future Enhancements

### Planned Features
- User authentication with JWT
- Advanced analytics dashboard
- Real-time notifications
- API rate limiting per user
- Bulk operations
- Advanced search filters
- Machine learning integration
- Mobile app support

### Scalability
- Horizontal scaling support
- Load balancing
- Database sharding
- Microservices architecture
- Container deployment
- Cloud integration

---

## 📞 Support & Documentation

### API Documentation
- Interactive API docs (Swagger/OpenAPI)
- Code examples
- SDK libraries
- Integration guides

### Monitoring Tools
- Application performance monitoring
- Error tracking
- User analytics
- Business metrics

### Development Tools
- Automated testing
- CI/CD pipelines
- Code quality checks
- Security scanning

---

*Last Updated: December 2024*
*Version: 1.0.0* 