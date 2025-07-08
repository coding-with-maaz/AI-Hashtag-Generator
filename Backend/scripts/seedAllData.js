const { sequelize } = require('../config/database');
const User = require('../models/User');
const KeywordSearch = require('../models/KeywordSearch');
const SavedKeyword = require('../models/SavedKeyword');
const AdMobConfig = require('../models/AdMobConfig');
const bcrypt = require('bcryptjs');

const seedAllData = async () => {
  try {
    console.log('🌱 Starting comprehensive data seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await AdMobConfig.destroy({ where: {} });
    await SavedKeyword.destroy({ where: {} });
    await KeywordSearch.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Seed Users
    console.log('👥 Seeding users...');
    const users = await User.bulkCreate([
      {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Digital marketing enthusiast and SEO specialist',
        date_of_birth: '1990-05-15',
        gender: 'male',
        country: 'United States',
        timezone: 'America/New_York',
        language: 'en',
        is_verified: true,
        is_active: true,
        is_premium: true,
        preferences: { theme: 'dark', notifications: true }
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1987654321',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Content creator and social media expert',
        date_of_birth: '1988-12-03',
        gender: 'female',
        country: 'Canada',
        timezone: 'America/Toronto',
        language: 'en',
        is_verified: true,
        is_active: true,
        is_premium: false,
        preferences: { theme: 'light', notifications: false }
      },
      {
        username: 'mike_wilson',
        email: 'mike.wilson@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '+44123456789',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Fitness trainer and wellness coach',
        date_of_birth: '1992-08-22',
        gender: 'male',
        country: 'United Kingdom',
        timezone: 'Europe/London',
        language: 'en',
        is_verified: true,
        is_active: true,
        is_premium: true,
        preferences: { theme: 'dark', notifications: true }
      },
      {
        username: 'sarah_jones',
        email: 'sarah.jones@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Sarah',
        last_name: 'Jones',
        phone: '+61412345678',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Food blogger and recipe developer',
        date_of_birth: '1995-03-10',
        gender: 'female',
        country: 'Australia',
        timezone: 'Australia/Sydney',
        language: 'en',
        is_verified: true,
        is_active: true,
        is_premium: false,
        preferences: { theme: 'light', notifications: true }
      },
      {
        username: 'alex_chen',
        email: 'alex.chen@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Alex',
        last_name: 'Chen',
        phone: '+81901234567',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Tech enthusiast and software developer',
        date_of_birth: '1993-11-18',
        gender: 'other',
        country: 'Japan',
        timezone: 'Asia/Tokyo',
        language: 'ja',
        is_verified: true,
        is_active: true,
        is_premium: true,
        preferences: { theme: 'dark', notifications: false }
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Seed KeywordSearches
    console.log('🔍 Seeding keyword searches...');
    const keywordSearches = await KeywordSearch.bulkCreate([
      {
        user_id: users[0].id,
        query: 'digital marketing strategies',
        platform: 'google',
        country: 'US',
        language: 'en',
        keywords: ['digital marketing', 'online marketing', 'internet marketing', 'web marketing', 'e-marketing'],
        questions: ['What is digital marketing?', 'How to start digital marketing?', 'Best digital marketing tools'],
        prepositions: ['for', 'with', 'through', 'via', 'by'],
        hashtags: ['#digitalmarketing', '#marketing', '#onlinebusiness', '#growthhacking'],
        generated_hashtags: ['#digitalstrategy', '#marketingtips', '#businessgrowth'],
        all_data: {
          keywords: ['digital marketing', 'online marketing', 'internet marketing', 'web marketing', 'e-marketing'],
          questions: ['What is digital marketing?', 'How to start digital marketing?', 'Best digital marketing tools'],
          prepositions: ['for', 'with', 'through', 'via', 'by'],
          hashtags: ['#digitalmarketing', '#marketing', '#onlinebusiness', '#growthhacking'],
          generated_hashtags: ['#digitalstrategy', '#marketingtips', '#businessgrowth']
        },
        search_type: 'all',
        response_time: 1250,
        status: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_12345',
        is_cached: false,
        cache_hit: false,
        metadata: { source: 'web', device: 'desktop' }
      },
      {
        user_id: users[1].id,
        query: 'healthy recipes',
        platform: 'youtube',
        country: 'CA',
        language: 'en',
        keywords: ['healthy recipes', 'nutritious meals', 'clean eating', 'whole foods', 'balanced diet'],
        questions: ['What are healthy recipes?', 'How to cook healthy meals?', 'Quick healthy dinner ideas'],
        prepositions: ['with', 'for', 'using', 'made from', 'containing'],
        hashtags: ['#healthyrecipes', '#cleaneating', '#nutrition', '#healthylifestyle'],
        generated_hashtags: ['#healthyfood', '#nutritious', '#wellness'],
        all_data: {
          keywords: ['healthy recipes', 'nutritious meals', 'clean eating', 'whole foods', 'balanced diet'],
          questions: ['What are healthy recipes?', 'How to cook healthy meals?', 'Quick healthy dinner ideas'],
          prepositions: ['with', 'for', 'using', 'made from', 'containing'],
          hashtags: ['#healthyrecipes', '#cleaneating', '#nutrition', '#healthylifestyle'],
          generated_hashtags: ['#healthyfood', '#nutritious', '#wellness']
        },
        search_type: 'all',
        response_time: 980,
        status: 'success',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        session_id: 'session_12346',
        is_cached: true,
        cache_hit: true,
        metadata: { source: 'mobile', device: 'iphone' }
      },
      {
        user_id: users[2].id,
        query: 'workout routines',
        platform: 'google',
        country: 'GB',
        language: 'en',
        keywords: ['workout routines', 'exercise programs', 'fitness training', 'strength training', 'cardio workouts'],
        questions: ['What are good workout routines?', 'How to create a workout plan?', 'Best exercises for beginners'],
        prepositions: ['for', 'with', 'using', 'at', 'in'],
        hashtags: ['#workout', '#fitness', '#exercise', '#gym', '#training'],
        generated_hashtags: ['#workoutroutine', '#fitnessmotivation', '#healthylifestyle'],
        all_data: {
          keywords: ['workout routines', 'exercise programs', 'fitness training', 'strength training', 'cardio workouts'],
          questions: ['What are good workout routines?', 'How to create a workout plan?', 'Best exercises for beginners'],
          prepositions: ['for', 'with', 'using', 'at', 'in'],
          hashtags: ['#workout', '#fitness', '#exercise', '#gym', '#training'],
          generated_hashtags: ['#workoutroutine', '#fitnessmotivation', '#healthylifestyle']
        },
        search_type: 'all',
        response_time: 1100,
        status: 'success',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_12347',
        is_cached: false,
        cache_hit: false,
        metadata: { source: 'web', device: 'desktop' }
      },
      {
        user_id: users[3].id,
        query: 'baking tips',
        platform: 'youtube',
        country: 'AU',
        language: 'en',
        keywords: ['baking tips', 'baking techniques', 'cake decorating', 'bread making', 'pastry skills'],
        questions: ['How to improve baking skills?', 'What are essential baking tools?', 'Baking tips for beginners'],
        prepositions: ['for', 'with', 'using', 'in', 'on'],
        hashtags: ['#baking', '#bakingtips', '#cakedecorating', '#bread', '#pastry'],
        generated_hashtags: ['#bakingskills', '#homemade', '#dessert'],
        all_data: {
          keywords: ['baking tips', 'baking techniques', 'cake decorating', 'bread making', 'pastry skills'],
          questions: ['How to improve baking skills?', 'What are essential baking tools?', 'Baking tips for beginners'],
          prepositions: ['for', 'with', 'using', 'in', 'on'],
          hashtags: ['#baking', '#bakingtips', '#cakedecorating', '#bread', '#pastry'],
          generated_hashtags: ['#bakingskills', '#homemade', '#dessert']
        },
        search_type: 'all',
        response_time: 850,
        status: 'success',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        session_id: 'session_12348',
        is_cached: false,
        cache_hit: false,
        metadata: { source: 'mobile', device: 'iphone' }
      },
      {
        user_id: users[4].id,
        query: 'programming tutorials',
        platform: 'google',
        country: 'JP',
        language: 'en',
        keywords: ['programming tutorials', 'coding lessons', 'software development', 'web development', 'app development'],
        questions: ['How to learn programming?', 'Best programming languages for beginners?', 'Programming tutorial recommendations'],
        prepositions: ['for', 'with', 'using', 'in', 'on'],
        hashtags: ['#programming', '#coding', '#software', '#webdev', '#appdev'],
        generated_hashtags: ['#codingtutorials', '#learntocode', '#tech'],
        all_data: {
          keywords: ['programming tutorials', 'coding lessons', 'software development', 'web development', 'app development'],
          questions: ['How to learn programming?', 'Best programming languages for beginners?', 'Programming tutorial recommendations'],
          prepositions: ['for', 'with', 'using', 'in', 'on'],
          hashtags: ['#programming', '#coding', '#software', '#webdev', '#appdev'],
          generated_hashtags: ['#codingtutorials', '#learntocode', '#tech']
        },
        search_type: 'all',
        response_time: 1350,
        status: 'success',
        ip_address: '192.168.1.104',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        session_id: 'session_12349',
        is_cached: false,
        cache_hit: false,
        metadata: { source: 'web', device: 'macbook' }
      }
    ]);

    console.log(`✅ Created ${keywordSearches.length} keyword searches`);

    // Seed SavedKeywords
    console.log('💾 Seeding saved keywords...');
    const savedKeywords = await SavedKeyword.bulkCreate([
      {
        user_id: users[0].id,
        original_search_id: keywordSearches[0].id,
        query: 'digital marketing strategies',
        platform: 'google',
        search_type: 'all',
        country: 'US',
        language: 'en',
        location: 'New York, NY',
        keywords: ['digital marketing', 'online marketing', 'internet marketing', 'web marketing', 'e-marketing'],
        questions: ['What is digital marketing?', 'How to start digital marketing?', 'Best digital marketing tools'],
        prepositions: ['for', 'with', 'through', 'via', 'by'],
        hashtags: ['#digitalmarketing', '#marketing', '#onlinebusiness', '#growthhacking'],
        generated_hashtags: ['#digitalstrategy', '#marketingtips', '#businessgrowth'],
        all_data: {
          keywords: ['digital marketing', 'online marketing', 'internet marketing', 'web marketing', 'e-marketing'],
          questions: ['What is digital marketing?', 'How to start digital marketing?', 'Best digital marketing tools'],
          prepositions: ['for', 'with', 'through', 'via', 'by'],
          hashtags: ['#digitalmarketing', '#marketing', '#onlinebusiness', '#growthhacking'],
          generated_hashtags: ['#digitalstrategy', '#marketingtips', '#businessgrowth']
        },
        title: 'Digital Marketing Master Collection',
        description: 'Comprehensive collection of digital marketing strategies and tools',
        tags: ['marketing', 'digital', 'business', 'growth'],
        category: 'Marketing',
        is_favorite: true,
        is_public: false,
        view_count: 45,
        share_count: 3,
        last_accessed: new Date(),
        metadata: { source: 'manual_save', priority: 'high' }
      },
      {
        user_id: users[1].id,
        original_search_id: keywordSearches[1].id,
        query: 'healthy recipes',
        platform: 'youtube',
        search_type: 'all',
        country: 'CA',
        language: 'en',
        location: 'Toronto, ON',
        keywords: ['healthy recipes', 'nutritious meals', 'clean eating', 'whole foods', 'balanced diet'],
        questions: ['What are healthy recipes?', 'How to cook healthy meals?', 'Quick healthy dinner ideas'],
        prepositions: ['with', 'for', 'using', 'made from', 'containing'],
        hashtags: ['#healthyrecipes', '#cleaneating', '#nutrition', '#healthylifestyle'],
        generated_hashtags: ['#healthyfood', '#nutritious', '#wellness'],
        all_data: {
          keywords: ['healthy recipes', 'nutritious meals', 'clean eating', 'whole foods', 'balanced diet'],
          questions: ['What are healthy recipes?', 'How to cook healthy meals?', 'Quick healthy dinner ideas'],
          prepositions: ['with', 'for', 'using', 'made from', 'containing'],
          hashtags: ['#healthyrecipes', '#cleaneating', '#nutrition', '#healthylifestyle'],
          generated_hashtags: ['#healthyfood', '#nutritious', '#wellness']
        },
        title: 'Healthy Cooking Collection',
        description: 'Collection of healthy and nutritious recipes for everyday cooking',
        tags: ['food', 'health', 'cooking', 'nutrition'],
        category: 'Food & Health',
        is_favorite: false,
        is_public: true,
        view_count: 23,
        share_count: 7,
        last_accessed: new Date(),
        metadata: { source: 'auto_save', priority: 'medium' }
      },
      {
        user_id: users[2].id,
        original_search_id: keywordSearches[2].id,
        query: 'workout routines',
        platform: 'google',
        search_type: 'all',
        country: 'GB',
        language: 'en',
        location: 'London, UK',
        keywords: ['workout routines', 'exercise programs', 'fitness training', 'strength training', 'cardio workouts'],
        questions: ['What are good workout routines?', 'How to create a workout plan?', 'Best exercises for beginners'],
        prepositions: ['for', 'with', 'using', 'at', 'in'],
        hashtags: ['#workout', '#fitness', '#exercise', '#gym', '#training'],
        generated_hashtags: ['#workoutroutine', '#fitnessmotivation', '#healthylifestyle'],
        all_data: {
          keywords: ['workout routines', 'exercise programs', 'fitness training', 'strength training', 'cardio workouts'],
          questions: ['What are good workout routines?', 'How to create a workout plan?', 'Best exercises for beginners'],
          prepositions: ['for', 'with', 'using', 'at', 'in'],
          hashtags: ['#workout', '#fitness', '#exercise', '#gym', '#training'],
          generated_hashtags: ['#workoutroutine', '#fitnessmotivation', '#healthylifestyle']
        },
        title: 'Fitness Training Guide',
        description: 'Complete workout routines and fitness training programs',
        tags: ['fitness', 'workout', 'exercise', 'health'],
        category: 'Fitness',
        is_favorite: true,
        is_public: false,
        view_count: 67,
        share_count: 12,
        last_accessed: new Date(),
        metadata: { source: 'manual_save', priority: 'high' }
      },
      {
        user_id: users[3].id,
        original_search_id: keywordSearches[3].id,
        query: 'baking tips',
        platform: 'youtube',
        search_type: 'all',
        country: 'AU',
        language: 'en',
        location: 'Sydney, NSW',
        keywords: ['baking tips', 'baking techniques', 'cake decorating', 'bread making', 'pastry skills'],
        questions: ['How to improve baking skills?', 'What are essential baking tools?', 'Baking tips for beginners'],
        prepositions: ['for', 'with', 'using', 'in', 'on'],
        hashtags: ['#baking', '#bakingtips', '#cakedecorating', '#bread', '#pastry'],
        generated_hashtags: ['#bakingskills', '#homemade', '#dessert'],
        all_data: {
          keywords: ['baking tips', 'baking techniques', 'cake decorating', 'bread making', 'pastry skills'],
          questions: ['How to improve baking skills?', 'What are essential baking tools?', 'Baking tips for beginners'],
          prepositions: ['for', 'with', 'using', 'in', 'on'],
          hashtags: ['#baking', '#bakingtips', '#cakedecorating', '#bread', '#pastry'],
          generated_hashtags: ['#bakingskills', '#homemade', '#dessert']
        },
        title: 'Baking Masterclass',
        description: 'Essential baking tips and techniques for perfect results',
        tags: ['baking', 'cooking', 'dessert', 'recipes'],
        category: 'Cooking',
        is_favorite: false,
        is_public: true,
        view_count: 34,
        share_count: 5,
        last_accessed: new Date(),
        metadata: { source: 'auto_save', priority: 'medium' }
      },
      {
        user_id: users[4].id,
        original_search_id: keywordSearches[4].id,
        query: 'programming tutorials',
        platform: 'google',
        search_type: 'all',
        country: 'JP',
        language: 'en',
        location: 'Tokyo, Japan',
        keywords: ['programming tutorials', 'coding lessons', 'software development', 'web development', 'app development'],
        questions: ['How to learn programming?', 'Best programming languages for beginners?', 'Programming tutorial recommendations'],
        prepositions: ['for', 'with', 'using', 'in', 'on'],
        hashtags: ['#programming', '#coding', '#software', '#webdev', '#appdev'],
        generated_hashtags: ['#codingtutorials', '#learntocode', '#tech'],
        all_data: {
          keywords: ['programming tutorials', 'coding lessons', 'software development', 'web development', 'app development'],
          questions: ['How to learn programming?', 'Best programming languages for beginners?', 'Programming tutorial recommendations'],
          prepositions: ['for', 'with', 'using', 'in', 'on'],
          hashtags: ['#programming', '#coding', '#software', '#webdev', '#appdev'],
          generated_hashtags: ['#codingtutorials', '#learntocode', '#tech']
        },
        title: 'Programming Learning Path',
        description: 'Comprehensive programming tutorials and learning resources',
        tags: ['programming', 'coding', 'tech', 'development'],
        category: 'Technology',
        is_favorite: true,
        is_public: false,
        view_count: 89,
        share_count: 15,
        last_accessed: new Date(),
        metadata: { source: 'manual_save', priority: 'high' }
      }
    ]);

    console.log(`✅ Created ${savedKeywords.length} saved keywords`);

    // Seed AdMobConfigs
    console.log('📱 Seeding AdMob configurations...');
    const adMobConfigs = await AdMobConfig.bulkCreate([
      {
        user_id: users[0].id,
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~3347511713',
        ad_type: 'adaptiveBanner',
        ad_unit_id: 'ca-app-pub-3940256099942544/6300978111',
        ad_unit_name: 'Test Adaptive Banner Ad',
        ad_unit_description: 'Test adaptive banner ad unit for development',
        is_active: true,
        is_test: true,
        platform: 'android',
        version: '1.0.0',
        config_data: {
          banner_size: 'ADAPTIVE_BANNER',
          position: 'bottom',
          refresh_rate: 60
        },
        usage_stats: {
          impressions: 1250,
          clicks: 45,
          revenue: 12.50,
          ctr: 3.6,
          cpm: 10.0
        },
        performance_metrics: {
          load_time: 1200,
          fill_rate: 95.5,
          error_rate: 2.1
        },
        last_updated: new Date(),
        created_by: users[0].id,
        notes: 'Test adaptive banner ad for development environment',
        metadata: { test_mode: true, priority: 'high' }
      },
      {
        user_id: users[1].id,
        environment: 'test',
        app_id: 'ca-app-pub-3940256099942544~1458002511',
        ad_type: 'interstitial',
        ad_unit_id: 'ca-app-pub-3940256099942544/1033173712',
        ad_unit_name: 'Test Interstitial Ad',
        ad_unit_description: 'Test interstitial ad unit for development',
        is_active: true,
        is_test: true,
        platform: 'ios',
        version: '1.0.0',
        config_data: {
          show_frequency: 'every_3_sessions',
          timeout: 5000,
          preload: true
        },
        usage_stats: {
          impressions: 890,
          clicks: 23,
          revenue: 8.90,
          ctr: 2.6,
          cpm: 10.0
        },
        performance_metrics: {
          load_time: 1800,
          fill_rate: 92.3,
          error_rate: 3.2
        },
        last_updated: new Date(),
        created_by: users[1].id,
        notes: 'Test interstitial ad for iOS development',
        metadata: { test_mode: true, priority: 'medium' }
      },
      {
        user_id: users[2].id,
        environment: 'production',
        app_id: 'ca-app-pub-1234567890123456~9876543210',
        ad_type: 'rewarded',
        ad_unit_id: 'ca-app-pub-1234567890123456/1234567890',
        ad_unit_name: 'Production Rewarded Ad',
        ad_unit_description: 'Production rewarded ad unit for live app',
        is_active: true,
        is_test: false,
        platform: 'android',
        version: '2.1.0',
        config_data: {
          reward_type: 'coins',
          reward_amount: 10,
          show_frequency: 'user_choice'
        },
        usage_stats: {
          impressions: 5670,
          clicks: 234,
          revenue: 156.70,
          ctr: 4.1,
          cpm: 27.6
        },
        performance_metrics: {
          load_time: 950,
          fill_rate: 98.1,
          error_rate: 0.8
        },
        last_updated: new Date(),
        created_by: users[2].id,
        notes: 'Production rewarded ad for live app',
        metadata: { test_mode: false, priority: 'high' }
      },
      {
        user_id: users[3].id,
        environment: 'production',
        app_id: 'ca-app-pub-9876543210987654~0123456789',
        ad_type: 'native',
        ad_unit_id: 'ca-app-pub-9876543210987654/0987654321',
        ad_unit_name: 'Production Native Ad',
        ad_unit_description: 'Production native ad unit for content integration',
        is_active: true,
        is_test: false,
        platform: 'ios',
        version: '2.0.0',
        config_data: {
          native_style: 'content_feed',
          aspect_ratio: '16:9',
          custom_styling: true
        },
        usage_stats: {
          impressions: 3420,
          clicks: 189,
          revenue: 94.20,
          ctr: 5.5,
          cpm: 27.5
        },
        performance_metrics: {
          load_time: 1100,
          fill_rate: 96.8,
          error_rate: 1.5
        },
        last_updated: new Date(),
        created_by: users[3].id,
        notes: 'Production native ad for content feed',
        metadata: { test_mode: false, priority: 'medium' }
      },
      {
        user_id: users[4].id,
        environment: 'staging',
        app_id: 'ca-app-pub-5555555555555555~5555555555',
        ad_type: 'appOpen',
        ad_unit_id: 'ca-app-pub-5555555555555555/5555555555',
        ad_unit_name: 'Staging App Open Ad',
        ad_unit_description: 'Staging app open ad unit for testing',
        is_active: true,
        is_test: true,
        platform: 'android',
        version: '1.5.0',
        config_data: {
          show_frequency: 'app_launch',
          timeout: 3000,
          background_check: true
        },
        usage_stats: {
          impressions: 2100,
          clicks: 67,
          revenue: 21.00,
          ctr: 3.2,
          cpm: 10.0
        },
        performance_metrics: {
          load_time: 800,
          fill_rate: 94.2,
          error_rate: 2.8
        },
        last_updated: new Date(),
        created_by: users[4].id,
        notes: 'Staging app open ad for testing',
        metadata: { test_mode: true, priority: 'low' }
      }
    ]);

    console.log(`✅ Created ${adMobConfigs.length} AdMob configurations`);

    console.log('🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Keyword Searches: ${keywordSearches.length}`);
    console.log(`- Saved Keywords: ${savedKeywords.length}`);
    console.log(`- AdMob Configs: ${adMobConfigs.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Run the seeding function
if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAllData; 