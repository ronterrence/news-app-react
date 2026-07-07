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
          <div className="news-item-content">
            <h4 className="news-title">{article.title}</h4>

            <div className="news-meta-row">
              <span className="news-source">{article.source}</span>
              <span className="news-date">{formatPublishedDate(article.publishedAt)}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default NewsList;
