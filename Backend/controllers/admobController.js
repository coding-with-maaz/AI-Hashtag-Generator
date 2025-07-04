const { 
  getAdMobConfig, 
  getAdUnitId, 
  getAllAdUnits, 
  getAppId, 
  isValidAdType, 
  isValidEnvironment,
  ADMOB_CONFIG 
} = require('../config/admob');

// Controller methods
const admobController = {
  // GET /api/admob/config
  async getConfig(req, res) {
    try {
      const { environment = 'test' } = req.query;
      const config = getAdMobConfig(environment);
      
      res.json({
        success: true,
        data: {
          environment,
          appId: config.appId,
          adUnits: config.adUnits,
          metadata: {
            totalAdUnits: Object.keys(config.adUnits).length,
            adTypes: Object.keys(config.adUnits),
            retrievedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/app-id
  async getAppId(req, res) {
    try {
      const { environment = 'test' } = req.query;
      const appId = getAppId(environment);
      
      res.json({
        success: true,
        data: {
          environment,
          appId,
          metadata: {
            retrievedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/ad-units
  async getAllAdUnits(req, res) {
    try {
      const { environment = 'test' } = req.query;
      const adUnits = getAllAdUnits(environment);
      
      res.json({
        success: true,
        data: {
          environment,
          adUnits,
          count: Object.keys(adUnits).length,
          metadata: {
            adTypes: Object.keys(adUnits),
            retrievedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/ad-units/:adType
  async getAdUnit(req, res) {
    try {
      const { adType } = req.params;
      const { environment = 'test' } = req.query;
      const config = getAdMobConfig(environment);
      const adUnit = config.adUnits[adType];
      
      if (!adUnit) {
        return res.status(404).json({
          success: false,
          error: 'Ad unit not found',
          message: `Ad unit "${adType}" not found for environment "${environment}"`
        });
      }
      
      res.json({
        success: true,
        data: {
          environment,
          adType,
          adUnit,
          metadata: {
            retrievedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/ad-units/:adType/id
  async getAdUnitId(req, res) {
    try {
      const { adType } = req.params;
      const { environment = 'test' } = req.query;
      const adUnitId = getAdUnitId(adType, environment);
      
      if (!adUnitId) {
        return res.status(404).json({
          success: false,
          error: 'Ad unit ID not found',
          message: `Ad unit ID for "${adType}" not found for environment "${environment}"`
        });
      }
      
      res.json({
        success: true,
        data: {
          environment,
          adType,
          adUnitId,
          metadata: {
            retrievedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/test-ids
  async getTestIds(req, res) {
    try {
      const testConfig = getAdMobConfig('test');
      const testIds = {};
      
      // Extract only the IDs for easy access
      Object.keys(testConfig.adUnits).forEach(adType => {
        testIds[adType] = testConfig.adUnits[adType].id;
      });
      
      res.json({
        success: true,
        data: {
          environment: 'test',
          appId: testConfig.appId,
          adUnitIds: testIds,
          metadata: {
            totalAdUnits: Object.keys(testIds).length,
            adTypes: Object.keys(testIds),
            retrievedAt: new Date().toISOString(),
            note: 'These are Google\'s official test ad unit IDs'
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/production-ids
  async getProductionIds(req, res) {
    try {
      const productionConfig = getAdMobConfig('production');
      const productionIds = {};
      
      // Extract only the IDs for easy access
      Object.keys(productionConfig.adUnits).forEach(adType => {
        productionIds[adType] = productionConfig.adUnits[adType].id;
      });
      
      res.json({
        success: true,
        data: {
          environment: 'production',
          appId: productionConfig.appId,
          adUnitIds: productionIds,
          metadata: {
            totalAdUnits: Object.keys(productionIds).length,
            adTypes: Object.keys(productionIds),
            retrievedAt: new Date().toISOString(),
            note: 'Replace placeholder IDs with your actual production ad unit IDs'
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/admob/validate
  async validateConfig(req, res) {
    try {
      const { environment = 'test' } = req.query;
      const config = getAdMobConfig(environment);
      const validation = {
        environment,
        isValid: true,
        issues: [],
        warnings: [],
        summary: {}
      };
      
      // Validate App ID
      if (!config.appId || config.appId === 'YOUR_PRODUCTION_APP_ID_HERE') {
        validation.issues.push('App ID is missing or not configured');
        validation.isValid = false;
      }
      
      // Validate each ad unit
      Object.keys(config.adUnits).forEach(adType => {
        const adUnit = config.adUnits[adType];
        const summary = {
          adType,
          hasId: !!adUnit.id,
          isPlaceholder: adUnit.id && adUnit.id.startsWith('YOUR_'),
          id: adUnit.id
        };
        
        if (!adUnit.id) {
          validation.issues.push(`Ad unit "${adType}" has no ID`);
          validation.isValid = false;
        } else if (adUnit.id.startsWith('YOUR_')) {
          validation.warnings.push(`Ad unit "${adType}" uses placeholder ID: ${adUnit.id}`);
        }
        
        validation.summary[adType] = summary;
      });
      
      // Add metadata
      validation.metadata = {
        totalAdUnits: Object.keys(config.adUnits).length,
        validAdUnits: Object.keys(config.adUnits).filter(adType => 
          config.adUnits[adType].id && !config.adUnits[adType].id.startsWith('YOUR_')
        ).length,
        placeholderAdUnits: Object.keys(config.adUnits).filter(adType => 
          config.adUnits[adType].id && config.adUnits[adType].id.startsWith('YOUR_')
        ).length,
        missingAdUnits: Object.keys(config.adUnits).filter(adType => 
          !config.adUnits[adType].id
        ).length,
        validatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = admobController; 