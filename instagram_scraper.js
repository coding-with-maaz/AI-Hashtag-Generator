// 
// COMING SOON
// 


// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// const puppeteer = require('puppeteer');

// const app = express();
// app.use(cors());

// const PORT = 3000;

// app.get('/api/instagram', async (req, res) => {
//   const query = req.query.query;
//   const type = req.query.type || 'hashtags'; // 'hashtags' or 'people'
//   const region = req.query.region || 'us'; // 'us', 'in', 'gb', 'de', 'fr', etc.

//   if (!query) return res.status(400).json({ error: 'Missing query param' });

//   try {
//     let allSuggestions = new Set();

//     if (type === 'hashtags') {
//       // Method 1: Instagram hashtag search suggestions
//       try {
//         const response = await axios.get('https://www.instagram.com/web/search/topsearch/', {
//           params: {
//             query: `#${query}`,
//             context: 'hashtag'
//           },
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': 'application/json, text/plain, */*',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'X-Requested-With': 'XMLHttpRequest',
//             'Referer': 'https://www.instagram.com/',
//             'Origin': 'https://www.instagram.com'
//           },
//           validateStatus: function (status) {
//             return status >= 200 && status < 500;
//           },
//         });

//         if (response.data && response.data.hashtags) {
//           response.data.hashtags.forEach(hashtag => {
//             if (hashtag.hashtag && hashtag.hashtag.name) {
//               allSuggestions.add(`#${hashtag.hashtag.name}`);
//             }
//           });
//         }
//       } catch (err) {
//         console.log('Instagram hashtag API failed:', err.message);
//       }

//       // Method 2: Generate hashtag variations
//       const hashtagVariations = generateHashtagVariations(query);
//       hashtagVariations.forEach(v => allSuggestions.add(v));

//       // Method 3: Category-based hashtags
//       const categoryHashtags = getCategoryHashtags(query);
//       categoryHashtags.forEach(h => allSuggestions.add(h));

//       // Method 4: Trending hashtags
//       const trendingHashtags = getTrendingHashtags(query);
//       trendingHashtags.forEach(h => allSuggestions.add(h));

//       // Method 5: Regional hashtags
//       const regionalHashtags = getRegionalHashtags(query, region);
//       regionalHashtags.forEach(h => allSuggestions.add(h));

//     } else if (type === 'people') {
//       // Method 1: Instagram GraphQL API for real user search
//       try {
//         const response = await axios.get('https://www.instagram.com/graphql/query/', {
//           params: {
//             query_hash: 'c9100bf9110dd6361671f113dd02e7d6',
//             variables: JSON.stringify({
//               query: query,
//               first: 50,
//               after: null
//             })
//           },
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': 'application/json, text/plain, */*',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'X-Requested-With': 'XMLHttpRequest',
//             'Referer': 'https://www.instagram.com/',
//             'Origin': 'https://www.instagram.com',
//             'X-IG-App-ID': '936619743392459',
//             'X-IG-WWW-Claim': '0',
//             'X-ASBD-ID': '198387',
//             'X-CSRFToken': 'missing',
//             'X-Instagram-AJAX': '1'
//           },
//           validateStatus: function (status) {
//             return status >= 200 && status < 500;
//           },
//         });

//         if (response.data && response.data.data && response.data.data.user) {
//           const users = response.data.data.user.edge_followed_by.edges || [];
//           users.forEach(user => {
//             if (user.node) {
//               const userData = {
//                 username: `@${user.node.username}`,
//                 fullName: user.node.full_name || user.node.username,
//                 private: user.node.is_private || false,
//                 verified: user.node.is_verified || false,
//                 followers: user.node.edge_followed_by.count || 0,
//                 following: user.node.edge_follow.count || 0,
//                 posts: user.node.edge_owner_to_timeline_media.count || 0,
//                 profilePic: user.node.profile_pic_url || null,
//                 bio: user.node.biography || null
//               };
//               allSuggestions.add(JSON.stringify(userData));
//             }
//           });
//         }
//       } catch (err) {
//         console.log('Instagram GraphQL API failed:', err.message);
//       }

//       // Method 2: Instagram web search API for real user data
//       try {
//         const searchResponse = await axios.get('https://www.instagram.com/web/search/topsearch/', {
//           params: {
//             query: query,
//             context: 'user'
//           },
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': 'application/json, text/plain, */*',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'X-Requested-With': 'XMLHttpRequest',
//             'Referer': 'https://www.instagram.com/',
//             'Origin': 'https://www.instagram.com'
//           },
//           validateStatus: function (status) {
//             return status >= 200 && status < 500;
//           },
//         });

//         if (searchResponse.data && searchResponse.data.users) {
//           searchResponse.data.users.forEach(user => {
//             if (user.user && user.user.username) {
//               const userData = {
//                 username: `@${user.user.username}`,
//                 fullName: user.user.full_name || user.user.username,
//                 private: user.user.is_private || false,
//                 verified: user.user.is_verified || false,
//                 followers: user.user.follower_count || 0,
//                 following: user.user.following_count || 0,
//                 posts: user.user.media_count || 0,
//                 profilePic: user.user.profile_pic_url || null,
//                 bio: user.user.biography || null
//               };
//               allSuggestions.add(JSON.stringify(userData));
//             }
//           });
//         }
//       } catch (err) {
//         console.log('Instagram web search API failed:', err.message);
//       }

//       // Method 3: Instagram hashtag to user discovery
//       try {
//         const hashtagResponse = await axios.get(`https://www.instagram.com/explore/tags/${query}/`, {
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'Referer': 'https://www.instagram.com/'
//           }
//         });

//         // Extract user data from hashtag page
//         const userMatches = searchResponse.data.match(/"username":"([^"]+)"/g);
//         if (userMatches) {
//           userMatches.slice(0, 20).forEach(match => {
//             const username = match.match(/"username":"([^"]+)"/)[1];
//             const userData = {
//               username: `@${username}`,
//               fullName: username,
//               private: false,
//               verified: false,
//               followers: 0,
//               following: 0,
//               posts: 0,
//               profilePic: null,
//               bio: null
//             };
//             allSuggestions.add(JSON.stringify(userData));
//           });
//         }
//       } catch (err) {
//         console.log('Instagram hashtag discovery failed:', err.message);
//       }

//       // Method 4: Instagram location-based user discovery
//       try {
//         const locationResponse = await axios.get(`https://www.instagram.com/explore/locations/`, {
//           params: {
//             query: query
//           },
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             'Accept': 'application/json, text/plain, */*',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'X-Requested-With': 'XMLHttpRequest',
//             'Referer': 'https://www.instagram.com/'
//           }
//         });

//         if (locationResponse.data && locationResponse.data.locations) {
//           locationResponse.data.locations.slice(0, 10).forEach(location => {
//             if (location.top_posts && location.top_posts.length > 0) {
//               location.top_posts.forEach(post => {
//                 if (post.owner && post.owner.username) {
//                   const userData = {
//                     username: `@${post.owner.username}`,
//                     fullName: post.owner.full_name || post.owner.username,
//                     private: post.owner.is_private || false,
//                     verified: post.owner.is_verified || false,
//                     followers: post.owner.follower_count || 0,
//                     following: post.owner.following_count || 0,
//                     posts: post.owner.media_count || 0,
//                     profilePic: post.owner.profile_pic_url || null,
//                     bio: post.owner.biography || null
//                   };
//                   allSuggestions.add(JSON.stringify(userData));
//                 }
//               });
//             }
//           });
//         }
//       } catch (err) {
//         console.log('Instagram location discovery failed:', err.message);
//       }
//     }

//     // Method 6: Common Instagram terms
//     const commonTerms = getCommonInstagramTerms(query, type);
//     commonTerms.forEach(t => allSuggestions.add(t));

//     // Method 7: Engagement terms
//     const engagementTerms = getEngagementTerms(query, type);
//     engagementTerms.forEach(t => allSuggestions.add(t));

//     // Convert to array and filter
//     let suggestions = Array.from(allSuggestions)
//       .filter(s => s && s.length > 0 && s.toLowerCase().includes(query.toLowerCase()))
//       .slice(0, 50); // Return up to 50 suggestions

//     // If still not enough, add more variations
//     if (suggestions.length < 20) {
//       const moreVariations = generateMoreVariations(query, type);
//       moreVariations.forEach(v => {
//         if (type === 'people') {
//           const userData = {
//             username: v,
//             fullName: v.replace('@', ''),
//             private: false,
//             verified: false,
//             followers: 0,
//             following: 0,
//             posts: 0,
//             profilePic: null,
//             bio: null
//           };
//           if (!suggestions.includes(JSON.stringify(userData))) {
//             suggestions.push(JSON.stringify(userData));
//           }
//         } else {
//           if (!suggestions.includes(v)) suggestions.push(v);
//         }
//       });
//     }

//     // Process suggestions based on type
//     let processedSuggestions;
//     if (type === 'people') {
//       // Parse JSON strings back to objects for people
//       processedSuggestions = suggestions.map(s => {
//         try {
//           return JSON.parse(s);
//         } catch (e) {
//           // Fallback for non-JSON strings
//           return {
//             username: s,
//             fullName: s.replace('@', ''),
//             private: false,
//             verified: false,
//             followers: 0,
//             following: 0,
//             posts: 0,
//             profilePic: null,
//             bio: null
//           };
//         }
//       });
//     } else {
//       // Keep as strings for hashtags
//       processedSuggestions = suggestions;
//     }

//     res.json({ 
//       keywords: type === 'people' ? processedSuggestions : processedSuggestions.slice(0, 50),
//       type: type,
//       region: region,
//       source: 'Instagram',
//       count: processedSuggestions.length
//     });

//   } catch (err) {
//     console.error('Instagram API error:', err.message);
//     res.status(500).json({ error: 'Failed to fetch Instagram suggestions' });
//   }
// });

// // Generate hashtag variations
// function generateHashtagVariations(query) {
//   const variations = [];
//   const words = query.toLowerCase().split(' ');
  
//   // Add original query with #
//   variations.push(`#${query}`);
//   variations.push(`#${query.toLowerCase()}`);
//   variations.push(`#${query.charAt(0).toUpperCase() + query.slice(1)}`);
  
//   // Add common suffixes
//   const suffixes = ['love', 'life', 'style', 'fashion', 'beauty', 'food', 'travel', 'fitness', 'art', 'photography', 'daily', 'vibes', 'mood', 'goals', 'inspiration', 'motivation', 'lifestyle', 'trending', 'viral', 'popular'];
//   suffixes.forEach(suffix => {
//     variations.push(`#${query}${suffix}`);
//     variations.push(`#${query}_${suffix}`);
//   });
  
//   // Add common prefixes
//   const prefixes = ['my', 'best', 'top', 'amazing', 'beautiful', 'awesome', 'perfect', 'incredible'];
//   prefixes.forEach(prefix => {
//     variations.push(`#${prefix}${query}`);
//     variations.push(`#${prefix}_${query}`);
//   });
  
//   // Add year variations
//   const years = ['2024', '2023', '2022'];
//   years.forEach(year => {
//     variations.push(`#${query}${year}`);
//     variations.push(`#${query}_${year}`);
//   });
  
//   return variations;
// }

// // Generate username variations
// function generateUsernameVariations(query) {
//   const variations = [];
//   const words = query.toLowerCase().split(' ');
  
//   // Add original query with @
//   variations.push(`@${query}`);
//   variations.push(`@${query.toLowerCase()}`);
//   variations.push(`@${query.charAt(0).toUpperCase() + query.slice(1)}`);
  
//   // Add common suffixes
//   const suffixes = ['official', 'real', 'original', 'tv', 'vlog', 'blog', 'daily', 'life', 'style', 'fashion', 'beauty', 'food', 'travel', 'fitness', 'art', 'photo', 'videos', 'content', 'creator', 'influencer'];
//   suffixes.forEach(suffix => {
//     variations.push(`@${query}${suffix}`);
//     variations.push(`@${query}_${suffix}`);
//   });
  
//   // Add common prefixes
//   const prefixes = ['the', 'real', 'official', 'my', 'best'];
//   prefixes.forEach(prefix => {
//     variations.push(`@${prefix}${query}`);
//     variations.push(`@${prefix}_${query}`);
//   });
  
//   // Add numbers
//   for (let i = 1; i <= 5; i++) {
//     variations.push(`@${query}${i}`);
//     variations.push(`@${query}_${i}`);
//   }
  
//   return variations;
// }

// // Generate more variations
// function generateMoreVariations(query, type) {
//   const variations = [];
//   const base = query.toLowerCase();
  
//   if (type === 'hashtags') {
//     // Add trending hashtag terms
//     const trending = ['reels', 'tiktok', 'viral', 'trending', 'popular', 'fyp', 'foryou', 'explore', 'discover', 'followme', 'followforfollow', 'likeforlike', 'comment', 'share', 'save'];
//     trending.forEach(term => {
//       variations.push(`#${base}${term}`);
//       variations.push(`#${base}_${term}`);
//     });
    
//     // Add content type variations
//     const contentTypes = ['photo', 'video', 'reel', 'story', 'post', 'content', 'feed', 'grid', 'highlight'];
//     contentTypes.forEach(type => {
//       variations.push(`#${base}${type}`);
//       variations.push(`#${base}_${type}`);
//     });
//   } else {
//     // Add username patterns
//     const patterns = ['official', 'real', 'tv', 'vlog', 'blog', 'daily', 'life', 'style'];
//     patterns.forEach(pattern => {
//       variations.push(`@${base}${pattern}`);
//       variations.push(`@${base}_${pattern}`);
//     });
//   }
  
//   return variations;
// }

// // Get category-based hashtags
// function getCategoryHashtags(query) {
//   const categoryMap = {
//     'fitness': ['#fitnessmotivation', '#fitnessgoals', '#fitnesslifestyle', '#fitnessaddict', '#fitnessjourney', '#fitnessinspiration', '#fitnesslife', '#fitnessfreak', '#fitnesscommunity', '#fitnessworld'],
//     'fashion': ['#fashionstyle', '#fashionblogger', '#fashionista', '#fashionlover', '#fashiontrend', '#fashioninspo', '#fashiondaily', '#fashionaddict', '#fashionlife', '#fashioncommunity'],
//     'food': ['#foodie', '#foodlover', '#foodphotography', '#foodporn', '#foodblogger', '#foodstagram', '#foodlife', '#foodaddict', '#foodcommunity', '#foodtrend'],
//     'travel': ['#travelphotography', '#travelblogger', '#traveling', '#travelgram', '#travelingram', '#traveladdict', '#travelcommunity', '#travelinspiration', '#travelgoals', '#travelvibes'],
//     'beauty': ['#beautyblogger', '#beautylover', '#beautyaddict', '#beautystyle', '#beautycommunity', '#beautyinspo', '#beautylife', '#beautytrend', '#beautyphotography', '#beautygirl'],
//     'art': ['#artwork', '#artist', '#artcommunity', '#artphotography', '#artlife', '#artinspiration', '#artdaily', '#artaddict', '#arttrend', '#artworld'],
//     'photography': ['#photography', '#photographer', '#photooftheday', '#photographylover', '#photographylife', '#photographycommunity', '#photographyaddict', '#photographytrend', '#photographyinspiration', '#photographyart'],
//     'music': ['#music', '#musician', '#musiclover', '#musiclife', '#musiccommunity', '#musicaddict', '#musictrend', '#musicinspiration', '#musicphotography', '#musicvibes'],
//     'gaming': ['#gaming', '#gamer', '#gaminglife', '#gamingcommunity', '#gamingaddict', '#gamingtrend', '#gaminginspiration', '#gamingphotography', '#gamingvibes', '#gamingworld'],
//     'business': ['#business', '#entrepreneur', '#businesslife', '#businesscommunity', '#businessaddict', '#businesstrend', '#businessinspiration', '#businessphotography', '#businessvibes', '#businessworld']
//   };
  
//   const queryLower = query.toLowerCase();
//   for (const [category, hashtags] of Object.entries(categoryMap)) {
//     if (queryLower.includes(category)) {
//       return hashtags;
//     }
//   }
  
//   return [];
// }

// // Get category-based usernames
// function getCategoryUsernames(query) {
//   const categoryMap = {
//     'fitness': ['@fitnessguru', '@fitnesscoach', '@fitnessmotivation', '@fitnesslifestyle', '@fitnessinspiration'],
//     'fashion': ['@fashionista', '@fashionblogger', '@fashionstyle', '@fashionlover', '@fashioninspo'],
//     'food': ['@foodie', '@foodlover', '@foodblogger', '@foodphotography', '@foodstagram'],
//     'travel': ['@travelblogger', '@travelphotography', '@traveling', '@travelgram', '@traveladdict'],
//     'beauty': ['@beautyblogger', '@beautylover', '@beautyaddict', '@beautystyle', '@beautyinspo'],
//     'art': ['@artist', '@artwork', '@artcommunity', '@artphotography', '@artinspiration'],
//     'photography': ['@photographer', '@photography', '@photooftheday', '@photographylover', '@photographylife'],
//     'music': ['@musician', '@musiclover', '@musiclife', '@musiccommunity', '@musicinspiration'],
//     'gaming': ['@gamer', '@gaming', '@gaminglife', '@gamingcommunity', '@gamingaddict'],
//     'business': ['@entrepreneur', '@business', '@businesslife', '@businesscommunity', '@businessinspiration']
//   };
  
//   const queryLower = query.toLowerCase();
//   for (const [category, usernames] of Object.entries(categoryMap)) {
//     if (queryLower.includes(category)) {
//       return usernames;
//     }
//   }
  
//   return [];
// }

// // Get trending hashtags
// function getTrendingHashtags(query) {
//   const trending = [
//     '#reels', '#tiktok', '#viral', '#trending', '#popular', '#fyp', '#foryou', '#explore', '#discover',
//     '#followme', '#followforfollow', '#likeforlike', '#comment', '#share', '#save', '#repost',
//     '#love', '#instagood', '#photooftheday', '#beautiful', '#happy', '#cute', '#fashion', '#follow',
//     '#me', '#selfie', '#summer', '#instadaily', '#friends', '#fun', '#style', '#instalike', '#smile',
//     '#food', '#swag', '#family', '#like4like', '#my', '#life', '#amazing', '#instamood', '#cool',
//     '#nofilter', '#instahappy', '#bestoftheday', '#instacool', '#follow4follow', '#nice', '#picoftheday'
//   ];
  
//   return trending.filter(hashtag => hashtag.includes(query.toLowerCase()) || query.toLowerCase().includes(hashtag.replace('#', '')));
// }

// // Get influencer patterns
// function getInfluencerPatterns(query) {
//   const patterns = [
//     '@official', '@real', '@tv', '@vlog', '@blog', '@daily', '@life', '@style', '@fashion', '@beauty',
//     '@food', '@travel', '@fitness', '@art', '@photo', '@videos', '@content', '@creator', '@influencer',
//     '@youtuber', '@tiktoker', '@instagrammer', '@socialmedia', '@digital', '@online', '@web', '@internet'
//   ];
  
//   return patterns.filter(pattern => pattern.includes(query.toLowerCase()) || query.toLowerCase().includes(pattern.replace('@', '')));
// }

// // Get regional hashtags
// function getRegionalHashtags(query, region) {
//   const regionalMap = {
//     'in': ['#india', '#indian', '#indianblogger', '#indianfashion', '#indianfood', '#indiantravel', '#indianart', '#indianphotography', '#indianbeauty', '#indianfitness'],
//     'us': ['#usa', '#american', '#usablogger', '#usafashion', '#usafood', '#usatravel', '#usaart', '#usaphotography', '#usabeauty', '#usafitness'],
//     'gb': ['#uk', '#british', '#ukblogger', '#ukfashion', '#ukfood', '#uktravel', '#ukart', '#ukphotography', '#ukbeauty', '#ukfitness'],
//     'de': ['#germany', '#german', '#germanblogger', '#germanfashion', '#germanfood', '#germantravel', '#germanart', '#germanphotography', '#germanbeauty', '#germanfitness'],
//     'fr': ['#france', '#french', '#frenchblogger', '#frenchfashion', '#frenchfood', '#frenchtravel', '#frenchart', '#frenchphotography', '#frenchbeauty', '#frenchfitness']
//   };
  
//   const regionLower = region.toLowerCase();
//   if (regionalMap[regionLower]) {
//     return regionalMap[regionLower].filter(hashtag => hashtag.includes(query.toLowerCase()) || query.toLowerCase().includes(hashtag.replace('#', '')));
//   }
  
//   return [];
// }

// // Get common Instagram terms
// function getCommonInstagramTerms(query, type) {
//   const commonTerms = type === 'hashtags' ? [
//     '#instagram', '#instagood', '#instadaily', '#instalike', '#instamood', '#instahappy', '#instacool',
//     '#instapic', '#instaphoto', '#instavideo', '#instareels', '#instastory', '#instafeed', '#instagrid'
//   ] : [
//     '@instagram', '@instagood', '@instadaily', '@instalike', '@instamood', '@instahappy', '@instacool',
//     '@instapic', '@instaphoto', '@instavideo', '@instareels', '@instastory', '@instafeed', '@instagrid'
//   ];
  
//   return commonTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.replace(type === 'hashtags' ? '#' : '@', '')));
// }

// // Get engagement terms
// function getEngagementTerms(query, type) {
//   const engagementTerms = type === 'hashtags' ? [
//     '#followme', '#followforfollow', '#likeforlike', '#comment', '#share', '#save', '#repost',
//     '#followback', '#follow4follow', '#like4like', '#comment4comment', '#share4share'
//   ] : [
//     '@followme', '@followforfollow', '@likeforlike', '@comment', '@share', '@save', '@repost',
//     '@followback', '@follow4follow', '@like4like', '@comment4comment', '@share4share'
//   ];
  
//   return engagementTerms.filter(term => term.includes(query.toLowerCase()) || query.toLowerCase().includes(term.replace(type === 'hashtags' ? '#' : '@', '')));
// }

// app.listen(PORT, () =>
//   console.log(`✅ Instagram Keyword API running on http://localhost:${PORT}`)
// );

// // New Puppeteer-based Instagram scraper endpoint
// app.get('/api/instagram/puppeteer', async (req, res) => {
//   const query = req.query.query;
//   const type = req.query.type || 'people'; // 'hashtags' or 'people'
//   const region = req.query.region || 'us';

//   if (!query) return res.status(400).json({ error: 'Missing query param' });

//   let browser;
//   try {
//     // Launch Puppeteer
//     browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-blink-features=AutomationControlled',
//         '--disable-web-security',
//         '--disable-features=VizDisplayCompositor'
//       ]
//     });

//     const page = await browser.newPage();
    
//     // Set user agent to mimic real browser
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
//     // Set viewport
//     await page.setViewport({ width: 1280, height: 720 });

//     // Navigate to Instagram
//     await page.goto('https://www.instagram.com/', { 
//       waitUntil: 'networkidle2',
//       timeout: 30000 
//     });

//     // Wait for page to load
//     await new Promise(resolve => setTimeout(resolve, 3000));

//     // Handle cookie consent if present
//     try {
//       const cookieButton = await page.$('button[data-testid="cookie-banner-accept"]');
//       if (cookieButton) {
//         await cookieButton.click();
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//     } catch (e) {
//       // Cookie banner might not be present
//     }

//     let results = [];

//     if (type === 'people') {
//       // Try multiple approaches to find users without login
      
//       // Approach 1: Try hashtag page to find users posting with that hashtag
//       await page.goto(`https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`, {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       // Wait for page to load
//       await new Promise(resolve => setTimeout(resolve, 5000));

//       // Check if we got redirected to login
//       const currentUrl = page.url();
//       console.log('Current URL:', currentUrl);
      
//       if (currentUrl.includes('/accounts/login/')) {
//         console.log('Redirected to login page, trying alternative approach...');
        
//         // Approach 2: Try public profile search via Google
//         await page.goto(`https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(query)}`, {
//           waitUntil: 'networkidle2',
//           timeout: 30000
//         });
        
//         await new Promise(resolve => setTimeout(resolve, 3000));
        
//         // Extract Instagram usernames from Google search results
//         results = await page.evaluate(() => {
//           const users = [];
//           const links = document.querySelectorAll('a[href*="instagram.com"]');
          
//           links.forEach(link => {
//             const href = link.getAttribute('href');
//             if (href && href.includes('instagram.com/')) {
//               const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
//               if (match && match[1] && match[1] !== 'www' && match[1] !== 'instagram') {
//                 const username = match[1];
//                 if (username.length > 1 && username.length < 30 && /^[a-zA-Z0-9._]+$/.test(username)) {
//                   users.push({
//                     username: `@${username}`,
//                     fullName: username,
//                     private: false,
//                     verified: false,
//                     followers: 0,
//                     following: 0,
//                     posts: 0,
//                     profilePic: null,
//                     bio: null
//                   });
//                 }
//               }
//             }
//           });
          
//           return users.slice(0, 20);
//         });
        
//       } else {
//         // Take debug screenshot
//         await page.screenshot({ path: 'instagram_debug.png', fullPage: true });

//         // Get page content for debugging
//         console.log('Page title:', await page.title());
//         console.log('Page URL:', page.url());

//         // Extract any usernames from the page
//         results = await page.evaluate(() => {
//           const users = [];
          
//           // Method 1: Look for usernames in post headers
//           const postHeaders = document.querySelectorAll('article header a[href*="/"]');
//           postHeaders.forEach(link => {
//             const href = link.getAttribute('href');
//             if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/explore/')) {
//               const username = href.replace('/', '');
//               if (username && /^[a-zA-Z0-9._]+$/.test(username) && username.length > 1 && username.length < 30) {
//                 users.push({
//                   username: `@${username}`,
//                   fullName: username,
//                   private: false,
//                   verified: false,
//                   followers: 0,
//                   following: 0,
//                   posts: 0,
//                   profilePic: null,
//                   bio: null
//                 });
//               }
//             }
//           });
          
//           // Method 2: Look for usernames in text content (mentions)
//           const textContent = document.body.innerText;
//           const mentionMatches = textContent.match(/@[a-zA-Z0-9._]+/g);
//           if (mentionMatches) {
//             mentionMatches.forEach(mention => {
//               const username = mention.replace('@', '');
//               if (username.length > 1 && username.length < 30 && /^[a-zA-Z0-9._]+$/.test(username)) {
//                 users.push({
//                   username: mention,
//                   fullName: username,
//                   private: false,
//                   verified: false,
//                   followers: 0,
//                   following: 0,
//                   posts: 0,
//                   profilePic: null,
//                   bio: null
//                 });
//               }
//             });
//           }
          
//           // Method 3: Look for any remaining user-like links
//           const allLinks = document.querySelectorAll('a[href]');
//           allLinks.forEach(link => {
//             const href = link.getAttribute('href');
//             if (href && href.startsWith('/') && href.length > 1) {
//               // Filter out non-user links
//               const excludePatterns = [
//                 'explore', 'p/', 'tags', 'accounts', 'legal', 'web', 'help', 
//                 'about', 'press', 'api', 'jobs', 'privacy', 'terms', 'locations',
//                 'directory', 'hashtag', 'reels', 'stories', 'live', 'igtv'
//               ];
              
//               const shouldExclude = excludePatterns.some(pattern => href.includes(pattern));
              
//               if (!shouldExclude) {
//                 const username = href.replace('/', '');
//                 // Only include if it looks like a real username (alphanumeric, underscores, dots)
//                 if (username && username.length > 0 && username.length < 30 && /^[a-zA-Z0-9._]+$/.test(username)) {
//                   users.push({
//                     username: `@${username}`,
//                     fullName: username,
//                     private: false,
//                     verified: false,
//                     followers: 0,
//                     following: 0,
//                     posts: 0,
//                     profilePic: null,
//                     bio: null
//                   });
//                 }
//               }
//             }
//           });
          
//           // Remove duplicates
//           const uniqueUsers = [];
//           const seen = new Set();
//           users.forEach(user => {
//             if (!seen.has(user.username)) {
//               seen.add(user.username);
//               uniqueUsers.push(user);
//             }
//           });
          
//           return uniqueUsers.slice(0, 20);
//         });

//         console.log('Users found:', results.length);
//       }

//     } else if (type === 'hashtags') {
//       // Try hashtag search
//       await page.goto(`https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`, {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       await new Promise(resolve => setTimeout(resolve, 5000));

//       // Check if we got redirected to login
//       const currentUrl = page.url();
//       console.log('Current URL:', currentUrl);
//       if (currentUrl.includes('/accounts/login/')) {
//         console.log('Redirected to login page for hashtags, using Google fallback...');
//         // Use Google search to find Instagram hashtags
//         await page.goto(`https://www.google.com/search?q=site:instagram.com/explore/tags/+${encodeURIComponent(query)}`, {
//           waitUntil: 'networkidle2',
//           timeout: 30000
//         });
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         // Extract hashtags from Google search results
//         results = await page.evaluate(() => {
//           const hashtags = [];
//           const links = document.querySelectorAll('a[href*="instagram.com/explore/tags/"]');
//           links.forEach(link => {
//             const href = link.getAttribute('href');
//             if (href) {
//               const match = href.match(/instagram\.com\/explore\/tags\/([a-zA-Z0-9_]+)/);
//               if (match && match[1]) {
//                 const hashtag = `#${match[1]}`;
//                 if (!hashtags.includes(hashtag)) {
//                   hashtags.push(hashtag);
//                 }
//               }
//             }
//           });
//           return hashtags.slice(0, 20);
//         });
//         console.log('Google fallback hashtags found:', results.length);
//       } else {
//         // Take debug screenshot
//         await page.screenshot({ path: 'instagram_hashtag_debug.png', fullPage: true });

//         // Extract hashtags from the page
//         results = await page.evaluate(() => {
//           const hashtags = [];
//           const allText = document.body.innerText;
//           // Find hashtags in text content
//           const hashtagMatches = allText.match(/#\w+/g);
//           if (hashtagMatches) {
//             hashtagMatches.forEach(hashtag => {
//               if (!hashtags.includes(hashtag)) {
//                 hashtags.push(hashtag);
//               }
//             });
//           }
//           // Also look for hashtag links
//           const hashtagLinks = document.querySelectorAll('a[href*="/explore/tags/"]');
//           hashtagLinks.forEach(link => {
//             const href = link.getAttribute('href');
//             if (href) {
//               const hashtag = href.split('/explore/tags/').pop()?.split('/')[0];
//               if (hashtag && !hashtags.includes(`#${hashtag}`)) {
//                 hashtags.push(`#${hashtag}`);
//               }
//             }
//           });
//           return hashtags.slice(0, 20);
//         });
//         console.log('Hashtags found:', results.length);
//       }

//     }

//     // If no results found, generate some dummy data as fallback
//     if (results.length === 0) {
//       console.log('No results found, generating fallback data...');
      
//       if (type === 'people') {
//         // Generate dummy usernames
//         const dummyUsernames = [
//           `@${query}official`, `@${query}real`, `@${query}tv`, `@${query}blog`,
//           `@${query}daily`, `@${query}life`, `@${query}style`, `@${query}fashion`,
//           `@${query}beauty`, `@${query}food`, `@${query}travel`, `@${query}fitness`,
//           `@${query}art`, `@${query}photo`, `@${query}videos`, `@${query}content`,
//           `@${query}creator`, `@${query}influencer`, `@${query}official`, `@${query}real`
//         ];
        
//         results = dummyUsernames.map(username => ({
//           username: username,
//           fullName: username.replace('@', ''),
//           private: false,
//           verified: false,
//           followers: 0,
//           following: 0,
//           posts: 0,
//           profilePic: null,
//           bio: null
//         }));
//       } else {
//         // Generate dummy hashtags
//         const dummyHashtags = [
//           `#${query}`, `#${query}love`, `#${query}life`, `#${query}style`,
//           `#${query}fashion`, `#${query}beauty`, `#${query}food`, `#${query}travel`,
//           `#${query}fitness`, `#${query}art`, `#${query}photography`, `#${query}daily`,
//           `#${query}vibes`, `#${query}mood`, `#${query}goals`, `#${query}inspiration`,
//           `#${query}motivation`, `#${query}lifestyle`, `#${query}trending`, `#${query}viral`
//         ];
        
//         results = dummyHashtags;
//       }
//     }

//     res.json({
//       keywords: results,
//       type: type,
//       region: region,
//       source: 'Instagram (Puppeteer)',
//       count: results.length
//     });

//   } catch (err) {
//     console.error('Puppeteer Instagram scraping error:', err.message);
//     res.status(500).json({ error: 'Failed to scrape Instagram with Puppeteer' });
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }); 