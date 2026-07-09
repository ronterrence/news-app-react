# News App Backend

FastAPI backend for semantic news retrieval and lightweight data pipeline orchestration.

This service ingests news articles from NewsAPI, processes them through a simple Bronze/Silver/Gold pipeline, generates embeddings with Sentence Transformers, and exposes semantic search endpoints for a frontend client.

## Features

- FastAPI API for health checks, semantic search, and pipeline triggering
- Multi-step data pipeline for ingestion, cleaning, deduplication, and vector indexing
- Semantic search powered by ChromaDB and `all-MiniLM-L6-v2`
- Local Bronze/Silver storage for development
- Optional AWS S3 backup for raw Bronze-layer payloads
- Docker-ready deployment for Hugging Face Spaces

## Architecture Overview

The backend follows a simple layered data pipeline:

- **Bronze**: Fetch raw news payloads from NewsAPI and persist them locally and optionally to AWS S3
- **Silver**: Clean text, normalize fields, generate article IDs, and deduplicate records
- **Gold**: Generate embeddings and index articles into an in-memory ChromaDB collection for semantic retrieval

### Why the vector store is in memory

The current deployment target is Hugging Face Spaces running in Docker mode. Its filesystem can be ephemeral, so local vector storage is not reliable across restarts or idle cycles.

To keep the deployment simple and robust, the project uses an **in-memory ChromaDB collection**. When the pipeline runs, it fetches fresh news, rebuilds the semantic index, and serves search results from memory.

## Project Structure

```text
news-app-backend/
├── main.py
├── requirements.txt
├── Dockerfile
├── README.md
└── data_pipeline/
    ├── config.py
    ├── ingestion.py
    ├── transformation.py
    ├── vector_store.py
    └── pipeline_run.py
```

## Core Components

### `main.py`
Defines the FastAPI application and exposes the HTTP API.

### `data_pipeline/config.py`
Loads environment variables and configures local storage paths for Bronze and Silver data.

### `data_pipeline/ingestion.py`
Fetches articles from NewsAPI using a small set of topic queries and stores raw payloads.

### `data_pipeline/transformation.py`
Cleans article content, strips HTML and truncation markers, generates stable article identifiers, and removes duplicates.

### `data_pipeline/vector_store.py`
Creates an in-memory ChromaDB collection, generates embeddings with Sentence Transformers, and serves semantic search queries.

### `data_pipeline/pipeline_run.py`
Runs the full pipeline from ingestion through vector indexing.

## Requirements

- Python 3.11 recommended
- NewsAPI key
- Optional AWS credentials for S3 Bronze backups

## Environment Variables

Create a `.env` file at the project root.

```env
NEWS_API_KEY=your_newsapi_key
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
BRONZE_S3_BUCKET=news-app-bronze-bucket
```

### Required

- `NEWS_API_KEY`: required for article ingestion from NewsAPI

### Optional

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `BRONZE_S3_BUCKET`

If AWS credentials are not configured, the application still saves Bronze data locally.

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run the API Locally

```bash
uvicorn main:app --reload
```

Default local URL:

- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Run the Data Pipeline

To execute the full ingestion and indexing pipeline manually:

```bash
python -m data_pipeline.pipeline_run
```

Pipeline steps:

1. Fetch news articles from NewsAPI
2. Save raw payload to the Bronze layer
3. Clean and deduplicate records into the Silver layer
4. Generate embeddings and index articles in the Gold layer
5. Run a quick semantic search validation

## API Endpoints

### `GET /`
Health check endpoint.

Example response:

```json
{
  "status": "healthy",
  "message": "AI News Engine is online and operational.",
  "architecture_layer": "FastAPI Deployment on Hugging Face Spaces"
}
```

### `GET /api/news`
Returns semantically matched news articles for a country-related query.

Accepted query parameters:

- `countryName`
- `country`
- `q`

If no country is provided, the API falls back to `world general news`.

Example:

```http
GET /api/news?countryName=Canada
```

### `GET /api/search`
Performs semantic search across indexed articles.

Example:

```http
GET /api/search?q=tech innovations
```

Example response shape:

```json
{
  "query": "tech innovations",
  "total_results": 5,
  "articles": []
}
```

### `POST /api/cron-trigger`
Triggers the pipeline asynchronously using FastAPI background tasks.

This is useful when the frontend needs to refresh the semantic index with newly ingested articles.

## Docker

Build the image:

```bash
docker build -t news-app-backend .
```

Run the container:

```bash
docker run -p 7860:7860 --env-file .env news-app-backend
```

The container starts Uvicorn on port `7860`, which aligns with the Hugging Face Spaces Docker setup.

## Frontend Integration

The backend is designed to support a separate frontend application.

Typical flow:

1. Frontend calls `POST /api/cron-trigger` to refresh the index
2. Backend ingests and processes fresh news
3. Frontend calls `GET /api/search?q=...` for semantic retrieval

## Operational Notes

- The ChromaDB collection is in memory only
- Indexed articles are lost when the process restarts
- Re-run the pipeline to rebuild the search index
- Bronze and Silver artifacts are stored locally for development
- Raw Bronze payloads can also be backed up to AWS S3 when credentials are available

## Known Limitations

- Vector storage is not persistent across restarts
- Search quality depends on the freshness and quality of NewsAPI results
- `/api/news` currently uses flexible query parameter handling to accommodate frontend variations
- CORS origins are hardcoded in `main.py`
- Background tasks do not provide persistent job tracking or retry behavior

## Deployment Notes

This project is compatible with Hugging Face Spaces using Docker mode.

If deployed there, keep in mind:

- local container storage should not be treated as durable
- the semantic index should be rebuilt as needed
- AWS S3 is the durable backup option for raw Bronze data

## Future Improvements

- Persist vector storage outside process memory
- Move hardcoded CORS configuration into environment-based settings
- Add structured logging and better error handling
- Add tests for pipeline stages and API routes
- Expose pipeline status and indexing metadata through the API
