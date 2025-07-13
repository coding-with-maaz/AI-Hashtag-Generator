const express = require('express');
const router = express.Router();
const {
  getBingKeywords,
  getBingQuestions,
  getBingPrepositions,
  getBingHashtags,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
} = require('../controllers/bingController');

router.get('/keywords', getBingKeywords);
router.get('/questions', getBingQuestions);
router.get('/prepositions', getBingPrepositions);
router.get('/hashtags', getBingHashtags);
router.get('/all', getBingKeywords);

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