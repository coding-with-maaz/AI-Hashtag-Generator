const express = require('express');
const cors = require('cors');
require('dotenv').config();

const googleRoutes = require('./routes/googleRoutes');
const admobRoutes = require('./routes/admobRoutes');
const savedKeywordRoutes = require('./routes/savedKeywordRoutes');
const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/google', googleRoutes);
app.use('/api/admob', admobRoutes);
app.use('/api/saved-keywords', savedKeywordRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Hashtag Generator Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Hashtag Generator Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      google: {
        keywords: '/api/google/keywords',
        questions: '/api/google/questions',
        prepositions: '/api/google/prepositions',
        hashtags: '/api/google/hashtags',
        all: '/api/google/all'
      },
      admob: {
        config: '/api/admob/config',
        appId: '/api/admob/app-id',
        adUnits: '/api/admob/ad-units',
        adUnit: '/api/admob/ad-units/:adType',
        adUnitId: '/api/admob/ad-units/:adType/id',
        testIds: '/api/admob/test-ids',
        productionIds: '/api/admob/production-ids',
        validate: '/api/admob/validate'
      },
      savedKeywords: {
        save: '/api/saved-keywords/save',
        unsave: '/api/saved-keywords/:id/unsave',
        getAll: '/api/saved-keywords',
        getById: '/api/saved-keywords/:id',
        update: '/api/saved-keywords/:id',
        stats: '/api/saved-keywords/stats',
        toggleFavorite: '/api/saved-keywords/:id/toggle-favorite',
        favorites: '/api/saved-keywords/favorites',
        recent: '/api/saved-keywords/recent'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist` 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Sync database models (without altering to avoid index issues)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database models synced successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 AI Hashtag Generator Backend running on http://localhost:${PORT}`);
      console.log(`📊 Available endpoints:`);
      console.log(`   - Health check: http://localhost:${PORT}/health`);
      console.log(`   - Google keywords: http://localhost:${PORT}/api/google/keywords?query=fitness`);
      console.log(`   - Google questions: http://localhost:${PORT}/api/google/questions?query=fitness`);
      console.log(`   - Google prepositions: http://localhost:${PORT}/api/google/prepositions?query=fitness`);
      console.log(`   - Google hashtags: http://localhost:${PORT}/api/google/hashtags?query=fitness`);
      console.log(`   - Google all data: http://localhost:${PORT}/api/google/all?query=fitness`);
      console.log(`   - AdMob test IDs: http://localhost:${PORT}/api/admob/test-ids`);
      console.log(`   - AdMob config: http://localhost:${PORT}/api/admob/config?environment=test`);
      console.log(`   - AdMob validation: http://localhost:${PORT}/api/admob/validate?environment=test`);
      console.log(`   - Save keyword: http://localhost:${PORT}/api/saved-keywords/save`);
      console.log(`   - Get saved keywords: http://localhost:${PORT}/api/saved-keywords`);
      console.log(`   - Google with save: http://localhost:${PORT}/api/google/all?query=fitness&save=true&location=New York`);
      console.log(`\n🗄️  Database: Connected and synced`);
      console.log(`📈 Models: Users, KeywordSearches, AdMobConfigs, SavedKeywords`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
