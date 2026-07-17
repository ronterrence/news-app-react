import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { searchNews } from "../services/newsApi";
import NewsList from "./NewsList";

const IDLE_REQUEST = {
  status: "idle",
  submittedQuery: "",
  articles: [],
  errorMessage: "",
};

const GoldSearchPanel = forwardRef(function GoldSearchPanel(
  { query, onQueryChange, onSearchInteraction, suggestions = [] },
  ref
) {
  const [requestState, setRequestState] = useState(IDLE_REQUEST);
  const abortControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const normalizedQuery = query.trim().toLowerCase();

  const runSearch = useCallback(async (rawQuery) => {
    const trimmedQuery = rawQuery.trim();

    abortControllerRef.current?.abort();
    const requestSequence = ++requestSequenceRef.current;

    if (!trimmedQuery) {
      setRequestState({
        status: "error",
        submittedQuery: "",
        articles: [],
        errorMessage: "Enter a semantic search query first.",
      });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setRequestState({
      status: "loading",
      submittedQuery: trimmedQuery,
      articles: [],
      errorMessage: "",
    });

    try {
      const results = await searchNews(trimmedQuery, {
        signal: controller.signal,
      });

      if (requestSequence !== requestSequenceRef.current) {
        return;
      }

      setRequestState({
        status: "success",
        submittedQuery: trimmedQuery,
        articles: results,
        errorMessage: "",
      });
    } catch (error) {
      if (error.name === "AbortError" || requestSequence !== requestSequenceRef.current) {
        return;
      }

      setRequestState({
        status: "error",
        submittedQuery: trimmedQuery,
        articles: [],
        errorMessage: error.message,
      });
    }
  }, []);

  useImperativeHandle(ref, () => ({ search: runSearch }), [runSearch]);

  useEffect(
    () => () => {
      requestSequenceRef.current += 1;
      abortControllerRef.current?.abort();
    },
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchInteraction?.();
    runSearch(query);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchInteraction?.();
    onQueryChange(suggestion);
    runSearch(suggestion);
  };

  const handleClearSearch = () => {
    onSearchInteraction?.();
    requestSequenceRef.current += 1;
    abortControllerRef.current?.abort();
    onQueryChange("");
    setRequestState(IDLE_REQUEST);
  };

  const { status, submittedQuery, articles, errorMessage } = requestState;

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
            onChange={(event) => onQueryChange(event.target.value)}
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
                aria-pressed={isActive}
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

      {status === "loading" && (
        <p className="status-text" role="status" aria-live="polite">
          Searching for {submittedQuery}…
        </p>
      )}

      {status === "error" && (
        <p className="error-text" role="alert">Error: {errorMessage}</p>
      )}

      {status === "success" && (
        <div className="gold-search-results" role="status" aria-live="polite">
          <div className="section-heading-row">
            <h3>Results for “{submittedQuery}”</h3>
            <span className="results-pill">{articles.length} articles</span>
          </div>
          <NewsList articles={articles} />
        </div>
      )}
    </section>
  );
});

export default GoldSearchPanel;
