import { useCallback, useMemo, useState } from "react";

import { fetchNews } from "../services/newsApi";
import { extractKeywords } from "../utils/keywords";
import NewsList from "./NewsList";
import KeywordChips from "./KeywordChips";

function ContinentNewsCard({ continent, countries }) {
  const countryNames = Object.keys(countries);

  const [selectedCountry, setSelectedCountry] = useState(countryNames[0]);
  const [headlines, setHeadlines] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const keywords = useMemo(() => {
    return extractKeywords(headlines);
  }, [headlines]);

  const loadNews = useCallback(async () => {
    const countryCode = countries[selectedCountry];

    setStatus("loading");
    setErrorMessage("");

    try {
      const results = await fetchNews(countryCode, selectedCountry);
      setHeadlines(results);
      setStatus("success");
    } catch (error) {
      setHeadlines([]);
      setErrorMessage(error.message);
      setStatus("error");
    }
  }, [countries, selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setHeadlines([]);
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
          <h3>News results for {selectedCountry}</h3>
          <NewsList headlines={headlines} />

          <h3>Top keywords</h3>
          <KeywordChips keywords={keywords} />
        </>
      )}
    </section>
  );
}

export default ContinentNewsCard;