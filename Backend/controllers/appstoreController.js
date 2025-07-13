const axios = require('axios');
const { SavedKeyword, KeywordSearch } = require('../models');
const { Op } = require('sequelize');
const { getScrapingConfig, getEnvironmentInfo } = require('../config/scrapingConfig');

// Helper function to get Apple Store Front ID
function getStoreFront(region) {
  const storeFronts = {
    'us': '143441-1,29',
    'gb': '143444-1,29',
    'in': '143467-1,29',
    'de': '143443-1,29',
    'fr': '143442-1,29',
    'ca': '143455-1,29',
    'au': '143460-1,29',
    'jp': '143462-1,29',
    'kr': '143466-1,29',
    'cn': '143465-1,29',
    'br': '143503-1,29',
    'mx': '143468-1,29',
    'es': '143454-1,29',
    'it': '143450-1,29',
    'nl': '143449-1,29',
    'se': '143456-1,29',
    'no': '143457-1,29',
    'dk': '143458-1,29',
    'fi': '143447-1,29',
    'ru': '143469-1,29',
    'tr': '143480-1,29',
    'sg': '143464-1,29',
    'my': '143473-1,29',
    'th': '143475-1,29',
    'ph': '143474-1,29',
    'id': '143476-1,29',
    'vn': '143471-1,29'
  };
  
  return storeFronts[region.toLowerCase()] || storeFronts['us'];
}

// Generate keyword variations
function generateKeywordVariations(query) {
  const variations = [];
  const words = query.toLowerCase().split(' ');
  
  // Add original query
  variations.push(query);
  variations.push(query.toLowerCase());
  variations.push(query.charAt(0).toUpperCase() + query.slice(1));
  
  // Add common suffixes
  const suffixes = ['app', 'pro', 'plus', 'free', 'premium', '2024', '2023', 'tracker', 'manager', 'helper'];
  suffixes.forEach(suffix => {
    variations.push(`${query} ${suffix}`);
    variations.push(`${query}${suffix}`);
  });
  
  // Add common prefixes
  const prefixes = ['my', 'best', 'top', 'free', 'premium'];
  prefixes.forEach(prefix => {
    variations.push(`${prefix} ${query}`);
  });
  
  // Add category variations
  if (words.includes('fitness') || words.includes('workout')) {
    variations.push('fitness tracker', 'workout app', 'exercise tracker', 'gym app', 'health tracker');
  }
  if (words.includes('game')) {
    variations.push('mobile game', 'puzzle game', 'action game', 'strategy game');
  }
  if (words.includes('photo') || words.includes('camera')) {
    variations.push('photo editor', 'camera app', 'photo filter', 'photo collage');
  }
  
  return variations;
}

// Generate more variations
function generateMoreVariations(query) {
  const variations = [];
  const base = query.toLowerCase();
  
  // Add trending terms
  const trending = ['ai', 'chat', 'social', 'video', 'music', 'food', 'travel', 'shopping', 'education'];
  trending.forEach(term => {
    variations.push(`${base} ${term}`);
  });
  
  // Add use case variations
  const useCases = ['for kids', 'for business', 'for students', 'for seniors', 'for beginners'];
  useCases.forEach(useCase => {
    variations.push(`${base} ${useCase}`);
  });
  
  return variations;
}

// Extract keywords from text
function extractKeywordsFromText(text) {
  const keywords = [];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && word.length < 15);
  
  // Get most common words
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.keys(wordCount)
    .sort((a, b) => wordCount[b] - wordCount[a])
    .slice(0, 10);
}

// Get category-based keywords
function getCategoryKeywords(query) {
  const categoryMap = {
    'fitness': ['workout', 'exercise', 'gym', 'health', 'nutrition', 'weight loss', 'running', 'yoga'],
    'game': ['puzzle', 'action', 'strategy', 'arcade', 'simulation', 'rpg', 'racing', 'sports'],
    'photo': ['camera', 'editor', 'filter', 'collage', 'gallery', 'instagram', 'snapchat'],
    'music': ['player', 'streaming', 'radio', 'playlist', 'spotify', 'apple music'],
    'social': ['chat', 'messaging', 'video call', 'dating', 'networking', 'facebook', 'twitter'],
    'food': ['recipe', 'delivery', 'restaurant', 'cooking', 'diet', 'meal planner'],
    'travel': ['booking', 'hotel', 'flight', 'map', 'navigation', 'trip planner'],
    'education': ['learning', 'course', 'tutorial', 'study', 'language', 'math', 'science']
  };
  
  const queryLower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (queryLower.includes(category)) {
      return keywords;
    }
  }
  
  return [];
}

// Get common App Store search terms
function getCommonAppStoreTerms(query) {
  const commonTerms = [
    'free app', 'best app', 'top app', 'popular app', 'new app',
    'app store', 'ios app', 'iphone app', 'ipad app',
    'download', 'install', 'update', 'review', 'rating'
  ];
  
  return commonTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.split(' ')[0]));
}

// Helper function to merge arrays and remove duplicates
function mergeArraysWithoutDuplicates(existingArray = [], newArray = []) {
  const merged = [...existingArray];
  for (const item of newArray) {
    if (!merged.includes(item)) {
      merged.push(item);
    }
  }
  return merged;
}

/**
 * Get App Store keyword suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppStoreKeywords = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 App Store scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Apple's search suggestions API
    try {
      const response = await axios.get('https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints', {
        params: {
          q: query,
          cc: region.toUpperCase(),
          lang: language,
          media: 'software',
          term: query
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Apple-Store-Front': getStoreFront(region),
          'X-Apple-I-FD-Client-Info': '{"U":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15","L":"en-US","Z":"GMT-08:00","V":"1.1","F":""}'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.hints) {
        response.data.hints.forEach(hint => {
          if (hint.term) allSuggestions.add(hint.term);
        });
      }
    } catch (err) {
      console.log('Primary API failed:', err.message);
    }

    // Method 2: Generate keyword variations
    const variations = generateKeywordVariations(query);
    variations.forEach(v => allSuggestions.add(v));

    // Method 3: iTunes search for related terms
    try {
      const searchResponse = await axios.get(`https://itunes.apple.com/search`, {
        params: {
          term: query,
          country: region,
          media: 'software',
          limit: 50,
          entity: 'software'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });

      if (searchResponse.data && searchResponse.data.results) {
        // Extract keywords from app descriptions and categories
        searchResponse.data.results.forEach(app => {
          if (app.description) {
            const descKeywords = extractKeywordsFromText(app.description);
            descKeywords.forEach(k => allSuggestions.add(k));
          }
          if (app.primaryGenreName) {
            allSuggestions.add(app.primaryGenreName);
          }
          if (app.genres && app.genres.length > 0) {
            app.genres.forEach(genre => allSuggestions.add(genre));
          }
        });
      }
    } catch (err) {
      console.log('iTunes search failed:', err.message);
    }

    // Method 4: Category-based suggestions
    const categoryKeywords = getCategoryKeywords(query);
    categoryKeywords.forEach(k => allSuggestions.add(k));

    // Method 5: Common app store search terms
    const commonTerms = getCommonAppStoreTerms(query);
    commonTerms.forEach(t => allSuggestions.add(t));

    // Convert to array and filter
    let suggestions = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50); // Return up to 50 suggestions

    // If still not enough, add more variations
    if (suggestions.length < 20) {
      const moreVariations = generateMoreVariations(query);
      moreVariations.forEach(v => {
        if (!suggestions.includes(v)) suggestions.push(v);
      });
    }

    // Deduplication and merge logic
    let searchRecord = null;
    let mergedKeywords = suggestions;
    let action = 'created';
    let total_merges = 0;
    try {
      searchRecord = await KeywordSearch.findOne({
        where: {
          query,
          platform: 'appstore',
          search_type: 'all',
          language,
          country: region
        }
      });
      if (searchRecord) {
        mergedKeywords = mergeArraysWithoutDuplicates(searchRecord.keywords, suggestions);
        total_merges = (searchRecord.metadata?.total_merges || 0) + 1;
        await searchRecord.update({
          keywords: mergedKeywords,
          last_merged: new Date().toISOString(),
          metadata: {
            ...(searchRecord.metadata || {}),
            total_merges
          }
        });
        action = 'merged';
      } else {
        searchRecord = await KeywordSearch.create({
          query,
          platform: 'appstore',
          search_type: 'all',
          language,
          country: region,
          keywords: suggestions,
          questions: [],
          prepositions: [],
          hashtags: [],
          generated_hashtags: [],
          all_data: {},
          response_time: null,
          status: 'success',
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          is_cached: false,
          cache_hit: false,
          metadata: {
            search_type: 'all',
            platform: 'appstore',
            user_ip: req.ip,
            total_merges: 0
          }
        });
        action = 'created';
        total_merges = 0;
      }
    } catch (trackError) {
      console.error('Error tracking App Store search:', trackError);
    }

    // Calculate new and total items for logging
    const new_keywords = mergedKeywords.length - (searchRecord?.keywords?.length || 0);
    const counts = {
      total_keywords: mergedKeywords.length,
      new_keywords
    };
    if (action === 'merged') {
      console.log('Merged App Store keyword search data. New items added:', counts);
    } else {
      console.log('Created new App Store keyword search record. Counts:', counts);
    }

    res.json({
      success: true,
      data: {
        keywords: mergedKeywords,
        region,
        language,
        action,
        total_merges
      }
    });

  } catch (err) {
    console.error('❌ App Store API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch App Store suggestions',
      message: err.message,
      query,
      region,
      language
    });
  }
};

/**
 * Get App Store app suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppStoreApps = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 App Store app scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Apple's search suggestions API
    try {
      const response = await axios.get('https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints', {
        params: {
          q: query,
          cc: region.toUpperCase(),
          lang: language,
          media: 'software',
          term: query
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Apple-Store-Front': getStoreFront(region),
          'X-Apple-I-FD-Client-Info': '{"U":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15","L":"en-US","Z":"GMT-08:00","V":"1.1","F":""}'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.hints) {
        response.data.hints.forEach(hint => {
          if (hint.term) allSuggestions.add(hint.term);
        });
      }
    } catch (err) {
      console.log('Primary API failed:', err.message);
    }

    // Method 2: Generate app-specific variations
    const appVariations = generateKeywordVariations(query);
    appVariations.forEach(v => allSuggestions.add(v));

    // Method 3: App Store specific terms
    const appStoreTerms = ['ios app', 'iphone app', 'ipad app', 'mac app', 'app store'];
    appStoreTerms.forEach(term => {
      allSuggestions.add(`${query} ${term}`);
    });

    // Convert to array and filter
    let suggestions = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 30); // Return up to 30 app suggestions

    console.log(`✅ App Store app scraping completed for "${query}": ${suggestions.length} apps found`);

    res.json({ 
      apps: suggestions.slice(0, 30),
      region: region,
      language: language,
      source: 'App Store',
      count: suggestions.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ App Store app API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch App Store app suggestions',
      message: err.message,
      query,
      region,
      language
    });
  }
};

/**
 * Get App Store game suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppStoreGames = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 App Store game scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Apple's search suggestions API for games
    try {
      const response = await axios.get('https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints', {
        params: {
          q: `${query} game`,
          cc: region.toUpperCase(),
          lang: language,
          media: 'software',
          term: `${query} game`
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Apple-Store-Front': getStoreFront(region),
          'X-Apple-I-FD-Client-Info': '{"U":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15","L":"en-US","Z":"GMT-08:00","V":"1.1","F":""}'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.hints) {
        response.data.hints.forEach(hint => {
          if (hint.term) allSuggestions.add(hint.term);
        });
      }
    } catch (err) {
      console.log('Primary API failed:', err.message);
    }

    // Method 2: Generate game-specific variations
    const gameSuffixes = ['game', 'games', 'gaming', 'play', 'fun', 'arcade', 'puzzle', 'action', 'strategy'];
    gameSuffixes.forEach(suffix => {
      allSuggestions.add(`${query} ${suffix}`);
      allSuggestions.add(`${query}${suffix}`);
    });

    // Method 3: Game category variations
    const gameCategories = ['puzzle', 'action', 'strategy', 'arcade', 'simulation', 'rpg', 'racing', 'sports', 'adventure', 'casual'];
    gameCategories.forEach(category => {
      allSuggestions.add(`${query} ${category} game`);
    });

    // Convert to array and filter
    let suggestions = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 30); // Return up to 30 game suggestions

    console.log(`✅ App Store game scraping completed for "${query}": ${suggestions.length} games found`);

    res.json({ 
      games: suggestions.slice(0, 30),
      region: region,
      language: language,
      source: 'App Store',
      count: suggestions.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ App Store game API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch App Store game suggestions',
      message: err.message,
      query,
      region,
      language
    });
  }
};

/**
 * Like a keyword search (increment likes)
 * @route POST /api/like
 */
const likeKeywordSearch = async (req, res) => {
  try {
    const { query, platform, language = 'en', country = 'us' } = req.query;
    if (!query || !platform) {
      return res.status(400).json({ success: false, message: 'Missing query or platform' });
    }
    
    // First, analyze the database to find all records with the same query and platform
    const allSearches = await KeywordSearch.findAll({
      where: { 
        query, 
        platform 
      },
      order: [['likes', 'DESC'], ['created_at', 'DESC']] // Order by likes descending, then by creation date
    });
    
    if (allSearches.length > 0) {
      // Find the record with the most likes (first in the sorted array)
      const mostLikedSearch = allSearches[0];
      
      // Increment likes for the record with the most likes
      mostLikedSearch.likes = (mostLikedSearch.likes || 0) + 1;
      await mostLikedSearch.save();
      
      console.log(`✅ Like added to record with most likes: ${query} (${platform}) - Record ID: ${mostLikedSearch.id} - Total likes: ${mostLikedSearch.likes}`);
      console.log(`📊 Found ${allSearches.length} total records for this query/platform combination`);
      
      // Log details about all records found
      allSearches.forEach((search, index) => {
        console.log(`  ${index + 1}. ID: ${search.id}, Likes: ${search.likes || 0}, Created: ${search.created_at}, Language: ${search.language}, Country: ${search.country}`);
      });
      
      return res.json({ 
        success: true, 
        likes: mostLikedSearch.likes,
        recordId: mostLikedSearch.id,
        totalRecords: allSearches.length,
        message: `Like added to record with most likes (${mostLikedSearch.likes} total)`
      });
    } else {
      // Create new search record with 1 like if no records exist
      const newSearch = await KeywordSearch.create({
        query,
        platform,
        search_type: 'all',
        language,
        country,
        keywords: [],
        questions: [],
        prepositions: [],
        hashtags: [],
        generated_hashtags: [],
        all_data: {},
        response_time: null,
        status: 'success',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        session_id: req.session?.id,
        is_cached: false,
        cache_hit: false,
        likes: 1,
        views: 0,
        metadata: {
          search_type: 'all',
          platform,
          user_ip: req.ip,
          created_from_like: true,
          first_like: new Date().toISOString()
        }
      });
      console.log(`✅ Created new search record from like: ${query} (${platform}) - Likes: 1`);
      return res.json({ 
        success: true, 
        likes: 1, 
        created: true,
        recordId: newSearch.id,
        message: "New record created with 1 like"
      });
    }
  } catch (err) {
    console.error('❌ Error tracking like:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Increment views for a keyword search
 * @route POST /api/view
 */
const viewKeywordSearch = async (req, res) => {
  try {
    const { query, platform, language = 'en', country = 'us' } = req.query;
    if (!query || !platform) {
      return res.status(400).json({ success: false, message: 'Missing query or platform' });
    }
    
    // Find existing search record by query and platform only (ignore language/country)
    const search = await KeywordSearch.findOne({
      where: { 
        query, 
        platform 
      },
      order: [['created_at', 'DESC']] // Get the most recent one
    });
    
    if (search) {
      // Increment views for existing search
      search.views = (search.views || 0) + 1;
      await search.save();
      console.log(`✅ View incremented for existing search: ${query} (${platform}) - Total views: ${search.views}`);
    } else {
      // Create new search record with 1 view if it doesn't exist
      const newSearch = await KeywordSearch.create({
        query,
        platform,
        search_type: 'all',
        language,
        country,
        keywords: [],
        questions: [],
        prepositions: [],
        hashtags: [],
        generated_hashtags: [],
        all_data: {},
        response_time: null,
        status: 'success',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        session_id: req.session?.id,
        is_cached: false,
        cache_hit: false,
        likes: 0,
        views: 1,
        metadata: {
          search_type: 'all',
          platform,
          user_ip: req.ip,
          created_from_view: true,
          first_view: new Date().toISOString()
        }
      });
      console.log(`✅ Created new search record from view: ${query} (${platform}) - Views: 1`);
      return res.json({ success: true, views: 1, created: true });
    }
    
    return res.json({ success: true, views: search.views });
  } catch (err) {
    console.error('❌ Error tracking view:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get trending (most liked) keyword searches
 * @route GET /api/trending
 */
const getTrendingKeywords = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const { query, platform, search_type, sort } = req.query;
    const where = { likes: { [require('sequelize').Op.gt]: 0 } };
    if (query) where.query = query;
    if (platform && platform !== 'all') where.platform = platform;
    if (search_type && search_type !== 'all') where.search_type = search_type;
    let order;
    if (sort === 'views') {
      order = [['views', 'DESC'], ['created_at', 'DESC']];
    } else if (sort === 'recent') {
      order = [['created_at', 'DESC']];
    } else {
      order = [['likes', 'DESC'], ['created_at', 'DESC']];
    }
    const all = await KeywordSearch.findAll({
      where,
      order,
    });
    
    // Group by query and platform, aggregate views and likes
    const grouped = {};
    for (const k of all) {
      const key = `${k.query}|${k.platform}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...k.toJSON(),
          total_views: 0,
          total_likes: 0,
          records: []
        };
      }
      grouped[key].total_views += (k.views || 0);
      grouped[key].total_likes += (k.likes || 0);
      grouped[key].records.push(k);
    }
    
    // Convert to array and sort based on the requested sort parameter
    let trending = Object.values(grouped)
      .map(item => ({
        ...item,
        views: item.total_views, // Use aggregated views
        likes: item.total_likes, // Use aggregated likes
        created_at: item.created_at instanceof Date ? item.created_at.toISOString() : (typeof item.created_at === 'string' ? item.created_at : ''),
        // Remove internal fields
        total_views: undefined,
        total_likes: undefined,
        records: undefined
      }));
    
    // Sort based on the requested sort parameter
    if (sort === 'views') {
      trending.sort((a, b) => b.views - a.views);
    } else if (sort === 'recent') {
      trending.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      trending.sort((a, b) => b.likes - a.likes);
    }
    
    trending = trending.slice(0, limit);
    
    return res.json({ success: true, data: trending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAppStoreKeywords,
  getAppStoreApps,
  getAppStoreGames,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
}; 