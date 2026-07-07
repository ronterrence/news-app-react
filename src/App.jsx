import { useMemo, useState } from "react";

import countriesByContinent from "./data/countries.json";
import ContinentNewsCard from "./components/ContinentNewsCard";
import GoldSearchPanel from "./components/GoldSearchPanel";
import TopicToggle from "./components/TopicToggle";

const FALLBACK_SUGGESTIONS = [
  "technology and software innovation",
  "global business markets",
  "science research breakthrough",
  "sports competition",
  "renewable energy policy",
];

function buildDynamicSuggestions(signalsByContinent, selectedTopic) {
  const allSignals = Object.values(signalsByContinent)
    .flat()
    .filter(Boolean)
    .map((signal) => String(signal).trim().toLowerCase());

  const uniqueSignals = [...new Set(allSignals)].slice(0, 8);

  if (!uniqueSignals.length) {
    return FALLBACK_SUGGESTIONS;
  }

  const suggestionSet = new Set();

  uniqueSignals.forEach((signal, index) => {
    suggestionSet.add(signal);

    if (selectedTopic !== "global") {
      suggestionSet.add(`${selectedTopic} ${signal}`);
    }

    const nextSignal = uniqueSignals[index + 1];
    if (nextSignal) {
      suggestionSet.add(`${signal} ${nextSignal}`);
    }
  });

  const suggestions = [...suggestionSet]
    .map((suggestion) => suggestion.trim())
    .filter((suggestion) => suggestion.length > 2)
    .slice(0, 8);

  return suggestions.length ? suggestions : FALLBACK_SUGGESTIONS;
}

function App() {
  const continents = Object.keys(countriesByContinent);
  const [selectedTopic, setSelectedTopic] = useState("global");
  const [goldSearchRequest, setGoldSearchRequest] = useState(null);
  const [activeKeyword, setActiveKeyword] = useState("");
  const [signalsByContinent, setSignalsByContinent] = useState({});

  const dynamicSuggestions = useMemo(
    () => buildDynamicSuggestions(signalsByContinent, selectedTopic),
    [selectedTopic, signalsByContinent]
  );

  const handleKeywordSearch = (keyword) => {
    setActiveKeyword(keyword);
    setGoldSearchRequest({
      id: Date.now(),
      query: keyword,
      source: "keyword",
    });

    const goldPanel = document.getElementById("gold-search-panel");
    goldPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGoldSearchInteraction = () => {
    setActiveKeyword("");
  };

  const handleSignalsChange = (continent, keywords) => {
    setSignalsByContinent((current) => ({
      ...current,
      [continent]: keywords.map((keyword) => keyword.word),
    }));
  };

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal News App v2</p>
          <h1>World News Snapshot</h1>
          <p className="hero-text">
            Explore country-focused news views, compare keyword signals, and use
            a semantic topic lens to guide retrieval across regions.
          </p>
        </div>

        <TopicToggle
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
        />
      </section>

      <GoldSearchPanel
        searchRequest={goldSearchRequest}
        onSearchInteraction={handleGoldSearchInteraction}
        suggestions={dynamicSuggestions}
      />

      <section className="dashboard-grid">
        {continents.map((continent) => (
          <ContinentNewsCard
            key={continent}
            continent={continent}
            countries={countriesByContinent[continent]}
            selectedTopic={selectedTopic}
            onKeywordSearch={handleKeywordSearch}
            activeKeyword={activeKeyword}
            onSignalsChange={handleSignalsChange}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
