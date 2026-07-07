import countriesByContinent from "./data/countries.json";
import ContinentNewsCard from "./components/ContinentNewsCard";

function App() {
  const continents = Object.keys(countriesByContinent);

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal News App v2</p>
          <h1>World News Snapshot</h1>
          <p className="hero-text">
            Track selected countries, review richer article summaries, and spot
            recurring keywords across regions.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        {continents.map((continent) => (
          <ContinentNewsCard
            key={continent}
            continent={continent}
            countries={countriesByContinent[continent]}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
