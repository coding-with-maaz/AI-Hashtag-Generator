// amazon_keyword_scraper.js

const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const path = require('path');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/amazon', async (req, res) => {
  const query = req.query.query;
  const region = req.query.region || 'com';

  if (!query) return res.status(400).json({ error: 'Missing query param' });

  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    await page.goto(`https://www.amazon.${region}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Debug screenshot after page load
    await page.screenshot({ path: 'amazon_debug_loaded.png', fullPage: true });

    await page.waitForFunction(() => {
      return document.querySelector('input#twotabsearchtextbox') || document.querySelector('input[name="field-keywords"]');
    }, { timeout: 10000 });

    const inputSelector = await page.evaluate(() => {
      if (document.querySelector('input#twotabsearchtextbox')) return 'input#twotabsearchtextbox';
      if (document.querySelector('input[name="field-keywords"]')) return 'input[name="field-keywords"]';
      return null;
    });

    if (!inputSelector) throw new Error('Search input not found');

    // Try to handle common popups
    try {
      await page.click('input[name="accept"]', { timeout: 2000 });
    } catch (e) {}
    try {
      await page.click('button[data-action="accept"]', { timeout: 2000 });
    } catch (e) {}

    await page.focus(inputSelector);
    
    // Type character by character with random delays (more human-like)
    for (let i = 0; i < query.length; i++) {
      await page.type(inputSelector, query[i], { delay: Math.random() * 200 + 100 });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
    }
    
    // Try different triggers to show dropdown
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Debug: Check if suggestions exist
    const suggestionCount = await page.evaluate(() => {
      return document.querySelectorAll('.s-suggestion').length;
    });
    console.log('Number of .s-suggestion elements found:', suggestionCount);

    // Debug: Check for alternative selectors
    const allElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 50)
      })).filter(item => 
        item.class.includes('suggestion') || 
        item.class.includes('dropdown') || 
        item.class.includes('autocomplete') ||
        item.class.includes('search')
      );
    });
    console.log('Possible suggestion elements:', allElements);

    // Debug: Check page title and URL
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasSearchBox: !!document.querySelector('input#twotabsearchtextbox') || !!document.querySelector('input[name="field-keywords"]')
      };
    });
    console.log('Page info:', pageInfo);

    // Debug screenshot after typing
    await page.screenshot({ path: 'amazon_debug_typed.png', fullPage: true });

    // Try multiple selectors for suggestions
    const suggestions = await page.evaluate(() => {
      // Try .s-suggestion first
      let items = Array.from(document.querySelectorAll('.s-suggestion'));
      if (items.length > 0) {
        return items.map(el => el.textContent.trim());
      }
      
      // Try other possible selectors
      items = Array.from(document.querySelectorAll('[data-action="suggestion"]'));
      if (items.length > 0) {
        return items.map(el => el.textContent.trim());
      }
      
      // Try any dropdown items
      items = Array.from(document.querySelectorAll('.a-dropdown-item'));
      if (items.length > 0) {
        return items.map(el => el.textContent.trim());
      }
      
      // Try search suggestions
      items = Array.from(document.querySelectorAll('.search-suggestion'));
      if (items.length > 0) {
        return items.map(el => el.textContent.trim());
      }
      
      return [];
    });

    await browser.close();
    res.json({ keywords: suggestions });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: 'Failed to fetch Amazon suggestions' });
  }
});

app.listen(PORT, () => console.log(`✅ Amazon Keyword API running on http://localhost:${PORT}`));
