const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

/**
 * @route GET /api/export/keyword-searches/csv
 * @desc Export KeywordSearch data to CSV
 * @access Public (for now, can add auth later)
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 * @query {string} platform - Platform filter (google, youtube, etc.)
 * @query {string} searchType - Search type filter (keywords, questions, etc.)
 * @query {string} status - Status filter (success, error, partial)
 * @query {string} country - Country filter
 * @query {string} language - Language filter
 * @query {number} userId - User ID filter
 * @query {number} limit - Maximum records to export (default: 10000)
 * @query {boolean} includeMetadata - Include metadata columns (default: false)
 */
router.get('/keyword-searches/csv', exportController.exportKeywordSearchesToCSV);

/**
 * @route GET /api/export/keyword-searches/json
 * @desc Export KeywordSearch data to JSON
 * @access Public (for now, can add auth later)
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 * @query {string} platform - Platform filter (google, youtube, etc.)
 * @query {string} searchType - Search type filter (keywords, questions, etc.)
 * @query {string} status - Status filter (success, error, partial)
 * @query {string} country - Country filter
 * @query {string} language - Language filter
 * @query {number} userId - User ID filter
 * @query {number} limit - Maximum records to export (default: 1000)
 * @query {boolean} includeFullData - Include full data arrays (default: false)
 */
router.get('/keyword-searches/json', exportController.exportKeywordSearchesToJSON);

/**
 * @route GET /api/export/stats
 * @desc Get export statistics
 * @access Public (for now, can add auth later)
 */
router.get('/stats', exportController.getExportStats);

/**
 * @route GET /api/export/recent-searches
 * @desc Get recent searches for dashboard
 * @access Public (for now, can add auth later)
 * @query {number} limit - Number of recent searches to return (default: 10)
 */
router.get('/recent-searches', exportController.getRecentSearches);

/**
 * @route GET /api/export/popular-keywords
 * @desc Get popular keywords for dashboard
 * @access Public (for now, can add auth later)
 * @query {number} limit - Number of popular keywords to return (default: 10)
 */
router.get('/popular-keywords', exportController.getPopularKeywords);

/**
 * @route GET /api/export/search-history
 * @desc Get search history for dashboard
 * @access Public (for now, can add auth later)
 * @query {number} limit - Number of searches to return (default: 10)
 * @query {number} days - Number of days to look back (default: 30)
 */
router.get('/search-history', exportController.getSearchHistory);

module.exports = router; 