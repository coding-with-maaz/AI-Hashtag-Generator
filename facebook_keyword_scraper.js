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

    // Get suggestions for the main keyword
    const mainSuggestions = await page.evaluate(async (search, language, country) => {
      const response = await fetch(
        `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`
      );
      const text = await response.text();
      const json = JSON.parse(text.replace(/^\)]}'\n/, ''));
      return json[0].map(item => item[0]);
    }, query, language, country);

    mainSuggestions.forEach(s => allSuggestions.add(s));

    // Get suggestions for keyword + each letter
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const suggestions = await page.evaluate(async (search, language, country) => {
        const response = await fetch(
          `https://www.google.com/complete/search?q=${encodeURIComponent(search)}&cp=1&client=gws-wiz&xssi=t&hl=${language}&gl=${country}`
        );
        const text = await response.text();
        const json = JSON.parse(text.replace(/^\)]}'\n/, ''));
        return json[0].map(item => item[0]);
      }, variant, language, country);

      suggestions.forEach(s => allSuggestions.add(s));
    }

    // Convert set to array and return
    const suggestionsArray = Array.from(allSuggestions);
    console.log(suggestionsArray);

    await browser.close();
    res.json({ keywords: suggestionsArray });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: 'Failed to fetch Google suggestions' });
  }
});

app.listen(PORT, () => console.log(`✅ Google Keyword API running on http://localhost:${PORT}`));