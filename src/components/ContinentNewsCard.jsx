import { useCallback, useMemo, useState } from "react";

import { fetchNews } from "../services/newsApi";
import { extractKeywords } from "../utils/keywords";
import NewsList from "./NewsList";
import KeywordChips from "./KeywordChips";

function ContinentNewsCard({ continent, countries, selectedTopic }) {
  const countryNames = Object.keys(countries);

  const [selectedCountry, setSelectedCountry] = useState(countryNames[0]);
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const keywords = useMemo(() => extractKeywords(articles), [articles]);

  const loadNews = useCallback(async () => {
    const countryCode = countries[selectedCountry];

    setStatus("loading");
    setErrorMessage("");

    try {
      const results = await fetchNews(countryCode, selectedCountry, selectedTopic);
      setArticles(results);
      setStatus("success");
    } catch (error) {
      setArticles([]);
      setErrorMessage(error.message);
      setStatus("error");
    }
  }, [countries, selectedCountry, selectedTopic]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setArticles([]);
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <section className="continent-card">
      <div className="card-header">
        <div>
          <h2>{continent}</h2>
          <p>Latest country news snapshot</p>
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

      <div className="active-topic-row">
        <span className="active-topic-label">Active topic</span>
        <span className="active-topic-pill">{selectedTopic}</span>
      </div>

      {status === "idle" && (
        <p className="status-text">
          Select a country and click Refresh to load news.
        </p>
      )}

      {status === "loading" && (
        <p className="status-text">Loading news for {selectedCountry}...</p>
      )}

      {status === "error" && (
        <p className="error-text">Error: {errorMessage}</p>
      )}

      {status === "success" && (
        <>
          <div className="signals-panel">
            <div className="section-heading-row keywords-heading-row">
              <h3>Keyword signals</h3>
              <span className="results-pill results-pill-muted">
                {keywords.length} signals
              </span>
            </div>
            <KeywordChips keywords={keywords} />
          </div>

          <div className="articles-panel">
            <div className="section-heading-row">
              <h3>News results for {selectedCountry}</h3>
              <span className="results-pill">{articles.length} articles</span>
            </div>
            <NewsList articles={articles} />
          </div>
        </>
      )}
    </section>
  );
}

export default ContinentNewsCard;
