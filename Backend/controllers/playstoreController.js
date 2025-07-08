const axios = require('axios');
const { Op } = require('sequelize');
const { SavedKeyword, KeywordSearch } = require('../models');

// Generate keyword variations
function generateKeywordVariations(query) {
  const variations = [];
  const words = query.toLowerCase().split(' ');
  
  // Add original query
  variations.push(query);
  variations.push(query.toLowerCase());
  variations.push(query.charAt(0).toUpperCase() + query.slice(1));
  
  // Add common suffixes
  const suffixes = ['app', 'pro', 'plus', 'free', 'premium', '2024', '2023', 'tracker', 'manager', 'helper', 'android'];
  suffixes.forEach(suffix => {
    variations.push(`${query} ${suffix}`);
    variations.push(`${query}${suffix}`);
  });
  
  // Add common prefixes
  const prefixes = ['my', 'best', 'top', 'free', 'premium', 'android'];
  prefixes.forEach(prefix => {
    variations.push(`${prefix} ${query}`);
  });
  
  // Add Play Store specific terms
  variations.push(`${query} play store`);
  variations.push(`${query} android app`);
  variations.push(`${query} google play`);
  
  return variations;
}

// Generate more variations
function generateMoreVariations(query) {
  const variations = [];
  const base = query.toLowerCase();
  
  // Add trending terms
  const trending = ['ai', 'chat', 'social', 'video', 'music', 'food', 'travel', 'shopping', 'education', 'gaming'];
  trending.forEach(term => {
    variations.push(`${base} ${term}`);
  });
  
  // Add use case variations
  const useCases = ['for kids', 'for business', 'for students', 'for seniors', 'for beginners', 'offline'];
  useCases.forEach(useCase => {
    variations.push(`${base} ${useCase}`);
  });
  
  // Add Android-specific terms
  const androidTerms = ['android', 'mobile', 'phone', 'tablet', 'wear os'];
  androidTerms.forEach(term => {
    variations.push(`${base} ${term}`);
  });
  
  return variations;
}

// Get Play Store category-based keywords
function getPlayStoreCategoryKeywords(query) {
  const categoryMap = {
    'fitness': ['workout', 'exercise', 'gym', 'health', 'nutrition', 'weight loss', 'running', 'yoga', 'meditation'],
    'game': ['puzzle', 'action', 'strategy', 'arcade', 'simulation', 'rpg', 'racing', 'sports', 'adventure', 'casual'],
    'photo': ['camera', 'editor', 'filter', 'collage', 'gallery', 'instagram', 'snapchat', 'photo grid'],
    'music': ['player', 'streaming', 'radio', 'playlist', 'spotify', 'youtube music', 'soundcloud'],
    'social': ['chat', 'messaging', 'video call', 'dating', 'networking', 'facebook', 'twitter', 'instagram'],
    'food': ['recipe', 'delivery', 'restaurant', 'cooking', 'diet', 'meal planner', 'zomato', 'swiggy'],
    'travel': ['booking', 'hotel', 'flight', 'map', 'navigation', 'trip planner', 'uber', 'ola'],
    'education': ['learning', 'course', 'tutorial', 'study', 'language', 'math', 'science', 'online class'],
    'finance': ['banking', 'investment', 'budget', 'expense', 'crypto', 'upi', 'paytm', 'phonepe'],
    'shopping': ['ecommerce', 'online shopping', 'fashion', 'electronics', 'amazon', 'flipkart']
  };
  
  const queryLower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (queryLower.includes(category)) {
      return keywords;
    }
  }
  
  return [];
}

// Get common Play Store search terms
function getCommonPlayStoreTerms(query) {
  const commonTerms = [
    'free app', 'best app', 'top app', 'popular app', 'new app',
    'play store', 'android app', 'google play', 'mobile app',
    'download', 'install', 'update', 'review', 'rating', 'offline'
  ];
  
  return commonTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.split(' ')[0]));
}

// Get regional terms
function getRegionalTerms(query, region) {
  const regionalMap = {
    'in': ['hindi', 'tamil', 'telugu', 'marathi', 'gujarati', 'bengali', 'kannada', 'malayalam', 'punjabi', 'odia'],
    'us': ['english', 'spanish', 'french'],
    'gb': ['english', 'welsh', 'scottish'],
    'de': ['german', 'deutsch'],
    'fr': ['french', 'français'],
    'es': ['spanish', 'español'],
    'it': ['italian', 'italiano'],
    'pt': ['portuguese', 'português'],
    'ru': ['russian', 'русский'],
    'ja': ['japanese', '日本語'],
    'ko': ['korean', '한국어'],
    'zh': ['chinese', '中文'],
    'ar': ['arabic', 'العربية'],
    'tr': ['turkish', 'türkçe'],
    'hi': ['hindi', 'हिन्दी'],
    'th': ['thai', 'ไทย'],
    'vi': ['vietnamese', 'tiếng việt'],
    'id': ['indonesian', 'bahasa indonesia'],
    'ms': ['malay', 'bahasa melayu'],
    'tl': ['filipino', 'tagalog']
  };
  
  const regionLower = region.toLowerCase();
  if (regionalMap[regionLower]) {
    return regionalMap[regionLower].map(lang => `${query} ${lang}`);
  }
  
  return [];
}

// Get app type terms
function getAppTypeTerms(query) {
  const appTypes = [
    'launcher', 'widget', 'live wallpaper', 'keyboard', 'browser',
    'file manager', 'antivirus', 'cleaner', 'booster', 'battery saver',
    'vpn', 'ad blocker', 'screen recorder', 'video editor', 'pdf reader',
    'calculator', 'calendar', 'notes', 'reminder', 'alarm', 'clock'
  ];
  
  return appTypes.filter(type => type.includes(query.toLowerCase()) || query.toLowerCase().includes(type.split(' ')[0]));
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
 * Get Play Store keyword suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlayStoreKeywords = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 Play Store scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Google Play Store search suggestions API
    try {
      const response = await axios.get('https://play.google.com/store/search/suggest', {
        params: {
          q: query,
          hl: language,
          gl: region,
          c: 'apps'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://play.google.com/store',
          'Origin': 'https://play.google.com'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.suggestions) {
        response.data.suggestions.forEach(suggestion => {
          if (suggestion.suggestion) allSuggestions.add(suggestion.suggestion);
        });
      }
    } catch (err) {
      console.log('Primary API failed:', err.message);
    }

    // Method 2: Google Search suggestions for Play Store
    try {
      const searchResponse = await axios.get('https://www.google.com/complete/search', {
        params: {
          q: `${query} play store app`,
          cp: 1,
          client: 'gws-wiz',
          xssi: 't',
          hl: language,
          gl: region,
          gs_rn: 64,
          ds: 'cse'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/javascript, application/javascript, */*',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'Referer': 'https://play.google.com/'
        }
      });

      if (searchResponse.data) {
        // Parse Google's JSONP response
        const jsonStr = searchResponse.data.replace(/^[^\[]+/, '');
        try {
          const jsonData = JSON.parse(jsonStr);
          if (jsonData[1]) {
            jsonData[1].forEach(suggestion => {
              if (typeof suggestion === 'string') {
                allSuggestions.add(suggestion);
              } else if (suggestion[0]) {
                allSuggestions.add(suggestion[0]);
              }
            });
          }
        } catch (parseErr) {
          console.log('Failed to parse Google suggestions:', parseErr.message);
        }
      }
    } catch (err) {
      console.log('Google search failed:', err.message);
    }

    // Method 3: Generate keyword variations
    const variations = generateKeywordVariations(query);
    variations.forEach(v => allSuggestions.add(v));

    // Method 4: Play Store category-based suggestions
    const categoryKeywords = getPlayStoreCategoryKeywords(query);
    categoryKeywords.forEach(k => allSuggestions.add(k));

    // Method 5: Common Play Store search terms
    const commonTerms = getCommonPlayStoreTerms(query);
    commonTerms.forEach(t => allSuggestions.add(t));

    // Method 6: Regional variations
    const regionalTerms = getRegionalTerms(query, region);
    regionalTerms.forEach(t => allSuggestions.add(t));

    // Method 7: App type variations
    const appTypeTerms = getAppTypeTerms(query);
    appTypeTerms.forEach(t => allSuggestions.add(t));

    // Convert to array and filter
    let suggestionsArray = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50); // Return up to 50 suggestions

    // If still not enough, add more variations
    if (suggestionsArray.length < 20) {
      const moreVariations = generateMoreVariations(query);
      moreVariations.forEach(v => {
        if (!suggestionsArray.includes(v)) suggestionsArray.push(v);
      });
    }

    // Deduplication and merge logic
    let searchRecord = null;
    let mergedKeywords = suggestionsArray;
    let action = 'created';
    let total_merges = 0;
    try {
      searchRecord = await KeywordSearch.findOne({
        where: {
          query,
          platform: 'playstore',
          search_type: 'all',
          language,
          country: region
        }
      });
      if (searchRecord) {
        mergedKeywords = mergeArraysWithoutDuplicates(searchRecord.keywords, suggestionsArray);
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
          platform: 'playstore',
          search_type: 'all',
          language,
          country: region,
          keywords: suggestionsArray,
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
            platform: 'playstore',
            user_ip: req.ip,
            total_merges: 0
          }
        });
        action = 'created';
        total_merges = 0;
      }
    } catch (trackError) {
      console.error('Error tracking Play Store search:', trackError);
    }

    // Calculate new and total items for logging
    const new_keywords = mergedKeywords.length - (searchRecord?.keywords?.length || 0);
    const counts = {
      total_keywords: mergedKeywords.length,
      new_keywords
    };
    if (action === 'merged') {
      console.log('Merged keyword search data. New items added:', counts);
    } else {
      console.log('Created new Play Store keyword search record. Counts:', counts);
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
    console.error('Play Store scraper error:', err);
    res.status(500).json({ error: 'Failed to fetch Play Store suggestions' });
  }
};

/**
 * Get Play Store app suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlayStoreApps = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 Play Store app scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Google Play Store search suggestions API
    try {
      const response = await axios.get('https://play.google.com/store/search/suggest', {
        params: {
          q: query,
          hl: language,
          gl: region,
          c: 'apps'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://play.google.com/store',
          'Origin': 'https://play.google.com'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.suggestions) {
        response.data.suggestions.forEach(suggestion => {
          if (suggestion.suggestion) allSuggestions.add(suggestion.suggestion);
        });
      }
    } catch (err) {
      console.log('Primary API failed:', err.message);
    }

    // Method 2: Generate app-specific variations
    const appVariations = generateKeywordVariations(query);
    appVariations.forEach(v => allSuggestions.add(v));

    // Method 3: App type variations
    const appTypeTerms = getAppTypeTerms(query);
    appTypeTerms.forEach(t => allSuggestions.add(t));

    // Convert to array and filter
    let suggestions = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 30); // Return up to 30 app suggestions

    console.log(`✅ Play Store app scraping completed for "${query}": ${suggestions.length} apps found`);

    res.json({ 
      apps: suggestions.slice(0, 30),
      region: region,
      language: language,
      source: 'Google Play Store',
      count: suggestions.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Play Store app API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch Play Store app suggestions',
      message: err.message,
      query,
      region,
      language
    });
  }
};

/**
 * Get Play Store game suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlayStoreGames = async (req, res) => {
  const { query, region = 'us', language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 Play Store game scraping started for query: "${query}" (${region}/${language})`);

    let allSuggestions = new Set();

    // Method 1: Google Play Store search suggestions API for games
    try {
      const response = await axios.get('https://play.google.com/store/search/suggest', {
        params: {
          q: `${query} game`,
          hl: language,
          gl: region,
          c: 'apps'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': `${language}-${region.toUpperCase()}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://play.google.com/store',
          'Origin': 'https://play.google.com'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.data && response.data.suggestions) {
        response.data.suggestions.forEach(suggestion => {
          if (suggestion.suggestion) allSuggestions.add(suggestion.suggestion);
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

    console.log(`✅ Play Store game scraping completed for "${query}": ${suggestions.length} games found`);

    res.json({ 
      games: suggestions.slice(0, 30),
      region: region,
      language: language,
      source: 'Google Play Store',
      count: suggestions.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Play Store game API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch Play Store game suggestions',
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
    const search = await KeywordSearch.findOne({
      where: { query, platform, language, country }
    });
    if (!search) {
      return res.status(404).json({ success: false, message: 'Keyword search not found' });
    }
    search.likes = (search.likes || 0) + 1;
    await search.save();
    return res.json({ success: true, likes: search.likes });
  } catch (err) {
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
    const search = await KeywordSearch.findOne({
      where: { query, platform, language, country }
    });
    if (!search) {
      return res.status(404).json({ success: false, message: 'Keyword search not found' });
    }
    search.views = (search.views || 0) + 1;
    await search.save();
    return res.json({ success: true, views: search.views });
  } catch (err) {
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
    // Deduplicate: only keep the latest for each (query, platform, search_type)
    const seen = new Set();
    const trending = [];
    for (const k of all) {
      const key = `${k.query}|${k.platform}|${k.search_type}`;
      if (!seen.has(key)) {
        trending.push({
          ...k.toJSON(),
          created_at: k.created_at instanceof Date ? k.created_at.toISOString() : (typeof k.created_at === 'string' ? k.created_at : ''),
          views: k.views
        });
        seen.add(key);
      }
      if (trending.length >= limit) break;
    }
    return res.json({ success: true, data: trending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPlayStoreKeywords,
  getPlayStoreApps,
  getPlayStoreGames,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
}; 