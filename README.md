---
title: News App Frontend
emoji: 
colorFrom: blue
colorTo: indigo
sdk: static
app_build_command: npm run build
app_file: dist/index.html
---

# Metal Intelligence

A React + Vite semantic news feed for exploring articles by country, topic, and concept.

## What it does

This app presents a unified world news feed. Country selection derives its continent automatically, topic filters retrieve immediately, and semantic searches can combine free text with the active country and topic context.

It works with a backend that returns normalized article results for both country-based retrieval and Gold semantic search.

## Features

- Unified responsive feed with grid and list layouts
- Country selection grouped by continent with derived region context
- Automatic topic-aware retrieval
- Keyword signal extraction from article data
- Clickable trending signals that launch semantic searches
- Semantic search that inherits active country and topic filters
- Relevance-order and published-date sorting
- Truthful summary metrics derived from the current response
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

1. Select a country or topic to retrieve article matches automatically.
2. Review the derived region, feed summary, and trending signals.
3. Search by concept with the active country/topic context when useful.
4. Switch between grid/list presentation or sort results by date.
5. Click a signal chip to pivot the feed into a semantic search.

## Key Frontend Responsibilities

- Manage country, derived continent, topic, view, and sort state
- Build semantic queries from text + country + topic context
- Extract and filter keyword signals from article results
- Ignore superseded responses across all retrieval paths
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
