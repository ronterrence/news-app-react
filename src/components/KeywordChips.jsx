function KeywordChips({ keywords, onKeywordClick, activeKeyword }) {
  if (!keywords.length) {
    return <p className="empty-text">No keyword signals found.</p>;
  }

  const normalizedActiveKeyword = activeKeyword?.trim().toLowerCase() ?? "";

  return (
    <div className="keyword-list">
      {keywords.map((item) => {
        const isClickable = typeof onKeywordClick === "function";
        const isActive = item.word.toLowerCase() === normalizedActiveKeyword;
        const className = `keyword-chip${
          isClickable ? " keyword-chip-button" : ""
        }${isActive ? " is-active" : ""}`;

        return isClickable ? (
          <button
            type="button"
            aria-pressed={isActive}
            className={className}
            key={item.word}
            onClick={() => onKeywordClick(item.word)}
          >
            {item.word} <strong>{item.count}</strong>
          </button>
        ) : (
          <span className={className} key={item.word}>
            {item.word} <strong>{item.count}</strong>
          </span>
        );
      })}
    </div>
  );
}

export default KeywordChips;
