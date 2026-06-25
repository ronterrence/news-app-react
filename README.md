---
title: News App Frontend
emoji: 📰
colorFrom: blue
colorTo: indigo
sdk: static
app_build_command: npm run build
app_file: dist/index.html
---

# Personal News App v2 — React

A simple React dashboard for viewing selected country news by continent.

This is the React version of my Personal News App v2. It fetches headlines from NewsAPI, organizes countries by continent, displays news results, and extracts recurring keywords from the headlines.

## Features

- Country selection by continent
- News dashboard with four region cards
- Fetches top headlines by country code
- Falls back to broader country-name search when top headlines are empty
- Displays up to 10 news results per country
- Extracts top keywords from headlines
- Refresh button with loading state
- Countries managed through a JSON file
- Clean React component structure

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- NewsAPI

## Project Structure

```text
news-app-react/
├── src/
│   ├── components/
│   │   ├── ContinentNewsCard.jsx
│   │   ├── KeywordChips.jsx
│   │   └── NewsList.jsx
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
├── .env
├── package.json
└── README.md

Current Version
v2 React Baseline

This version focuses on:

clean React architecture
reusable components
JSON-based country data
basic news fetching
fallback search
keyword extraction
simple dashboard design
Future Improvements

Possible v3 features:

AI summaries 
personalized news topics
trending topic detection
saved countries
saved articles
article source names and links
category filters
backend API proxy to protect the key
user preferences and alerts

## Trajectory

v2:
Basic keyword counting

v3:
Mathematical trending score

v4:
LLM-generated trend labels and summaries