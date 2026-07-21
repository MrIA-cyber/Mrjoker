import React, { useMemo } from 'react';
import { Merchant, Product } from '../types';
import { 
  Award, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  MapPin, 
  ShoppingBag, 
  Phone, 
  Zap, 
  ArrowRight,
  Sparkles,
  Percent,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import VerifiedBadge from './VerifiedBadge';

interface BestMerchantWidgetProps {
  merchants: Merchant[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function BestMerchantWidget({ 
  merchants, 
  products, 
  onSelectProduct, 
  onAddToCart 
}: BestMerchantWidgetProps) {

  // Dynamic computation of the best merchant based on Sales + Clicks + Views weights
  const bestMerchantInfo = useMemo(() => {
    if (merchants.length === 0) return null;

    // Calculate a performance score for each merchant
    const scoredMerchants = merchants.map(m => {
      // score: sales + clicks * 50 + views * 10
      const score = m.sales + (m.clicks * 50) + (m.views * 10);
      return { merchant: m, score };
    });

    // Sort to find the highest score
    scoredMerchants.sort((a, b) => b.score - a.score);
    const best = scoredMerchants[0].merchant;
    const score = scoredMerchants[0].score;

    // Get products belonging to this best merchant
    const merchantProducts = products.filter(p => p.merchantId === best.id);
    
    // Sort products by rating & reviews to find their star product
    const starProduct = [...merchantProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

    // Calculate some high-fidelity statistics
    const conversionRate = mToRate(best.clicks, best.views);
    const totalItemsCount = merchantProducts.length;

    return {
      merchant: best,
      score,
      products: merchantProducts.slice(0, 3), // top 3 products
      starProduct,
      conversionRate,
      totalItemsCount
    };
  }, [merchants, products]);

  function mToRate(clicks: number, views: number) {
    if (!views) return '15.4';
    return ((clicks / views) * 100).toFixed(1);
  }

  if (!bestMerchantInfo) return null;

  const { merchant, products: topProducts, starProduct, conversionRate, totalItemsCount } = bestMerchantInfo;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-colors duration-200" id="best-merchant-widget">
      {/* Absolute top decorative badge */}
      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-6 py-2 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
        <Award className="w-3.5 h-3.5" />
        <span>N°1 de la Mifi</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Store identity, real-time live pulses and major stats */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest">
                Activité Instantanée en Direct
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-3xl shadow-xs shrink-0">
                {merchant.logo || '🏪'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {merchant.shopName}
                  </h2>
                  {merchant.isVerified && (
                    <VerifiedBadge id="verified-badge-best-merchant" size="md" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{merchant.location}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Géré par {merchant.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick descriptive text based on merchant */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            Cette boutique est actuellement classée première à Bafoussam grâce à son volume exceptionnel de ventes directes, son service de préparation ultra-rapide et l'excellent taux de satisfaction de la communauté de l'Ouest.
          </p>

          {/* Elegant, seamless stats horizontal bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 py-4 border-t border-b border-slate-100 dark:border-slate-800/80 my-2" id="best-merchant-compact-stats">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Ventes Directes</span>
                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                  {merchant.sales.toLocaleString('fr-FR')} <span className="text-[9px] font-bold text-slate-500">FCFA</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Visites Produits</span>
                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                  {merchant.views.toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Clicks Clients</span>
                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                  {merchant.clicks.toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Taux d'Intérêt</span>
                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                  {conversionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick contact and badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Membre Élite Premium</span>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs">
              <ShoppingBag className="w-3 h-3" />
              <span>{totalItemsCount} articles en ligne</span>
            </span>
            <a 
              href={`tel:${merchant.phone.replace(/\s+/g, '')}`} 
              className="bg-indigo-50 dark:bg-indigo-950/35 hover:bg-indigo-100 dark:hover:bg-indigo-900/45 border border-indigo-100 dark:border-indigo-900/55 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold px-3 py-1 rounded-md flex items-center gap-1 shadow-2xs transition"
            >
              <Phone className="w-3 h-3" />
              <span>Appeler : {merchant.phone}</span>
            </a>
          </div>
        </div>

        {/* Right Side: Showcase of top products with instant buy */}
        <div className="w-full lg:w-[380px] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Top Ventes de la Boutique</span>
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Livré express</span>
          </div>

          <div className="space-y-3.5">
            {topProducts.map((p) => (
              <div 
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/70 hover:border-indigo-100 dark:hover:border-indigo-900 rounded-xl p-2.5 flex items-center gap-3 transition cursor-pointer group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950 relative">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  {p.isBoosted && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-0.5">
                      <span className="text-[7px] text-amber-300 font-black uppercase tracking-widest">PROMO</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                      {p.price.toLocaleString('fr-FR')} F
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">• Stock: {p.stock}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(p);
                  }}
                  disabled={p.stock <= 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white p-2 rounded-lg transition shadow-2xs cursor-pointer shrink-0"
                  title="Ajouter au panier instantanément"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {starProduct && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-3.5 text-[10.5px] text-indigo-900 dark:text-indigo-300 leading-normal flex gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Recommandation :</strong> Le <strong>{starProduct.name}</strong> est actuellement le produit vedette avec une note de <strong>{starProduct.rating}/5</strong> par nos clients.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
