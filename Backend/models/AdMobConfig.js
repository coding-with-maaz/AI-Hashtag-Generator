const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdMobConfig = sequelize.define('AdMobConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  environment: {
    type: DataTypes.ENUM('test', 'production', 'staging'),
    allowNull: false,
    defaultValue: 'test'
  },
  app_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  ad_type: {
    type: DataTypes.ENUM('appOpen', 'adaptiveBanner', 'fixedBanner', 'interstitial', 'rewarded', 'rewardedInterstitial', 'native', 'nativeVideo'),
    allowNull: false
  },
  ad_unit_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  ad_unit_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  ad_unit_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  is_test: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  platform: {
    type: DataTypes.ENUM('android', 'ios', 'web', 'unity', 'flutter'),
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '1.0.0'
  },
  config_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  usage_stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      ctr: 0,
      cpm: 0
    }
  },
  performance_metrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      load_time: 0,
      fill_rate: 0,
      error_rate: 0
    }
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'admob_configs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['environment', 'ad_type', 'user_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['environment']
    },
    {
      fields: ['ad_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_test']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: (config) => {
      if (config.config_data === null) config.config_data = {};
      if (config.usage_stats === null) {
        config.usage_stats = {
          impressions: 0,
          clicks: 0,
          revenue: 0,
          ctr: 0,
          cpm: 0
        };
      }
      if (config.performance_metrics === null) {
        config.performance_metrics = {
          load_time: 0,
          fill_rate: 0,
          error_rate: 0
        };
      }
      if (config.metadata === null) config.metadata = {};
    },
    beforeUpdate: (config) => {
      if (config.config_data === null) config.config_data = {};
      if (config.usage_stats === null) {
        config.usage_stats = {
          impressions: 0,
          clicks: 0,
          revenue: 0,
          ctr: 0,
          cpm: 0
        };
      }
      if (config.performance_metrics === null) {
        config.performance_metrics = {
          load_time: 0,
          fill_rate: 0,
          error_rate: 0
        };
      }
      if (config.metadata === null) config.metadata = {};
      config.last_updated = new Date();
    }
  }
});

module.exports = AdMobConfig; 