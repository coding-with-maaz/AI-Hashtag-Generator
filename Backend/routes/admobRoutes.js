const express = require('express');
const router = express.Router();
const admobController = require('../controllers/admobController');

// Middleware to validate environment parameter
const validateEnvironment = (req, res, next) => {
  const { environment } = req.query;
  if (environment && !['test', 'production', 'staging'].includes(environment)) {
    return res.status(400).json({ 
      error: 'Invalid environment parameter',
      message: 'Environment must be either "test", "production", or "staging"'
    });
  }
  next();
};

// Middleware to validate ad type parameter
const validateAdType = (req, res, next) => {
  const { adType } = req.params;
  const validTypes = [
    'banner',
    'interstitial',
    'rewarded',
    'native',
    'appOpen',
    'splash',
    'custom',
    'rewardedInterstitial'
  ];
  
  if (!validTypes.includes(adType)) {
    return res.status(400).json({ 
      error: 'Invalid ad type',
      message: `Ad type must be one of: ${validTypes.join(', ')}`,
      validTypes
    });
  }
  next();
};

// Route: GET /api/admob/config
// Description: Get all AdMob configurations or specific environment
router.get('/config', validateEnvironment, admobController.getConfig);

// Route: GET /api/admob/config/:environment
// Description: Get AdMob configuration for specific environment
router.get('/config/:environment', admobController.getConfigByEnvironment);

// Route: GET /api/admob/config/:environment/:adType
// Description: Get specific ad type configuration for environment
router.get('/config/:environment/:adType', validateAdType, admobController.getAdTypeConfig);

// Route: PUT /api/admob/config
// Description: Update AdMob configuration (requires environment in body)
router.put('/config', admobController.updateConfig);

// Route: PUT /api/admob/config/:environment
// Description: Update AdMob configuration for specific environment
router.put('/config/:environment', admobController.updateConfigByEnvironment);

// Route: PUT /api/admob/config/:environment/:adType
// Description: Update specific ad type configuration for environment
router.put('/config/:environment/:adType', validateAdType, admobController.updateAdTypeConfig);

// Route: GET /api/admob/test-ids
// Description: Get all test ad unit IDs (for development)
router.get('/test-ids', admobController.getTestIds);

// Route: GET /api/admob/production-ids
// Description: Get all production ad unit IDs (for production)
router.get('/production-ids', admobController.getProductionIds);

// Route: POST /api/admob/validate
// Description: Validate ad unit configuration
router.post('/validate', admobController.validateConfig);

module.exports = router; 