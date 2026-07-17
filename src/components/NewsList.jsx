function formatPublishedDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSnippet(value, maxLength = 180) {
  if (!value) return "";
  const normalizedValue = String(value)
    .replace(/^Title:\s*/i, "")
    .replace(/\s*Content:\s*/i, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedValue.length <= maxLength) return normalizedValue;
  return `${normalizedValue.slice(0, maxLength).trimEnd()}…`;
}

function NewsList({ articles, viewMode = "grid" }) {
  if (!articles.length) {
    return <p className="empty-text">No news results found.</p>;
  }

  return (
    <div className={`news-list news-list-${viewMode}`}>
      {articles.map((article) => {
        const snippet = formatSnippet(article.description);

        return (
          <article key={article.id} className="news-item-card">
            <div className="news-card-topline">
              {article.category ? <span className="category-pill">{article.category}</span> : <span />}
              <span className="news-date">{formatPublishedDate(article.publishedAt)}</span>
            </div>
            <h3 className="news-title">{article.title}</h3>
            {snippet && <p className="news-snippet">{snippet}</p>}
            <div className="news-card-footer">
              <span className="news-source">{article.source}</span>
              {article.url && (
                <a href={article.url} target="_blank" rel="noreferrer">
                  Read article <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default NewsList;
