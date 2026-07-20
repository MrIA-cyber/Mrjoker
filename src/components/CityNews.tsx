import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  CloudRain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar, 
  MapPin, 
  ChevronRight, 
  Search, 
  Tag, 
  Compass, 
  Award,
  BookOpen,
  Info,
  X,
  Share2,
  Clock,
  Heart
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Économie' | 'Culture' | 'Infrastructures' | 'Sport & Vie locale';
  date: string;
  author: string;
  readTime: string;
  image: string;
  likes: number;
  tags: string[];
}

// Helper to remove accents and convert to lowercase for robust, accent-insensitive search
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function CityNews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [showCopied, setShowCopied] = useState(false);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({
    'news-1': 142,
    'news-2': 98,
    'news-3': 210,
    'news-4': 76,
    'news-5': 115,
  });

  const newsCategories = ['Tous', 'Économie', 'Culture', 'Infrastructures', 'Sport & Vie locale'];

  const articles: NewsArticle[] = [
    {
      id: 'news-1',
      title: "Campagne Caféière 2026 : Bafoussam se dote d'un nouveau centre de torréfaction moderne",
      excerpt: "La coopérative des planteurs de café de la Mifi a inauguré ce samedi une unité de transformation de pointe pour valoriser l'Arabica local sur place au Marché A.",
      content: `Le café Arabica de Bafoussam s'apprête à conquérir de nouveaux sommets. Ce samedi matin, la coopérative agricole des producteurs de la Mifi a officiellement mis en service sa nouvelle usine pilote de torréfaction au cœur de la zone artisanale de Bafoussam. 

Cet investissement d'envergure, soutenu par les acteurs de la communauté de l'Ouest, vise à transformer au moins 45% de la récolte annuelle directement sur place, plutôt que d'exporter les grains verts à l'état brut. 

"C'est une révolution pour nos familles de planteurs", explique Paul Mbiandou, propriétaire de la Maison du Café de l'Ouest et membre de la coopérative. "Grâce à cette torréfaction de précision gérée localement, nous pouvons garantir une fraîcheur absolue à nos clients de Bafoussam Direct et multiplier par trois la marge laissée aux producteurs de nos collines." 

L'unité dispose d'un laboratoire de dégustation ("cupping room") ouvert au public tous les vendredis après-midi, favorisant ainsi la culture de la dégustation du café de spécialité auprès des jeunes résidents.`,
      category: 'Économie',
      date: '18 Juillet 2026',
      author: 'Emile Tchoute',
      readTime: '4 min',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60',
      likes: 142,
      tags: ['Café', 'Mifi', 'Agriculture', 'Marché A']
    },
    {
      id: 'news-2',
      title: "Festival Fussep 2026 : La cour royale de la Chefferie supérieure prépare de grandes célébrations",
      excerpt: "Les préparatifs s'accélèrent à la Chefferie Bafoussam pour le rassemblement biennal des communautés de l'Ouest sous le signe de l'unité et du tissu Ndop.",
      content: `La cour d'honneur de la Chefferie supérieure de Bafoussam résonne déjà au son des tam-tams traditionnels. Sa Majesté le Chef Supérieur vient d'annoncer les dates officielles des célébrations biennales du peuple Fussep, qui se tiendront du 12 au 18 Novembre prochain.

Placée sous le thème de "La transmission des rites ancestraux à l'ère du digital", l'édition 2026 promet de rassembler plus de 50 000 visiteurs venant de tout le Cameroun et de la diaspora.

Le point d'orgue de l'événement sera la grande parade des sociétés secrètes, arborant les plus prestigieux tissus Ndop teints à l'indigo naturel. "Nous voulons redonner au Ndop sa noblesse historique tout en éduquant la jeunesse sur la signification sacrée de chaque motif", confie Nguemgne Florence, créatrice et gardienne de la boutique Ndop & Traditions Bamiléké. 

Un marché artisanal géant sera aménagé le long de la colline de la chefferie, et les visiteurs pourront assister en direct à des démonstrations de tissage traditionnel, de perlage royal et de dégustation du taro à la sauce jaune (Achou) préparé selon les règles sacrées de l'art culinaire de l'Ouest.`,
      category: 'Culture',
      date: '15 Juillet 2026',
      author: 'Florence Nguemgne',
      readTime: '5 min',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60',
      likes: 98,
      tags: ['Chefferie', 'Ndop', 'Fussep', 'Coup de Cœur']
    },
    {
      id: 'news-3',
      title: "Pavages de la voirie : Les travaux de désenclavement avancent à Tamdja et Bamendzi",
      excerpt: "La mairie de ville de Bafoussam poursuit son vaste programme de pavage des axes secondaires. Les moto-taxis saluent une circulation fluidifiée.",
      content: `Fini la boue tenace de la saison des pluies et la poussière étouffante de la saison sèche sur les axes de desserte interne ! Les travaux de pavage en béton lourd autobloquant avancent à un rythme soutenu à Bafoussam. 

La mairie de ville a fait le point ce mercredi sur le chantier de Tamdja (tronçon Carrefour Bamiléké - Lycée Classique) et sur la boucle de Bamendzi, deux zones névralgiques pour le transport local de marchandises.

Au total, ce sont près de 7,8 kilomètres de rues de quartier qui ont été entièrement terrassés, canalisés et pavés au cours des quatre derniers mois. Une bénédiction pour nos livreurs moto-taxis qui assurent la liaison entre les marchands et les consommateurs de l'application Bafoussam Direct.

"Avant, il nous fallait parfois 20 minutes pour traverser Bamendzi après une forte pluie sous peine de glisser", témoigne Jean-Marc, coursier moto à Bafoussam. "Aujourd'hui, on livre en moins de 10 minutes en toute sécurité pour les colis." Le maire a annoncé que la prochaine étape concernera les axes menant au Marché Congo et à Banengo.`,
      category: 'Infrastructures',
      date: '14 Juillet 2026',
      author: 'Sylvain Kengne',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
      likes: 210,
      tags: ['Mairie', 'Routes', 'Tamdja', 'Bamendzi']
    },
    {
      id: 'news-4',
      title: "Innovation : Les jeunes développeurs du Carrefour Bamiléké récompensés au challenge national",
      excerpt: "Une équipe de start-up basée au Tech Hub de Bafoussam a décroché la 3ème place nationale grâce à un algorithme d'optimisation de trajets agricoles.",
      content: `Le génie numérique de la capitale de l'Ouest s'illustre à l'échelle nationale. L'équipe du "Bafoussam Tech Hub", située à l'étage du complexe du Carrefour Bamiléké, a reçu les félicitations officielles du gouverneur de la région de l'Ouest pour son parcours exceptionnel lors du Hackathon national de Yaoundé.

Ces trois jeunes ingénieurs formés localement ont développé une solution mobile ingénieuse permettant d'optimiser les flux de livraison des denrées périssables des champs de Bamendzi vers les marchés de gros de la ville.

"Nous avons conçu cet outil pour aider les agriculteurs à ne plus perdre leurs récoltes de tomates et de légumes faute de transporteurs disponibles au bon moment", explique Sylvain Kengne, mentor de l'équipe. 

Cette distinction confirme le dynamisme croissant de l'écosystème technologique à Bafoussam, qui attire de plus en plus de jeunes diplômés désireux d'apporter des réponses concrètes et connectées aux problématiques spécifiques de la communauté locale.`,
      category: 'Sport & Vie locale',
      date: '10 Juillet 2026',
      author: 'Patricia Mafouo',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
      likes: 76,
      tags: ['Tech', 'Innovation', 'Jeunesse', 'Bamiléké']
    },
    {
      id: 'news-5',
      title: "Prix des denrées : Stabilisation progressive au Marché A et Marché B après les récoltes",
      excerpt: "Le taro de choix, le piment de la Mifi et le panier de tomates enregistrent une baisse favorable du panier de la ménagère ce mois-ci.",
      content: `Excellente nouvelle pour les consommateurs et les foyers de Bafoussam. Le dernier relevé mensuel de l'Observatoire des Prix des Marchés de la Mifi indique une baisse sensible et bienvenue des prix des produits de grande consommation locale.

Le sac de taro de choix de 10kg, indispensable pour la confection de l'Achou national, s'échange désormais entre 11 000 et 12 500 FCFA au Marché A, contre près de 15 000 FCFA le trimestre dernier.

Cette accalmie tarifaire s'explique par l'abondance des récoltes maraîchères dans les zones agricoles périurbaines et par la facilitation logistique apportée par les initiatives de vente directe connectée. 

Du côté des épices, le panier d'assortiment de sauce jaune reste stable à 3 000 FCFA, tandis que la grande cagette de tomates bio de Bamendzi se négocie dorénavant autour de 4 500 FCFA, pour le plus grand bonheur des restauratrices de Tamdja et Djeleng.`,
      category: 'Économie',
      date: '08 Juillet 2026',
      author: 'David Tchoffo',
      readTime: '4 min',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=60',
      likes: 115,
      tags: ['Marché B', 'Taro', 'Prix', 'Consommation']
    }
  ];

  // Filtered Articles list
  const filteredArticles = articles.filter(art => {
    const normSearch = normalizeString(searchTerm);
    const matchSearch = normalizeString(art.title).includes(normSearch) || 
      normalizeString(art.excerpt).includes(normSearch) || 
      art.tags.some(t => normalizeString(t).includes(normSearch));
    
    const matchCat = selectedCategory === 'Tous' || art.category === selectedCategory;

    return matchSearch && matchCat;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = !!likedArticles[id];
    setLikedArticles(prev => ({ ...prev, [id]: !isLiked }));
    setLikesCount(prev => ({
      ...prev,
      [id]: isLiked ? prev[id] - 1 : prev[id] + 1
    }));
  };

  // Local market real-time price state index
  const marketPrices = [
    { name: 'Café Arabica Pur (250g)', price: '2 500 F', trend: 'stable', market: 'Marché A' },
    { name: 'Sac de Taro Sélectionné (10kg)', price: '12 000 F', trend: 'down', market: 'Marché B' },
    { name: 'Tissu Ndop Royal (Mètre)', price: '45 000 F', trend: 'stable', market: 'Marché Congo' },
    { name: 'Tomates Bio (Cagette)', price: '4 500 F', trend: 'down', market: 'Bamendzi' },
    { name: 'Épices Sauce Jaune (Lot)', price: '3 000 F', trend: 'up', market: 'Marché B' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="city-news-container">
      {/* City Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8 border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3f51b5_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
              Journal Communautaire Bafoussam Direct
            </span>
            <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-none text-white font-display">
              L'Actualité de notre Ville
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Restez connecté à la vie sociale, aux célébrations traditionnelles, aux cours des prix des marchés et aux projets de développement de Bafoussam.
            </p>
          </div>

          {/* Quick Weather & State Box */}
          <div className="flex gap-4 shrink-0">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <CloudRain className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Météo Bafoussam</span>
                <span className="text-base font-extrabold text-white block">21°C • Climat Doux</span>
                <span className="text-[9px] text-indigo-300 font-medium block">Pluies fines passagères sur la colline</span>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hidden sm:flex">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Activité Locale</span>
                <span className="text-base font-extrabold text-white block">100% Fluide</span>
                <span className="text-[9px] text-emerald-400 font-medium block">Pavages achevés à Tamdja</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: News Feed + Market Tracker sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* News Feed (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
            {/* Horizontal Categories Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {newsCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Local Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher une actualité, tag..."
                className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-lg text-slate-950 dark:text-slate-100 text-xs transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Articles list */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
              <span className="text-4xl block mb-2">📰</span>
              <p className="font-bold text-slate-800 text-sm">Aucun article trouvé</p>
              <p className="text-xs text-slate-400 mt-1">
                Aucune actualité ne correspond à vos critères de recherche. Essayez d'autres mots-clés.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.2) }}
                  onClick={() => setActiveArticle(article)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col sm:flex-row group cursor-pointer"
                >
                  {/* Article Thumbnail */}
                  <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      {article.category}
                    </div>
                  </div>

                  {/* Article Info */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{article.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime} de lecture</span>
                        </span>
                      </div>

                      <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {article.title}
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                          {article.author.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{article.author}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleLike(article.id, e)}
                          className={`flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-lg transition ${
                            likedArticles[article.id]
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedArticles[article.id] ? 'fill-red-600 stroke-red-600 dark:fill-red-400 dark:stroke-red-400' : ''}`} />
                          <span>{likesCount[article.id]}</span>
                        </button>

                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          <span>Lire</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar widgets (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Price index widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Prix des Marchés</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Le cours de Bafoussam • Mis à jour aujourd'hui</p>
              </div>
            </div>

            <div className="space-y-3">
              {marketPrices.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100/50 dark:border-slate-800/80">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.market}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100">{item.price}</span>
                    {item.trend === 'down' && (
                      <span className="p-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md" title="En baisse (Favorable)">
                        <TrendingDown className="w-3 h-3" />
                      </span>
                    )}
                    {item.trend === 'up' && (
                      <span className="p-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-md" title="En hausse">
                        <TrendingUp className="w-3 h-3" />
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md" title="Stable">
                        <Minus className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl p-3.5 text-[10px] text-amber-900 dark:text-amber-300 leading-relaxed flex gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Avis aux acheteurs :</strong> Ces prix de référence sont relevés en direct auprès des syndicats de commerçants de la Mifi pour lutter contre la spéculation.
              </span>
            </div>
          </div>

          {/* Chefferie / Culture corner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 text-7xl opacity-5 pointer-events-none">👑</div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">Culture & Coutumes</h3>
                <p className="text-[9px] text-slate-400">Patrimoine Fussep & Ouest</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Bafoussam (Fussep) abrite l'une des plus prestigieuses chefferies traditionnelles du Cameroun. Fondée au XIIIe siècle, elle incarne la richesse de l'art du bronze, du perlage et des étoffes de cour.
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider mb-0.5">Le saviez-vous ?</span>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Le tissu <strong>Ndop</strong> royal bamiléké est entièrement cousu de fil de raphia puis teint à l'indigo avant que les fils ne soient décousus pour révéler les motifs géométriques mystiques sacrés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Detail Modal Overlay */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100"
              id="news-detail-modal"
            >
              {/* Modal Image Header */}
              <div className="h-60 sm:h-72 relative shrink-0 bg-slate-100">
                <img 
                  src={activeArticle.image} 
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                  <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {activeArticle.category}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                    {activeArticle.title}
                  </h2>
                </div>
              </div>

              {/* Modal content body */}
              <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {activeArticle.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{activeArticle.author}</span>
                      <span className="text-[10px] text-slate-400">Rédacteur Bafoussam Direct</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeArticle.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeArticle.readTime}</span>
                    </span>
                  </div>
                </div>

                {/* Main article narrative text */}
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                  {activeArticle.content}
                </div>

                {/* Tag badges */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags:</span>
                  </span>
                  {activeArticle.tags.map((t, i) => (
                    <span key={i} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-100">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal footer control bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  onClick={(e) => {
                    handleLike(activeArticle.id, e);
                  }}
                  className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer ${
                    likedArticles[activeArticle.id]
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedArticles[activeArticle.id] ? 'fill-red-600 stroke-red-600' : ''}`} />
                  <span>{likedArticles[activeArticle.id] ? 'J\'adore !' : 'Aimer cet article'} ({likesCount[activeArticle.id]})</span>
                </button>

                <div className="flex items-center gap-2">
                  {showCopied && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100 animate-pulse">
                      Lien copié !
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const shareText = `Bafoussam Direct - Actualités : ${activeArticle.title}`;
                      navigator.clipboard?.writeText?.(shareText).catch(() => {});
                      setShowCopied(true);
                      setTimeout(() => setShowCopied(false), 2000);
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-600 p-2.5 border border-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center"
                    title="Partager l'article"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer shadow-sm h-[38px]"
                  >
                    Fermer la lecture
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
