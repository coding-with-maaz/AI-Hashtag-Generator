'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Create a temporary table with the new structure
    await queryInterface.createTable('admob_configs_new', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      environment: {
        type: Sequelize.ENUM('test', 'production', 'staging'),
        allowNull: false,
        unique: true
      },
      banner: {
        type: Sequelize.JSON,
        allowNull: true
      },
      interstitial: {
        type: Sequelize.JSON,
        allowNull: true
      },
      rewarded: {
        type: Sequelize.JSON,
        allowNull: true
      },
      native: {
        type: Sequelize.JSON,
        allowNull: true
      },
      appOpen: {
        type: Sequelize.JSON,
        allowNull: true
      },
      splash: {
        type: Sequelize.JSON,
        allowNull: true
      },
      custom: {
        type: Sequelize.JSON,
        allowNull: true
      },
      globalConfig: {
        type: Sequelize.JSON,
        allowNull: true
      },
      rewardedInterstitial: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Step 2: Insert initial data for test and production environments
    await queryInterface.bulkInsert('admob_configs_new', [
      {
        environment: 'test',
        banner: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/6300978111',
          position: 'bottom',
          refreshInterval: 60
        },
        interstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/1033173712',
          minInterval: 300,
          showOnJobView: true,
          showOnCompanyView: false,
          showOnCategoryView: false
        },
        rewarded: {
          enabled: false,
          adUnitId: 'ca-app-pub-3940256099942544/5224354917',
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        native: {
          style: 'default',
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/2247696110',
          position: 'job_list'
        },
        appOpen: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/3419835294',
          showOnResume: true,
          maxShowsPerDay: 3
        },
        splash: {
          enabled: false,
          adUnitId: 'ca-app-pub-3940256099942544/3419835294',
          showDelay: 2,
          skipAfter: 5
        },
        custom: {
          enabled: false,
          adUnitId: '',
          position: 'custom',
          customConfig: {}
        },
        globalConfig: {
          testMode: true,
          debugMode: true,
          ageRestriction: 13,
          cooldownPeriod: 60,
          maxAdsPerSession: 10,
          userConsentRequired: true
        },
        rewardedInterstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/5354046379',
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        environment: 'production',
        banner: {
          enabled: true,
          adUnitId: 'YOUR_PRODUCTION_BANNER_AD_UNIT_ID',
          position: 'bottom',
          refreshInterval: 60
        },
        interstitial: {
          enabled: true,
          adUnitId: 'YOUR_PRODUCTION_INTERSTITIAL_AD_UNIT_ID',
          minInterval: 300,
          showOnJobView: true,
          showOnCompanyView: false,
          showOnCategoryView: false
        },
        rewarded: {
          enabled: false,
          adUnitId: 'YOUR_PRODUCTION_REWARDED_AD_UNIT_ID',
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        native: {
          style: 'default',
          enabled: true,
          adUnitId: 'YOUR_PRODUCTION_NATIVE_AD_UNIT_ID',
          position: 'job_list'
        },
        appOpen: {
          enabled: true,
          adUnitId: 'YOUR_PRODUCTION_APP_OPEN_AD_UNIT_ID',
          showOnResume: true,
          maxShowsPerDay: 3
        },
        splash: {
          enabled: false,
          adUnitId: 'YOUR_PRODUCTION_SPLASH_AD_UNIT_ID',
          showDelay: 2,
          skipAfter: 5
        },
        custom: {
          enabled: false,
          adUnitId: '',
          position: 'custom',
          customConfig: {}
        },
        globalConfig: {
          testMode: false,
          debugMode: false,
          ageRestriction: 13,
          cooldownPeriod: 60,
          maxAdsPerSession: 10,
          userConsentRequired: true
        },
        rewardedInterstitial: {
          enabled: false,
          adUnitId: 'YOUR_PRODUCTION_REWARDED_INTERSTITIAL_AD_UNIT_ID',
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Step 3: Drop the old table and rename the new one
    await queryInterface.dropTable('admob_configs');
    await queryInterface.renameTable('admob_configs_new', 'admob_configs');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the old structure if needed
    await queryInterface.dropTable('admob_configs');
    
    // Recreate the old table structure
    await queryInterface.createTable('admob_configs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      environment: {
        type: Sequelize.ENUM('test', 'production', 'staging'),
        allowNull: false,
        defaultValue: 'test'
      },
      app_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ad_type: {
        type: Sequelize.ENUM('appOpen', 'adaptiveBanner', 'fixedBanner', 'interstitial', 'rewarded', 'rewardedInterstitial', 'native', 'nativeVideo'),
        allowNull: false
      },
      ad_unit_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ad_unit_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ad_unit_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_test: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      platform: {
        type: Sequelize.ENUM('android', 'ios', 'web', 'unity', 'flutter'),
        allowNull: true
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '1.0.0'
      },
      config_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      usage_stats: {
        type: Sequelize.JSON,
        allowNull: true
      },
      performance_metrics: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  }
}; 