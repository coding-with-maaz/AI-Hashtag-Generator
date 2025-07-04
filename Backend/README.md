# AI Hashtag Generator Backend API

A modular backend API for generating keywords, questions, prepositions, and hashtags from Google search suggestions.

## 🚀 Features

- **Modular Architecture**: Separate routes and controllers for different data types
- **Caching**: Built-in caching to avoid repeated scraping
- **Multiple Endpoints**: Dedicated endpoints for keywords, questions, prepositions, and hashtags
- **Error Handling**: Comprehensive error handling and validation
- **Rate Limiting**: Built-in request validation and caching
- **CORS Support**: Cross-origin resource sharing enabled

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── routes/
│   └── googleRoutes.js   # Google API routes
└── controllers/
    └── googleController.js # Google scraping logic
```

## 🛠️ Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health Check
```
GET /health
```

### Google API Endpoints

All Google endpoints accept the following query parameters:
- `query` (required): The search term
- `country` (optional): Country code (default: 'US')
- `language` (optional): Language code (default: 'en')

#### 1. Keywords Only
```
GET /api/google/keywords?query=fitness
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": ["fitness", "fitness tracker", "fitness app", ...],
    "count": 150,
    "metadata": {
      "query": "fitness",
      "country": "US",
      "language": "en",
      "scrapedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 2. Questions Only
```
GET /api/google/questions?query=fitness
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": ["what fitness", "how fitness", "why fitness", ...],
    "count": 25,
    "metadata": {
      "query": "fitness",
      "country": "US",
      "language": "en",
      "scrapedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 3. Prepositions Only
```
GET /api/google/prepositions?query=fitness
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prepositions": ["fitness for", "fitness with", "fitness about", ...],
    "count": 30,
    "metadata": {
      "query": "fitness",
      "country": "US",
      "language": "en",
      "scrapedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 4. Hashtags Only
```
GET /api/google/hashtags?query=fitness
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hashtags": ["#fitness", "#fitnessmotivation"],
    "generatedHashtags": ["#fitness", "#fitnesstracker", "#fitnessapp", ...],
    "count": {
      "hashtags": 2,
      "generatedHashtags": 150,
      "total": 152
    },
    "metadata": {
      "query": "fitness",
      "country": "US",
      "language": "en",
      "scrapedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 5. All Data
```
GET /api/google/all?query=fitness
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": ["fitness", "fitness tracker", ...],
    "questions": ["what fitness", "how fitness", ...],
    "prepositions": ["fitness for", "fitness with", ...],
    "hashtags": ["#fitness", "#fitnessmotivation"],
    "generatedHashtags": ["#fitness", "#fitnesstracker", ...],
    "metadata": {
      "query": "fitness",
      "country": "US",
      "language": "en",
      "totalKeywords": 150,
      "totalQuestions": 25,
      "totalPrepositions": 30,
      "totalHashtags": 2,
      "totalGeneratedHashtags": 150,
      "scrapedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Caching
- Cache duration: 5 minutes
- Cache is shared across all endpoints for the same query

## 📊 Example Usage

### Using cURL

```bash
# Get keywords only
curl "http://localhost:3000/api/google/keywords?query=gaming"

# Get questions only
curl "http://localhost:3000/api/google/questions?query=gaming"

# Get prepositions only
curl "http://localhost:3000/api/google/prepositions?query=gaming"

# Get hashtags only
curl "http://localhost:3000/api/google/hashtags?query=gaming"

# Get all data
curl "http://localhost:3000/api/google/all?query=gaming"

# With custom country and language
curl "http://localhost:3000/api/google/keywords?query=fitness&country=GB&language=en"
```

### Using JavaScript/Fetch

```javascript
// Get keywords
const response = await fetch('http://localhost:3000/api/google/keywords?query=fitness');
const data = await response.json();
console.log(data.data.keywords);

// Get questions
const questionsResponse = await fetch('http://localhost:3000/api/google/questions?query=fitness');
const questionsData = await questionsResponse.json();
console.log(questionsData.data.questions);

// Get hashtags
const hashtagsResponse = await fetch('http://localhost:3000/api/google/hashtags?query=fitness');
const hashtagsData = await hashtagsResponse.json();
console.log(hashtagsData.data.generatedHashtags);
```

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error scenarios:
- Missing query parameter
- Invalid query (empty or too short)
- Scraping failures
- Server errors

## 🚀 Performance

- **Caching**: Results are cached for 5 minutes to avoid repeated scraping
- **Concurrent Requests**: Multiple requests for the same query return cached data
- **Memory Efficient**: Uses Set for deduplication and Map for caching

## 🔒 Legal & Ethics

- Uses Google's public autocomplete API
- Respects rate limits and terms of service
- Includes proper user agent and headers
- Caching reduces server load

## 📝 License

MIT License - see main project license

## 👨‍💻 Author

Developed by **[Dr Tools]**
[📫 drtoolofficial@gmail.com](mailto:drtoolofficial@gmail.com) 