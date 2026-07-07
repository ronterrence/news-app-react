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

function NewsList({ articles }) {
  if (!articles.length) {
    return <p className="empty-text">No news results found.</p>;
  }

  return (
    <div className="news-list">
      {articles.map((article) => (
        <article key={article.id} className="news-item-card">
          {article.imageUrl ? (
            <img
              className="news-image"
              src={article.imageUrl}
              alt={article.title}
              loading="lazy"
            />
          ) : (
            <div className="news-image news-image-placeholder">No image</div>
          )}

          <div className="news-item-content">
            <div className="news-meta-row">
              <span className="news-source">{article.source}</span>
              <span className="news-date">{formatPublishedDate(article.publishedAt)}</span>
            </div>

            <h4 className="news-title">{article.title}</h4>

            <p className="news-description">
              {article.description || "No description available for this article."}
            </p>

            {article.url ? (
              <a
                className="news-link"
                href={article.url}
                target="_blank"
                rel="noreferrer"
              >
                Read article
              </a>
            ) : (
              <span className="news-link news-link-disabled">Link unavailable</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default NewsList;

