const { KeywordSearch } = require('../models');

async function seed() {
  await KeywordSearch.create({
    user_id: 1,
    query: 'test search',
    platform: 'google',
    country: 'US',
    language: 'en',
    keywords: ['test', 'search', 'example'],
    questions: ['what is test?', 'how to search?'],
    prepositions: ['test for', 'search with'],
    hashtags: ['#test', '#search'],
    generated_hashtags: ['#example'],
    all_data: { foo: 'bar' },
    search_type: 'all',
    response_time: 123,
    status: 'success',
    error_message: null,
    ip_address: '127.0.0.1',
    user_agent: 'seed-script',
    session_id: 'seed-session',
    is_cached: false,
    cache_hit: false,
    metadata: { seeded: true },
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log('Seeded test keyword search for user_id=1');
  process.exit(0);
}

seed(); 