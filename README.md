---
title: News App Frontend
emoji: 
colorFrom: blue
colorTo: indigo
sdk: static
app_build_command: npm run build
app_file: dist/index.html
---

# Personal News App mvp

A React + Vite frontend for exploring country-focused news, comparing keyword signals, and running semantic search across regions.

## What it does

This app presents a world news dashboard organized by continent. Each region card lets you select a country, retrieve article matches, inspect extracted keyword signals, and pivot those signals into a broader semantic search flow.

It works with a backend that returns normalized article results for both country-based retrieval and Gold semantic search.

## Features

- Country selection grouped by continent
- Topic-aware country retrieval
- Semantic query summary per region card
- Keyword signal extraction from article data
- Clickable keyword chips that launch Gold search
- Gold semantic search for concept-based discovery
- Dynamic suggested searches built from current keyword signals
- Loading, empty, and error-aware result states
- Reusable React component structure with JSON-based country configuration

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Backend API for country retrieval and semantic search

## Project Structure

```text
news-app-frontend/
├── src/
│   ├── components/
│   │   ├── ContinentNewsCard.jsx
│   │   ├── GoldSearchPanel.jsx
│   │   ├── KeywordChips.jsx
│   │   ├── NewsList.jsx
│   │   └── TopicToggle.jsx
│   ├── data/
│   │   └── countries.json
│   ├── services/
│   │   └── newsApi.js
│   ├── utils/
│   │   └── keywords.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

## Core UI Flow

1. Choose a global topic lens.
2. Select a country inside a continent card.
3. Refresh to retrieve article matches for that country/topic pairing.
4. Review keyword signals extracted from returned articles.
5. Click a signal chip or use a suggested query to run Gold semantic search.

## Key Frontend Responsibilities

- Manage selected topic state across the dashboard
- Build semantic country queries from country + topic context
- Extract and filter keyword signals from article results
- Aggregate signals across continent cards into dynamic search suggestions
- Render normalized article results from backend responses

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint the project:

```bash
npm run lint
```

## Notes

- The frontend depends on a backend service for news retrieval and semantic search.
- Gold search is semantic/concept-based rather than exact keyword matching.
- Suggested searches fall back to a starter list when signal data is not yet available.
