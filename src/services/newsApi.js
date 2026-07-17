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
      source: article.source_name ?? article.source ?? article.category ?? "Unknown source",
      publishedAt: article.published_at ?? "",
      imageUrl: article.url_to_image ?? article.image_url ?? "",
      description:
        article.summary ?? article.description ?? article.text_vectorized ?? "",
      category: article.category ?? "",
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
    }))
    .filter((article) => article.title);
}

function buildCountryQuery(countryName, selectedTopic) {
  if (!selectedTopic || selectedTopic === "global") {
    return countryName;
  }

  return `${countryName} ${selectedTopic}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
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

  return data;
}

export async function fetchNews(
  countryCode,
  countryName,
  selectedTopic = "global",
  options = {}
) {
  const countryQuery = buildCountryQuery(countryName, selectedTopic);
  const url = `${API_BASE_URL}/api/news?country=${countryCode}&countryName=${encodeURIComponent(
    countryQuery
  )}`;

  const data = await requestJson(url, options);
  return normalizeArticles(data).slice(0, 10);
}

export async function searchNews(query, options = {}) {
  const url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`;
  const data = await requestJson(url, options);
  return normalizeArticles(data).slice(0, 10);
}
