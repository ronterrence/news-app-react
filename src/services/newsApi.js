const API_BASE_URL = "https://ronterrence-news-app-backend.hf.space";

function normalizeArticles(payload) {
  const articles = Array.isArray(payload) ? payload : payload?.articles;

  if (!Array.isArray(articles)) {
    return [];
  }

  return articles
    .map((article, index) => ({
      id: article.id ?? `${article.title ?? "article"}-${index}`,
      title: article.title ?? "Untitled article",
      url: article.url ?? "",
      source: article.source_name ?? article.source ?? "Unknown source",
      publishedAt: article.published_at ?? "",
      imageUrl: article.url_to_image ?? article.image_url ?? "",
      description: article.description ?? article.text_vectorized ?? "",
    }))
    .filter((article) => article.title);
}

export async function fetchNews(countryCode, countryName) {
  const url = `${API_BASE_URL}/api/news?country=${countryCode}&countryName=${encodeURIComponent(
    countryName
  )}`;

  const response = await fetch(url);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : [];
  } catch {
    throw new Error(
      "Backend returned a non-JSON response. The backend Space may be sleeping, restarting, or in error."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.error || data?.message || "Failed to fetch news."
    );
  }

  return normalizeArticles(data).slice(0, 10);
}