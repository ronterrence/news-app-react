const TOPIC_OPTIONS = [
  "global",
  "technology",
  "business",
  "science",
  "sports",
];

function TopicToggle({ selectedTopic, onTopicChange }) {
  return (
    <aside className="topic-panel" aria-label="Topic selector">
      <p className="topic-label">Semantic topic</p>
      <p className="topic-helper-text">
        Refines the semantic query used to retrieve country-related articles.
      </p>
      <div className="topic-toggle-list">
        {TOPIC_OPTIONS.map((topic) => {
          const isActive = topic === selectedTopic;

          return (
            <button
              key={topic}
              type="button"
              className={`topic-toggle-button${isActive ? " is-active" : ""}`}
              onClick={() => onTopicChange(topic)}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default TopicToggle;
