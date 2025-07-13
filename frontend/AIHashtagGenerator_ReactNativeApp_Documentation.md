# 📱 AI Hashtag Generator — Feature Documentation

---

## 1. Project Overview

This documentation covers the core features and implementation of the following pages:
- **LikedKeywords.tsx**: Explore, filter, and export trending/most viewed/most liked keywords.
- **Search.tsx**: Search for keywords, hashtags, questions, and prepositions across multiple platforms.
- **Statistics.tsx**: View analytics, trends, and platform/content performance for keyword searches.

---

## 2. Tech Stack

- **Frontend:** React, TypeScript
- **UI:** Tailwind CSS, custom components
- **State Management:** React state/hooks
- **Networking:** fetch
- **Backend:** Express API

---

## 3. Folder Structure (Relevant)

```
/src
  /pages
    LikedKeywords.tsx
    Search.tsx
    Statistics.tsx
  /components
    /dashboard
      liked-keywords-table.tsx
      search-form.tsx
      search-results.tsx
      stats-card.tsx
    /layout
      dashboard-layout.tsx
    /ui
      (various UI components: card, input, button, select, dialog, etc.)
  /hooks
    use-toast.ts
  /types
    index.ts
```

---

## 4. Pages & Features

### 4.1 LikedKeywords.tsx
- **Purpose:**
  - Explore trending, most viewed, and most liked keywords.
  - Filter by platform, type (keywords, hashtags, questions, prepositions), and sort order.
  - Search within keywords.
  - Export filtered results as CSV.
- **Key UI:**
  - Filters (platform, type, sort, search input)
  - Table of keywords (with likes/views)
  - Export button
- **API Endpoints:**
  - `/api/trending`, `/api/most-views`, `/api/most-likes`
- **Logic:**
  - Fetches and filters keywords based on user input.
  - Debounced search/filtering.
  - Exports current view as CSV.
  - Listens for trending data refresh events.

### 4.2 Search.tsx
- **Purpose:**
  - Search for keywords, hashtags, questions, and prepositions across Google, YouTube, Bing, Play Store, and App Store.
  - View and interact with search results.
- **Key UI:**
  - Search form (platform, query, language, country)
  - Progress indicator during search
  - Search results display
- **API Endpoints:**
  - `/api/google/all`, `/api/youtube/all`, `/api/bing/all`, `/api/playstore/all`, `/api/appstore/all`
  - `/api/view` (track search views)
- **Logic:**
  - Handles search submission and result fetching.
  - Tracks search progress and errors.
  - Triggers trending data refresh after search.

### 4.3 Statistics.tsx
- **Purpose:**
  - Display analytics and insights for keyword searches.
  - Show trending keywords, most viewed/liked, platform breakdown, and search activity.
- **Key UI:**
  - Stats cards (total searches, trending keywords, popular platform, most liked keyword)
  - Tabs for overview, searches, platforms, and content analytics
  - Charts (bar charts for trends, activity, platform/content performance)
- **API Endpoints:**
  - `/api/trending`, `/api/most-views`, `/api/most-likes`, `/api/statistics`, `/api/search-activity`
- **Logic:**
  - Fetches and aggregates analytics data.
  - Renders charts and tables for trends and activity.
  - Supports time range selection and detailed dialogs for top searches/keywords.

---

## 5. Reusable Components (Used by These Pages)

- **DashboardLayout**: Main layout wrapper for all pages.
- **LikedKeywordsTable**: Table for displaying and filtering keywords (LikedKeywords.tsx).
- **SearchForm**: Search input and controls (Search.tsx).
- **SearchResults**: Displays search results (Search.tsx, LikedKeywords.tsx).
- **StatsCard**: Card for displaying stats (Statistics.tsx).
- **UI Components**: Card, Input, Button, Select, Dialog, Progress, Tabs, etc.

---

## 6. Custom Hooks & Utilities

- **use-toast.ts**: Toast notifications for user feedback.
- **Debounced search/filtering**: Used in LikedKeywords.tsx for efficient API calls.

---

## 7. API Integration

- All API calls use `fetch` to communicate with the backend Express API.
- Endpoints are used for trending, search, analytics, and activity data.
- All API calls handle errors and loading states, with user feedback via toasts.

---

## 8. Error Handling & Loading States

- All API calls handle errors and show loading indicators or toast notifications.
- User feedback is provided for all major actions (search, export, analytics).

---

## 9. Accessibility

- Follows accessibility best practices for all UI components (ARIA, keyboard navigation, color contrast, etc.).

---

## 10. Extensibility

- Add more analytics or export options.
- Add more platforms or search types.
- Enhance filtering and visualization features.

---

**For code samples or UI diagrams for these pages, see the source files or request more details!** 