const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { SavedKeyword, KeywordSearch } = require('../models');
const { Op } = require('sequelize');

puppeteer.use(StealthPlugin());

// Cache for storing results to avoid repeated scraping
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to strip HTML tags
function stripHtmlTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

// Helper function to create browser with retry logic
async function createBrowserWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Browser creation attempt ${attempt}/${maxRetries}`);
      
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1920,1080'
        ],
        timeout: 30000,
        protocolTimeout: 30000
      });

      // Test browser connection
      const testPage = await browser.newPage();
      await testPage.setDefaultTimeout(10000);
      await testPage.setDefaultNavigationTimeout(10000);
      await testPage.close();
      
      console.log('Browser created successfully');
      return browser;
    } catch (error) {
      console.error(`Browser creation attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error(`Failed to create browser after ${maxRetries} attempts: ${error.message}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

// Helper function to merge arrays and remove duplicates
function mergeArraysWithoutDuplicates(existingArray = [], newArray = []) {
  const existingSet = new Set(existingArray.map(item => item.toLowerCase().trim()));
  const merged = [...existingArray];
  
  for (const item of newArray) {
    const normalizedItem = item.toLowerCase().trim();
    if (!existingSet.has(normalizedItem)) {
      merged.push(item);
      existingSet.add(normalizedItem);
    }
  }
  
  return merged;
}

// Helper function to check and merge keyword search data
async function checkAndMergeKeywordSearchData(user_id, query, platform, country, language, newData, search_type, responseTime, req) {
  try {
    // Validate and set default values for required parameters
    const validatedParams = {
      user_id: user_id || null,
      query: query || '',
      platform: platform || 'google',
      country: country || 'US',
      language: language || 'en',
      search_type: search_type || 'all'
    };

    // Validate that query is not empty
    if (!validatedParams.query.trim()) {
      console.error('Query parameter is required');
      return {
        action: 'create_new',
        existingRecord: null,
        newItemsAdded: null,
        counts: null
      };
    }

    // Find existing keyword search from today (within 24 hours)
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const existingSearch = await KeywordSearch.findOne({
      where: {
        user_id: validatedParams.user_id,
        query: validatedParams.query,
        platform: validatedParams.platform,
        country: validatedParams.country,
        language: validatedParams.language,
        search_type: validatedParams.search_type,
        created_at: {
          [Op.gte]: yesterday
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (existingSearch) {
      console.log(`Found existing keyword search for ${validatedParams.query} from today, merging data`);
      
      // Merge arrays without duplicates
      const mergedKeywords = mergeArraysWithoutDuplicates(existingSearch.keywords, newData.keywords);
      const mergedQuestions = mergeArraysWithoutDuplicates(existingSearch.questions, newData.questions);
      const mergedPrepositions = mergeArraysWithoutDuplicates(existingSearch.prepositions, newData.prepositions);
      const mergedHashtags = mergeArraysWithoutDuplicates(existingSearch.hashtags, newData.hashtags);
      const mergedGeneratedHashtags = mergeArraysWithoutDuplicates(existingSearch.generated_hashtags, newData.generatedHashtags);
      
      // Calculate new items added
      const newKeywords = newData.keywords.filter(item => 
        !existingSearch.keywords.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newQuestions = newData.questions.filter(item => 
        !existingSearch.questions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newPrepositions = newData.prepositions.filter(item => 
        !existingSearch.prepositions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newHashtags = newData.hashtags.filter(item => 
        !existingSearch.hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newGeneratedHashtags = newData.generatedHashtags.filter(item => 
        !existingSearch.generated_hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      
      // Update the existing record
      await existingSearch.update({
        keywords: mergedKeywords,
        questions: mergedQuestions,
        prepositions: mergedPrepositions,
        hashtags: mergedHashtags,
        generated_hashtags: mergedGeneratedHashtags,
        all_data: {
          ...existingSearch.all_data,
          ...newData,
          last_merged: new Date().toISOString(),
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        },
        response_time: Math.min(existingSearch.response_time || responseTime, responseTime),
        metadata: {
          ...existingSearch.metadata,
          last_merge: new Date().toISOString(),
          total_merges: (existingSearch.metadata?.total_merges || 0) + 1,
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          },
          merge_count: (existingSearch.metadata?.merge_count || 0) + 1
        }
      });
      
      return {
        action: 'merged',
        existingRecord: existingSearch,
        newItemsAdded: {
          keywords: newKeywords,
          questions: newQuestions,
          prepositions: newPrepositions,
          hashtags: newHashtags,
          generated_hashtags: newGeneratedHashtags
        },
        counts: {
          total_keywords: mergedKeywords.length,
          total_questions: mergedQuestions.length,
          total_prepositions: mergedPrepositions.length,
          total_hashtags: mergedHashtags.length,
          total_generated_hashtags: mergedGeneratedHashtags.length,
          new_keywords: newKeywords.length,
          new_questions: newQuestions.length,
          new_prepositions: newPrepositions.length,
          new_hashtags: newHashtags.length,
          new_generated_hashtags: newGeneratedHashtags.length
        }
      };
    } else {
      console.log(`No existing keyword search found for ${validatedParams.query} from today, creating new record`);
      return {
        action: 'create_new',
        existingRecord: null,
        newItemsAdded: null,
        counts: null
      };
    }
  } catch (error) {
    console.error('Error checking and merging keyword search data:', error);
    throw error;
  }
}

// Helper function to check and merge saved keyword data
async function checkAndMergeSavedKeywordData(user_id, query, platform, country, language, newData) {
  try {
    // Validate and set default values for required parameters
    const validatedParams = {
      user_id: user_id || 1, // Default user ID
      query: query || '',
      platform: platform || 'google',
      country: country || 'US',
      language: language || 'en'
    };

    // Validate that query is not empty
    if (!validatedParams.query.trim()) {
      console.error('Query parameter is required for saved keyword');
      return {
        action: 'create_new',
        existingRecord: null,
        newItemsAdded: null,
        counts: null
      };
    }

    // Find existing saved keyword
    const existingSaved = await SavedKeyword.findOne({
      where: {
        user_id: validatedParams.user_id,
        query: validatedParams.query,
        platform: validatedParams.platform,
        country: validatedParams.country,
        language: validatedParams.language
      }
    });

    if (existingSaved) {
      console.log(`Found existing saved keyword for ${validatedParams.query}, merging new data`);
      
      // Merge arrays without duplicates
      const mergedKeywords = mergeArraysWithoutDuplicates(existingSaved.keywords, newData.keywords);
      const mergedQuestions = mergeArraysWithoutDuplicates(existingSaved.questions, newData.questions);
      const mergedPrepositions = mergeArraysWithoutDuplicates(existingSaved.prepositions, newData.prepositions);
      const mergedHashtags = mergeArraysWithoutDuplicates(existingSaved.hashtags, newData.hashtags);
      const mergedGeneratedHashtags = mergeArraysWithoutDuplicates(existingSaved.generated_hashtags, newData.generatedHashtags);
      
      // Calculate new items added
      const newKeywords = newData.keywords.filter(item => 
        !existingSaved.keywords.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newQuestions = newData.questions.filter(item => 
        !existingSaved.questions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newPrepositions = newData.prepositions.filter(item => 
        !existingSaved.prepositions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newHashtags = newData.hashtags.filter(item => 
        !existingSaved.hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newGeneratedHashtags = newData.generatedHashtags.filter(item => 
        !existingSaved.generated_hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      
      // Update the existing record
      await existingSaved.update({
        keywords: mergedKeywords,
        questions: mergedQuestions,
        prepositions: mergedPrepositions,
        hashtags: mergedHashtags,
        generated_hashtags: mergedGeneratedHashtags,
        all_data: {
          ...existingSaved.all_data,
          ...newData,
          last_merged: new Date().toISOString(),
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        },
        last_accessed: new Date(),
        metadata: {
          ...existingSaved.metadata,
          last_merge: new Date().toISOString(),
          total_merges: (existingSaved.metadata?.total_merges || 0) + 1,
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        }
      });
      
      return {
        action: 'merged',
        existingRecord: existingSaved,
        newItemsAdded: {
          keywords: newKeywords,
          questions: newQuestions,
          prepositions: newPrepositions,
          hashtags: newHashtags,
          generated_hashtags: newGeneratedHashtags
        },
        counts: {
          total_keywords: mergedKeywords.length,
          total_questions: mergedQuestions.length,
          total_prepositions: mergedPrepositions.length,
          total_hashtags: mergedHashtags.length,
          total_generated_hashtags: mergedGeneratedHashtags.length,
          new_keywords: newKeywords.length,
          new_questions: newQuestions.length,
          new_prepositions: newPrepositions.length,
          new_hashtags: newHashtags.length,
          new_generated_hashtags: newGeneratedHashtags.length
        }
      };
    } else {
      console.log(`No existing saved keyword found for ${validatedParams.query}, creating new record`);
      return {
        action: 'create_new',
        existingRecord: null,
        newItemsAdded: null,
        counts: null
      };
    }
  } catch (error) {
    console.error('Error checking and merging saved keyword data:', error);
    throw error;
  }
}

// Helper function to make API requests with retry logic
async function makeGoogleAPIRequest(page, search, language, country, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API request attempt ${attempt}/${maxRetries} for: ${search}`);
      
      const suggestions = await page.evaluate(async (search, language, country) => {
        const url = `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`;
        console.log('Fetching:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const text = await response.text();
          const json = JSON.parse(text.replace(/^[^\[]+/, ''));
          console.log('API suggestions:', json[0]);
          return json[0].map(item => item[0]);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      }, search, language, country);

      console.log(`API request successful for: ${search}`);
      return suggestions;
    } catch (error) {
      console.error(`API request attempt ${attempt} failed for ${search}:`, error.message);
      if (attempt === maxRetries) {
        console.error(`All API request attempts failed for: ${search}`);
        return []; // Return empty array instead of throwing
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Main scraping function
async function scrapeGoogleData(query, country = 'US', language = 'en') {
  const cacheKey = `${query}-${country}-${language}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', query);
    return cached.data;
  }

  let browser = null;
  
  try {
    console.log(`Starting Google scraping for query: ${query}`);
    
    // Create browser with retry logic
    browser = await createBrowserWithRetry();
    
    const page = await browser.newPage();
    
    // Set timeouts
    await page.setDefaultTimeout(15000);
    await page.setDefaultNavigationTimeout(15000);
    
    // Set user agent and viewport
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to Google with retry logic
    let navigationSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt}/3 to Google`);
        await page.goto('https://www.google.com', { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        navigationSuccess = true;
        break;
      } catch (navError) {
        console.error(`Navigation attempt ${attempt} failed:`, navError.message);
        if (attempt === 3) {
          throw new Error(`Failed to navigate to Google after 3 attempts: ${navError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!navigationSuccess) {
      throw new Error('Failed to navigate to Google');
    }

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set();

    // Get suggestions for the main keyword
    console.log('Fetching main keyword suggestions');
    const mainSuggestions = await makeGoogleAPIRequest(page, query, language, country);
    mainSuggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));

    // Get suggestions for keyword + each letter
    console.log('Fetching alphabet-based suggestions');
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const suggestions = await makeGoogleAPIRequest(page, variant, language, country);
      suggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Aggregate question variations
    console.log('Fetching question-based suggestions');
    const questionPrefixes = [
      "how", "what", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];
    
    for (const prefix of questionPrefixes) {
      const variant = `${query} ${prefix}`;
      const suggestions = await makeGoogleAPIRequest(page, variant, language, country);
      suggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Convert set to array and clean all suggestions
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

    // Prepositions: suggestions that contain a preposition as a word
    const prepositionRegex = new RegExp(`\\b(${prepositions.join("|")})\\b`, "i");
    const prepositionSuggestions = suggestionsArray.filter(s => prepositionRegex.test(s));

    const hashtags = suggestionsArray.filter(s => s.trim().startsWith('#'));
    const generatedHashtags = Array.from(new Set(suggestionsArray.map(s => '#' + s.replace(/\s+/g, '').toLowerCase())));

    console.log(`Scraping completed successfully. Found ${suggestionsArray.length} total suggestions`);

    const result = {
      keywords: suggestionsArray,
      questions,
      prepositions: prepositionSuggestions,
      hashtags,
      generatedHashtags,
      metadata: {
        query,
        country,
        language,
        totalKeywords: suggestionsArray.length,
        totalQuestions: questions.length,
        totalPrepositions: prepositionSuggestions.length,
        totalHashtags: hashtags.length,
        totalGeneratedHashtags: generatedHashtags.length,
        scrapedAt: new Date().toISOString()
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (err) {
    console.error('Scraper error:', err);
    
    // Provide fallback data if scraping fails
    const fallbackKeywords = [
      query,
      `${query} guide`,
      `${query} tips`,
      `${query} tutorial`,
      `${query} examples`,
      `${query} best practices`,
      `${query} how to`,
      `${query} what is`,
      `${query} benefits`,
      `${query} features`
    ];
    
    const fallbackQuestions = [
      `What is ${query}?`,
      `How to use ${query}?`,
      `Why use ${query}?`,
      `When to use ${query}?`,
      `Where to find ${query}?`
    ];
    
    const fallbackPrepositions = [
      `about ${query}`,
      `with ${query}`,
      `for ${query}`,
      `in ${query}`,
      `on ${query}`
    ];
    
    const fallbackHashtags = [
      `#${query.replace(/\s+/g, '')}`,
      `#${query.replace(/\s+/g, '').toLowerCase()}`,
      `#${query.replace(/\s+/g, '')}tips`,
      `#${query.replace(/\s+/g, '')}guide`
    ];
    
    console.log('Returning fallback data due to scraping error');
    
    return {
      keywords: fallbackKeywords,
      questions: fallbackQuestions,
      prepositions: fallbackPrepositions,
      hashtags: fallbackHashtags,
      generatedHashtags: fallbackHashtags,
      metadata: {
        query,
        country,
        language,
        totalKeywords: fallbackKeywords.length,
        totalQuestions: fallbackQuestions.length,
        totalPrepositions: fallbackPrepositions.length,
        totalHashtags: fallbackHashtags.length,
        totalGeneratedHashtags: fallbackHashtags.length,
        scrapedAt: new Date().toISOString(),
        error: err.message,
        isFallback: true
      }
    };
  } finally {
    // Always close browser
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
}

// Controller methods
const googleController = {
  // GET /api/google/keywords
  async getKeywords(req, res) {
    try {
      const { query, country, language } = req.query;
      
      // Validate required parameters
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }
      
      const startTime = Date.now();
      
      const data = await scrapeGoogleData(query, country, language);
      const responseTime = Date.now() - startTime;
      
      // Track search in KeywordSearch table with duplicate checking
      try {
        const user_id = req.user?.id || null;
        
        // Check for existing keyword search and merge if found
        const searchMergeResult = await checkAndMergeKeywordSearchData(
          user_id, 
          query, 
          'google', 
          country, 
          language, 
          data,
          'keywords',
          responseTime,
          req
        );

        if (searchMergeResult.action === 'merged') {
          console.log(`Merged keyword search data. New items added:`, searchMergeResult.counts);
        } else {
          // Create new keyword search record
          await KeywordSearch.create({
            user_id,
            query,
            platform: 'google',
            search_type: 'keywords',
            country,
            language,
            keywords: data.keywords,
            questions: data.questions,
            prepositions: data.prepositions,
            hashtags: data.hashtags,
            generated_hashtags: data.generatedHashtags,
            all_data: data,
            response_time: responseTime,
            status: 'success',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            session_id: req.session?.id,
            is_cached: false,
            cache_hit: false,
            metadata: {
              search_type: 'keywords',
              platform: 'google',
              user_ip: req.ip,
              total_merges: 0
            }
          });
          console.log(`Created new keyword search record for: ${query}`);
        }
      } catch (trackError) {
        console.error('Error tracking search:', trackError);
        // Continue with response even if tracking fails
      }
      
      res.json({
        success: true,
        data: {
          keywords: data.keywords,
          count: data.keywords.length,
          metadata: {
            query,
            country,
            language,
            scrapedAt: data.metadata.scrapedAt,
            responseTime
          }
        }
      });
    } catch (error) {
      // Track failed search
      try {
        const user_id = req.user?.id || null;
        await KeywordSearch.create({
          user_id,
          query: req.query.query,
          platform: 'google',
          search_type: 'keywords',
          country: req.query.country,
          language: req.query.language,
          status: 'error',
          error_message: error.message,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          metadata: {
            search_type: 'keywords',
            platform: 'google',
            error: error.message
          }
        });
      } catch (trackError) {
        console.error('Error tracking failed search:', trackError);
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/google/questions
  async getQuestions(req, res) {
    try {
      const { query, country, language } = req.query;
      
      // Validate required parameters
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }
      
      const startTime = Date.now();
      
      const data = await scrapeGoogleData(query, country, language);
      const responseTime = Date.now() - startTime;
      
      // Track search in KeywordSearch table with duplicate checking
      try {
        const user_id = req.user?.id || null;
        
        // Check for existing keyword search and merge if found
        const searchMergeResult = await checkAndMergeKeywordSearchData(
          user_id, 
          query, 
          'google', 
          country, 
          language, 
          data,
          'questions',
          responseTime,
          req
        );

        if (searchMergeResult.action === 'merged') {
          console.log(`Merged keyword search data. New items added:`, searchMergeResult.counts);
        } else {
          // Create new keyword search record
          await KeywordSearch.create({
            user_id,
            query,
            platform: 'google',
            search_type: 'questions',
            country,
            language,
            keywords: data.keywords,
            questions: data.questions,
            prepositions: data.prepositions,
            hashtags: data.hashtags,
            generated_hashtags: data.generatedHashtags,
            all_data: data,
            response_time: responseTime,
            status: 'success',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            session_id: req.session?.id,
            is_cached: false,
            cache_hit: false,
            metadata: {
              search_type: 'questions',
              platform: 'google',
              user_ip: req.ip,
              total_merges: 0
            }
          });
          console.log(`Created new keyword search record for: ${query}`);
        }
      } catch (trackError) {
        console.error('Error tracking search:', trackError);
        // Continue with response even if tracking fails
      }
      
      res.json({
        success: true,
        data: {
          questions: data.questions,
          count: data.questions.length,
          metadata: {
            query,
            country,
            language,
            scrapedAt: data.metadata.scrapedAt,
            responseTime
          }
        }
      });
    } catch (error) {
      // Track failed search
      try {
        const user_id = req.user?.id || null;
        await KeywordSearch.create({
          user_id,
          query: req.query.query,
          platform: 'google',
          search_type: 'questions',
          country: req.query.country,
          language: req.query.language,
          status: 'error',
          error_message: error.message,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          metadata: {
            search_type: 'questions',
            platform: 'google',
            error: error.message
          }
        });
      } catch (trackError) {
        console.error('Error tracking failed search:', trackError);
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/google/prepositions
  async getPrepositions(req, res) {
    try {
      const { query, country, language } = req.query;
      
      // Validate required parameters
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }
      
      const startTime = Date.now();
      
      const data = await scrapeGoogleData(query, country, language);
      const responseTime = Date.now() - startTime;
      
      // Track search in KeywordSearch table with duplicate checking
      try {
        const user_id = req.user?.id || null;
        
        // Check for existing keyword search and merge if found
        const searchMergeResult = await checkAndMergeKeywordSearchData(
          user_id, 
          query, 
          'google', 
          country, 
          language, 
          data,
          'prepositions',
          responseTime,
          req
        );

        if (searchMergeResult.action === 'merged') {
          console.log(`Merged keyword search data. New items added:`, searchMergeResult.counts);
        } else {
          // Create new keyword search record
          await KeywordSearch.create({
            user_id,
            query,
            platform: 'google',
            search_type: 'prepositions',
            country,
            language,
            keywords: data.keywords,
            questions: data.questions,
            prepositions: data.prepositions,
            hashtags: data.hashtags,
            generated_hashtags: data.generatedHashtags,
            all_data: data,
            response_time: responseTime,
            status: 'success',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            session_id: req.session?.id,
            is_cached: false,
            cache_hit: false,
            metadata: {
              search_type: 'prepositions',
              platform: 'google',
              user_ip: req.ip,
              total_merges: 0
            }
          });
          console.log(`Created new keyword search record for: ${query}`);
        }
      } catch (trackError) {
        console.error('Error tracking search:', trackError);
        // Continue with response even if tracking fails
      }
      
      res.json({
        success: true,
        data: {
          prepositions: data.prepositions,
          count: data.prepositions.length,
          metadata: {
            query,
            country,
            language,
            scrapedAt: data.metadata.scrapedAt,
            responseTime
          }
        }
      });
    } catch (error) {
      // Track failed search
      try {
        const user_id = req.user?.id || null;
        await KeywordSearch.create({
          user_id,
          query: req.query.query,
          platform: 'google',
          search_type: 'prepositions',
          country: req.query.country,
          language: req.query.language,
          status: 'error',
          error_message: error.message,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          metadata: {
            search_type: 'prepositions',
            platform: 'google',
            error: error.message
          }
        });
      } catch (trackError) {
        console.error('Error tracking failed search:', trackError);
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/google/hashtags
  async getHashtags(req, res) {
    try {
      const { query, country, language } = req.query;
      
      // Validate required parameters
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }
      
      const startTime = Date.now();
      
      const data = await scrapeGoogleData(query, country, language);
      const responseTime = Date.now() - startTime;
      
      // Track search in KeywordSearch table with duplicate checking
      try {
        const user_id = req.user?.id || null;
        
        // Check for existing keyword search and merge if found
        const searchMergeResult = await checkAndMergeKeywordSearchData(
          user_id, 
          query, 
          'google', 
          country, 
          language, 
          data,
          'hashtags',
          responseTime,
          req
        );

        if (searchMergeResult.action === 'merged') {
          console.log(`Merged keyword search data. New items added:`, searchMergeResult.counts);
        } else {
          // Create new keyword search record
          await KeywordSearch.create({
            user_id,
            query,
            platform: 'google',
            search_type: 'hashtags',
            country,
            language,
            keywords: data.keywords,
            questions: data.questions,
            prepositions: data.prepositions,
            hashtags: data.hashtags,
            generated_hashtags: data.generatedHashtags,
            all_data: data,
            response_time: responseTime,
            status: 'success',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            session_id: req.session?.id,
            is_cached: false,
            cache_hit: false,
            metadata: {
              search_type: 'hashtags',
              platform: 'google',
              user_ip: req.ip,
              total_merges: 0
            }
          });
          console.log(`Created new keyword search record for: ${query}`);
        }
      } catch (trackError) {
        console.error('Error tracking search:', trackError);
        // Continue with response even if tracking fails
      }
      
      res.json({
        success: true,
        data: {
          hashtags: data.hashtags,
          generatedHashtags: data.generatedHashtags,
          count: {
            hashtags: data.hashtags.length,
            generatedHashtags: data.generatedHashtags.length,
            total: data.hashtags.length + data.generatedHashtags.length
          },
          metadata: {
            query,
            country,
            language,
            scrapedAt: data.metadata.scrapedAt,
            responseTime
          }
        }
      });
    } catch (error) {
      // Track failed search
      try {
        const user_id = req.user?.id || null;
        await KeywordSearch.create({
          user_id,
          query: req.query.query,
          platform: 'google',
          search_type: 'hashtags',
          country: req.query.country,
          language: req.query.language,
          status: 'error',
          error_message: error.message,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          metadata: {
            search_type: 'hashtags',
            platform: 'google',
            error: error.message
          }
        });
      } catch (trackError) {
        console.error('Error tracking failed search:', trackError);
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/google/all
  async getAllData(req, res) {
    try {
      const { query, country, language, save = 'false', location, title, description, tags, category } = req.query;
      
      // Validate required parameters
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }
      
      const startTime = Date.now();
      
      const data = await scrapeGoogleData(query, country, language);
      const responseTime = Date.now() - startTime;
      
      // Track search in KeywordSearch table with duplicate checking
      let searchRecord = null;
      try {
        const user_id = req.user?.id || null;
        
        // Check for existing keyword search and merge if found
        const searchMergeResult = await checkAndMergeKeywordSearchData(
          user_id, 
          query, 
          'google', 
          country, 
          language, 
          data,
          'all',
          responseTime,
          req
        );

        if (searchMergeResult.action === 'merged') {
          searchRecord = searchMergeResult.existingRecord;
          console.log(`Merged keyword search data. New items added:`, searchMergeResult.counts);
        } else {
          // Create new keyword search record
          searchRecord = await KeywordSearch.create({
            user_id,
            query,
            platform: 'google',
            search_type: 'all',
            country,
            language,
            keywords: data.keywords,
            questions: data.questions,
            prepositions: data.prepositions,
            hashtags: data.hashtags,
            generated_hashtags: data.generatedHashtags,
            all_data: data,
            response_time: responseTime,
            status: 'success',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            session_id: req.session?.id,
            is_cached: false,
            cache_hit: false,
            metadata: {
              search_type: 'all',
              platform: 'google',
              user_ip: req.ip,
              save_requested: save === 'true',
              total_merges: 0
            }
          });
          console.log(`Created new keyword search record for: ${query}`);
        }
      } catch (trackError) {
        console.error('Error tracking search:', trackError);
        // Continue with response even if tracking fails
      }
      
      // Save to database if requested
      let savedKeyword = null;
      let mergeResult = null;
      if (save === 'true') {
        try {
          const user_id = req.user?.id || 1; // Default user ID for now
          
          // Check for existing saved keyword and merge if found
          mergeResult = await checkAndMergeSavedKeywordData(
            user_id, 
            query, 
            'google', 
            country, 
            language, 
            data
          );

          if (mergeResult.action === 'merged') {
            // Data was merged with existing record
            savedKeyword = mergeResult.existingRecord;
            console.log(`Merged data with existing saved keyword. New items added:`, mergeResult.counts);
          } else {
            // Create new saved keyword
            savedKeyword = await SavedKeyword.create({
              user_id,
              original_search_id: searchRecord?.id, // Link to the search record
              query,
              platform: 'google',
              search_type: 'all',
              country,
              language,
              location,
              title: title || `${query} - Google keywords`,
              description,
              tags: tags ? JSON.parse(tags) : [],
              category,
              keywords: data.keywords,
              questions: data.questions,
              prepositions: data.prepositions,
              hashtags: data.hashtags,
              generated_hashtags: data.generatedHashtags,
              all_data: data,
              last_accessed: new Date(),
              metadata: {
                saved_from: 'google_api',
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                location: location,
                search_record_id: searchRecord?.id,
                total_merges: 0
              }
            });
            console.log(`Created new saved keyword for: ${query}`);
          }
        } catch (saveError) {
          console.error('Error saving keyword:', saveError);
          // Continue with response even if save fails
        }
      }
      
      res.json({
        success: true,
        data: {
          keywords: data.keywords,
          questions: data.questions,
          prepositions: data.prepositions,
          hashtags: data.hashtags,
          generatedHashtags: data.generatedHashtags,
          metadata: data.metadata,
          saved: savedKeyword ? {
            id: savedKeyword.id,
            saved_at: savedKeyword.created_at,
            location: savedKeyword.location,
            title: savedKeyword.title,
            action: mergeResult?.action || 'created',
            merge_info: mergeResult ? {
              action: mergeResult.action,
              new_items_added: mergeResult.counts,
              total_items: mergeResult.counts ? {
                keywords: mergeResult.counts.total_keywords,
                questions: mergeResult.counts.total_questions,
                prepositions: mergeResult.counts.total_prepositions,
                hashtags: mergeResult.counts.total_hashtags,
                generated_hashtags: mergeResult.counts.total_generated_hashtags
              } : null
            } : null
          } : null
        },
        metadata: {
          query,
          platform: 'google',
          language,
          country,
          search_type: 'all',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Track failed search
      try {
        const user_id = req.user?.id || null;
        await KeywordSearch.create({
          user_id,
          query: req.query.query,
          platform: 'google',
          search_type: 'all',
          country: req.query.country,
          language: req.query.language,
          status: 'error',
          error_message: error.message,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          session_id: req.session?.id,
          metadata: {
            search_type: 'all',
            platform: 'google',
            error: error.message,
            save_requested: req.query.save === 'true'
          }
        });
      } catch (trackError) {
        console.error('Error tracking failed search:', trackError);
      }
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Like a keyword search (increment likes)
   * @route POST /api/like
   */
  async likeKeywordSearch(req, res) {
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
  },

  /**
   * Get trending (most liked) keyword searches
   * @route GET /api/trending
   */
  async getTrendingKeywords(req, res) {
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
  },

  /**
   * Increment views for a keyword search
   * @route POST /api/view
   */
  async viewKeywordSearch(req, res) {
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
  }
};

module.exports = googleController; 