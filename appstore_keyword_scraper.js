const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/appstore', async (req, res) => {
  const query = req.query.query;
  const region = req.query.region || 'us'; // 'us', 'gb', 'in', 'de', 'fr', etc.
  const language = req.query.language || 'en'; // 'en', 'es', 'fr', 'de', etc.

  if (!query) return res.status(400).json({ error: 'Missing query param' });

  try {
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

    res.json({ 
      keywords: suggestions.slice(0, 50),
      region: region,
      language: language,
      source: 'App Store',
      count: suggestions.length
    });

  } catch (err) {
    console.error('App Store API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch App Store suggestions' });
  }
});

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

app.listen(PORT, () =>
  console.log(`✅ App Store Keyword API running on http://localhost:${PORT}`)
); 