const express = require('express');
const router = express.Router();
const {
  getBingKeywords,
  getBingQuestions,
  getBingPrepositions,
  getBingHashtags
} = require('../controllers/bingController');

router.get('/keywords', getBingKeywords);
router.get('/questions', getBingQuestions);
router.get('/prepositions', getBingPrepositions);
router.get('/hashtags', getBingHashtags);
router.get('/all', getBingKeywords);

// Like a keyword search
router.post('/like', bingController.likeKeywordSearch);

// Get trending keywords
router.get('/trending', bingController.getTrendingKeywords);

// Increment views for a keyword search
router.post('/view', bingController.viewKeywordSearch);

// Export handlers for global use
module.exports = router;
module.exports.likeKeywordSearch = bingController.likeKeywordSearch;
module.exports.getTrendingKeywords = bingController.getTrendingKeywords;
module.exports.viewKeywordSearch = bingController.viewKeywordSearch; 