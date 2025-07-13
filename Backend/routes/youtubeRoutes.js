const express = require('express');
const router = express.Router();
const {
  getYouTubeKeywords,
  getYouTubeQuestions,
  getYouTubePrepositions,
  getYouTubeHashtags,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
} = require('../controllers/youtubeController');

/**
 * @route GET /api/youtube/keywords
 * @desc Get YouTube keyword suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} hl - Language code (default: 'en')
 * @query {string} gl - Country code (default: 'US')
 */
router.get('/keywords', getYouTubeKeywords);

/**
 * @route GET /api/youtube/questions
 * @desc Get YouTube question suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} hl - Language code (default: 'en')
 * @query {string} gl - Country code (default: 'US')
 */
router.get('/questions', getYouTubeQuestions);

/**
 * @route GET /api/youtube/prepositions
 * @desc Get YouTube preposition suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} hl - Language code (default: 'en')
 * @query {string} gl - Country code (default: 'US')
 */
router.get('/prepositions', getYouTubePrepositions);

/**
 * @route GET /api/youtube/hashtags
 * @desc Get YouTube hashtag suggestions
 * @access Public
 * @query {string} query - Search query
 * @query {string} hl - Language code (default: 'en')
 * @query {string} gl - Country code (default: 'US')
 */
router.get('/hashtags', getYouTubeHashtags);

/**
 * @route GET /api/youtube/all
 * @desc Get all YouTube data (keywords, questions, prepositions, hashtags)
 * @access Public
 * @query {string} query - Search query
 * @query {string} hl - Language code (default: 'en')
 * @query {string} gl - Country code (default: 'US')
 */
router.get('/all', getYouTubeKeywords);

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