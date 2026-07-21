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
        const articleKeywords = Array.isArray(article.keywords)
          ? article.keywords.filter(Boolean).slice(0, 3)
          : [];

        return (
          <article key={article.id} className="news-item-card">
            <div className="news-card-topline">
              {article.category ? <span className="category-pill">{article.category}</span> : <span />}
            </div>
            <h3 className="news-title">{article.title}</h3>
            {snippet && <p className="news-snippet">{snippet}</p>}
            <div className="news-meta">
              <span className="news-date">{formatPublishedDate(article.publishedAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="news-source">{article.source}</span>
            </div>
            {articleKeywords.length > 0 && (
              <ul className="article-keywords" aria-label="Article keywords">
                {articleKeywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
              </ul>
            )}
            {article.url && (
              <div className="news-card-footer">
                <a href={article.url} target="_blank" rel="noreferrer">
                  Read article <span aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default NewsList;
