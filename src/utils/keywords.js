const stopwords = new Set([
  "the", "and", "for", "with", "from", "this", "that",
  "are", "was", "were", "has", "have", "after", "into",
  "over", "about", "amid", "new", "you", "your", "will",
  "his", "her", "its", "they", "their", "who", "what",
  "how", "why", "not", "but", "all", "can", "may", "a",
  "an", "to", "of", "in", "on", "at", "by", "as", "is"
]);

export function extractKeywords(articles, limit = 6) {
  const counts = {};

  articles.forEach((article) => {
    if (Array.isArray(article.keywords) && article.keywords.length) {
      article.keywords.forEach((keyword) => {
        const normalizedKeyword = String(keyword).trim().toLowerCase();

        if (normalizedKeyword) {
          counts[normalizedKeyword] = (counts[normalizedKeyword] || 0) + 1;
        }
      });

      return;
    }

    const content = [article.title, article.description, article.category]
      .filter(Boolean)
      .join(" ");

    content
      .toLowerCase()
      .split(/\s+/)
      .forEach((rawWord) => {
        const word = rawWord.replace(/[.,:;!?()[\]"'/-]/g, "");

        if (word && word.length > 2 && !stopwords.has(word)) {
          counts[word] = (counts[word] || 0) + 1;
        }
      });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
