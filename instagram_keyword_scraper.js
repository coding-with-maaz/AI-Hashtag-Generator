const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/instagram', async (req, res) => {
  const query = req.query.query;
  const type = req.query.type || 'hashtags'; // 'hashtags' or 'people'
  const region = req.query.region || 'us'; // 'us', 'in', 'gb', 'de', 'fr', etc.

  if (!query) return res.status(400).json({ error: 'Missing query param' });

  try {
    let allSuggestions = new Set();

    if (type === 'hashtags') {
      // Method 1: Instagram hashtag search suggestions
      try {
        const response = await axios.get('https://www.instagram.com/web/search/topsearch/', {
          params: {
            query: `#${query}`,
            context: 'hashtag'
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.instagram.com/',
            'Origin': 'https://www.instagram.com'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          },
        });

        if (response.data && response.data.hashtags) {
          response.data.hashtags.forEach(hashtag => {
            if (hashtag.hashtag && hashtag.hashtag.name) {
              allSuggestions.add(`#${hashtag.hashtag.name}`);
            }
          });
        }
      } catch (err) {
        console.log('Instagram hashtag API failed:', err.message);
      }

      // Method 2: Generate hashtag variations
      const hashtagVariations = generateHashtagVariations(query);
      hashtagVariations.forEach(v => allSuggestions.add(v));

      // Method 3: Category-based hashtags
      const categoryHashtags = getCategoryHashtags(query);
      categoryHashtags.forEach(h => allSuggestions.add(h));

      // Method 4: Trending hashtags
      const trendingHashtags = getTrendingHashtags(query);
      trendingHashtags.forEach(h => allSuggestions.add(h));

      // Method 5: Regional hashtags
      const regionalHashtags = getRegionalHashtags(query, region);
      regionalHashtags.forEach(h => allSuggestions.add(h));

    } else if (type === 'people') {
      // Method 1: Instagram user search suggestions
      try {
        const response = await axios.get('https://www.instagram.com/web/search/topsearch/', {
          params: {
            query: query,
            context: 'user'
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.instagram.com/',
            'Origin': 'https://www.instagram.com'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          },
        });

        if (response.data && response.data.users) {
          response.data.users.forEach(user => {
            if (user.user && user.user.username) {
              allSuggestions.add(`@${user.user.username}`);
            }
          });
        }
      } catch (err) {
        console.log('Instagram user API failed:', err.message);
      }

      // Method 2: Generate username variations
      const usernameVariations = generateUsernameVariations(query);
      usernameVariations.forEach(v => allSuggestions.add(v));

      // Method 3: Category-based usernames
      const categoryUsernames = getCategoryUsernames(query);
      categoryUsernames.forEach(u => allSuggestions.add(u));

      // Method 4: Popular influencer patterns
      const influencerPatterns = getInfluencerPatterns(query);
      influencerPatterns.forEach(p => allSuggestions.add(p));
    }

    // Method 6: Common Instagram terms
    const commonTerms = getCommonInstagramTerms(query, type);
    commonTerms.forEach(t => allSuggestions.add(t));

    // Method 7: Engagement terms
    const engagementTerms = getEngagementTerms(query, type);
    engagementTerms.forEach(t => allSuggestions.add(t));

    // Convert to array and filter
    let suggestions = Array.from(allSuggestions)
      .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50); // Return up to 50 suggestions

    // If still not enough, add more variations
    if (suggestions.length < 20) {
      const moreVariations = generateMoreVariations(query, type);
      moreVariations.forEach(v => {
        if (!suggestions.includes(v)) suggestions.push(v);
      });
    }

    res.json({ 
      keywords: suggestions.slice(0, 50),
      type: type,
      region: region,
      source: 'Instagram',
      count: suggestions.length
    });

  } catch (err) {
    console.error('Instagram API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Instagram suggestions' });
  }
});

// Generate hashtag variations
function generateHashtagVariations(query) {
  const variations = [];
  const words = query.toLowerCase().split(' ');
  
  // Add original query with #
  variations.push(`#${query}`);
  variations.push(`#${query.toLowerCase()}`);
  variations.push(`#${query.charAt(0).toUpperCase() + query.slice(1)}`);
  
  // Add common suffixes
  const suffixes = ['love', 'life', 'style', 'fashion', 'beauty', 'food', 'travel', 'fitness', 'art', 'photography', 'daily', 'vibes', 'mood', 'goals', 'inspiration', 'motivation', 'lifestyle', 'trending', 'viral', 'popular'];
  suffixes.forEach(suffix => {
    variations.push(`#${query}${suffix}`);
    variations.push(`#${query}_${suffix}`);
  });
  
  // Add common prefixes
  const prefixes = ['my', 'best', 'top', 'amazing', 'beautiful', 'awesome', 'perfect', 'incredible'];
  prefixes.forEach(prefix => {
    variations.push(`#${prefix}${query}`);
    variations.push(`#${prefix}_${query}`);
  });
  
  // Add year variations
  const years = ['2024', '2023', '2022'];
  years.forEach(year => {
    variations.push(`#${query}${year}`);
    variations.push(`#${query}_${year}`);
  });
  
  return variations;
}

// Generate username variations
function generateUsernameVariations(query) {
  const variations = [];
  const words = query.toLowerCase().split(' ');
  
  // Add original query with @
  variations.push(`@${query}`);
  variations.push(`@${query.toLowerCase()}`);
  variations.push(`@${query.charAt(0).toUpperCase() + query.slice(1)}`);
  
  // Add common suffixes
  const suffixes = ['official', 'real', 'original', 'tv', 'vlog', 'blog', 'daily', 'life', 'style', 'fashion', 'beauty', 'food', 'travel', 'fitness', 'art', 'photo', 'videos', 'content', 'creator', 'influencer'];
  suffixes.forEach(suffix => {
    variations.push(`@${query}${suffix}`);
    variations.push(`@${query}_${suffix}`);
  });
  
  // Add common prefixes
  const prefixes = ['the', 'real', 'official', 'my', 'best'];
  prefixes.forEach(prefix => {
    variations.push(`@${prefix}${query}`);
    variations.push(`@${prefix}_${query}`);
  });
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    variations.push(`@${query}${i}`);
    variations.push(`@${query}_${i}`);
  }
  
  return variations;
}

// Generate more variations
function generateMoreVariations(query, type) {
  const variations = [];
  const base = query.toLowerCase();
  
  if (type === 'hashtags') {
    // Add trending hashtag terms
    const trending = ['reels', 'tiktok', 'viral', 'trending', 'popular', 'fyp', 'foryou', 'explore', 'discover', 'followme', 'followforfollow', 'likeforlike', 'comment', 'share', 'save'];
    trending.forEach(term => {
      variations.push(`#${base}${term}`);
      variations.push(`#${base}_${term}`);
    });
    
    // Add content type variations
    const contentTypes = ['photo', 'video', 'reel', 'story', 'post', 'content', 'feed', 'grid', 'highlight'];
    contentTypes.forEach(type => {
      variations.push(`#${base}${type}`);
      variations.push(`#${base}_${type}`);
    });
  } else {
    // Add username patterns
    const patterns = ['official', 'real', 'tv', 'vlog', 'blog', 'daily', 'life', 'style'];
    patterns.forEach(pattern => {
      variations.push(`@${base}${pattern}`);
      variations.push(`@${base}_${pattern}`);
    });
  }
  
  return variations;
}

// Get category-based hashtags
function getCategoryHashtags(query) {
  const categoryMap = {
    'fitness': ['#fitnessmotivation', '#fitnessgoals', '#fitnesslifestyle', '#fitnessaddict', '#fitnessjourney', '#fitnessinspiration', '#fitnesslife', '#fitnessfreak', '#fitnesscommunity', '#fitnessworld'],
    'fashion': ['#fashionstyle', '#fashionblogger', '#fashionista', '#fashionlover', '#fashiontrend', '#fashioninspo', '#fashiondaily', '#fashionaddict', '#fashionlife', '#fashioncommunity'],
    'food': ['#foodie', '#foodlover', '#foodphotography', '#foodporn', '#foodblogger', '#foodstagram', '#foodlife', '#foodaddict', '#foodcommunity', '#foodtrend'],
    'travel': ['#travelphotography', '#travelblogger', '#traveling', '#travelgram', '#travelingram', '#traveladdict', '#travelcommunity', '#travelinspiration', '#travelgoals', '#travelvibes'],
    'beauty': ['#beautyblogger', '#beautylover', '#beautyaddict', '#beautystyle', '#beautycommunity', '#beautyinspo', '#beautylife', '#beautytrend', '#beautyphotography', '#beautygirl'],
    'art': ['#artwork', '#artist', '#artcommunity', '#artphotography', '#artlife', '#artinspiration', '#artdaily', '#artaddict', '#arttrend', '#artworld'],
    'photography': ['#photography', '#photographer', '#photooftheday', '#photographylover', '#photographylife', '#photographycommunity', '#photographyaddict', '#photographytrend', '#photographyinspiration', '#photographyart'],
    'music': ['#music', '#musician', '#musiclover', '#musiclife', '#musiccommunity', '#musicaddict', '#musictrend', '#musicinspiration', '#musicphotography', '#musicvibes'],
    'gaming': ['#gaming', '#gamer', '#gaminglife', '#gamingcommunity', '#gamingaddict', '#gamingtrend', '#gaminginspiration', '#gamingphotography', '#gamingvibes', '#gamingworld'],
    'business': ['#business', '#entrepreneur', '#businesslife', '#businesscommunity', '#businessaddict', '#businesstrend', '#businessinspiration', '#businessphotography', '#businessvibes', '#businessworld']
  };
  
  const queryLower = query.toLowerCase();
  for (const [category, hashtags] of Object.entries(categoryMap)) {
    if (queryLower.includes(category)) {
      return hashtags;
    }
  }
  
  return [];
}

// Get category-based usernames
function getCategoryUsernames(query) {
  const categoryMap = {
    'fitness': ['@fitnessguru', '@fitnesscoach', '@fitnessmotivation', '@fitnesslifestyle', '@fitnessinspiration'],
    'fashion': ['@fashionista', '@fashionblogger', '@fashionstyle', '@fashionlover', '@fashioninspo'],
    'food': ['@foodie', '@foodlover', '@foodblogger', '@foodphotography', '@foodstagram'],
    'travel': ['@travelblogger', '@travelphotography', '@traveling', '@travelgram', '@traveladdict'],
    'beauty': ['@beautyblogger', '@beautylover', '@beautyaddict', '@beautystyle', '@beautyinspo'],
    'art': ['@artist', '@artwork', '@artcommunity', '@artphotography', '@artinspiration'],
    'photography': ['@photographer', '@photography', '@photooftheday', '@photographylover', '@photographylife'],
    'music': ['@musician', '@musiclover', '@musiclife', '@musiccommunity', '@musicinspiration'],
    'gaming': ['@gamer', '@gaming', '@gaminglife', '@gamingcommunity', '@gamingaddict'],
    'business': ['@entrepreneur', '@business', '@businesslife', '@businesscommunity', '@businessinspiration']
  };
  
  const queryLower = query.toLowerCase();
  for (const [category, usernames] of Object.entries(categoryMap)) {
    if (queryLower.includes(category)) {
      return usernames;
    }
  }
  
  return [];
}

// Get trending hashtags
function getTrendingHashtags(query) {
  const trending = [
    '#reels', '#tiktok', '#viral', '#trending', '#popular', '#fyp', '#foryou', '#explore', '#discover',
    '#followme', '#followforfollow', '#likeforlike', '#comment', '#share', '#save', '#repost',
    '#love', '#instagood', '#photooftheday', '#beautiful', '#happy', '#cute', '#fashion', '#follow',
    '#me', '#selfie', '#summer', '#instadaily', '#friends', '#fun', '#style', '#instalike', '#smile',
    '#food', '#swag', '#family', '#like4like', '#my', '#life', '#amazing', '#instamood', '#cool',
    '#nofilter', '#instahappy', '#bestoftheday', '#instacool', '#follow4follow', '#nice', '#picoftheday'
  ];
  
  return trending.filter(hashtag => hashtag.includes(query.toLowerCase()) || query.toLowerCase().includes(hashtag.replace('#', '')));
}

// Get influencer patterns
function getInfluencerPatterns(query) {
  const patterns = [
    '@official', '@real', '@tv', '@vlog', '@blog', '@daily', '@life', '@style', '@fashion', '@beauty',
    '@food', '@travel', '@fitness', '@art', '@photo', '@videos', '@content', '@creator', '@influencer',
    '@youtuber', '@tiktoker', '@instagrammer', '@socialmedia', '@digital', '@online', '@web', '@internet'
  ];
  
  return patterns.filter(pattern => pattern.includes(query.toLowerCase()) || query.toLowerCase().includes(pattern.replace('@', '')));
}

// Get regional hashtags
function getRegionalHashtags(query, region) {
  const regionalMap = {
    'in': ['#india', '#indian', '#indianblogger', '#indianfashion', '#indianfood', '#indiantravel', '#indianart', '#indianphotography', '#indianbeauty', '#indianfitness'],
    'us': ['#usa', '#american', '#usablogger', '#usafashion', '#usafood', '#usatravel', '#usaart', '#usaphotography', '#usabeauty', '#usafitness'],
    'gb': ['#uk', '#british', '#ukblogger', '#ukfashion', '#ukfood', '#uktravel', '#ukart', '#ukphotography', '#ukbeauty', '#ukfitness'],
    'de': ['#germany', '#german', '#germanblogger', '#germanfashion', '#germanfood', '#germantravel', '#germanart', '#germanphotography', '#germanbeauty', '#germanfitness'],
    'fr': ['#france', '#french', '#frenchblogger', '#frenchfashion', '#frenchfood', '#frenchtravel', '#frenchart', '#frenchphotography', '#frenchbeauty', '#frenchfitness']
  };
  
  const regionLower = region.toLowerCase();
  if (regionalMap[regionLower]) {
    return regionalMap[regionLower].filter(hashtag => hashtag.includes(query.toLowerCase()) || query.toLowerCase().includes(hashtag.replace('#', '')));
  }
  
  return [];
}

// Get common Instagram terms
function getCommonInstagramTerms(query, type) {
  const commonTerms = type === 'hashtags' ? [
    '#instagram', '#instagood', '#instadaily', '#instalike', '#instamood', '#instahappy', '#instacool',
    '#instapic', '#instaphoto', '#instavideo', '#instareels', '#instastory', '#instafeed', '#instagrid'
  ] : [
    '@instagram', '@instagood', '@instadaily', '@instalike', '@instamood', '@instahappy', '@instacool',
    '@instapic', '@instaphoto', '@instavideo', '@instareels', '@instastory', '@instafeed', '@instagrid'
  ];
  
  return commonTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.replace(type === 'hashtags' ? '#' : '@', '')));
}

// Get engagement terms
function getEngagementTerms(query, type) {
  const engagementTerms = type === 'hashtags' ? [
    '#followme', '#followforfollow', '#likeforlike', '#comment', '#share', '#save', '#repost',
    '#followback', '#follow4follow', '#like4like', '#comment4comment', '#share4share'
  ] : [
    '@followme', '@followforfollow', '@likeforlike', '@comment', '@share', '@save', '@repost',
    '@followback', '@follow4follow', '@like4like', '@comment4comment', '@share4share'
  ];
  
  return engagementTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.replace(type === 'hashtags' ? '#' : '@', '')));
}

app.listen(PORT, () =>
  console.log(`✅ Instagram Keyword API running on http://localhost:${PORT}`)
);