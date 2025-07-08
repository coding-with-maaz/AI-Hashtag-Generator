const express = require('express');
const router = express.Router();
const {
  getPlayStoreKeywords,
  getPlayStoreApps,
  getPlayStoreGames
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
router.post('/like', playstoreController.likeKeywordSearch);

// Get trending keywords
router.get('/trending', playstoreController.getTrendingKeywords);

// Increment views for a keyword search
router.post('/view', playstoreController.viewKeywordSearch);

// Export handlers for global use
module.exports = router;
module.exports.likeKeywordSearch = playstoreController.likeKeywordSearch;
module.exports.getTrendingKeywords = playstoreController.getTrendingKeywords;
module.exports.viewKeywordSearch = playstoreController.viewKeywordSearch; 