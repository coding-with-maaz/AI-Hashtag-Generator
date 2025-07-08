const { KeywordSearch } = require('../models');

async function debug() {
  const searches = await KeywordSearch.findAll({
    where: { user_id: 1 },
    order: [['created_at', 'DESC']],
    limit: 20,
  });
  console.log('KeywordSearches for user_id=1:', searches.map(s => s.toJSON()));
  process.exit(0);
}

debug(); 