# Save/Unsave Keywords Feature

This module provides comprehensive save/unsave functionality for keyword searches with location tracking, metadata management, and advanced filtering capabilities.

## 🎯 Features

- **Save Keywords**: Save any keyword search with location and metadata
- **Location Tracking**: Geographic location for each saved search
- **Last Updated**: Automatic timestamp tracking
- **Favorites System**: Mark keywords as favorites
- **Categories & Tags**: Organize saved keywords
- **Search & Filter**: Advanced filtering and search capabilities
- **Statistics**: Usage analytics and insights
- **Multi-platform Support**: Works with all supported platforms

## 📊 Database Schema

### SavedKeywords Table
```sql
CREATE TABLE saved_keywords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  original_search_id INT,
  query VARCHAR(255) NOT NULL,
  platform ENUM('google', 'youtube', 'bing', 'facebook', 'amazon', 'appstore', 'playstore') DEFAULT 'google',
  search_type ENUM('keywords', 'questions', 'prepositions', 'hashtags', 'all') DEFAULT 'all',
  country VARCHAR(10) DEFAULT 'US',
  language VARCHAR(10) DEFAULT 'en',
  location VARCHAR(100),
  keywords JSON,
  questions JSON,
  prepositions JSON,
  hashtags JSON,
  generated_hashtags JSON,
  all_data JSON,
  title VARCHAR(200),
  description TEXT,
  tags JSON,
  category VARCHAR(50),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  last_accessed DATETIME,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (original_search_id) REFERENCES keyword_searches(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_query (user_id, query, platform, country, language)
);
```

## 🚀 API Endpoints

### Save Keywords

#### Save a Keyword Search
```http
POST /api/saved-keywords/save
Content-Type: application/json

{
  "query": "fitness",
  "platform": "google",
  "search_type": "all",
  "country": "US",
  "language": "en",
  "location": "New York, NY",
  "title": "Fitness Keywords for NYC",
  "description": "Fitness-related keywords for New York market",
  "tags": ["fitness", "health", "nyc"],
  "category": "health",
  "is_favorite": true,
  "is_public": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Keyword saved successfully",
  "data": {
    "savedKeyword": {
      "id": 1,
      "query": "fitness",
      "platform": "google",
      "title": "Fitness Keywords for NYC",
      "location": "New York, NY",
      "is_favorite": true,
      "category": "health",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_updated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Save from Google API
```http
GET /api/google/all?query=fitness&save=true&location=New York&title=Fitness Keywords&category=health
```

**Response includes saved data:**
```json
{
  "success": true,
  "data": {
    "keywords": [...],
    "questions": [...],
    "prepositions": [...],
    "hashtags": [...],
    "generatedHashtags": [...],
    "metadata": {...},
    "saved": {
      "id": 1,
      "saved_at": "2024-01-01T00:00:00.000Z",
      "location": "New York",
      "title": "Fitness Keywords"
    }
  }
}
```

### Manage Saved Keywords

#### Get All Saved Keywords
```http
GET /api/saved-keywords?page=1&limit=20&platform=google&category=health&is_favorite=true&search=fitness&sort_by=created_at&sort_order=DESC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "savedKeywords": [
      {
        "id": 1,
        "query": "fitness",
        "platform": "google",
        "search_type": "all",
        "country": "US",
        "language": "en",
        "location": "New York, NY",
        "title": "Fitness Keywords for NYC",
        "description": "Fitness-related keywords for New York market",
        "tags": ["fitness", "health", "nyc"],
        "category": "health",
        "is_favorite": true,
        "is_public": false,
        "view_count": 5,
        "share_count": 0,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "last_accessed": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "filters": {
      "platform": "google",
      "category": "health",
      "is_favorite": true,
      "search": "fitness"
    },
    "sort": {
      "by": "created_at",
      "order": "DESC"
    }
  }
}
```

#### Get Specific Saved Keyword
```http
GET /api/saved-keywords/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "savedKeyword": {
      "id": 1,
      "query": "fitness",
      "platform": "google",
      "keywords": [...],
      "questions": [...],
      "prepositions": [...],
      "hashtags": [...],
      "generated_hashtags": [...],
      "keywords_count": 150,
      "questions_count": 25,
      "prepositions_count": 30,
      "hashtags_count": 10,
      "generated_hashtags_count": 150,
      "title": "Fitness Keywords for NYC",
      "description": "Fitness-related keywords for New York market",
      "location": "New York, NY",
      "tags": ["fitness", "health", "nyc"],
      "category": "health",
      "is_favorite": true,
      "is_public": false,
      "view_count": 6,
      "share_count": 0,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "last_accessed": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Saved Keyword
```http
PUT /api/saved-keywords/1
Content-Type: application/json

{
  "title": "Updated Fitness Keywords",
  "description": "Updated description",
  "tags": ["fitness", "health", "nyc", "updated"],
  "category": "health",
  "is_favorite": true,
  "is_public": true
}
```

#### Unsave/Delete Keyword
```http
DELETE /api/saved-keywords/1/unsave
```

### Advanced Features

#### Get Statistics
```http
GET /api/saved-keywords/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_saved": 25,
    "total_favorites": 8,
    "total_public": 3,
    "platform_stats": {
      "google": 15,
      "youtube": 5,
      "facebook": 3,
      "bing": 2
    },
    "category_stats": {
      "health": 10,
      "technology": 8,
      "fashion": 4,
      "food": 3
    },
    "recent_saves": [
      {
        "id": 1,
        "query": "fitness",
        "platform": "google",
        "title": "Fitness Keywords",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Toggle Favorite
```http
POST /api/saved-keywords/1/toggle-favorite
```

#### Get Favorites Only
```http
GET /api/saved-keywords/favorites
```

#### Get Recent Saves
```http
GET /api/saved-keywords/recent?limit=10
```

#### Get by Platform
```http
GET /api/saved-keywords/by-platform/google
```

#### Get by Category
```http
GET /api/saved-keywords/by-category/health
```

## 🔍 Query Parameters

### Filtering Options
- `platform`: Filter by platform (google, youtube, bing, facebook, amazon, appstore, playstore)
- `category`: Filter by category
- `is_favorite`: Filter favorites only (true/false)
- `search`: Search in query, title, description, and tags
- `country`: Filter by country
- `language`: Filter by language

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Sorting
- `sort_by`: Field to sort by (created_at, updated_at, last_accessed, query, title)
- `sort_order`: Sort order (ASC/DESC, default: DESC)

### Save Parameters (for Google API)
- `save`: Enable saving (true/false)
- `location`: Geographic location
- `title`: Custom title
- `description`: Description
- `tags`: JSON array of tags
- `category`: Category

## 📱 Frontend Integration Examples

### JavaScript/React
```javascript
// Save a keyword
const saveKeyword = async (keywordData) => {
  const response = await fetch('/api/saved-keywords/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'fitness',
      platform: 'google',
      location: 'New York, NY',
      title: 'Fitness Keywords for NYC',
      category: 'health',
      tags: ['fitness', 'health', 'nyc']
    })
  });
  return response.json();
};

// Get saved keywords with filters
const getSavedKeywords = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/saved-keywords?${params}`);
  return response.json();
};

// Save from Google API
const searchAndSave = async (query, location) => {
  const response = await fetch(
    `/api/google/all?query=${query}&save=true&location=${location}&title=${query} Keywords`
  );
  return response.json();
};
```

### React Native
```javascript
import { Alert } from 'react-native';

const saveKeyword = async (keywordData) => {
  try {
    const response = await fetch('http://your-api.com/api/saved-keywords/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keywordData)
    });
    
    const result = await response.json();
    if (result.success) {
      Alert.alert('Success', 'Keyword saved successfully!');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to save keyword');
  }
};
```

## 🗺️ Location Tracking

### Location Features
- **Geographic Location**: Store location for each saved search
- **Location-based Filtering**: Filter saved keywords by location
- **Location Analytics**: Track popular locations for searches
- **Location Metadata**: Store additional location information

### Location Examples
```javascript
// Save with location
{
  "query": "pizza",
  "location": "New York, NY",
  "metadata": {
    "coordinates": { "lat": 40.7128, "lng": -74.0060 },
    "timezone": "America/New_York",
    "country": "US",
    "state": "NY",
    "city": "New York"
  }
}

// Save with coordinates
{
  "query": "coffee",
  "location": "San Francisco, CA",
  "metadata": {
    "coordinates": { "lat": 37.7749, "lng": -122.4194 },
    "neighborhood": "Mission District"
  }
}
```

## 📊 Analytics & Insights

### Usage Statistics
- **Total Saved**: Number of saved keywords
- **Platform Distribution**: Keywords saved per platform
- **Category Distribution**: Keywords saved per category
- **Favorite Rate**: Percentage of favorited keywords
- **View Analytics**: Most viewed saved keywords
- **Location Analytics**: Popular locations for searches

### Performance Metrics
- **Save Success Rate**: Percentage of successful saves
- **Duplicate Prevention**: Automatic duplicate detection
- **Search Performance**: Response times for saved searches
- **User Engagement**: View counts and access patterns

## 🔧 Configuration

### Environment Variables
```bash
# Database configuration (already set up)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_hashtag_generator
```

### Default Settings
- **Cache Duration**: 5 minutes for search results
- **Max Results**: 100 items per page
- **Default User**: User ID 1 (for development)
- **Auto-save**: Disabled by default (use `save=true` parameter)

## 🚨 Error Handling

### Common Errors
```json
{
  "success": false,
  "error": "Keyword already saved",
  "message": "This keyword search has already been saved"
}

{
  "success": false,
  "error": "Saved keyword not found",
  "message": "The saved keyword does not exist or you do not have permission to access it"
}

{
  "success": false,
  "error": "Invalid platform",
  "message": "Platform must be one of: google, youtube, bing, facebook, amazon, appstore, playstore"
}
```

## 🧪 Testing

### Test Endpoints
```bash
# Test save functionality
curl -X POST http://localhost:3000/api/saved-keywords/save \
  -H "Content-Type: application/json" \
  -d '{"query":"test","platform":"google","location":"Test City"}'

# Test Google API with save
curl "http://localhost:3000/api/google/all?query=test&save=true&location=Test City"

# Test get saved keywords
curl "http://localhost:3000/api/saved-keywords"

# Test statistics
curl "http://localhost:3000/api/saved-keywords/stats"
```

## 📚 Additional Resources

- [Database Schema Documentation](./DATABASE_README.md)
- [API Documentation](./README.md)
- [AdMob Integration](./ADMOB_README.md)
- [Sequelize Documentation](https://sequelize.org/)

## 🤝 Contributing

1. **Save Functionality**: Always include location and metadata
2. **Error Handling**: Implement comprehensive error handling
3. **Validation**: Validate all input parameters
4. **Testing**: Test with various platforms and locations
5. **Documentation**: Update documentation for new features 