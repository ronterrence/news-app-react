# News App Frontend Guidance

## Working agreement

- This repository contains the React/Vite frontend. The FastAPI backend is deployed and maintained separately.
- Use `npm run dev` for local development, `npm run lint` for static checks, `npm test` for component tests, and `npm run build` for a production build.
- Keep API calls in `src/services/newsApi.js`, display behavior in components, and country configuration in `src/data/countries.json`.
- Preserve request correctness: abort superseded work, ignore stale responses, and render results only when their request context matches the current UI selection.
- Interactive selected states must be programmatically exposed, and asynchronous loading, success, and error changes must be announced accessibly.

## Backend and data contract

- The hosted API base URL is `https://ronterrence-news-app-backend.hf.space`.
- `GET /api/news` performs semantic retrieval using country and topic text. A selected country is query context; it is not a country-partitioned source dataset.
- `GET /api/search?q=...` performs semantic retrieval across the Gold vector collection.
- The backend ingests globally themed queries (`technology`, `business`, `science`, `sports`, and `global`) through a Bronze -> Silver -> Gold pipeline.
- Bronze preserves raw source payloads and can back them up to S3. Silver cleans, normalizes, and deduplicates articles. Gold embeds the Silver corpus for similarity search.
- Gold uses an in-memory ChromaDB collection. A process restart removes the searchable index, so a previously successful pipeline run does not guarantee that search is currently available.
- Gold documents use a `Title: ...\nContent: ...` wrapper for embeddings. Do not treat that wrapper as presentation-ready copy or allow it to pollute displayed descriptions and keyword signals.

## Reference pipeline run

The user-provided run associated with `raw_news_1784229879.json` completed at 2026-07-16 19:24:39 UTC:

- Bronze collected 491 articles and uploaded the raw backup to S3.
- Silver retained 398 clean, deduplicated articles: 93 were removed, an 18.9% reduction and 81.1% retention rate.
- Gold indexed all 398 Silver articles in the ephemeral Chroma collection.
- The semantic sanity query `technology and software innovation` returned a relevant AI-engineering article.
- The unauthenticated Hugging Face Hub warning did not fail this run; it indicates lower rate limits and potentially slower model downloads. Configure `HF_TOKEN` in the backend environment when operational limits matter.

These values are a historical diagnostic snapshot, not hardcoded UI metrics or permanent availability guarantees.

## Design reference

- `feed_variant_1.html` is an untracked, static visual reference containing mock data and no API or interaction logic.
- Do not ship it as the application, import its Tailwind CDN runtime into production, or display its mocked pipeline status and relevance values as real data.
- Its typography, color system, compact article cards, topic chips, and summary-card ideas may inform a separately approved redesign. The current application remains the functional source of truth.
