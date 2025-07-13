const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Op, fn, col, literal } = require('sequelize');

// Disable caching for all /api routes
const app = express();
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const googleRoutes = require('./routes/googleRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const bingRoutes = require('./routes/bingRoutes');
const playstoreRoutes = require('./routes/playstoreRoutes');
const appstoreRoutes = require('./routes/appstoreRoutes');
const admobRoutes = require('./routes/admobRoutes');
const savedKeywordRoutes = require('./routes/savedKeywordRoutes');
const exportRoutes = require('./routes/exportRoutes');
const { sequelize, testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/google', googleRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/bing', bingRoutes);
app.use('/api/playstore', playstoreRoutes);
app.use('/api/appstore', appstoreRoutes);
app.use('/api/admob', admobRoutes);
app.use('/api/saved-keywords', savedKeywordRoutes);
app.use('/api/export', exportRoutes);

// Global like and trending endpoints
app.post('/api/like', googleRoutes.likeKeywordSearch);
app.get('/api/trending', googleRoutes.getTrendingKeywords);
app.post('/api/view', googleRoutes.viewKeywordSearch);

// Global most views and most likes endpoints
app.get('/api/most-views', async (req, res) => {
  try {
    const { KeywordSearch } = require('./models');
    const limit = parseInt(req.query.limit, 10) || 20;
    const { platform, search_type } = req.query;
    // --- Range filter ---
    const range = req.query.range || 'week';
    let since = new Date();
    if (range === 'today') {
      since.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      since.setDate(since.getDate() - 7);
    } else if (range === 'month') {
      since.setDate(since.getDate() - 30);
    }
    // ---
    const where = { views: { [require('sequelize').Op.gt]: 0 }, created_at: { [Op.gte]: since } };
    if (platform && platform !== 'all') where.platform = platform;
    if (search_type && search_type !== 'all') where.search_type = search_type;
    
    const all = await KeywordSearch.findAll({
      where,
      order: [['views', 'DESC'], ['created_at', 'DESC']],
    });
    
    // Group by query and platform, aggregate views and likes
    const grouped = {};
    for (const k of all) {
      const key = `${k.query}|${k.platform}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...k.toJSON(),
          total_views: 0,
          total_likes: 0,
          records: []
        };
      }
      grouped[key].total_views += (k.views || 0);
      grouped[key].total_likes += (k.likes || 0);
      grouped[key].records.push(k);
    }
    
    // Convert to array and sort by total views
    const mostViewed = Object.values(grouped)
      .map(item => ({
        ...item,
        views: item.total_views, // Use aggregated views
        likes: item.total_likes, // Use aggregated likes
        created_at: item.created_at instanceof Date ? item.created_at.toISOString() : (typeof item.created_at === 'string' ? item.created_at : ''),
        // Remove internal fields
        total_views: undefined,
        total_likes: undefined,
        records: undefined
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    
    return res.json({ success: true, data: mostViewed });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/most-likes', async (req, res) => {
  try {
    const { KeywordSearch } = require('./models');
    const limit = parseInt(req.query.limit, 10) || 20;
    const { platform, search_type } = req.query;
    // --- Range filter ---
    const range = req.query.range || 'week';
    let since = new Date();
    if (range === 'today') {
      since.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      since.setDate(since.getDate() - 7);
    } else if (range === 'month') {
      since.setDate(since.getDate() - 30);
    }
    // ---
    const where = { likes: { [require('sequelize').Op.gt]: 0 }, created_at: { [Op.gte]: since } };
    if (platform && platform !== 'all') where.platform = platform;
    if (search_type && search_type !== 'all') where.search_type = search_type;
    
    const all = await KeywordSearch.findAll({
      where,
      order: [['likes', 'DESC'], ['created_at', 'DESC']],
    });
    
    // Group by query and platform, aggregate views and likes
    const grouped = {};
    for (const k of all) {
      const key = `${k.query}|${k.platform}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...k.toJSON(),
          total_views: 0,
          total_likes: 0,
          records: []
        };
      }
      grouped[key].total_views += (k.views || 0);
      grouped[key].total_likes += (k.likes || 0);
      grouped[key].records.push(k);
    }
    
    // Convert to array and sort by total likes
    const mostLiked = Object.values(grouped)
      .map(item => ({
        ...item,
        views: item.total_views, // Use aggregated views
        likes: item.total_likes, // Use aggregated likes
        created_at: item.created_at instanceof Date ? item.created_at.toISOString() : (typeof item.created_at === 'string' ? item.created_at : ''),
        // Remove internal fields
        total_views: undefined,
        total_likes: undefined,
        records: undefined
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
    
    return res.json({ success: true, data: mostLiked });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/search-activity', async (req, res) => {
  try {
    const { KeywordSearch } = require('./models');
    // Optional: support ?range=week|month|year
    const range = req.query.range || 'month';
    let dateFormat = '%Y-%m-%d';
    let since = new Date();
    if (range === 'week') {
      since.setDate(since.getDate() - 7);
    } else if (range === 'month') {
      since.setMonth(since.getMonth() - 1);
    } else if (range === 'year') {
      since.setFullYear(since.getFullYear() - 1);
    }
    // Group by date, count searches
    const results = await KeywordSearch.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), dateFormat), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: since }
      },
      group: [literal('date')],
      order: [[literal('date'), 'ASC']]
    });
    res.json({ success: true, data: results.map(r => r.toJSON()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
      global: {
        like: '/api/like',
        view: '/api/view',
        trending: '/api/trending',
        mostViews: '/api/most-views',
        mostLikes: '/api/most-likes'
      },
      google: {
        keywords: '/api/google/keywords',
        questions: '/api/google/questions',
        prepositions: '/api/google/prepositions',
        hashtags: '/api/google/hashtags',
        all: '/api/google/all'
      },
      youtube: {
        keywords: '/api/youtube/keywords',
        questions: '/api/youtube/questions',
        prepositions: '/api/youtube/prepositions',
        hashtags: '/api/youtube/hashtags',
        all: '/api/youtube/all'
      },
      bing: {
        keywords: '/api/bing/keywords',
        questions: '/api/bing/questions',
        prepositions: '/api/bing/prepositions',
        hashtags: '/api/bing/hashtags',
        all: '/api/bing/all'
      },
      playstore: {
        keywords: '/api/playstore/keywords',
        apps: '/api/playstore/apps',
        games: '/api/playstore/games',
        all: '/api/playstore/all'
      },
      appstore: {
        keywords: '/api/appstore/keywords',
        apps: '/api/appstore/apps',
        games: '/api/appstore/games',
        all: '/api/appstore/all'
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
      },
      export: {
        csv: '/api/export/keyword-searches/csv',
        json: '/api/export/keyword-searches/json',
        stats: '/api/export/stats'
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
      console.log(`   - Global trending: http://localhost:${PORT}/api/trending`);
      console.log(`   - Global most views: http://localhost:${PORT}/api/most-views`);
      console.log(`   - Global most likes: http://localhost:${PORT}/api/most-likes`);
      console.log(`   - Google keywords: http://localhost:${PORT}/api/google/keywords?query=fitness`);
      console.log(`   - Google questions: http://localhost:${PORT}/api/google/questions?query=fitness`);
      console.log(`   - Google prepositions: http://localhost:${PORT}/api/google/prepositions?query=fitness`);
      console.log(`   - Google hashtags: http://localhost:${PORT}/api/google/hashtags?query=fitness`);
      console.log(`   - Google all data: http://localhost:${PORT}/api/google/all?query=fitness`);
      console.log(`   - YouTube keywords: http://localhost:${PORT}/api/youtube/keywords?query=fitness`);
      console.log(`   - YouTube questions: http://localhost:${PORT}/api/youtube/questions?query=fitness`);
      console.log(`   - YouTube prepositions: http://localhost:${PORT}/api/youtube/prepositions?query=fitness`);
      console.log(`   - YouTube hashtags: http://localhost:${PORT}/api/youtube/hashtags?query=fitness`);
      console.log(`   - YouTube all data: http://localhost:${PORT}/api/youtube/all?query=fitness`);
      console.log(`   - Bing keywords: http://localhost:${PORT}/api/bing/keywords?query=fitness`);
      console.log(`   - Bing questions: http://localhost:${PORT}/api/bing/questions?query=fitness`);
      console.log(`   - Bing prepositions: http://localhost:${PORT}/api/bing/prepositions?query=fitness`);
      console.log(`   - Bing hashtags: http://localhost:${PORT}/api/bing/hashtags?query=fitness`);
      console.log(`   - Bing all data: http://localhost:${PORT}/api/bing/all?query=fitness`);
      console.log(`   - Play Store keywords: http://localhost:${PORT}/api/playstore/keywords?query=fitness`);
      console.log(`   - Play Store apps: http://localhost:${PORT}/api/playstore/apps?query=fitness`);
      console.log(`   - Play Store games: http://localhost:${PORT}/api/playstore/games?query=fitness`);
      console.log(`   - Play Store all data: http://localhost:${PORT}/api/playstore/all?query=fitness`);
      console.log(`   - App Store keywords: http://localhost:${PORT}/api/appstore/keywords?query=fitness`);
      console.log(`   - App Store apps: http://localhost:${PORT}/api/appstore/apps?query=fitness`);
      console.log(`   - App Store games: http://localhost:${PORT}/api/appstore/games?query=fitness`);
      console.log(`   - App Store all data: http://localhost:${PORT}/api/appstore/all?query=fitness`);
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
