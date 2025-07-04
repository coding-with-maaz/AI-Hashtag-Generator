// // amazon_keyword_scraper.js

// 
  //  coMMING SOON
// 

// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const PORT = 3000;

// app.get('/api/amazon', async (req, res) => {
//   const query = req.query.query;
//   const region = req.query.region || 'com'; // 'com', 'in', 'co.uk', etc.

//   if (!query) return res.status(400).json({ error: 'Missing query param' });

//   try {
//     const response = await axios.get(`https://completion.amazon.${region}/search/complete`, {
//       params: {
//         method: 'completion',
//         'search-alias': 'aps',
//         mkt: 1,
//         q: query,
//       },
//       headers: {
//         'User-Agent': 'Mozilla/5.0',
//       },
//       validateStatus: function (status) {
//         return status >= 200 && status < 500; // Accept 4xx for custom handling
//       },
//     });

//     if (response.status === 404) {
//       return res.status(404).json({
//         error: `Amazon autocomplete endpoint not found for region '${region}'. Try one of: 'com', 'co.uk', 'in', 'de', 'fr'.`,
//       });
//     }

//     const suggestions = response.data[1] || [];
//     res.json({ keywords: suggestions });
//   } catch (err) {
//     console.error('Amazon API error:', err.message);
//     res.status(500).json({ error: 'Failed to fetch suggestions from Amazon' });
//   }
// });

// app.listen(PORT, () =>
//   console.log(`✅ Amazon Keyword API (API-based) running on http://localhost:${PORT}`)
// );


