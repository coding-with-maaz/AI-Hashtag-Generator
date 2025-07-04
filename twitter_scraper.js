// 
// COMING SOON
// 

// const express = require('express');
// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// puppeteer.use(StealthPlugin());

// const router = express.Router();

// // /api/twitter?query=...&type=keywords|hashtags
// router.get('/api/twitter', async (req, res) => {
//   const query = req.query.query;
//   const type = req.query.type || 'keywords';

//   if (!query) return res.status(400).json({ error: 'Missing query param' });

//   let browser;
//   let results = [];
//   try {
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
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
//     await page.setViewport({ width: 1280, height: 720 });

//     // Go to Twitter Explore page
//     await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2', timeout: 30000 });
//     await new Promise(resolve => setTimeout(resolve, 3000));

//     // Accept cookies or dismiss modals if prompted
//     try {
//       // Accept cookie consent
//       const cookieButton = await page.$('div[role="button"][data-testid="confirmationSheetConfirm"]');
//       if (cookieButton) {
//         await cookieButton.click();
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//       // Dismiss login modal if present
//       const loginModal = await page.$('div[role="dialog"] [data-testid="sheetDialog"]');
//       if (loginModal) {
//         const closeBtn = await page.$('div[role="dialog"] [aria-label="Close"]');
//         if (closeBtn) {
//           await closeBtn.click();
//           await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//       }
//     } catch (e) {}

//     // Try multiple selectors for the search input
//     let searchInputFound = false;
//     const selectors = [
//       'input[data-testid="SearchBox_Search_Input"]',
//       'input[aria-label="Search query"]',
//       'input[placeholder*="Search"]',
//       'input[type="text"]'
//     ];
//     for (const selector of selectors) {
//       try {
//         await page.waitForSelector(selector, { timeout: 4000 });
//         await page.click(selector);
//         await page.type(selector, query, { delay: 100 });
//         searchInputFound = true;
//         break;
//       } catch (e) {}
//     }
//     if (!searchInputFound) {
//       await page.screenshot({ path: 'twitter_search_debug.png', fullPage: true });
//       throw new Error('Could not find Twitter search input. Screenshot saved as twitter_search_debug.png');
//     }
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     // Scrape autocomplete suggestions
//     results = await page.evaluate((type) => {
//       const suggestions = [];
//       // Twitter suggestions appear in a listbox
//       const items = document.querySelectorAll('div[role="listbox"] div[role="option"]');
//       items.forEach(item => {
//         const text = item.innerText.trim();
//         if (type === 'hashtags') {
//           if (text.startsWith('#')) {
//             suggestions.push(text);
//           }
//         } else {
//           // For keywords, skip hashtags
//           if (!text.startsWith('#') && text.length > 0) {
//             suggestions.push(text);
//           }
//         }
//       });
//       return suggestions.slice(0, 20);
//     }, type);

//     // Fallback: For hashtags, also scrape trending hashtags from Explore page if no results
//     if (type === 'hashtags' && results.length === 0) {
//       await page.goto('https://twitter.com/explore/tabs/trending', { waitUntil: 'networkidle2', timeout: 30000 });
//       await new Promise(resolve => setTimeout(resolve, 3000));
//       results = await page.evaluate(() => {
//         const hashtags = [];
//         const items = document.querySelectorAll('a[role="link"] span');
//         items.forEach(span => {
//           const text = span.innerText.trim();
//           if (text.startsWith('#') && !hashtags.includes(text)) {
//             hashtags.push(text);
//           }
//         });
//         return hashtags.slice(0, 20);
//       });
//     }

//     // Fallback: For keywords, suggest many smart variations if no results
//     if (type === 'keywords' && results.length === 0) {
//       const base = query.trim();
//       const suffixes = [
//         '', 'news', 'today', 'trending', 'latest', '2024', '2023', 'update', 'explained', 'facts', 'insights', 'analysis', 'future', 'jobs', 'startup', 'apps', 'tools', 'open source', 'community', 'events', 'conference', 'summit', 'forum', 'discussion', 'debate', 'vs', 'comparison', 'review', 'guide', 'tutorial', 'how to', 'examples', 'case study', 'statistics', 'data', 'filter:news', 'filter:media', 'filter:videos', 'filter:links', 'lang:en', 'lang:es', 'lang:fr', 'since:2023-01-01', 'until:2024-12-31', 'from:OpenAI', 'to:elonmusk', 'min_faves:100', 'min_retweets:50', 'min_replies:10'
//       ];
//       results = suffixes.map(s => s ? `${base} ${s}`.trim() : base);
//       // Remove duplicates and empty
//       results = Array.from(new Set(results)).filter(Boolean).slice(0, 40);
//     }

//     res.json({
//       keywords: results,
//       type,
//       source: 'Twitter (Puppeteer)',
//       count: results.length
//     });
//   } catch (err) {
//     console.error('Twitter Puppeteer error:', err.message);
//     res.status(500).json({ error: 'Failed to scrape Twitter suggestions' });
//   } finally {
//     if (browser) await browser.close();
//   }
// });

// // If run directly, start the server
// if (require.main === module) {
//   const app = express();
//   app.use(router);
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`✅ Twitter Scraper API running on http://localhost:${PORT}`);
//   });
// }

// module.exports = router; 