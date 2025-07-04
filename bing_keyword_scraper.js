// bing_keyword_scraper.js

const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const fetch = require('node-fetch').default;

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/bing', async (req, res) => {
  const query = req.query.query;
  const mkt = req.query.mkt || 'en-US'; // e.g., 'en-US', 'ur-PK'

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

    await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}&mkt=${mkt}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      }
    );
    const json = await response.json();
    const suggestions = json[1] || [];

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let allSuggestions = new Set(suggestions);

    // Get suggestions for keyword + each letter
    for (const letter of alphabet) {
      const variant = `${query} ${letter}`;
      const resp = await fetch(
        `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(variant)}&mkt=${mkt}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        }
      );
      const js = await resp.json();
      (js[1] || []).forEach(item => allSuggestions.add(item));
    }

    const questionPrefixes = [
      "how", "what", "why", "when", "where", "who", "which", "can", "is", "are", "do", "does", "did", "will", "should", "could", "would", "may", "might", "shall", "whose", "whom", "was", "were", "has", "have", "had", "am"
    ];

    for (const prefix of questionPrefixes) {
      const variant = `${query} ${prefix}`;
      const resp = await fetch(
        `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(variant)}&mkt=${mkt}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        }
      );
      const js = await resp.json();
      (js[1] || []).forEach(item => allSuggestions.add(item));
    }

    const suggestionsArray = Array.from(allSuggestions);

    // List of common prepositions
    const prepositions = [
      "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by", "concerning", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "regarding", "since", "through", "throughout", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without"
    ];

    // Questions: suggestions that start with a question word or end with '?'
    const questions = suggestionsArray.filter(s => {
      const lower = s.trim().toLowerCase();
      return questionPrefixes.some(qw => lower.startsWith(qw + " ")) || lower.endsWith("?");
    });

    // Prepositions: suggestions that contain a preposition as a word
    const prepositionRegex = new RegExp(`\\b(${prepositions.join("|")})\\b`, "i");
    const prepositionSuggestions = suggestionsArray.filter(s => prepositionRegex.test(s));

    const hashtags = suggestionsArray.filter(s => s.trim().startsWith('#'));
    const generatedHashtags = Array.from(new Set(suggestionsArray.map(s => '#' + s.replace(/\s+/g, '').toLowerCase())));

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
    res.status(500).json({ error: 'Failed to fetch Bing suggestions' });
  }
});

app.listen(PORT, () => console.log(`✅ Bing Keyword API running on http://localhost:${PORT}`));
