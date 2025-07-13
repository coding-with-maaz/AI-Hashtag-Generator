const { sequelize } = require('../config/database');

async function migrateAdMobConfig() {
  try {
    console.log('🔄 Starting AdMobConfig table migration...');
    
    // Step 1: Check if the old table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'admob_configs'
    `);
    
    if (tables.length === 0) {
      console.log('ℹ️  AdMobConfig table does not exist. Creating new table...');
      
      // Create the new table structure
      await sequelize.query(`
        CREATE TABLE admob_configs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          environment ENUM('test', 'production', 'staging') NOT NULL UNIQUE,
          banner JSON,
          interstitial JSON,
          rewarded JSON,
          native JSON,
          appOpen JSON,
          splash JSON,
          custom JSON,
          globalConfig JSON,
          rewardedInterstitial JSON,
          created_by INT,
          notes TEXT,
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ New AdMobConfig table created');
    } else {
      console.log('ℹ️  AdMobConfig table exists. Checking structure...');
      
      // Check current table structure
      const [columns] = await sequelize.query(`
        DESCRIBE admob_configs
      `);
      
      const hasNewStructure = columns.some(col => col.Field === 'banner' && col.Type.includes('json'));
      
      if (hasNewStructure) {
        console.log('ℹ️  Table already has new structure. Skipping migration.');
        return;
      }
      
      console.log('🔄 Migrating from old structure to new structure...');
      
      // Create temporary table with new structure
      await sequelize.query(`
        CREATE TABLE admob_configs_new (
          id INT PRIMARY KEY AUTO_INCREMENT,
          environment ENUM('test', 'production', 'staging') NOT NULL UNIQUE,
          banner JSON,
          interstitial JSON,
          rewarded JSON,
          native JSON,
          appOpen JSON,
          splash JSON,
          custom JSON,
          globalConfig JSON,
          rewardedInterstitial JSON,
          created_by INT,
          notes TEXT,
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // Insert initial data for test and production environments
      await sequelize.query(`
        INSERT INTO admob_configs_new (environment, banner, interstitial, rewarded, native, appOpen, splash, custom, globalConfig, rewardedInterstitial, created_at, updated_at) VALUES
        ('test', 
          '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/6300978111", "position": "bottom", "refreshInterval": 60}',
          '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/1033173712", "minInterval": 300, "showOnJobView": true, "showOnCompanyView": false, "showOnCategoryView": false}',
          '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/5224354917", "rewardType": "premium_jobs", "rewardAmount": 1}',
          '{"style": "default", "enabled": true, "adUnitId": "ca-app-pub-3940256099942544/2247696110", "position": "job_list"}',
          '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showOnResume": true, "maxShowsPerDay": 3}',
          '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showDelay": 2, "skipAfter": 5}',
          '{"enabled": false, "adUnitId": "", "position": "custom", "customConfig": {}}',
          '{"testMode": true, "debugMode": true, "ageRestriction": 13, "cooldownPeriod": 60, "maxAdsPerSession": 10, "userConsentRequired": true}',
          '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/5354046379", "rewardType": "premium_jobs", "rewardAmount": 1}',
          NOW(), NOW()
        ),
        ('production',
          '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_BANNER_AD_UNIT_ID", "position": "bottom", "refreshInterval": 60}',
          '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_INTERSTITIAL_AD_UNIT_ID", "minInterval": 300, "showOnJobView": true, "showOnCompanyView": false, "showOnCategoryView": false}',
          '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_REWARDED_AD_UNIT_ID", "rewardType": "premium_jobs", "rewardAmount": 1}',
          '{"style": "default", "enabled": true, "adUnitId": "YOUR_PRODUCTION_NATIVE_AD_UNIT_ID", "position": "job_list"}',
          '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_APP_OPEN_AD_UNIT_ID", "showOnResume": true, "maxShowsPerDay": 3}',
          '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_SPLASH_AD_UNIT_ID", "showDelay": 2, "skipAfter": 5}',
          '{"enabled": false, "adUnitId": "", "position": "custom", "customConfig": {}}',
          '{"testMode": false, "debugMode": false, "ageRestriction": 13, "cooldownPeriod": 60, "maxAdsPerSession": 10, "userConsentRequired": true}',
          '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_REWARDED_INTERSTITIAL_AD_UNIT_ID", "rewardType": "premium_jobs", "rewardAmount": 1}',
          NOW(), NOW()
        )
      `);
      
      // Drop old table and rename new table
      await sequelize.query(`DROP TABLE admob_configs`);
      await sequelize.query(`RENAME TABLE admob_configs_new TO admob_configs`);
      
      console.log('✅ Migration completed successfully!');
    }
    
    // Verify the new structure
    const [results] = await sequelize.query(`
      DESCRIBE admob_configs
    `);
    
    console.log('📊 New table structure:');
    results.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Verify data was inserted
    const [data] = await sequelize.query(`
      SELECT environment, banner, interstitial FROM admob_configs
    `);
    
    console.log('📊 Sample data:');
    data.forEach(row => {
      console.log(`  - ${row.environment}: ${Object.keys(JSON.parse(row.banner || '{}')).length} banner configs`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrateAdMobConfig(); 