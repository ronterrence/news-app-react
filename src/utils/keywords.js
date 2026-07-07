const stopwords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "are",
  "was",
  "were",
  "has",
  "have",
  "after",
  "into",
  "over",
  "about",
  "amid",
  "new",
  "you",
  "your",
  "will",
  "his",
  "her",
  "its",
  "they",
  "their",
  "who",
  "what",
  "when",
  "where",
  "how",
  "why",
  "not",
  "but",
  "all",
  "can",
  "may",
  "more",
  "most",
  "just",
  "than",
  "then",
  "also",
  "said",
  "says",
  "say",
  "one",
  "two",
  "first",
  "last",
  "next",
  "former",
  "former",
  "via",
  "per",
  "our",
  "out",
  "off",
  "up",
  "down",
  "under",
  "again",
  "against",
  "during",
  "before",
  "between",
  "through",
  "around",
  "because",
  "while",
  "within",
  "without",
  "onto",
  "news",
  "latest",
  "update",
  "updates",
  "report",
  "reports",
  "reported",
  "breaking",
  "video",
  "photos",
  "photo",
  "live",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "as",
  "is",
]);

function tokenize(content) {
  return String(content)
    .toLowerCase()
    .split(/\s+/)
    .map((rawWord) => rawWord.replace(/[.,:;!?()[\]"'/-]/g, ""))
    .filter(Boolean);
}

function normalizeToken(value) {
  return tokenize(value).join(" ").trim();
}

function normalizeKeyword(word) {
  if (!word) {
    return "";
  }

  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 4) {
    return word.slice(0, -1);
  }

  return word;
}

function buildExclusions(excludedTerms) {
  const exclusions = new Set();

  excludedTerms.forEach((term) => {
    tokenize(term).forEach((token) => {
      const normalizedToken = normalizeKeyword(token);

      if (normalizedToken) {
        exclusions.add(normalizedToken);
      }
    });
  });

  return exclusions;
}

function addWeightedTokens(counts, content, weight, exclusions) {
  tokenize(content).forEach((rawWord) => {
    const word = normalizeKeyword(rawWord);

    if (
      !word ||
      word.length <= 2 ||
      stopwords.has(word) ||
      exclusions.has(word) ||
      /^\d+$/.test(word)
    ) {
      return;
    }

    counts[word] = (counts[word] || 0) + weight;
  });
}

export function extractKeywords(articles, options = {}) {
  const { limit = 12, excludedTerms = [] } = options;
  const counts = {};
  const exclusions = buildExclusions(excludedTerms);

  articles.forEach((article) => {
    if (Array.isArray(article.keywords) && article.keywords.length) {
      article.keywords.forEach((keyword) => {
        const normalizedKeyword = normalizeKeyword(normalizeToken(keyword));

        if (
          normalizedKeyword &&
          normalizedKeyword.length > 2 &&
          !stopwords.has(normalizedKeyword) &&
          !exclusions.has(normalizedKeyword)
        ) {
          counts[normalizedKeyword] = (counts[normalizedKeyword] || 0) + 2;
        }
      });

      return;
    }

    addWeightedTokens(counts, article.title, 3, exclusions);
    addWeightedTokens(counts, article.source, 1, exclusions);
    addWeightedTokens(counts, article.category, 1, exclusions);
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
