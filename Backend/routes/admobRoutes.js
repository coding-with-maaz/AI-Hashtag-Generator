const express = require('express');
const router = express.Router();
const admobController = require('../controllers/admobController');

// Middleware to validate environment parameter
const validateEnvironment = (req, res, next) => {
  const { environment } = req.query;
  if (environment && !['test', 'production'].includes(environment)) {
    return res.status(400).json({ 
      error: 'Invalid environment parameter',
      message: 'Environment must be either "test" or "production"'
    });
  }
  next();
};

// Middleware to validate ad type parameter
const validateAdType = (req, res, next) => {
  const { adType } = req.params;
  const validTypes = [
    'appOpen',
    'adaptiveBanner', 
    'fixedBanner',
    'interstitial',
    'rewarded',
    'rewardedInterstitial',
    'native',
    'nativeVideo'
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
// Description: Get complete AdMob configuration for specified environment
router.get('/config', validateEnvironment, admobController.getConfig);

// Route: GET /api/admob/app-id
// Description: Get AdMob App ID for specified environment
router.get('/app-id', validateEnvironment, admobController.getAppId);

// Route: GET /api/admob/ad-units
// Description: Get all ad units for specified environment
router.get('/ad-units', validateEnvironment, admobController.getAllAdUnits);

// Route: GET /api/admob/ad-units/:adType
// Description: Get specific ad unit ID for specified environment and ad type
router.get('/ad-units/:adType', validateEnvironment, validateAdType, admobController.getAdUnit);

// Route: GET /api/admob/ad-units/:adType/id
// Description: Get only the ad unit ID (string) for specified environment and ad type
router.get('/ad-units/:adType/id', validateEnvironment, validateAdType, admobController.getAdUnitId);

// Route: GET /api/admob/test-ids
// Description: Get all test ad unit IDs (for development)
router.get('/test-ids', admobController.getTestIds);

// Route: GET /api/admob/production-ids
// Description: Get all production ad unit IDs (for production)
router.get('/production-ids', admobController.getProductionIds);

// Route: GET /api/admob/validate
// Description: Validate ad unit configuration
router.get('/validate', validateEnvironment, admobController.validateConfig);

module.exports = router; 