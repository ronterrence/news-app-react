import countriesByContinent from "./data/countries.json";
import ContinentNewsCard from "./components/ContinentNewsCard";

function App() {
  const continents = Object.keys(countriesByContinent);
  const totalCountries = Object.values(countriesByContinent).reduce(
    (count, countries) => count + Object.keys(countries).length,
    0
  );

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal News App v2</p>
          <h1>World News Snapshot</h1>
          <p className="hero-text">
            Track selected countries, review richer article summaries, and spot
            recurring keywords across regions without turning this into fake
            Google.
          </p>
        </div>

        <div className="hero-stats" aria-label="News dashboard overview">
          <div className="hero-stat-card">
            <span className="hero-stat-value">{continents.length}</span>
            <span className="hero-stat-label">Regions</span>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-value">{totalCountries}</span>
            <span className="hero-stat-label">Countries</span>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-value">Live</span>
            <span className="hero-stat-label">API status</span>
          </div>
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