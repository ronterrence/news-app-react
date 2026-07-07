import React, { useState, useEffect } from 'react';

export default function DashboardNews() {
  const [articles, setArticles] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("global"); // Région par défaut
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // On appelle ton backend Hugging Face
    fetch(`https://ronterrence-news-app-backend.hf.space/api/news/search?query=${selectedRegion}`)
      .then((res) => res.json())
      .then((data) => {
        // Sécurité : si le backend renvoie un objet direct ou une structure imbriquée
        const newsList = Array.isArray(data) ? data : (data.articles || []);
        setArticles(newsList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur Backend HF:", err);
        setLoading(false);
      });
  }, [selectedRegion]);

  // Extraction unique de tous les mots-clés cumulés pour la région
  const globalKeywords = Array.from(
    new Set(articles.flatMap(art => art.keywords || (art.category ? [art.category] : [])))
  ).slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      
      {/* 1. SÉLECTEUR DE RÉGIONS (Pour changer le filtre sémantique) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["global", "technology", "business", "science", "sports"].map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedRegion === region 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* 2. TITRE UNIQUE ET NUAGE DE MOTS-CLÉS (Créé UNE seule fois) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Tendances Actuelles : <span className="capitalize text-blue-600">{selectedRegion}</span>
        </h2>
        
        {globalKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {globalKeywords.map((keyword, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 uppercase tracking-wider"
              >
                #{keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Aucun tag sémantique détecté pour le moment.</p>
        )}
      </div>

      {/* 3. GRILLE D'ARTICLES TEXTUELS (NO IMAGES) */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          🔄 Analyse sémantique de la base vectorielle ChromaDB...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                  {article.category || "General"}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-4 mb-4">
                  {article.summary || article.description || "Résumé analytique en cours de traitement..."}
                </p>
              </div>

              {/* Micro-mots clés spécifiques à cet article au pied de la carte */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                {(article.keywords || []).slice(0, 3).map((kw, i) => (
                  <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si la base vectorielle est vide */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          Aucun article trouvé. Pensez à déclencher le /api/cron-trigger sur votre Swagger HF.
        </div>
      )}
    </div>
  );
}