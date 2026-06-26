function NewsList({ headlines }) {
  if (!headlines.length) {
    return <p className="empty-text">No news results found.</p>;
  }

  return (
    <ol className="news-list">
      {headlines.map((headline, index) => (
        <li key={`${headline}-${index}`} className="news-item">
          {headline}
        </li>
      ))}
    </ol>
  );
}

export default NewsList;

