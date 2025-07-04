const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ai_hashtag_generator',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'maaz',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function cleanupIndexes() {
  try {
    console.log('🧹 Cleaning up database indexes...');
    
    // First, let's see what indexes we have
    const indexCounts = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COUNT(*) as index_count
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'ai_hashtag_generator'}'
      GROUP BY TABLE_NAME
      ORDER BY index_count DESC;
    `);
    
    console.log('\n📊 Current index counts:');
    indexCounts[0].forEach(row => {
      console.log(`   - ${row.TABLE_NAME}: ${row.index_count} indexes`);
    });
    
    // Get total count
    const totalIndexes = indexCounts[0].reduce((sum, row) => sum + parseInt(row.index_count), 0);
    console.log(`\n📈 Total indexes: ${totalIndexes}/64`);
    
    if (totalIndexes <= 64) {
      console.log('✅ Index count is within limits. No cleanup needed.');
      return;
    }
    
    console.log('⚠️  Too many indexes. Starting cleanup...\n');
    
    // Drop indexes from users table first (it has the most)
    const userIndexQueries = [
      'DROP INDEX idx_users_created_at ON users',
      'DROP INDEX idx_users_updated_at ON users',
      'DROP INDEX idx_users_email ON users',
      'DROP INDEX idx_users_username ON users',
      'DROP INDEX idx_users_role ON users',
      'DROP INDEX idx_users_is_active ON users',
      'DROP INDEX idx_users_last_login ON users',
      'DROP INDEX idx_users_email_username ON users',
      'DROP INDEX idx_users_role_active ON users'
    ];
    
    console.log('🗑️  Dropping user table indexes...');
    for (const query of userIndexQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Dropped: ${query}`);
      } catch (error) {
        console.log(`ℹ️  Not found: ${query}`);
      }
    }
    
    // Drop indexes from saved_keywords table
    const savedKeywordIndexQueries = [
      'DROP INDEX idx_saved_keywords_location ON saved_keywords',
      'DROP INDEX idx_saved_keywords_is_public ON saved_keywords',
      'DROP INDEX idx_saved_keywords_updated_at ON saved_keywords',
      'DROP INDEX idx_saved_keywords_last_accessed ON saved_keywords',
      'DROP INDEX idx_saved_keywords_keyword_type ON saved_keywords',
      'DROP INDEX idx_saved_keywords_location_type ON saved_keywords'
    ];
    
    console.log('\n🗑️  Dropping saved_keywords table indexes...');
    for (const query of savedKeywordIndexQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Dropped: ${query}`);
      } catch (error) {
        console.log(`ℹ️  Not found: ${query}`);
      }
    }
    
    // Drop indexes from keyword_searches table
    const keywordSearchIndexQueries = [
      'DROP INDEX idx_keyword_searches_country ON keyword_searches',
      'DROP INDEX idx_keyword_searches_language ON keyword_searches',
      'DROP INDEX idx_keyword_searches_created_at ON keyword_searches',
      'DROP INDEX idx_keyword_searches_success ON keyword_searches',
      'DROP INDEX idx_keyword_searches_country_language ON keyword_searches'
    ];
    
    console.log('\n🗑️  Dropping keyword_searches table indexes...');
    for (const query of keywordSearchIndexQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Dropped: ${query}`);
      } catch (error) {
        console.log(`ℹ️  Not found: ${query}`);
      }
    }
    
    // Drop indexes from admob_configs table
    const admobIndexQueries = [
      'DROP INDEX idx_admob_configs_created_at ON admob_configs',
      'DROP INDEX idx_admob_configs_updated_at ON admob_configs',
      'DROP INDEX idx_admob_configs_is_active ON admob_configs'
    ];
    
    console.log('\n🗑️  Dropping admob_configs table indexes...');
    for (const query of admobIndexQueries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Dropped: ${query}`);
      } catch (error) {
        console.log(`ℹ️  Not found: ${query}`);
      }
    }
    
    // Check final count
    const finalIndexCounts = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COUNT(*) as index_count
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'ai_hashtag_generator'}'
      GROUP BY TABLE_NAME
      ORDER BY index_count DESC;
    `);
    
    console.log('\n📊 Final index counts:');
    finalIndexCounts[0].forEach(row => {
      console.log(`   - ${row.TABLE_NAME}: ${row.index_count} indexes`);
    });
    
    const finalTotalIndexes = finalIndexCounts[0].reduce((sum, row) => sum + parseInt(row.index_count), 0);
    console.log(`\n📈 Final total indexes: ${finalTotalIndexes}/64`);
    
    if (finalTotalIndexes <= 64) {
      console.log('✅ Database indexes cleaned up successfully.');
    } else {
      console.log('⚠️  Still too many indexes. Manual intervention may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up indexes:', error);
  } finally {
    await sequelize.close();
  }
}

cleanupIndexes(); 