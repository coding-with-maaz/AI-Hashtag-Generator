const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');

// Middleware to validate query parameter
const validateQuery = (req, res, next) => {
  const { query } = req.query;
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Missing or empty query parameter',
      message: 'Please provide a valid query parameter (e.g., ?query=fitness)'
    });
  }
  next();
};

// Route: GET /api/google/keywords
// Description: Get only keywords for the given query
router.get('/keywords', validateQuery, googleController.getKeywords);

// Route: GET /api/google/questions
// Description: Get only questions for the given query
router.get('/questions', validateQuery, googleController.getQuestions);

// Route: GET /api/google/prepositions
// Description: Get only prepositions for the given query
router.get('/prepositions', validateQuery, googleController.getPrepositions);

// Route: GET /api/google/hashtags
// Description: Get only hashtags for the given query
router.get('/hashtags', validateQuery, googleController.getHashtags);

// Route: GET /api/google/all
// Description: Get all data (keywords, questions, prepositions, hashtags) for the given query
router.get('/all', validateQuery, googleController.getAllData);

// Route: GET /api/google
// Description: Legacy endpoint - redirects to /all
router.get('/', validateQuery, (req, res) => {
  res.redirect(`/api/google/all?${new URLSearchParams(req.query).toString()}`);
});

// Like a keyword search
router.post('/like', googleController.likeKeywordSearch);

// Get trending keywords
router.get('/trending', googleController.getTrendingKeywords);

// Increment views for a keyword search
router.post('/view', googleController.viewKeywordSearch);

// Export handlers for global use
module.exports = router;
module.exports.likeKeywordSearch = googleController.likeKeywordSearch;
module.exports.getTrendingKeywords = googleController.getTrendingKeywords;
module.exports.viewKeywordSearch = googleController.viewKeywordSearch; 