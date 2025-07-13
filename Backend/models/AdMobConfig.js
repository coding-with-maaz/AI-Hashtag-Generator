const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// New wide-table model: one row per environment, each ad type is a JSON column
const AdMobConfig = sequelize.define('AdMobConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  environment: {
    type: DataTypes.ENUM('test', 'production', 'staging'),
    allowNull: false,
    unique: true
  },
  banner: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'banner'
  },
  interstitial: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'interstitial'
  },
  rewarded: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'rewarded'
  },
  native: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'native'
  },
  appOpen: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'appOpen'
  },
  splash: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'splash'
  },
  custom: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'custom'
  },
  globalConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'globalConfig'
  },
  rewardedInterstitial: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'rewardedInterstitial'
  },
  // Add more ad types as needed
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
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
    { unique: true, fields: ['environment'] }
  ]
});

// MIGRATION NOTE:
// - Drop ad_type, ad_unit_id, ad_unit_name, ad_unit_description, is_active, is_test, platform, version, config_data, usage_stats, performance_metrics, last_updated
// - Add JSON columns for each ad type and globalConfig
// - One row per environment (test, production)

module.exports = AdMobConfig; 