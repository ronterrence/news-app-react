function KeywordChips({ keywords }) {
  if (!keywords.length) {
    return <p className="empty-text">No keyword signals found.</p>;
  }

  return (
    <div className="keyword-list">
      {keywords.map((item) => (
        <span className="keyword-chip" key={item.word}>
          {item.word} <strong>{item.count}</strong>
        </span>
      ))}
    </div>
  );
}

export default KeywordChips;