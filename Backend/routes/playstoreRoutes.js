const express = require('express');
const router = express.Router();
const {
  getPlayStoreKeywords,
  getPlayStoreApps,
  getPlayStoreGames,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
} = require('../controllers/playstoreController');

/**
 * @route GET /api/playstore/keywords
 * @desc Get Play Store keyword suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/keywords', getPlayStoreKeywords);

/**
 * @route GET /api/playstore/apps
 * @desc Get Play Store app suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/apps', getPlayStoreApps);

/**
 * @route GET /api/playstore/games
 * @desc Get Play Store game suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/games', getPlayStoreGames);

/**
 * @route GET /api/playstore/all
 * @desc Get all Play Store data (keywords, apps, games)
 * @access Public
 * @query {string} query - Search query
 * @query {string} region - Region code (default: 'us')
 * @query {string} language - Language code (default: 'en')
 */
router.get('/all', getPlayStoreKeywords);

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