import { useEffect, useState } from "react";

import { searchNews } from "../services/newsApi";
import NewsList from "./NewsList";

function GoldSearchPanel({ searchRequest, onSearchInteraction, suggestions = [] }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const runSearch = async (rawQuery) => {
    const trimmedQuery = rawQuery.trim();

    if (!trimmedQuery) {
      setStatus("error");
      setErrorMessage("Enter a semantic search query first.");
      setArticles([]);
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setSubmittedQuery(trimmedQuery);

    try {
      const results = await searchNews(trimmedQuery);
      setArticles(results);
      setStatus("success");
    } catch (error) {
      setArticles([]);
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!searchRequest?.query) {
      return;
    }

    setQuery(searchRequest.query);
    runSearch(searchRequest.query);
  }, [searchRequest]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    onSearchInteraction?.();
    await runSearch(query);
  };

  const handleSuggestionClick = async (suggestion) => {
    onSearchInteraction?.();
    setQuery(suggestion);
    await runSearch(suggestion);
  };

  const handleClearSearch = () => {
    onSearchInteraction?.();
    setQuery("");
    setSubmittedQuery("");
    setArticles([]);
    setErrorMessage("");
    setStatus("idle");
  };

  return (
    <section className="gold-search-panel" id="gold-search-panel">
      <div className="gold-search-header">
        <div>
          <p className="eyebrow">Gold Search</p>
          <h2>Gold semantic search</h2>
          <p className="panel-helper-text">
            Search by meaning instead of exact keyword matches using the Gold
            vector layer in the backend.
          </p>
        </div>
      </div>

      <form className="gold-search-form" onSubmit={handleSubmit}>
        <label className="gold-search-label" htmlFor="gold-search-input">
          Semantic query
        </label>
        <div className="gold-search-row">
          <input
            id="gold-search-input"
            className="gold-search-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: technology and software innovation"
          />
          <button
            className="refresh-button gold-search-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Searching…" : "Search"}
          </button>
          <button
            className="secondary-button gold-clear-button"
            type="button"
            onClick={handleClearSearch}
            disabled={status === "loading"}
          >
            Clear search
          </button>
        </div>
      </form>

      <div className="gold-suggestions-panel">
        <span className="gold-suggestions-label">Suggested searches</span>
        <div className="gold-suggestions-list">
          {suggestions.map((suggestion) => {
            const isActive = suggestion.toLowerCase() === normalizedQuery;

            return (
              <button
                key={suggestion}
                type="button"
                className={`gold-suggestion-chip${isActive ? " is-active" : ""}`}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={status === "loading"}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>

      {status === "idle" && (
        <p className="status-text">
          Enter a topic, phrase, or concept to explore semantically related
          articles.
        </p>
      )}

      {status === "error" && <p className="error-text">Error: {errorMessage}</p>}

      {status === "success" && (
        <div className="gold-search-results">
          <div className="section-heading-row">
            <h3>Results for “{submittedQuery}”</h3>
            <span className="results-pill">{articles.length} articles</span>
          </div>
          <NewsList articles={articles} />
        </div>
      )}
    </section>
  );
}

export default GoldSearchPanel;
