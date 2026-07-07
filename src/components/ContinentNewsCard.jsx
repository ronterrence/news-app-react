import { useState, useMemo, useCallback } from 'react';

import { extractKeywords } from "../utils/keywords";
import NewsList from "./NewsList";
import KeywordChips from "./KeywordChips";

function ContinentNewsCard({ continent, countries }) {
  const countryNames = Object.keys(countries);

  const [selectedCountry, setSelectedCountry] = useState(countryNames[0]);
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const keywords = useMemo(() => extractKeywords(articles), [articles]);

  const loadNews = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/news?countryName=${selectedCountry}`);
      const data = await response.json();

      setArticles(data);
      setStatus("success");
    } catch (error) {
      console.error("Error fetching news:", error);
      setErrorMessage(error.message || "Failed to fetch news");
      setStatus("error");
    }
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setArticles([]);
    setErrorMessage("");
    setStatus("idle");
  };

  return (
    <section className="continent-card">
      <div className="card-header">
        <div>
          <h2>{continent}</h2>
          <p>AI-ranked coverage for a selected country</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadNews}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="country-field">
        <label
          className="country-label"
          htmlFor={`country-select-${continent}`}
        >
          Country
        </label>

        <select
          id={`country-select-${continent}`}
          name={`country-select-${continent}`}
          value={selectedCountry}
          onChange={handleCountryChange}
        >
          {countryNames.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && (
        <p className="status-text">Loading news for {selectedCountry}...</p>
      )}

      {status === "error" && (
        <p className="error-text">Error: {errorMessage}</p>
      )}

      {status === "success" && (
        <>
          <div className="section-heading-row">
            <h3>News results for {selectedCountry}</h3>
            <span className="results-pill">{articles.length} articles</span>
          </div>
          <NewsList articles={articles} />

          <div className="section-heading-row keywords-heading-row">
            <h3>Top keywords</h3>
            <span className="results-pill results-pill-muted">
              {keywords.length} signals
            </span>
          </div>
          <KeywordChips keywords={keywords} />
        </>
      )}
    </section>
  );
}

export default ContinentNewsCard;
