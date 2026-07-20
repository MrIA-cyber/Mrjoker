import React, { useState, useMemo } from 'react';
import { Product, Merchant, User, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { 
  Award, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Clock, 
  ShoppingBag, 
  Star, 
  TrendingDown, 
  Compass, 
  Coins, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SmartRecommendationBannerProps {
  searchTerm: string;
  products: Product[];
  merchants: Merchant[];
  currentUser: User;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

// Helper to remove accents and convert to lowercase for robust, accent-insensitive search
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Helper to calculate coordinates of any merchant's location
function getMerchantCoordinates(location: string): { x: number; y: number } {
  const normalized = location.toLowerCase();
  const matchedNeigh = BAFOUSSAM_NEIGHBORHOODS.find(
    n => normalized.includes(n.name.toLowerCase()) || n.name.toLowerCase().includes(normalized)
  );
  if (matchedNeigh) return matchedNeigh.coordinates;

  // Custom market or location fallback
  if (normalized.includes('congo')) {
    return { x: 170, y: 160 }; // Custom coordinates representing Marché Congo
  }
  if (normalized.includes('marché b')) {
    return { x: 130, y: 220 }; // Custom coordinates representing Marché B
  }

  return { x: 150, y: 180 }; // Fallback to center Marché A
}

export default function SmartRecommendationBanner({
  searchTerm,
  products,
  merchants,
  currentUser,
  onAddToCart,
  onSelectProduct,
}: SmartRecommendationBannerProps) {
  // Active delivery neighborhood state - defaults to user's registered neighborhood or Marché A
  const [activeNeighborhoodId, setActiveNeighborhoodId] = useState<string>(() => {
    return currentUser.neighborhoodId || BAFOUSSAM_NEIGHBORHOODS[0].id;
  });

  // Find active neighborhood details
  const currentNeighborhood = useMemo(() => {
    return BAFOUSSAM_NEIGHBORHOODS.find(n => n.id === activeNeighborhoodId) || BAFOUSSAM_NEIGHBORHOODS[0];
  }, [activeNeighborhoodId]);

  // Find all matching in-stock products for the search term
  const matchedProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const normSearch = normalizeString(searchTerm);
    return products.filter(p => {
      const matchSearch = normalizeString(p.name).includes(normSearch) ||
        normalizeString(p.description).includes(normSearch) ||
        normalizeString(p.category).includes(normSearch) ||
        normalizeString(p.merchantName).includes(normSearch);
      return matchSearch && p.stock > 0;
    });
  }, [searchTerm, products]);

  // Recommendation engine calculations
  const recommendations = useMemo(() => {
    if (matchedProducts.length === 0) return null;
    const userCoords = currentNeighborhood.coordinates;

    // Helper to calculate distance from current user neighborhood to product's merchant
    const getProductDistance = (p: Product) => {
      const merchantLocation = p.merchantName;
      // Find merchant location
      const merchantObj = merchants.find(m => m.id === p.merchantId);
      const merchantLocString = merchantObj ? merchantObj.location : p.merchantName;
      const mCoords = getMerchantCoordinates(merchantLocString);

      const dx = userCoords.x - mCoords.x;
      const dy = userCoords.y - mCoords.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Scaling factor: 1 unit of map coordinates is roughly 12 meters
      const distanceMeters = pixelDistance * 12;
      return distanceMeters;
    };

    // Prepare enriched products with calculated metrics
    const enriched = matchedProducts.map(p => {
      const distanceMeters = getProductDistance(p);
      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
      const estDeliveryMinutes = Math.round(10 + distanceKm * 4); // 10 mins base + 4 mins per KM
      
      const merchant = merchants.find(m => m.id === p.merchantId);
      
      return {
        product: p,
        merchant,
        distanceKm,
        estDeliveryMinutes,
      };
    });

    // 1. CHEAPEST (Le prix le plus bas)
    const cheapestOption = [...enriched].sort((a, b) => a.product.price - b.product.price)[0];

    // 2. CLOSEST (La distance la plus proche)
    const closestOption = [...enriched].sort((a, b) => a.distanceKm - b.distanceKm)[0];

    // 3. MOST QUALIFIED (La boutique la plus qualifiée du moment - Smart Scoring)
    // We compute a quality score for each out of 100
    const prices = enriched.map(e => e.product.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const distances = enriched.map(e => e.distanceKm);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    const distanceRange = maxDistance - minDistance;

    const scoredOptions = enriched.map(e => {
      // a) Rating score (up to 30 points)
      const ratingScore = e.product.rating * 6; // 5.0 rating = 30 points

      // b) Price score (up to 30 points) - lower price is better
      let priceScore = 30; // default if range is 0
      if (priceRange > 0) {
        priceScore = Math.round(30 * (maxPrice - e.product.price) / priceRange);
      }

      // c) Distance score (up to 25 points) - closer is better
      let distanceScore = 25; // default if range is 0
      if (distanceRange > 0) {
        distanceScore = Math.round(25 * (maxDistance - e.distanceKm) / distanceRange);
      }

      // d) Merchant status / reputation (up to 15 points)
      let reputationScore = 0;
      if (e.merchant) {
        if (e.merchant.isPremium) reputationScore += 7; // Premium status bonus
        reputationScore += Math.min(8, (e.merchant.sales / 150000) * 8); // Sales volume indicator
      }

      const totalScore = Math.min(100, Math.round(ratingScore + priceScore + distanceScore + reputationScore));

      return {
        ...e,
        score: totalScore,
      };
    });

    // Sort by highest score to get the most qualified merchant of the moment
    const mostQualifiedOption = [...scoredOptions].sort((a, b) => b.score - a.score)[0];

    // Calculate dynamic savings for the cheapest option compared to the average price of search matches
    const avgPrice = prices.reduce((acc, curr) => acc + curr, 0) / prices.length;
    const cheapestSavings = Math.round(avgPrice - cheapestOption.product.price);

    return {
      cheapest: cheapestOption,
      closest: closestOption,
      qualified: mostQualifiedOption,
      savings: cheapestSavings,
      count: matchedProducts.length,
    };
  }, [matchedProducts, merchants, currentNeighborhood]);

  // If no search term is entered or no matching products are in stock, we do not show the banner
  if (!searchTerm.trim() || matchedProducts.length === 0 || !recommendations) {
    return null;
  }

  const { cheapest, closest, qualified, savings, count } = recommendations;

  return (
    <div 
      className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden space-y-6"
      id="smart-recommendation-block"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

      {/* Header section with badge */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              Moteur de Comparaison Bafoussam Direct
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Analyse intelligente pour : <span className="text-amber-400">"{searchTerm}"</span>
          </h2>
          <p className="text-xs text-slate-300">
            Nous avons analysé {count} article{count > 1 ? 's' : ''} en stock. Voici les meilleures options de la Mifi basées sur le prix, la distance et la fiabilité.
          </p>
        </div>

        {/* Neighborhood Selector */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Votre position de livraison</span>
              <span className="text-xs font-semibold text-slate-200 mt-1">Actuel : {currentNeighborhood.name}</span>
            </div>
          </div>
          <select
            value={activeNeighborhoodId}
            onChange={(e) => setActiveNeighborhoodId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            id="neighborhood-location-select"
          >
            {BAFOUSSAM_NEIGHBORHOODS.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.deliveryFee} F)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10" id="recommendation-cards-container">
        
        {/* Card 1: 👑 MEILLEUR COMPROMIS (Boutique la plus qualifiée du moment) */}
        <div className="bg-gradient-to-b from-indigo-950 to-indigo-900/60 border-2 border-amber-400 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg shadow-amber-500/5">
          {/* Top highlight badge */}
          <div className="absolute -top-3 left-4 bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Award className="w-3.5 h-3.5 fill-slate-950" />
            Boutique la plus qualifiée du moment
          </div>

          <div className="space-y-4 pt-1.5">
            {/* Merchant Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 text-xl font-bold flex items-center justify-center shadow-xs">
                  {qualified.merchant?.logo || '🏪'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-amber-300 truncate">
                    {qualified.merchant?.shopName || qualified.product.merchantName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{qualified.merchant?.location}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg px-2 py-1 text-right shrink-0 border border-indigo-500/20">
                <span className="text-[8px] text-slate-400 block font-bold uppercase leading-none">Score Qualité</span>
                <span className="text-xs font-black text-amber-400 leading-none mt-1 inline-block">{qualified.score}/100</span>
              </div>
            </div>

            {/* Product description & stats */}
            <div className="bg-slate-900/40 border border-indigo-500/10 rounded-xl p-3 space-y-2.5">
              <p 
                onClick={() => onSelectProduct(qualified.product)}
                className="font-bold text-xs hover:text-amber-300 transition cursor-pointer line-clamp-2"
              >
                {qualified.product.name}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{qualified.product.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-medium text-[10px]">({qualified.product.reviewsCount} avis)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Prix Direct</span>
                  <span className="font-mono text-xs font-black text-white leading-none">
                    {qualified.product.price.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            </div>

            {/* Distance and delivery stats */}
            <div className="flex justify-between items-center text-[11px] text-slate-200 px-1">
              <div className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-300" />
                <span>Distance : <strong className="text-white">{qualified.distanceKm} km</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                <span>Livraison : <strong className="text-white">{qualified.estDeliveryMinutes} min</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-500/10 flex gap-2">
            <button
              onClick={() => onSelectProduct(qualified.product)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer text-center"
            >
              Fiche Produit
            </button>
            <button
              onClick={() => onAddToCart(qualified.product)}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Prendre
            </button>
          </div>
        </div>

        {/* Card 2: 💰 LE MOINS CHER (Prix le plus bas) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative hover:border-emerald-500/40 transition duration-300">
          <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            Tarif le plus bas trouvé
          </div>

          <div className="space-y-4 pt-1.5">
            {/* Merchant Details */}
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-slate-200 truncate">
                  {cheapest.merchant?.shopName || cheapest.product.merchantName}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{cheapest.merchant?.location}</span>
                </div>
              </div>
              {savings > 0 && (
                <div className="bg-emerald-950/60 rounded-lg px-2 py-1 text-right shrink-0 border border-emerald-500/20">
                  <span className="text-[8px] text-emerald-400 block font-bold uppercase leading-none">Économie</span>
                  <span className="text-xs font-bold text-emerald-400 leading-none mt-1 inline-block">-{savings.toLocaleString('fr-FR')} F</span>
                </div>
              )}
            </div>

            {/* Product description & stats */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <p 
                onClick={() => onSelectProduct(cheapest.product)}
                className="font-bold text-xs hover:text-emerald-400 transition cursor-pointer line-clamp-2"
              >
                {cheapest.product.name}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                  <span>{cheapest.product.rating.toFixed(1)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block">Meilleur Prix Cash</span>
                  <span className="font-mono text-sm font-black text-emerald-400 leading-none">
                    {cheapest.product.price.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Distance and delivery stats */}
            <div className="flex justify-between items-center text-[11px] text-slate-300 px-1">
              <div className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                <span>Distance : <strong>{cheapest.distanceKm} km</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Livraison : <strong>{cheapest.estDeliveryMinutes} min</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
            <button
              onClick={() => onSelectProduct(cheapest.product)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer text-center"
            >
              Fiche
            </button>
            <button
              onClick={() => onAddToCart(cheapest.product)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Prendre
            </button>
          </div>
        </div>

        {/* Card 3: 📍 LE PLUS PROCHE DE VOUS (Distance minimale) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative hover:border-indigo-500/40 transition duration-300">
          <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            La boutique la plus proche
          </div>

          <div className="space-y-4 pt-1.5">
            {/* Merchant Details */}
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-slate-200 truncate">
                  {closest.merchant?.shopName || closest.product.merchantName}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate font-semibold text-indigo-300">{closest.merchant?.location}</span>
                </div>
              </div>
              <div className="bg-indigo-950/60 rounded-lg px-2 py-1 text-center shrink-0 border border-indigo-500/20">
                <span className="text-[8px] text-slate-400 block font-bold uppercase leading-none">Chrono</span>
                <span className="text-xs font-bold text-indigo-300 leading-none mt-1 inline-block">⏱️ {closest.estDeliveryMinutes} min</span>
              </div>
            </div>

            {/* Product description & stats */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <p 
                onClick={() => onSelectProduct(closest.product)}
                className="font-bold text-xs hover:text-indigo-400 transition cursor-pointer line-clamp-2"
              >
                {closest.product.name}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                  <span>{closest.product.rating.toFixed(1)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block">Prix Direct</span>
                  <span className="font-mono text-xs font-black text-white leading-none">
                    {closest.product.price.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            </div>

            {/* Distance and delivery stats */}
            <div className="flex justify-between items-center text-[11px] text-slate-300 px-1">
              <div className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                <span>Distance : <strong className="text-indigo-300">{closest.distanceKm} km (Ultra-proche)</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
            <button
              onClick={() => onSelectProduct(closest.product)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer text-center"
            >
              Fiche
            </button>
            <button
              onClick={() => onAddToCart(closest.product)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Prendre
            </button>
          </div>
        </div>

      </div>

      {/* Footer advice line */}
      <div className="border-t border-indigo-500/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 text-[10px] font-medium relative z-10">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Le saviez-vous ? Le calcul du <strong>Meilleur compromis</strong> pondère le tarif d'achat, le délai de livraison à moto, l'accréditation du vendeur et sa réputation auprès des résidents de l'Ouest.
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Garantie Bafoussam Direct</span>
        </div>
      </div>
    </div>
  );
}
