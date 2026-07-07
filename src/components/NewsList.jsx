function formatPublishedDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSnippet(value, maxLength = 180) {
  if (!value) {
    return "";
  }

  const normalizedValue = String(value)
    .replace(/^Title:\s*/i, "")
    .replace(/\s*Content:\s*/i, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedValue) {
    return "";
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength).trimEnd()}…`;
}

function NewsCardContent({ article }) {
  const snippet = formatSnippet(article.description);

  return (
    <div className="news-item-content">
      <h4 className="news-title">{article.title}</h4>

      <div className="news-meta-row">
        <span className="news-source">{article.source}</span>
        <span className="news-date">{formatPublishedDate(article.publishedAt)}</span>
      </div>

      {snippet && <p className="news-snippet">{snippet}</p>}
    </div>
  );
}

function NewsList({ articles }) {
  if (!articles.length) {
    return <p className="empty-text">No news results found.</p>;
  }

  return (
    <div className="news-list">
      {articles.map((article) => (
        <article key={article.id} className="news-item-card">
          {article.url ? (
            <a
              className="news-card-link"
              href={article.url}
              target="_blank"
              rel="noreferrer"
            >
              <NewsCardContent article={article} />
            </a>
          ) : (
            <NewsCardContent article={article} />
          )}
        </article>
      ))}
    </div>
  );
}

export default NewsList;
