const API_BASE_URL = "https://ronterrence-news-app-backend.hf.space";

function getHeadlinesFromArticles(articles) {
  return articles
    .map((article) => article.title)
    .filter(Boolean)
    .slice(0, 10);
}

export async function fetchNews(countryCode, countryName) {
  const url = `${API_BASE_URL}/api/news?country=${countryCode}&countryName=${encodeURIComponent(
    countryName
  )}`;

  const response = await fetch(url);

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Backend returned a non-JSON response. The backend Space may be sleeping, restarting, or in error."
    );
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Failed to fetch news.");
  }

  return getHeadlinesFromArticles(data.articles || []);
}