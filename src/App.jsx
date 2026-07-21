import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import countriesByContinent from "./data/countries.json";
import KeywordChips from "./components/KeywordChips";
import NewsList from "./components/NewsList";
import TopicToggle from "./components/TopicToggle";
import Icon from "./components/Icon";
import { fetchNews, searchNews } from "./services/newsApi";
import { extractKeywords } from "./utils/keywords";

const EMPTY_ARTICLES = [];

function buildCountryIndex(countryGroups) {
  return Object.entries(countryGroups).reduce((index, [continent, countries]) => {
    Object.entries(countries).forEach(([country, code]) => {
      index[country] = { code, continent };
    });
    return index;
  }, {});
}

function buildSearchQuery(searchTerm, country, topic) {
  return [searchTerm, country, topic === "global" ? "" : topic]
    .filter(Boolean)
    .join(" ");
}

function App() {
  const countryIndex = useMemo(() => buildCountryIndex(countriesByContinent), []);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortMode, setSortMode] = useState("relevance");
  const [lastRequest, setLastRequest] = useState(null);
  const [requestState, setRequestState] = useState({
    status: "idle",
    articles: EMPTY_ARTICLES,
    errorMessage: "",
    submittedLabel: "",
  });
  const abortControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const countrySelectRef = useRef(null);

  const selectedContinent = selectedCountry
    ? countryIndex[selectedCountry]?.continent ?? ""
    : "";

  const executeRetrieval = useCallback(
    async ({ country = selectedCountry, topic = selectedTopic, term = "" }) => {
      abortControllerRef.current?.abort();
      const sequence = ++requestSequenceRef.current;
      const trimmedTerm = term.trim();

      if (!country && topic === "global" && !trimmedTerm) {
        setLastRequest(null);
        setRequestState({
          status: "idle",
          articles: EMPTY_ARTICLES,
          errorMessage: "",
          submittedLabel: "",
        });
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLastRequest({ country, topic, term: trimmedTerm });
      const semanticQuery = buildSearchQuery(trimmedTerm, country, topic);
      const submittedLabel = semanticQuery || "Global news";

      setRequestState({
        status: "loading",
        articles: EMPTY_ARTICLES,
        errorMessage: "",
        submittedLabel,
      });

      try {
        let results;

        if (trimmedTerm) {
          results = await searchNews(semanticQuery, { signal: controller.signal });
        } else if (country) {
          results = await fetchNews(
            countryIndex[country].code,
            country,
            topic,
            { signal: controller.signal }
          );
        } else {
          results = await searchNews(topic, { signal: controller.signal });
        }

        if (sequence !== requestSequenceRef.current) {
          return;
        }

        setRequestState({
          status: "success",
          articles: results,
          errorMessage: "",
          submittedLabel,
        });
      } catch (error) {
        if (error.name === "AbortError" || sequence !== requestSequenceRef.current) {
          return;
        }

        setRequestState({
          status: "error",
          articles: EMPTY_ARTICLES,
          errorMessage: error.message,
          submittedLabel,
        });
      }
    },
    [countryIndex, selectedCountry, selectedTopic]
  );

  useEffect(
    () => () => {
      requestSequenceRef.current += 1;
      abortControllerRef.current?.abort();
    },
    []
  );

  const handleCountryChange = (event) => {
    const country = event.target.value;
    setSelectedCountry(country);
    setSearchQuery("");
    setActiveKeyword("");
    executeRetrieval({ country, topic: selectedTopic });
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setSearchQuery("");
    setActiveKeyword("");
    executeRetrieval({ country: selectedCountry, topic });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setRequestState({
        status: "error",
        articles: EMPTY_ARTICLES,
        errorMessage: "Enter a semantic search query first.",
        submittedLabel: "",
      });
      return;
    }

    setActiveKeyword("");
    executeRetrieval({ term: searchQuery });
  };

  const handleKeywordSearch = (keyword) => {
    setSearchQuery(keyword);
    setActiveKeyword(keyword);
    executeRetrieval({ term: keyword });
    document.getElementById("feed")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleReset = () => {
    requestSequenceRef.current += 1;
    abortControllerRef.current?.abort();
    setSelectedCountry("");
    setSelectedTopic("global");
    setSearchQuery("");
    setActiveKeyword("");
    setSortMode("relevance");
    setLastRequest(null);
    setRequestState({
      status: "idle",
      articles: EMPTY_ARTICLES,
      errorMessage: "",
      submittedLabel: "",
    });
  };

  const handleRefresh = () => {
    if (lastRequest) {
      executeRetrieval(lastRequest);
    }
  };

  const handleNewAnalysis = () => {
    const topicsPanel = document.getElementById("topics");
    if (typeof topicsPanel?.scrollIntoView === "function") {
      topicsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    countrySelectRef.current?.focus({ preventScroll: true });
  };

  const keywords = useMemo(
    () =>
      extractKeywords(requestState.articles, {
        excludedTerms: [selectedCountry, selectedTopic],
      }),
    [requestState.articles, selectedCountry, selectedTopic]
  );

  const sourceCount = useMemo(
    () =>
      new Set(
        requestState.articles
          .map((article) => article.source?.trim())
          .filter(Boolean)
      ).size,
    [requestState.articles]
  );

  const displayedArticles = useMemo(() => {
    if (sortMode === "relevance") {
      return requestState.articles;
    }

    return requestState.articles
      .map((article, index) => ({ article, index }))
      .sort((left, right) => {
        const leftTime = new Date(left.article.publishedAt).getTime();
        const rightTime = new Date(right.article.publishedAt).getTime();
        const leftValid = !Number.isNaN(leftTime);
        const rightValid = !Number.isNaN(rightTime);

        if (leftValid && rightValid) return rightTime - leftTime;
        if (leftValid) return -1;
        if (rightValid) return 1;
        return left.index - right.index;
      })
      .map(({ article }) => article);
  }, [requestState.articles, sortMode]);

  return (
    <div className="app-frame">
      <aside className="side-nav" aria-label="Primary navigation">
        <div className="brand-block">
          <div>
            <strong>Metal Intelligence</strong>
            <span>Semantic news desk</span>
          </div>
        </div>
        <button className="new-analysis-button" type="button" onClick={handleNewAnalysis}>
          New Analysis
        </button>
        <nav className="section-nav">
          <a href="#feed"><Icon name="feed" />Feed</a>
          <a href="#topics"><Icon name="topics" />Topics</a>
          <a href="#semantic-search"><Icon name="search" />Semantic Search</a>
        </nav>
      </aside>

      <div className="content-shell">
        <header className="top-bar">
          <a className="mobile-brand" href="#feed">Metal Intelligence</a>
          <form className="top-search" id="semantic-search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="semantic-query">Semantic search</label>
            <Icon name="search" className="search-icon" size={18} />
            <input
              id="semantic-query"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search articles, topics, keywords…"
            />
            <button type="submit" disabled={requestState.status === "loading"}>
              Search
            </button>
          </form>
          <button
            className="refresh-button"
            type="button"
            onClick={handleRefresh}
            disabled={!lastRequest || requestState.status === "loading"}
          >
            <Icon name="reset" size={17} /> Refresh
          </button>
          <button className="reset-button" type="button" onClick={handleReset}>
            <Icon name="reset" size={17} /> Reset
          </button>
        </header>

        <main className="feed-canvas" id="feed">
          <h1 id="page-title" className="sr-only">World News Snapshot</h1>

          <section className="context-strip" id="topics" aria-labelledby="filter-title">
            <div className="context-strip-heading">
              <span className="eyebrow">Retrieval context</span>
              <h2 id="filter-title">The Wire</h2>
            </div>
            <div className="filter-grid">
              <label className="country-control" htmlFor="country-select">
                <span>Country</span>
                <select
                  id="country-select"
                  ref={countrySelectRef}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <option value="">Choose a country</option>
                  {Object.entries(countriesByContinent).map(([continent, countries]) => (
                    <optgroup key={continent} label={continent}>
                      {Object.keys(countries).map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <TopicToggle
                selectedTopic={selectedTopic}
                onTopicChange={handleTopicChange}
              />
            </div>
            {selectedContinent && (
              <div className="region-context" aria-live="polite">
                <span>Region</span>
                <strong>{selectedContinent}</strong>
              </div>
            )}
          </section>

          <section className="stats-grid" aria-label="Current feed summary">
            <div className="stat-card">
              <span className="stat-icon stat-icon-dark"><Icon name="article" size={23} /></span>
              <div><strong>{requestState.articles.length}</strong><span>Articles</span><small>Current results</small></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon stat-icon-blue"><Icon name="signal" size={23} /></span>
              <div><strong>{keywords.length}</strong><span>Trending signals</span><small>Extracted from results</small></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon stat-icon-gold"><Icon name="source" size={23} /></span>
              <div><strong>{sourceCount}</strong><span>Sources</span><small>Distinct publishers</small></div>
            </div>
          </section>

          {keywords.length > 0 && (
            <section className="trending-panel" aria-labelledby="trending-title">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Live signals</p>
                  <h2 id="trending-title">Trending topics</h2>
                </div>
                <span>Search any signal</span>
              </div>
              <KeywordChips
                keywords={keywords}
                onKeywordClick={handleKeywordSearch}
                activeKeyword={activeKeyword}
              />
            </section>
          )}

          <section className="feed-section" aria-labelledby="results-title">
            <div className="feed-toolbar">
              <div>
                <h2 id="results-title">{requestState.articles.length} articles found</h2>
                {requestState.submittedLabel && <p>{requestState.submittedLabel}</p>}
              </div>
              <div className="view-tools">
                <div className="view-toggle" aria-label="Article layout">
                  <button
                    type="button"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                  ><Icon name="grid" size={16} />Grid</button>
                  <button
                    type="button"
                    aria-pressed={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                  ><Icon name="list" size={16} />List</button>
                </div>
                <label>
                  <span className="sr-only">Sort articles</span>
                  <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="date">Date</option>
                  </select>
                </label>
              </div>
            </div>

            {requestState.status === "idle" && (
              <div className="empty-state">
                <strong>Start with a country, topic, or semantic search.</strong>
                <p>No request is sent until you choose a retrieval context.</p>
              </div>
            )}
            {requestState.status === "loading" && (
              <div className="loading-state" role="status" aria-live="polite">
                <span className="loading-bar" aria-hidden="true" />
                Searching the semantic index for {requestState.submittedLabel}…
              </div>
            )}
            {requestState.status === "error" && (
              <p className="error-text" role="alert">Error: {requestState.errorMessage}</p>
            )}
            {requestState.status === "success" && (
              <div role="status" aria-live="polite">
                <NewsList articles={displayedArticles} viewMode={viewMode} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
