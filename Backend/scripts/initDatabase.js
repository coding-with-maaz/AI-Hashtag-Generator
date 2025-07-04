const { sequelize, User, KeywordSearch, AdMobConfig } = require('../models');
const { testConnection } = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }

    // Sync all models with database
    console.log('📊 Syncing database models...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synced successfully.');

    // Create indexes
    console.log('🔍 Creating database indexes...');
    await sequelize.query(`
      -- Users table indexes (already defined in model)
      -- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      -- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      -- CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
      -- CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      
      -- Keyword searches table indexes (already defined in model)
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_user_id ON keyword_searches(user_id);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_query ON keyword_searches(query);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_platform ON keyword_searches(platform);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_search_type ON keyword_searches(search_type);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_status ON keyword_searches(status);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_created_at ON keyword_searches(created_at);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_user_created ON keyword_searches(user_id, created_at);
      -- CREATE INDEX IF NOT EXISTS idx_keyword_searches_platform_query ON keyword_searches(platform, query);
      
      -- AdMob configs table indexes
      CREATE INDEX IF NOT EXISTS idx_admob_configs_user_id ON admob_configs(user_id);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_environment ON admob_configs(environment);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_ad_type ON admob_configs(ad_type);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_is_active ON admob_configs(is_active);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_is_test ON admob_configs(is_test);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_platform ON admob_configs(platform);
      CREATE INDEX IF NOT EXISTS idx_admob_configs_created_at ON admob_configs(created_at);
    `);
    console.log('✅ Database indexes created successfully.');

    // Seed default AdMob configurations
    console.log('🌱 Seeding default AdMob configurations...');
    await seedDefaultAdMobConfigs();
    console.log('✅ Default AdMob configurations seeded successfully.');

    // Create default user
    console.log('👤 Creating default user...');
    await createDefaultUser();
    console.log('✅ Default user created successfully.');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Database Summary:');
    console.log('   - Users table: User management and authentication');
    console.log('   - Keyword searches table: Search history and results');
    console.log('   - AdMob configs table: AdMob configuration management');
    console.log('\n🔗 You can now start using the API with database persistence.');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function seedDefaultAdMobConfigs() {
  try {
    // Check if default configs already exist
    const existingConfigs = await AdMobConfig.count();
    if (existingConfigs > 0) {
      console.log('   - Default AdMob configs already exist, skipping...');
      return;
    }

    const defaultConfigs = [
      // Test Environment Configs
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'appOpen',
        ad_unit_id: 'ca-app-pub-3940256099942544/9257395921',
        ad_unit_name: 'App Open Test',
        ad_unit_description: 'Test app open ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'adaptiveBanner',
        ad_unit_id: 'ca-app-pub-3940256099942544/9214589741',
        ad_unit_name: 'Adaptive Banner Test',
        ad_unit_description: 'Test adaptive banner ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'fixedBanner',
        ad_unit_id: 'ca-app-pub-3940256099942544/6300978111',
        ad_unit_name: 'Fixed Banner Test',
        ad_unit_description: 'Test fixed banner ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'interstitial',
        ad_unit_id: 'ca-app-pub-3940256099942544/1033173712',
        ad_unit_name: 'Interstitial Test',
        ad_unit_description: 'Test interstitial ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'rewarded',
        ad_unit_id: 'ca-app-pub-3940256099942544/5224354917',
        ad_unit_name: 'Rewarded Test',
        ad_unit_description: 'Test rewarded ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'rewardedInterstitial',
        ad_unit_id: 'ca-app-pub-3940256099942544/5354046379',
        ad_unit_name: 'Rewarded Interstitial Test',
        ad_unit_description: 'Test rewarded interstitial ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'native',
        ad_unit_id: 'ca-app-pub-3940256099942544/2247696110',
        ad_unit_name: 'Native Test',
        ad_unit_description: 'Test native ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      },
      {
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'nativeVideo',
        ad_unit_id: 'ca-app-pub-3940256099942544/1044960115',
        ad_unit_name: 'Native Video Test',
        ad_unit_description: 'Test native video ad unit',
        is_test: true,
        platform: 'android',
        config_data: {
          testMode: true,
          description: 'Google official test ad unit'
        }
      }
    ];

    await AdMobConfig.bulkCreate(defaultConfigs);
    console.log(`   - Created ${defaultConfigs.length} default AdMob configurations`);

  } catch (error) {
    console.error('   - Error seeding default AdMob configs:', error);
    throw error;
  }
}

async function createDefaultUser() {
  try {
    // Check if default user already exists
    const existingUser = await User.findByPk(1);
    if (existingUser) {
      console.log('   - Default user already exists, skipping...');
      return;
    }

    // Create default user with ID 1
    const defaultUser = await User.create({
      id: 1, // Explicitly set ID to 1
      username: 'default_user',
      email: 'default@example.com',
      password_hash: 'default_hash_for_testing_only',
      first_name: 'Default',
      last_name: 'User',
      is_verified: true,
      is_active: true,
      is_premium: false,
      language: 'en',
      country: 'US',
      timezone: 'UTC',
      preferences: {
        theme: 'light',
        notifications: true
      }
    });

    console.log(`   - Created default user with ID: ${defaultUser.id}`);

  } catch (error) {
    console.error('   - Error creating default user:', error);
    throw error;
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
  seedDefaultAdMobConfigs
}; 