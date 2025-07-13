const { 
  getAdMobConfig, 
  getAdUnitId, 
  getAllAdUnits, 
  getAppId, 
  isValidAdType, 
  isValidEnvironment,
  ADMOB_CONFIG 
} = require('../config/admob');
const AdMobConfigModel = require('../models/AdMobConfig');

// Controller methods
const admobController = {
  // GET /api/admob/config
  async getConfig(req, res) {
    try {
      const { environment } = req.query;
      
      let query = {};
      if (environment) {
        query = { where: { environment } };
      }
      
      // Fetch all configurations
      const configs = await AdMobConfigModel.findAll(query);
      
      if (!configs.length) {
        return res.status(404).json({ 
          success: false, 
          error: 'No AdMob configurations found' 
        });
      }

      // If specific environment requested, return just that one
      if (environment) {
        const config = configs[0];
        return res.json({
          success: true,
          data: config,
          metadata: {
            environment: config.environment,
            retrievedAt: new Date().toISOString()
          }
        });
      }

      // Return all configurations
      res.json({
        success: true,
        data: configs,
        metadata: {
          totalEnvironments: configs.length,
          environments: configs.map(c => c.environment),
          retrievedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching AdMob config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admob/config/:environment
  async getConfigByEnvironment(req, res) {
    try {
      const { environment } = req.params;
      
      const config = await AdMobConfigModel.findOne({ 
        where: { environment } 
      });
      
      if (!config) {
        return res.status(404).json({ 
          success: false, 
          error: `No AdMob configuration found for environment: ${environment}` 
        });
      }

      res.json({
        success: true,
        data: config,
        metadata: {
          environment: config.environment,
          retrievedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching AdMob config by environment:', error);
      res.status(500).json({ success: false, error: error.message });
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
      const testConfig = await AdMobConfigModel.findOne({ 
        where: { environment: 'test' } 
      });
      
      if (!testConfig) {
        return res.status(404).json({ 
          success: false, 
          error: 'Test environment configuration not found' 
        });
      }

      // Extract ad unit IDs from test config
      const adUnitIds = {};
      const adTypes = ['banner', 'interstitial', 'appOpen', 'native', 'rewarded', 'rewardedInterstitial', 'splash'];
      
      adTypes.forEach(adType => {
        const adConfig = testConfig[adType];
        if (adConfig && adConfig.enabled && adConfig.adUnitId) {
          adUnitIds[adType] = adConfig.adUnitId;
        }
      });

      res.json({
        success: true,
        data: {
          environment: 'test',
          adUnitIds,
          globalConfig: testConfig.globalConfig
        },
        metadata: {
          totalAdUnits: Object.keys(adUnitIds).length,
          adTypes: Object.keys(adUnitIds),
          retrievedAt: new Date().toISOString(),
          note: 'These are Google\'s official test ad unit IDs'
        }
      });
    } catch (error) {
      console.error('Error fetching test IDs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admob/production-ids
  async getProductionIds(req, res) {
    try {
      const prodConfig = await AdMobConfigModel.findOne({ 
        where: { environment: 'production' } 
      });
      
      if (!prodConfig) {
        return res.status(404).json({ 
          success: false, 
          error: 'Production environment configuration not found' 
        });
      }

      // Extract ad unit IDs from production config
      const adUnitIds = {};
      const adTypes = ['banner', 'interstitial', 'appOpen', 'native', 'rewarded', 'rewardedInterstitial', 'splash'];
      
      adTypes.forEach(adType => {
        const adConfig = prodConfig[adType];
        if (adConfig && adConfig.enabled && adConfig.adUnitId) {
          adUnitIds[adType] = adConfig.adUnitId;
        }
      });

      res.json({
        success: true,
        data: {
          environment: 'production',
          adUnitIds,
          globalConfig: prodConfig.globalConfig
        },
        metadata: {
          totalAdUnits: Object.keys(adUnitIds).length,
          adTypes: Object.keys(adUnitIds),
          retrievedAt: new Date().toISOString(),
          note: 'Production ad unit IDs - replace with your actual IDs'
        }
      });
    } catch (error) {
      console.error('Error fetching production IDs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/admob/validate
  async validateConfig(req, res) {
    try {
      const { environment, adType, config } = req.body;
      
      if (!environment || !adType || !config) {
        return res.status(400).json({ 
          success: false, 
          error: 'Environment, ad type, and config are required' 
        });
      }

      const validation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Validate ad unit ID format
      if (config.adUnitId) {
        const adUnitIdPattern = /^ca-app-pub-\d+~\d+$|^ca-app-pub-\d+\/\d+$/;
        if (!adUnitIdPattern.test(config.adUnitId)) {
          validation.errors.push('Invalid ad unit ID format');
          validation.isValid = false;
        }
      }

      // Validate environment-specific rules
      if (environment === 'production') {
        if (config.adUnitId && config.adUnitId.includes('test')) {
          validation.warnings.push('Production environment should not use test ad unit IDs');
        }
      }

      // Validate ad type specific rules
      if (adType === 'banner') {
        if (config.refreshInterval && (config.refreshInterval < 30 || config.refreshInterval > 300)) {
          validation.warnings.push('Banner refresh interval should be between 30 and 300 seconds');
        }
      }

      if (adType === 'interstitial') {
        if (config.minInterval && config.minInterval < 60) {
          validation.warnings.push('Interstitial minimum interval should be at least 60 seconds');
        }
      }

      res.json({
        success: true,
        data: validation,
        metadata: {
          environment,
          adType,
          validatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error validating config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admob/app-id
  async updateAppId(req, res) {
    try {
      const { environment = 'test' } = req.query;
      const { appId } = req.body;
      
      if (!appId) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required',
          message: 'Please provide a valid App ID'
        });
      }

      // Update the configuration (in a real app, this would be saved to database)
      const config = getAdMobConfig(environment);
      config.appId = appId;
      
      res.json({
        success: true,
        message: 'App ID updated successfully',
        data: {
          environment,
          appId,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT /api/admob/ad-units/:adType
  async updateAdUnit(req, res) {
    try {
      const { adType } = req.params;
      const { environment = 'test' } = req.query;
      const { id, name, description } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Ad unit ID is required',
          message: 'Please provide a valid ad unit ID'
        });
      }

      // Update the configuration (in a real app, this would be saved to database)
      const config = getAdMobConfig(environment);
      if (config.adUnits[adType]) {
        config.adUnits[adType].id = id;
        if (name) config.adUnits[adType].name = name;
        if (description) config.adUnits[adType].description = description;
      }
      
      res.json({
        success: true,
        message: 'Ad unit updated successfully',
        data: {
          environment,
          adType,
          adUnit: config.adUnits[adType],
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT /api/admob/config
  async updateConfig(req, res) {
    try {
      const { environment, ...updateData } = req.body;
      
      if (!environment) {
        return res.status(400).json({ 
          success: false, 
          error: 'Environment is required' 
        });
      }

      // Find existing config or create new one
      let config = await AdMobConfigModel.findOne({ 
        where: { environment } 
      });

      if (config) {
        // Update existing config
        await config.update(updateData);
      } else {
        // Create new config
        config = await AdMobConfigModel.create({
          environment,
          ...updateData
        });
      }

      res.json({
        success: true,
        data: config,
        message: `AdMob configuration for ${environment} environment updated successfully`,
        metadata: {
          environment: config.environment,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating AdMob config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admob/config/:environment
  async updateConfigByEnvironment(req, res) {
    try {
      const { environment } = req.params;
      const updateData = req.body;

      // Find existing config
      let config = await AdMobConfigModel.findOne({ 
        where: { environment } 
      });

      if (!config) {
        return res.status(404).json({ 
          success: false, 
          error: `No AdMob configuration found for environment: ${environment}` 
        });
      }

      // Update the config
      await config.update(updateData);

      res.json({
        success: true,
        data: config,
        message: `AdMob configuration for ${environment} environment updated successfully`,
        metadata: {
          environment: config.environment,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating AdMob config by environment:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/admob/config/:environment/:adType
  async getAdTypeConfig(req, res) {
    try {
      const { environment, adType } = req.params;
      
      const config = await AdMobConfigModel.findOne({ 
        where: { environment } 
      });
      
      if (!config) {
        return res.status(404).json({ 
          success: false, 
          error: `No AdMob configuration found for environment: ${environment}` 
        });
      }

      const adTypeConfig = config[adType];
      if (!adTypeConfig) {
        return res.status(404).json({ 
          success: false, 
          error: `Ad type "${adType}" not found in ${environment} environment` 
        });
      }

      res.json({
        success: true,
        data: {
          environment,
          adType,
          config: adTypeConfig
        },
        metadata: {
          retrievedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching ad type config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/admob/config/:environment/:adType
  async updateAdTypeConfig(req, res) {
    try {
      const { environment, adType } = req.params;
      const updateData = req.body;
      
      const config = await AdMobConfigModel.findOne({ 
        where: { environment } 
      });
      
      if (!config) {
        return res.status(404).json({ 
          success: false, 
          error: `No AdMob configuration found for environment: ${environment}` 
        });
      }

      // Update the specific ad type configuration
      const currentAdTypeConfig = config[adType] || {};
      const updatedAdTypeConfig = { ...currentAdTypeConfig, ...updateData };
      
      await config.update({
        [adType]: updatedAdTypeConfig
      });

      res.json({
        success: true,
        data: {
          environment,
          adType,
          config: updatedAdTypeConfig
        },
        message: `${adType} configuration for ${environment} environment updated successfully`,
        metadata: {
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating ad type config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = admobController; 