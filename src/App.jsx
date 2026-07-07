import { useState } from "react";

import countriesByContinent from "./data/countries.json";
import ContinentNewsCard from "./components/ContinentNewsCard";
import GoldSearchPanel from "./components/GoldSearchPanel";
import TopicToggle from "./components/TopicToggle";

function App() {
  const continents = Object.keys(countriesByContinent);
  const [selectedTopic, setSelectedTopic] = useState("global");
  const [goldSearchRequest, setGoldSearchRequest] = useState(null);
  const [activeKeyword, setActiveKeyword] = useState("");

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

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal News App v2</p>
          <h1>World News Snapshot</h1>
          <p className="hero-text">
            Track selected countries, review article headlines, and spot cleaner
            keyword signals while using a semantic topic lens across regions.
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
          />
        ))}
      </section>
    </main>
  );
}

export default App;
