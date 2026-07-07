import { useState } from "react";

import countriesByContinent from "./data/countries.json";
import ContinentNewsCard from "./components/ContinentNewsCard";
import TopicToggle from "./components/TopicToggle";

function App() {
  const continents = Object.keys(countriesByContinent);
  const [selectedTopic, setSelectedTopic] = useState("global");

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal News App v2</p>
          <h1>World News Snapshot</h1>
          <p className="hero-text">
            Track selected countries, review article titles, and spot keyword
            signals by country across regions.
          </p>
        </div>

        <TopicToggle
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
        />
      </section>

      <section className="dashboard-grid">
        {continents.map((continent) => (
          <ContinentNewsCard
            key={continent}
            continent={continent}
            countries={countriesByContinent[continent]}
            selectedTopic={selectedTopic}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
