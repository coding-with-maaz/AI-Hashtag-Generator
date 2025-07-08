const express = require('express');
const router = express.Router();
const savedKeywordController = require('../controllers/savedKeywordController');

// Middleware to validate platform parameter
const validatePlatform = (req, res, next) => {
  const { platform } = req.query;
  const validPlatforms = ['google', 'youtube', 'bing', 'facebook', 'amazon', 'appstore', 'playstore'];
  
  if (platform && !validPlatforms.includes(platform)) {
    return res.status(400).json({
      error: 'Invalid platform',
      message: `Platform must be one of: ${validPlatforms.join(', ')}`,
      validPlatforms
    });
  }
  next();
};

// Middleware to validate search type parameter
const validateSearchType = (req, res, next) => {
  const { search_type } = req.query;
  const validTypes = ['keywords', 'questions', 'prepositions', 'hashtags', 'all'];
  
  if (search_type && !validTypes.includes(search_type)) {
    return res.status(400).json({
      error: 'Invalid search type',
      message: `Search type must be one of: ${validTypes.join(', ')}`,
      validTypes
    });
  }
  next();
};

// Route: POST /api/saved-keywords/save
// Description: Save a keyword search with location and metadata
router.post('/save', validatePlatform, validateSearchType, savedKeywordController.saveKeyword);

// Route: GET /api/saved-keywords/stats
// Description: Get statistics about saved keywords
router.get('/stats', savedKeywordController.getSavedKeywordsStats);

// Route: GET /api/saved-keywords/favorites
// Description: Get only favorite saved keywords
router.get('/favorites', validatePlatform, (req, res, next) => {
  req.query.is_favorite = 'true';
  next();
}, savedKeywordController.getSavedKeywords);

// Route: GET /api/saved-keywords/recent
// Description: Get recently saved keywords
router.get('/recent', validatePlatform, (req, res, next) => {
  req.query.sort_by = 'created_at';
  req.query.sort_order = 'DESC';
  req.query.limit = req.query.limit || '10';
  next();
}, savedKeywordController.getSavedKeywords);

// Route: GET /api/saved-keywords/by-platform/:platform
// Description: Get saved keywords by specific platform
router.get('/by-platform/:platform', validatePlatform, (req, res, next) => {
  req.query.platform = req.params.platform;
  next();
}, savedKeywordController.getSavedKeywords);

// Route: GET /api/saved-keywords/by-category/:category
// Description: Get saved keywords by category
router.get('/by-category/:category', validatePlatform, (req, res, next) => {
  req.query.category = req.params.category;
  next();
}, savedKeywordController.getSavedKeywords);

// Route: GET /api/saved-keywords
// Description: Get all saved keywords with filtering and pagination
router.get('/', validatePlatform, savedKeywordController.getSavedKeywords);

// Route: GET /api/saved-keywords/:id
// Description: Get a specific saved keyword by ID
router.get('/:id', savedKeywordController.getSavedKeyword);

// Route: PUT /api/saved-keywords/:id
// Description: Update a saved keyword (title, description, tags, etc.)
router.put('/:id', savedKeywordController.updateSavedKeyword);

// Route: DELETE /api/saved-keywords/:id/unsave
// Description: Unsave/delete a saved keyword
router.delete('/:id/unsave', savedKeywordController.unsaveKeyword);

// Route: POST /api/saved-keywords/:id/toggle-favorite
// Description: Toggle favorite status of a saved keyword
router.post('/:id/toggle-favorite', savedKeywordController.toggleFavorite);

// Route: POST /api/saved-keywords/:id/merge-data
// Description: Merge new data with existing saved keyword (skip duplicates)
router.post('/:id/merge-data', savedKeywordController.mergeData);

module.exports = router; 