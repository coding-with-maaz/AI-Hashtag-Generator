const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fetch = require('node-fetch').default;
const { Op } = require('sequelize');
const KeywordSearch = require('../models/KeywordSearch');
const { SavedKeyword } = require('../models');
const { getScrapingConfig, getEnvironmentInfo } = require('../config/scrapingConfig');

puppeteer.use(StealthPlugin());

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
 * Get YouTube keyword suggestions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getYouTubeKeywords = async (req, res) => {
  const { query, hl = 'en', gl = 'US' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    const config = getScrapingConfig();
    const envInfo = getEnvironmentInfo();
    console.log(`🔍 YouTube scraping started for query: "${query}" (${hl}/${gl})`);
    console.log(`Environment: ${envInfo.environment}, Online Server: ${envInfo.isOnlineServer}`);
    console.log(`Configuration: ${config.maxAlphabetRequests} alphabet requests, ${config.maxQuestionRequests} question requests, ${config.requestDelay}ms delay`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set();

    // Get suggestions for the main keyword
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
        }
      }
    );
    const json = await response.json();
    json[1].forEach(item => allSuggestions.add(item));

    // Get suggestions for keyword + each letter (limited based on environment)
    console.log('Fetching alphabet-based suggestions');
    const alphabetToUse = alphabet.slice(0, config.maxAlphabetRequests);
    for (const letter of alphabetToUse) {
      const variant = `${query} ${letter}`;
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(variant)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
          }
        }
      );
      const js = await resp.json();
      js[1].forEach(item => allSuggestions.add(item));
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, config.requestDelay));
    }

    const questionPrefixes = [
      "how", "what", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];

    // Get suggestions for question prefixes (limited based on environment)
    console.log('Fetching question-based suggestions');
    const questionPrefixesToUse = questionPrefixes.slice(0, config.maxQuestionRequests);
    for (const prefix of questionPrefixesToUse) {
      const variant = `${query} ${prefix}`;
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(variant)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
          }
        }
      );
      const js = await resp.json();
      js[1].forEach(item => allSuggestions.add(item));
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, config.requestDelay));
    }

    const suggestionsArray = Array.from(allSuggestions);
    console.log(`✅ YouTube scraping completed for "${query}": ${suggestionsArray.length} suggestions found`);

    // List of question words
    const questionWords = [
      "what", "how", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];

    // List of common prepositions
    const prepositions = [
      "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "since", "through", "throughout", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without"
    ];

    // Questions: suggestions that start with a question word or end with '?'
    const questions = suggestionsArray.filter(s => {
      const lower = s.trim().toLowerCase();
      return questionWords.some(qw => lower.startsWith(qw + " ")) || lower.endsWith("?");
    });

    // Prepositions: suggestions that contain a preposition as a word
    const prepositionRegex = new RegExp(`\\b(${prepositions.join("|")})\\b`, "i");
    const prepositionSuggestions = suggestionsArray.filter(s => prepositionRegex.test(s));

    const hashtags = suggestionsArray.filter(s => s.trim().startsWith('#'));
    const generatedHashtags = Array.from(new Set(suggestionsArray.map(s => '#' + s.replace(/\s+/g, '').toLowerCase())));

    // Deduplication and merge logic (like Google)
    let searchRecord = null;
    let mergedKeywords = suggestionsArray;
    let mergedQuestions = questions;
    let mergedPrepositions = prepositionSuggestions;
    let mergedHashtags = hashtags;
    let mergedGeneratedHashtags = generatedHashtags;
    let action = 'created';
    let total_merges = 0;
    try {
      // Find existing search for this user/query/platform only (ignore language/country)
      searchRecord = await KeywordSearch.findOne({
        where: {
          query,
          platform: 'youtube',
          search_type: 'all'
        },
        order: [['created_at', 'DESC']] // Get the most recent one
      });
      if (searchRecord) {
        mergedKeywords = mergeArraysWithoutDuplicates(searchRecord.keywords, suggestionsArray);
        mergedQuestions = mergeArraysWithoutDuplicates(searchRecord.questions, questions);
        mergedPrepositions = mergeArraysWithoutDuplicates(searchRecord.prepositions, prepositionSuggestions);
        mergedHashtags = mergeArraysWithoutDuplicates(searchRecord.hashtags, hashtags);
        mergedGeneratedHashtags = mergeArraysWithoutDuplicates(searchRecord.generated_hashtags, generatedHashtags);
        total_merges = (searchRecord.metadata?.total_merges || 0) + 1;
        await searchRecord.update({
          keywords: mergedKeywords,
          questions: mergedQuestions,
          prepositions: mergedPrepositions,
          hashtags: mergedHashtags,
          generated_hashtags: mergedGeneratedHashtags,
          views: (searchRecord.views || 0) + 1,
          last_merged: new Date().toISOString(),
          metadata: {
            ...(searchRecord.metadata || {}),
            total_merges,
            last_view: new Date().toISOString()
          }
        });
        action = 'merged';
        console.log(`Merged YouTube keyword search data for: ${query}`);
      } else {
        // Create new record
        searchRecord = await KeywordSearch.create({
          query,
          platform: 'youtube',
          search_type: 'all',
          language: hl,
          country: gl,
          keywords: suggestionsArray,
          questions,
          prepositions: prepositionSuggestions,
          hashtags,
          generated_hashtags: generatedHashtags,
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
            platform: 'youtube',
            user_ip: req.ip,
            total_merges: 0,
            last_view: new Date().toISOString()
          }
        });
        action = 'created';
        total_merges = 0;
        console.log(`Created new YouTube keyword search record for: ${query}`);
      }
    } catch (trackError) {
      console.error('Error tracking YouTube search:', trackError);
    }

    // Calculate new and total items for logging
    const new_keywords = mergedKeywords.length - (searchRecord?.keywords?.length || 0);
    const new_questions = mergedQuestions.length - (searchRecord?.questions?.length || 0);
    const new_prepositions = mergedPrepositions.length - (searchRecord?.prepositions?.length || 0);
    const new_hashtags = mergedHashtags.length - (searchRecord?.hashtags?.length || 0);
    const new_generated_hashtags = mergedGeneratedHashtags.length - (searchRecord?.generated_hashtags?.length || 0);
    const counts = {
      total_keywords: mergedKeywords.length,
      total_questions: mergedQuestions.length,
      total_prepositions: mergedPrepositions.length,
      total_hashtags: mergedHashtags.length,
      total_generated_hashtags: mergedGeneratedHashtags.length,
      new_keywords,
      new_questions,
      new_prepositions,
      new_hashtags,
      new_generated_hashtags
    };
    if (action === 'merged') {
      console.log('Merged keyword search data. New items added:', counts);
    } else {
      console.log('Created new YouTube keyword search record. Counts:', counts);
    }

    console.log(`✅ YouTube scraping completed for "${query}":`);
    console.log(`   - Keywords: ${suggestionsArray.length}`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Prepositions: ${prepositionSuggestions.length}`);
    console.log(`   - Hashtags: ${hashtags.length}`);
    console.log(`   - Generated hashtags: ${generatedHashtags.length}`);

    // Only return the "no suggestions" message if the suggestions array is empty or all first char
    if (suggestionsArray.length === 0 || suggestionsArray.every(s => s === query[0])) {
      await browser.close();
      return res.status(200).json({
        success: true,
        data: {
          keywords: [],
          questions: [],
          prepositions: [],
          hashtags: [],
          generatedHashtags: [],
          message: "No suggestions available for this query or locale.",
          query,
          locale: { hl, gl }
        }
      });
    }

    await browser.close();
    
    res.json({
      success: true,
      data: {
        keywords: mergedKeywords,
        questions: mergedQuestions,
        prepositions: mergedPrepositions,
        hashtags: mergedHashtags,
        generatedHashtags: mergedGeneratedHashtags,
        query,
        locale: { hl, gl },
        timestamp: new Date().toISOString(),
        action,
        total_merges
      }
    });
  } catch (err) {
    console.error('❌ YouTube scraper error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube suggestions',
      message: err.message,
      query,
      locale: { hl, gl }
    });
  }
};

/**
 * Get YouTube questions only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getYouTubeQuestions = async (req, res) => {
  const { query, hl = 'en', gl = 'US' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 YouTube questions scraping started for query: "${query}" (${hl}/${gl})`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    let allSuggestions = new Set();

    // Get suggestions for the main keyword
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
        }
      }
    );
    const json = await response.json();
    json[1].forEach(item => allSuggestions.add(item));

    const questionPrefixes = [
      "how", "what", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];

    for (const prefix of questionPrefixes) {
      const variant = `${query} ${prefix}`;
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(variant)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
          }
        }
      );
      const js = await resp.json();
      js[1].forEach(item => allSuggestions.add(item));
    }

    const suggestionsArray = Array.from(allSuggestions);

    // List of question words
    const questionWords = [
      "what", "how", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];

    // List of common prepositions
    const prepositions = [
      "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "since", "through", "throughout", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without"
    ];

    // Questions: suggestions that start with a question word or end with '?'
    const questions = suggestionsArray.filter(s => {
      const lower = s.trim().toLowerCase();
      return questionWords.some(qw => lower.startsWith(qw + " ")) || lower.endsWith("?");
    });

    console.log(`✅ YouTube questions scraping completed for "${query}": ${questions.length} questions found`);

    await browser.close();
    
    res.json({
      questions,
      query,
      locale: { hl, gl },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ YouTube questions scraper error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube questions',
      message: err.message,
      query,
      locale: { hl, gl }
    });
  }
};

/**
 * Get YouTube prepositions only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getYouTubePrepositions = async (req, res) => {
  const { query, hl = 'en', gl = 'US' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 YouTube prepositions scraping started for query: "${query}" (${hl}/${gl})`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set();

    // Get suggestions for the main keyword
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
        }
      }
    );
    const json = await response.json();
    json[1].forEach(item => allSuggestions.add(item));

    // Get suggestions for keyword + each letter
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(variant)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
          }
        }
      );
      const js = await resp.json();
      js[1].forEach(item => allSuggestions.add(item));
    }

    const suggestionsArray = Array.from(allSuggestions);

    // List of common prepositions
    const prepositions = [
      "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "since", "through", "throughout", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without"
    ];

    // Prepositions: suggestions that contain a preposition as a word
    const prepositionRegex = new RegExp(`\\b(${prepositions.join("|")})\\b`, "i");
    const prepositionSuggestions = suggestionsArray.filter(s => prepositionRegex.test(s));

    console.log(`✅ YouTube prepositions scraping completed for "${query}": ${prepositionSuggestions.length} prepositions found`);

    await browser.close();
    
    res.json({
      prepositions: prepositionSuggestions,
      query,
      locale: { hl, gl },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ YouTube prepositions scraper error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube prepositions',
      message: err.message,
      query,
      locale: { hl, gl }
    });
  }
};

/**
 * Get YouTube hashtags only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getYouTubeHashtags = async (req, res) => {
  const { query, hl = 'en', gl = 'US' } = req.query;

  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter',
      message: 'Please provide a search query'
    });
  }

  try {
    console.log(`🔍 YouTube hashtags scraping started for query: "${query}" (${hl}/${gl})`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set();

    // Get suggestions for the main keyword
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
        }
      }
    );
    const json = await response.json();
    json[1].forEach(item => allSuggestions.add(item));

    // Get suggestions for keyword + each letter
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${hl}&gl=${gl}&q=${encodeURIComponent(variant)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-client-data': 'CIi2yQEIpbbJAQjBtskBCKmdygEIqKPKAQ==',
          }
        }
      );
      const js = await resp.json();
      js[1].forEach(item => allSuggestions.add(item));
    }

    const suggestionsArray = Array.from(allSuggestions);

    const hashtags = suggestionsArray.filter(s => s.trim().startsWith('#'));
    const generatedHashtags = Array.from(new Set(suggestionsArray.map(s => '#' + s.replace(/\s+/g, '').toLowerCase())));

    console.log(`✅ YouTube hashtags scraping completed for "${query}":`);
    console.log(`   - Hashtags: ${hashtags.length}`);
    console.log(`   - Generated hashtags: ${generatedHashtags.length}`);

    await browser.close();
    
    res.json({
      hashtags,
      generatedHashtags,
      query,
      locale: { hl, gl },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ YouTube hashtags scraper error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube hashtags',
      message: err.message,
      query,
      locale: { hl, gl }
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
  getYouTubeKeywords,
  getYouTubeQuestions,
  getYouTubePrepositions,
  getYouTubeHashtags,
  likeKeywordSearch,
  viewKeywordSearch,
  getTrendingKeywords
}; 