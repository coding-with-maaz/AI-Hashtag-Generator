// Seed AdMobConfig table with initial data for all ad types and environments
const { sequelize } = require('../config/database');

const TEST_AD_UNITS = {
  appOpen: 'ca-app-pub-3940256099942544/9257395921',
  adaptiveBanner: 'ca-app-pub-3940256099942544/9214589741',
  fixedBanner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
  native: 'ca-app-pub-3940256099942544/2247696110',
  nativeVideo: 'ca-app-pub-3940256099942544/1044960115',
};

const PROD_AD_UNITS = {
  appOpen: 'YOUR_APP_OPEN_AD_UNIT_ID',
  adaptiveBanner: 'YOUR_ADAPTIVE_BANNER_AD_UNIT_ID',
  fixedBanner: 'YOUR_FIXED_BANNER_AD_UNIT_ID',
  interstitial: 'YOUR_INTERSTITIAL_AD_UNIT_ID',
  rewarded: 'YOUR_REWARDED_AD_UNIT_ID',
  rewardedInterstitial: 'YOUR_REWARDED_INTERSTITIAL_AD_UNIT_ID',
  native: 'YOUR_NATIVE_AD_UNIT_ID',
  nativeVideo: 'YOUR_NATIVE_VIDEO_AD_UNIT_ID',
};

const ENVIRONMENTS = [
  {
    name: 'test',
    app_id: 'ca-app-pub-3940256099942544~3347511713',
    adUnits: TEST_AD_UNITS,
    is_test: true,
  },
  {
    name: 'production',
    app_id: 'YOUR_PRODUCTION_APP_ID_HERE',
    adUnits: PROD_AD_UNITS,
    is_test: false,
  },
];

async function seedAdMobConfig() {
  try {
    console.log('🌱 Starting AdMobConfig data seeding...');
    
    // Check if data already exists
    const [existingCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM admob_configs
    `);
    
    if (existingCount[0].count > 0) {
      console.log(`ℹ️  Found ${existingCount[0].count} existing AdMobConfig records. Clearing and reseeding...`);
      await sequelize.query(`DELETE FROM admob_configs`);
    }
    
    // Seed data for test environment
    await sequelize.query(`
      INSERT INTO admob_configs (environment, banner, interstitial, rewarded, native, appOpen, splash, custom, globalConfig, rewardedInterstitial, notes, metadata, created_at, updated_at) VALUES
      ('test', 
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/6300978111", "position": "bottom", "refreshInterval": 60, "adaptive": true, "smartBanner": true}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/1033173712", "minInterval": 300, "showOnJobView": true, "showOnCompanyView": false, "showOnCategoryView": false, "showOnSearch": true, "showOnProfile": false}',
        '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/5224354917", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobApply": true, "showOnProfile": false}',
        '{"style": "default", "enabled": true, "adUnitId": "ca-app-pub-3940256099942544/2247696110", "position": "job_list", "layout": "medium", "showInFeed": true, "showInDetail": false}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showOnResume": true, "maxShowsPerDay": 3, "showOnAppStart": true, "showOnAppReturn": true, "cooldownPeriod": 300}',
        '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showDelay": 2, "skipAfter": 5, "showOnFirstLaunch": true, "showOnAppUpdate": false}',
        '{"enabled": false, "adUnitId": "", "position": "custom", "customConfig": {}, "targeting": {}, "keywords": []}',
        '{"testMode": true, "debugMode": true, "ageRestriction": 13, "cooldownPeriod": 60, "maxAdsPerSession": 10, "userConsentRequired": true, "gdprCompliant": true, "ccpaCompliant": true, "maxAdRequestsPerMinute": 5, "adLoadTimeout": 10}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/5354046379", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobView": true, "showOnCompanyView": false}',
        'Test environment configuration with Google test ad unit IDs',
        '{"version": "1.0.0", "lastUpdated": "${new Date().toISOString()}", "createdBy": "system"}',
        NOW(), NOW()
      )
    `);
    
    // Seed data for production environment
    await sequelize.query(`
      INSERT INTO admob_configs (environment, banner, interstitial, rewarded, native, appOpen, splash, custom, globalConfig, rewardedInterstitial, notes, metadata, created_at, updated_at) VALUES
      ('production',
        '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_BANNER_AD_UNIT_ID", "position": "bottom", "refreshInterval": 60, "adaptive": true, "smartBanner": true}',
        '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_INTERSTITIAL_AD_UNIT_ID", "minInterval": 300, "showOnJobView": true, "showOnCompanyView": false, "showOnCategoryView": false, "showOnSearch": true, "showOnProfile": false}',
        '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_REWARDED_AD_UNIT_ID", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobApply": true, "showOnProfile": false}',
        '{"style": "default", "enabled": true, "adUnitId": "YOUR_PRODUCTION_NATIVE_AD_UNIT_ID", "position": "job_list", "layout": "medium", "showInFeed": true, "showInDetail": false}',
        '{"enabled": true, "adUnitId": "YOUR_PRODUCTION_APP_OPEN_AD_UNIT_ID", "showOnResume": true, "maxShowsPerDay": 3, "showOnAppStart": true, "showOnAppReturn": true, "cooldownPeriod": 300}',
        '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_SPLASH_AD_UNIT_ID", "showDelay": 2, "skipAfter": 5, "showOnFirstLaunch": true, "showOnAppUpdate": false}',
        '{"enabled": false, "adUnitId": "", "position": "custom", "customConfig": {}, "targeting": {}, "keywords": []}',
        '{"testMode": false, "debugMode": false, "ageRestriction": 13, "cooldownPeriod": 60, "maxAdsPerSession": 10, "userConsentRequired": true, "gdprCompliant": true, "ccpaCompliant": true, "maxAdRequestsPerMinute": 5, "adLoadTimeout": 10}',
        '{"enabled": false, "adUnitId": "YOUR_PRODUCTION_REWARDED_INTERSTITIAL_AD_UNIT_ID", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobView": true, "showOnCompanyView": false}',
        'Production environment configuration - Replace ad unit IDs with your actual production IDs',
        '{"version": "1.0.0", "lastUpdated": "${new Date().toISOString()}", "createdBy": "system"}',
        NOW(), NOW()
      )
    `);
    
    // Seed data for staging environment
    await sequelize.query(`
      INSERT INTO admob_configs (environment, banner, interstitial, rewarded, native, appOpen, splash, custom, globalConfig, rewardedInterstitial, notes, metadata, created_at, updated_at) VALUES
      ('staging',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/6300978111", "position": "bottom", "refreshInterval": 60, "adaptive": true, "smartBanner": true}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/1033173712", "minInterval": 300, "showOnJobView": true, "showOnCompanyView": false, "showOnCategoryView": false, "showOnSearch": true, "showOnProfile": false}',
        '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/5224354917", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobApply": true, "showOnProfile": false}',
        '{"style": "default", "enabled": true, "adUnitId": "ca-app-pub-3940256099942544/2247696110", "position": "job_list", "layout": "medium", "showInFeed": true, "showInDetail": false}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showOnResume": true, "maxShowsPerDay": 3, "showOnAppStart": true, "showOnAppReturn": true, "cooldownPeriod": 300}',
        '{"enabled": false, "adUnitId": "ca-app-pub-3940256099942544/3419835294", "showDelay": 2, "skipAfter": 5, "showOnFirstLaunch": true, "showOnAppUpdate": false}',
        '{"enabled": false, "adUnitId": "", "position": "custom", "customConfig": {}, "targeting": {}, "keywords": []}',
        '{"testMode": true, "debugMode": true, "ageRestriction": 13, "cooldownPeriod": 60, "maxAdsPerSession": 10, "userConsentRequired": true, "gdprCompliant": true, "ccpaCompliant": true, "maxAdRequestsPerMinute": 5, "adLoadTimeout": 10}',
        '{"enabled": true, "adUnitId": "ca-app-pub-3940256099942544/5354046379", "rewardType": "premium_jobs", "rewardAmount": 1, "showOnJobView": true, "showOnCompanyView": false}',
        'Staging environment configuration using test ad unit IDs',
        '{"version": "1.0.0", "lastUpdated": "${new Date().toISOString()}", "createdBy": "system"}',
        NOW(), NOW()
      )
    `);
    
    console.log('✅ AdMobConfig data seeded successfully!');
    
    // Verify the seeded data
    const [results] = await sequelize.query(`
      SELECT environment, banner, interstitial, appOpen, globalConfig FROM admob_configs
    `);
    
    console.log('📊 Seeded data summary:');
    results.forEach(row => {
      try {
        const banner = JSON.parse(row.banner || '{}');
        const interstitial = JSON.parse(row.interstitial || '{}');
        const appOpen = JSON.parse(row.appOpen || '{}');
        const globalConfig = JSON.parse(row.globalConfig || '{}');
        
        console.log(`  - ${row.environment}:`);
        console.log(`    • Banner: ${banner.enabled ? '✅' : '❌'} (${banner.adUnitId || 'N/A'})`);
        console.log(`    • Interstitial: ${interstitial.enabled ? '✅' : '❌'} (${interstitial.adUnitId || 'N/A'})`);
        console.log(`    • AppOpen: ${appOpen.enabled ? '✅' : '❌'} (${appOpen.adUnitId || 'N/A'})`);
        console.log(`    • Test Mode: ${globalConfig.testMode ? '✅' : '❌'}`);
      } catch (parseError) {
        console.log(`  - ${row.environment}: Error parsing JSON data`);
      }
    });
    
    console.log('\n📝 Notes:');
    console.log('  - Test environment uses Google test ad unit IDs');
    console.log('  - Production environment needs real ad unit IDs');
    console.log('  - Staging environment uses test IDs for safe testing');
    console.log('  - Update production ad unit IDs before going live');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seedAdMobConfig(); 