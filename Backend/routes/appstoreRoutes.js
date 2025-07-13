const express = require('express');
const router = express.Router();
const {
  getAppStoreKeywords,
  getAppStoreApps,
  getAppStoreGames,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
} = require('../controllers/appstoreController');

/**
 * @route GET /api/appstore/keywords
 * @desc Get App Store keyword suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/keywords', getAppStoreKeywords);

/**
 * @route GET /api/appstore/apps
 * @desc Get App Store app suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/apps', getAppStoreApps);

/**
 * @route GET /api/appstore/games
 * @desc Get App Store game suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/games', getAppStoreGames);

/**
 * @route GET /api/appstore/all
 * @desc Get all App Store data (keywords, apps, games)
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/all', getAppStoreKeywords);

// Like a keyword search
router.post('/like', likeKeywordSearch);

// Get trending keywords
router.get('/trending', getTrendingKeywords);

// Increment views for a keyword search
router.post('/view', viewKeywordSearch);

// Export handlers for global use
module.exports = router;
module.exports.likeKeywordSearch = likeKeywordSearch;
module.exports.getTrendingKeywords = getTrendingKeywords;
module.exports.viewKeywordSearch = viewKeywordSearch; 