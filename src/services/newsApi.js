const API_BASE_URL = "https://ronterrence-news-app-backend.hf.space";

function getHeadlinesFromArticles(articles) {
  return articles
    .map((article) => article.title)
    .filter(Boolean)
    .slice(0, 10);
}

export async function fetchNews(countryCode, countryName) {
  const response = await fetch(
    `${API_BASE_URL}/api/news?country=${countryCode}&countryName=${encodeURIComponent(
      countryName
    )}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Failed to fetch news.");
  }

  const articles = data.articles || [];

  return getHeadlinesFromArticles(articles);
}