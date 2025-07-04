// google_keyword_scraper.js

const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/google', async (req, res) => {
  const query = req.query.query;
  const country = req.query.country || 'US';
  const language = req.query.language || 'en';
  if (!query) return res.status(400).json({ error: 'Missing query param' });

  try {
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

    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set();

    // Helper to strip HTML tags
    function stripHtmlTags(str) {
      return str.replace(/<[^>]*>/g, '');
    }

    // Get suggestions for the main keyword
    const mainSuggestions = await page.evaluate(async (search, language, country) => {
      const url = `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`;
      console.log('Fetching:', url);
      const response = await fetch(url);
      const text = await response.text();
      const json = JSON.parse(text.replace(/^[^\[]+/, ''));
      console.log('API suggestions:', json[0]);
      return json[0].map(item => item[0]);
    }, query, language, country);

    mainSuggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));

    // Get suggestions for keyword + each letter
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const suggestions = await page.evaluate(async (search, language, country) => {
        const url = `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.replace(/^[^\[]+/, ''));
        console.log('API suggestions:', json[0]);
        return json[0].map(item => item[0]);
      }, variant, language, country);

      suggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));
    }

    // Aggregate question variations (like YouTube logic)
    const questionPrefixes = [
      "how", "what", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];
    for (const prefix of questionPrefixes) {
      const variant = `${query} ${prefix}`;
      const suggestions = await page.evaluate(async (search, language, country) => {
        const url = `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.replace(/^[^\[]+/, ''));
        console.log('API suggestions:', json[0]);
        return json[0].map(item => item[0]);
      }, variant, language, country);
      suggestions.forEach(s => allSuggestions.add(stripHtmlTags(s)));
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

    console.log(suggestionsArray);
    console.log('Questions:', questions);
    console.log('Prepositions:', prepositionSuggestions);
    console.log('Hashtags:', hashtags);
    console.log('Generated Hashtags:', generatedHashtags);

    await browser.close();
    res.json({
      keywords: suggestionsArray,
      questions,
      prepositions: prepositionSuggestions,
      hashtags,
      generatedHashtags
    });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: 'Failed to fetch Google suggestions' });
  }
});

app.listen(PORT, () => console.log(`✅ Google Keyword API running on http://localhost:${PORT}`));