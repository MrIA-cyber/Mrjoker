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
import { translations } from '../translations';

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

interface CityNewsProps {
  lang: 'fr' | 'en';
}

// Helper to remove accents and convert to lowercase for robust, accent-insensitive search
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const categoryTranslations: Record<string, Record<string, string>> = {
  fr: {
    'Tous': 'Tous',
    'Économie': 'Économie',
    'Culture': 'Culture',
    'Infrastructures': 'Infrastructures',
    'Sport & Vie locale': 'Sport & Vie locale',
  },
  en: {
    'Tous': 'All',
    'Économie': 'Economy',
    'Culture': 'Culture',
    'Infrastructures': 'Infrastructure',
    'Sport & Vie locale': 'Sport & Local Life',
  }
};

export default function CityNews({ lang }: CityNewsProps) {
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

  const getTranslation = (key: string, replacements?: Record<string, string | number>) => {
    let text = (translations[lang] as any)[key] || (translations['fr'] as any)[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const newsCategories = ['Tous', 'Économie', 'Culture', 'Infrastructures', 'Sport & Vie locale'];

  const articles: NewsArticle[] = [
    {
      id: 'news-1',
      title: lang === 'fr' 
        ? "Campagne Caféière 2026 : Bafoussam se dote d'un nouveau centre de torréfaction moderne"
        : "2026 Coffee Campaign: Bafoussam gets a new modern roasting center",
      excerpt: lang === 'fr'
        ? "La coopérative des planteurs de café de la Mifi a inauguré ce samedi une unité de transformation de pointe pour valoriser l'Arabica local sur place au Marché A."
        : "The Mifi coffee farmers' cooperative inaugurated a state-of-the-art processing unit this Saturday to add value to local Arabica on-site at Marché A.",
      content: lang === 'fr'
        ? `Le café Arabica de Bafoussam s'apprête à conquérir de nouveaux sommets. Ce samedi matin, la coopérative agricole des producteurs de la Mifi a officiellement mis en service sa nouvelle usine pilote de torréfaction au cœur de la zone artisanale de Bafoussam. \n\nCet investissement d'envergure, soutenu par les acteurs de la communauté de l'Ouest, vise à transformer au moins 45% de la récolte annuelle directement sur place, plutôt que d'exporter les grains verts à l'état brut. \n\n"C'est une révolution pour nos familles de planteurs", explique Paul Mbiandou, propriétaire de la Maison du Café de l'Ouest et membre de la coopérative. "Grâce à cette torréfaction de précision gérée localement, nous pouvons garantir une fraîcheur absolue à nos clients de Bafoussam Direct et multiplier par trois la marge laissée aux producteurs de nos collines." \n\nL'unité dispose d'un laboratoire de dégustation ("cupping room") ouvert au public tous les vendredis après-midi, favorisant ainsi la culture de la dégustation du café de spécialité auprès des jeunes résidents.`
        : `Bafoussam's Arabica coffee is about to conquer new heights. This Saturday morning, the agricultural cooperative of Mifi producers officially commissioned its new pilot roasting plant in the heart of Bafoussam's artisanal zone.\n\nThis major investment, supported by Western community players, aims to process at least 45% of the annual harvest directly on-site, rather than exporting green beans raw.\n\n"This is a revolution for our farming families," explains Paul Mbiandou, owner of Maison du Café de l'Ouest and cooperative member. "Thanks to this locally-managed precision roasting, we can guarantee absolute freshness to Bafoussam Direct customers and triple the margin left to our hillside growers."\n\nThe unit features a tasting lab ("cupping room") open to the public every Friday afternoon, promoting specialty coffee appreciation among young residents.`,
      category: 'Économie',
      date: lang === 'fr' ? '18 Juillet 2026' : 'July 18, 2026',
      author: 'Emile Tchoute',
      readTime: lang === 'fr' ? '4 min' : '4 min read',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60',
      likes: 142,
      tags: lang === 'fr' ? ['Café', 'Mifi', 'Agriculture', 'Marché A'] : ['Coffee', 'Mifi', 'Agriculture', 'Market A']
    },
    {
      id: 'news-2',
      title: lang === 'fr'
        ? "Festival Fussep 2026 : La cour royale de la Chefferie supérieure prépare de grandes célébrations"
        : "2026 Fussep Festival: Royal Court of the Chiefdom prepares grand celebrations",
      excerpt: lang === 'fr'
        ? "Les préparatifs s'accélèrent à la Chefferie Bafoussam pour le rassemblement biennal des communautés de l'Ouest sous le signe de l'unité et du tissu Ndop."
        : "Preparations are accelerating at the Bafoussam Chiefdom for the biennial gathering of Western communities under the banner of unity and Ndop fabric.",
      content: lang === 'fr'
        ? `La cour d'honneur de la Chefferie supérieure de Bafoussam résonne déjà au son des tam-tams traditionnels. Sa Majesté le Chef Supérieur vient d'annoncer les dates officielles des célébrations biennales du peuple Fussep, qui se tiendront du 12 au 18 Novembre prochain. \n\nPlacée sous le thème de "La transmission des rites ancestraux à l'ère du digital", l'édition 2026 promet de rassembler plus de 50 000 visiteurs venant de tout le Cameroun et de la diaspora. \n\nLe point d'orgue de l'événement sera la grande parade des sociétés secrètes, arborant les plus prestigieux tissus Ndop teints à l'indigo naturel. "Nous voulons redonner au Ndop sa noblesse historique tout en éduquant la jeunesse sur la signification sacrée de chaque motif", confie Nguemgne Florence, créatrice et gardienne de la boutique Ndop & Traditions Bamiléké. \n\nUn marché artisanal géant sera aménagé le long de la colline de la chefferie, et les visiteurs pourront assister en direct à des démonstrations de tissage traditionnel, de perlage royal et de dégustation du taro à la sauce jaune (Achou) préparé selon les règles sacrées de l'art culinaire de l'Ouest.`
        : `The main courtyard of Bafoussam's Royal Palace is already vibrating with traditional drums. His Majesty the Paramount Chief has just announced the official dates for the Fussep people's biennial celebrations, which will take place from November 12 to 18.\n\nUnder the theme "Transmission of ancestral rites in the digital age," the 2026 edition promises to bring together more than 50,000 visitors from across Cameroon and the diaspora.\n\nThe highlight of the event will be the grand parade of secret societies, showing off the most prestigious Ndop fabrics dyed with natural indigo. "We want to restore Ndop to its historical nobility while educating youth about the sacred meaning of each motif," shares Nguemgne Florence, designer and guardian of the Ndop & Bamiléké Traditions shop.\n\nA giant craft market will be set up along the palace hill, and visitors will be able to watch live demonstrations of traditional weaving, royal beadwork, and culinary tastings of taro with yellow sauce (Achou) prepared according to ancestral West culinary arts rules.`,
      category: 'Culture',
      date: lang === 'fr' ? '15 Juillet 2026' : 'July 15, 2026',
      author: 'Florence Nguemgne',
      readTime: lang === 'fr' ? '5 min' : '5 min read',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60',
      likes: 98,
      tags: lang === 'fr' ? ['Chefferie', 'Ndop', 'Fussep', 'Coup de Cœur'] : ['Chiefdom', 'Ndop', 'Fussep', 'Top Choice']
    },
    {
      id: 'news-3',
      title: lang === 'fr'
        ? "Pavages de la voirie : Les travaux de désenclavement avancent à Tamdja et Bamendzi"
        : "Road Paving: Infrastructure works advancing in Tamdja and Bamendzi",
      excerpt: lang === 'fr'
        ? "La mairie de ville de Bafoussam poursuit son vaste programme de pavage des axes secondaires. Les moto-taxis saluent une circulation fluidifiée."
        : "Bafoussam's city council continues its major program to pave secondary roads. Moto-taxi drivers welcome smoother traffic.",
      content: lang === 'fr'
        ? `Fini la boue tenace de la saison des pluies et la poussière étouffante de la saison sèche sur les axes de desserte interne ! Les travaux de pavage en béton lourd autobloquant avancent à un rythme soutenu à Bafoussam. \n\nLa mairie de ville a fait le point ce mercredi sur le chantier de Tamdja (tronçon Carrefour Bamiléké - Lycée Classique) et sur la boucle de Bamendzi, deux zones névralgiques pour le transport local de marchandises. \n\nAu total, ce sont près de 7,8 kilomètres de rues de quartier qui ont été entièrement terrassés, canalisés et pavés au cours des quatre derniers mois. Une bénédiction pour nos livreurs moto-taxis qui assurent la liaison entre les marchands et les consommateurs de l'application Bafoussam Direct. \n\n"Avant, il nous fallait parfois 20 minutes pour traverser Bamendzi après une forte pluie sous peine de glisser", témoigne Jean-Marc, coursier moto à Bafoussam. "Aujourd'hui, on livre en moins de 10 minutes en toute sécurité pour les colis." Le maire a annoncé que la prochaine étape concernera les axes menant au Marché Congo et à Banengo.`
        : `Gone is the sticky mud of the rainy season and the suffocating dust of the dry season on internal roads! Heavy-duty interlocking concrete paving works are progressing steadily in Bafoussam.\n\nThe city council assessed progress this Wednesday on the Tamdja site (Carrefour Bamiléké - Lycée Classique stretch) and the Bamendzi loop, two critical areas for local freight transport.\n\nIn total, nearly 7.8 kilometers of neighborhood streets have been completely cleared, drained, and paved over the last four months. A blessing for our moto-taxi delivery riders who connect merchants and consumers through Bafoussam Direct.\n\n"Before, it sometimes took us 20 minutes to cross Bamendzi after a heavy rain without slipping," testifies Jean-Marc, a courier in Bafoussam. "Today, we deliver in less than 10 minutes safely." The Mayor announced the next phase will focus on roads to Marché Congo and Banengo.`,
      category: 'Infrastructures',
      date: lang === 'fr' ? '14 Juillet 2026' : 'July 14, 2026',
      author: 'Sylvain Kengne',
      readTime: lang === 'fr' ? '3 min' : '3 min read',
      image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
      likes: 210,
      tags: lang === 'fr' ? ['Mairie', 'Routes', 'Tamdja', 'Bamendzi'] : ['City Hall', 'Roads', 'Tamdja', 'Bamendzi']
    },
    {
      id: 'news-4',
      title: lang === 'fr'
        ? "Innovation : Les jeunes développeurs du Carrefour Bamiléké récompensés au challenge national"
        : "Innovation: Young developers from Carrefour Bamiléké rewarded at national challenge",
      excerpt: lang === 'fr'
        ? "Une équipe de start-up basée au Tech Hub de Bafoussam a décroché la 3ème place nationale grâce à un algorithme d'optimisation de trajets agricoles."
        : "A startup team based in Bafoussam Tech Hub grabbed 3rd place nationally thanks to a routing algorithm for agricultural distribution.",
      content: lang === 'fr'
        ? `Le génie numérique de la capitale de l'Ouest s'illustre à l'échelle nationale. L'équipe du "Bafoussam Tech Hub", située à l'étage du complexe du Carrefour Bamiléké, a reçu les félicitations officielles du gouverneur de la région de l'Ouest pour son parcours exceptionnel lors du Hackathon national de Yaoundé. \n\nCes trois jeunes ingénieurs formés localement ont développé une solution mobile ingénieuse permettant d'optimiser les flux de livraison des denrées périssables des champs de Bamendzi vers les marchés de gros de la ville. \n\n"Nous avons conçu cet outil pour aider les agriculteurs à ne plus perdre leurs récoltes de tomates et de légumes faute de transporteurs disponibles au bon moment", explique Sylvain Kengne, mentor de l'équipe. \n\nCette distinction confirme le dynamisme croissant de l'écosystème technologique à Bafoussam, qui attire de plus en plus de jeunes diplômés désireux d'apporter des réponses concrètes et connectées aux problématiques spécifiques de la communauté locale.`
        : `Digital genius from the capital of the West shines on the national stage. The team from the "Bafoussam Tech Hub," located upstairs at the Carrefour Bamiléké complex, received official congratulations from the West Regional Governor for their outstanding achievement at the National Hackathon in Yaoundé.\n\nThese three locally trained young engineers developed an ingenious mobile solution to optimize delivery flows of perishable foods from Bamendzi fields to city wholesale markets.\n\n"We designed this tool to help farmers stop losing tomato and vegetable harvests due to unavailable transport at the right time," explains Sylvain Kengne, team mentor.\n\nThis award confirms the growing momentum of Bafoussam's technological ecosystem, attracting more and more young graduates eager to provide concrete, connected answers to local community issues.`,
      category: 'Sport & Vie locale',
      date: lang === 'fr' ? '10 Juillet 2026' : 'July 10, 2026',
      author: 'Patricia Mafouo',
      readTime: lang === 'fr' ? '3 min' : '3 min read',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
      likes: 76,
      tags: lang === 'fr' ? ['Tech', 'Innovation', 'Jeunesse', 'Bamiléké'] : ['Tech', 'Innovation', 'Youth', 'Bamiléké']
    },
    {
      id: 'news-5',
      title: lang === 'fr'
        ? "Prix des denrées : Stabilisation progressive au Marché A et Marché B après les récoltes"
        : "Food Prices: Gradual stabilization at Marché A and Marché B post-harvest",
      excerpt: lang === 'fr'
        ? "Le taro de choix, le piment de la Mifi et le panier de tomates enregistrent une baisse favorable du panier de la ménagère ce mois-ci."
        : "Premium taro, Mifi pepper, and tomato baskets see a favorable decline for the consumer's basket this month.",
      content: lang === 'fr'
        ? `Excellente nouvelle pour les consommateurs et les foyers de Bafoussam. Le dernier relevé mensuel de l'Observatoire des Prix des Marchés de la Mifi indique une baisse sensible et bienvenue des prix des produits de grande consommation locale. \n\nLe sac de taro de choix de 10kg, indispensable pour la confection de l'Achou national, s'échange désormais entre 11 000 et 12 500 FCFA au Marché A, contre près de 15 000 FCFA le trimestre dernier. \n\nCette accalmie tarifaire s'explique par l'abondance des récoltes maraîchères dans les zones agricoles périurbaines et par la facilitation logistique apportée par les initiatives de vente directe connectée. \n\nDu côté des épices, le panier d'assortiment de sauce jaune reste stable à 3 000 FCFA, tandis que la grande cagette de tomates bio de Bamendzi se négocie dorénavant autour de 4 500 FCFA, pour le plus grand bonheur des restauratrices de Tamdja et Djeleng.`
        : `Excellent news for Bafoussam consumers and households. The latest monthly report from the Mifi Market Price Observatory indicates a significant and welcome decline in prices of major local consumer goods.\n\nThe 10kg premium taro bag, essential for the national Achou dish, is now trading between 11,000 and 12,500 FCFA at Marché A, down from nearly 15,000 FCFA last quarter.\n\nThis price relief is explained by the abundance of market garden harvests in peri-urban farming areas and logistic facilitation provided by direct connected selling initiatives.\n\nAs for spices, the yellow sauce assortment basket remains stable at 3,000 FCFA, while the large box of organic tomatoes from Bamendzi is now negotiating around 4,500 FCFA, much to the joy of restaurateurs in Tamdja and Djeleng.`,
      category: 'Économie',
      date: lang === 'fr' ? '08 Juillet 2026' : 'July 8, 2026',
      author: 'David Tchoffo',
      readTime: lang === 'fr' ? '4 min' : '4 min read',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=60',
      likes: 115,
      tags: lang === 'fr' ? ['Marché B', 'Taro', 'Prix', 'Consommation'] : ['Market B', 'Taro', 'Prices', 'Consumption']
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
    { name: lang === 'fr' ? 'Café Arabica Pur (250g)' : 'Pure Arabica Coffee (250g)', price: '2 500 F', trend: 'stable', market: lang === 'fr' ? 'Marché A' : 'Market A' },
    { name: lang === 'fr' ? 'Sac de Taro Sélectionné (10kg)' : 'Selected Taro Bag (10kg)', price: '12 000 F', trend: 'down', market: lang === 'fr' ? 'Marché B' : 'Market B' },
    { name: lang === 'fr' ? 'Tissu Ndop Royal (Mètre)' : 'Royal Ndop Fabric (Meter)', price: '45 000 F', trend: 'stable', market: lang === 'fr' ? 'Marché Congo' : 'Congo Market' },
    { name: lang === 'fr' ? 'Tomates Bio (Cagette)' : 'Organic Tomatoes (Crate)', price: '4 500 F', trend: 'down', market: 'Bamendzi' },
    { name: lang === 'fr' ? 'Épices Sauce Jaune (Lot)' : 'Yellow Sauce Spices (Lot)', price: '3 000 F', trend: 'up', market: lang === 'fr' ? 'Marché B' : 'Market B' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="city-news-container">
      {/* City Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8 border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3f51b5_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
              {lang === 'fr' ? 'Journal Communautaire Bafoussam Direct' : 'Bafoussam Direct Community Journal'}
            </span>
            <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-none text-white font-display">
              {getTranslation('newsWidgetTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {getTranslation('newsWidgetDesc')}
            </p>
          </div>

          {/* Quick Weather & State Box */}
          <div className="flex gap-4 shrink-0">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <CloudRain className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{getTranslation('weatherWidgetTitle')}</span>
                <span className="text-base font-extrabold text-white block">{getTranslation('weatherWidgetStatus')}</span>
                <span className="text-[9px] text-indigo-300 font-medium block">{getTranslation('weatherWidgetDesc')}</span>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hidden sm:flex">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{getTranslation('localActivityTitle')}</span>
                <span className="text-base font-extrabold text-white block">{getTranslation('localActivityStatus')}</span>
                <span className="text-[9px] text-emerald-400 font-medium block">{getTranslation('localActivityDesc')}</span>
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
                  {categoryTranslations[lang][cat] || cat}
                </button>
              ))}
            </div>

            {/* Local Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={getTranslation('newsSearchPlaceholder')}
                className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-lg text-slate-950 dark:text-slate-100 text-xs transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Articles list */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-md mx-auto">
              <span className="text-4xl block mb-2">📰</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{getTranslation('newsNoArticles')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {getTranslation('newsNoArticlesDesc')}
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
                      {categoryTranslations[lang][article.category] || article.category}
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
                          <span>{article.readTime} {lang === 'fr' ? 'de lecture' : ''}</span>
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
                          <span>{getTranslation('newsReadBtn')}</span>
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
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">{getTranslation('marketPricesTitle')}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{getTranslation('marketPricesDesc')}</p>
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
                <strong>{getTranslation('buyerNoticeTitle')}</strong> {getTranslation('buyerNoticeDesc')}
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
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">{getTranslation('cultureCornerTitle')}</h3>
                <p className="text-[9px] text-slate-400">{getTranslation('cultureCornerDesc')}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-slate-300 leading-relaxed">
                {getTranslation('cultureText1')}
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider mb-0.5">{getTranslation('didYouKnow')}</span>
                <p className="text-[11px] text-slate-300 leading-normal">
                  {getTranslation('cultureText2')}
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
                      <span className="text-[10px] text-slate-400">{getTranslation('newsAuthorRole')}</span>
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
                  <span>{likedArticles[activeArticle.id] ? getTranslation('lovedBtn') : getTranslation('loveBtn')} ({likesCount[activeArticle.id]})</span>
                </button>

                <div className="flex items-center gap-2">
                  {showCopied && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100 animate-pulse">
                      {getTranslation('copiedBtn')}
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
                    title={getTranslation('shareTooltip')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer shadow-sm h-[38px]"
                  >
                    {getTranslation('closeBtn')}
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
