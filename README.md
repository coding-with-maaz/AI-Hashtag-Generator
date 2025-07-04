# 🚀 AI Hashtag Generator

**Multi-Platform Keyword & Hashtag Suggestion Tool Powered by Scraping & Public APIs**

<p align="center">
  <img src="https://github.com/user-attachments/assets/189c699a-6095-41ee-8669-6a8488382e51" width="600"/>
</p>

---

## ✨ Features

- 🔍 Supports multiple platforms:
  - ✅ Google
  - ✅ YouTube
  - ✅ TikTok
  - ✅ Bing
  - ✅ Amazon
- 🌍 Country & language-specific keyword results
- ⚡ Fast API endpoints with scraping and autocomplete suggestions
- 🧠 Ideal for SEO, content creators, marketers, and app developers
- 💡 Extendable with more platforms (e.g., Instagram, Twitter, Pinterest)

---

## 🖼️ UI Snapshots

| Search Panel | Suggestions View | Country-Language Filters | Mobile Ready |
|--------------|------------------|---------------------------|--------------|
| ![1](https://github.com/user-attachments/assets/a020147d-d86f-43ab-9f84-2db148e57073) | ![2](https://github.com/user-attachments/assets/9ed006ff-00ae-498b-a19c-8d9fe85b224c) | ![3](https://github.com/user-attachments/assets/c8069658-5c80-4b3e-bd08-d65fe655e004) | ![4](https://github.com/user-attachments/assets/189c699a-6095-41ee-8669-6a8488382e51) |

---

## 🧰 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Backend    | `Node.js`, `Express`          |
| Scraping   | `Puppeteer`, `puppeteer-extra` with stealth plugin |
| APIs       | Public endpoints (e.g. Google suggest, Amazon autocomplete) |
| Frontend   | (Optional) React / Flutter integration |
| Deployment | Localhost / Render / Railway / Vercel (Backend) |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/ai-hashtag-generator.git
cd ai-hashtag-generator
npm install
````

---

## ▶️ Usage

### 🔌 Start Server

```bash
node platform_keyword_scraper.js
```

### 🔗 API Endpoints

| Platform | Endpoint                               | Example                                                     |
| -------- | -------------------------------------- | ----------------------------------------------------------- |
| Google   | `/api/google?query=fitness`            | `http://localhost:3000/api/google?query=fitness`            |
| YouTube  | `/api/youtube?query=fitness`           | `http://localhost:3000/api/youtube?query=fitness`           |
| TikTok   | `/api/tiktok?query=fitness`            | `http://localhost:3000/api/tiktok?query=fitness`            |
| Bing     | `/api/bing?query=fitness`              | `http://localhost:3000/api/bing?query=fitness`              |
| Amazon   | `/api/amazon?query=fitness&region=com` | `http://localhost:3000/api/amazon?query=fitness&region=com` |

> ✅ Tip: Change `region` and `language` query parameters for localization.

---

## 🔒 Legal & Ethics

* Uses **public endpoints** or **user-simulated requests**.
* ⚠️ Do **not misuse or spam** requests.
* ❗ Check the **terms of service** of each platform before commercial use.

---

## 🧩 Contributing

```bash
# Add support for more platforms (e.g. Twitter, Pinterest)
# Build a UI with React or Flutter
# Add export-to-CSV or copy hashtags button
```

Feel free to fork, star ⭐, and contribute pull requests.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Author

Developed by **\[Dr Tools]**
[📫 drtoolofficial@gmail.com](mailto:drtoolofficial@gmail.com)

---

<p align="center"><b>🚀 Boost your reach. Optimize your content. Stay ahead in the trend game.</b></p>
```
