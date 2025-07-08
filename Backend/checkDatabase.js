const { KeywordSearch, SavedKeyword, User } = require('./models');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check total searches
    const totalSearches = await KeywordSearch.count();
    console.log(`Total searches: ${totalSearches}`);
    
    // Check total saved keywords
    const totalSaved = await SavedKeyword.count();
    console.log(`Total saved keywords: ${totalSaved}`);
    
    // Check recent searches
    const recentSearches = await KeywordSearch.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'query', 'platform', 'created_at']
    });
    
    console.log('\nRecent searches:');
    if (recentSearches.length === 0) {
      console.log('No recent searches found');
    } else {
      recentSearches.forEach(search => {
        console.log(`- ${search.query} (${search.platform}) - ${search.created_at}`);
      });
    }
    
    // Check saved keywords
    const savedKeywords = await SavedKeyword.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'query', 'platform', 'created_at']
    });
    
    console.log('\nSaved keywords:');
    if (savedKeywords.length === 0) {
      console.log('No saved keywords found');
    } else {
      savedKeywords.forEach(saved => {
        console.log(`- ${saved.query} (${saved.platform}) - ${saved.created_at}`);
      });
    }
    
    // Check users
    const users = await User.findAll({
      attributes: ['id', 'username', 'email']
    });
    
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ Database check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }); 