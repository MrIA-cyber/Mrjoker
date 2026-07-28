import React from 'react';
import { motion } from 'motion/react';
import { Product, Review } from '../types';
import { Star, ShoppingCart, Sparkles, MapPin } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  isMerchantVerified?: boolean;
  onAddToCart: (product: Product) => void;
  onSelect: (product: Product) => void;
  reviews?: Review[];
  lang?: string;
  index?: number;
}

export default function ProductCard({ 
  product, 
  isMerchantVerified = false, 
  onAddToCart, 
  onSelect,
  reviews = [],
  lang = 'fr',
  index = 0,
}: ProductCardProps) {
  const isBoostedActive = product.isBoosted && (!product.boostExpiryDate || new Date(product.boostExpiryDate) >= new Date());

  // Compute merchant rating if reviews are provided
  const merchantReviews = reviews.filter(r => r.merchantId === product.merchantId);
  const avgRating = merchantReviews.length > 0
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.35, 
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.25, 1, 0.5, 1] 
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden group relative shadow-md hover:shadow-2xl ${
        isBoostedActive
          ? 'border-indigo-200 dark:border-indigo-800/80 shadow-indigo-500/10 hover:shadow-indigo-500/20 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600'
          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-indigo-500/5'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Light Reflection / Shine Effect traversing top strip on hover */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Premium Boost Badge & Sparkles Overlay */}
      {product.isBoosted && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md shadow-indigo-600/30">
          <Sparkles className="w-3 h-3 text-white fill-white animate-pulse" />
          <span>PREMIUM • Ouest</span>
        </div>
      )}

      {/* Discrete Sponsored Badge */}
      {isBoostedActive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
          <span>{lang === 'en' ? 'Sponsored' : 'Sponsorisé'}</span>
        </div>
      )}

      {/* Product Image Frame */}
      <div
        className="aspect-square bg-slate-50 dark:bg-slate-950 relative overflow-hidden cursor-pointer"
        onClick={() => onSelect(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Merchant & Market with Shop Rating */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="truncate max-w-[100px] text-slate-600 dark:text-slate-400">{product.merchantName}</span>
            {isMerchantVerified && (
              <VerifiedBadge id={`verified-badge-card-${product.id}`} />
            )}
            
            {/* Live boutique shop rating & total reviews */}
            {avgRating && (
              <span className="text-amber-500 flex items-center gap-0.5 ml-1 font-extrabold" title={`${merchantReviews.length} avis sur la boutique`}>
                ★ {avgRating}
              </span>
            )}

            <span className="text-slate-300 dark:text-slate-700 font-normal">({product.origin.includes('Local') ? 'Local' : 'Import'})</span>
          </div>

          {/* Product Name */}
          <h4
            className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2 leading-snug mb-2"
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h4>

          {/* Rating Stars & Stock */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-0.5">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{product.reviewsCount} avis</span>
            <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
            <span className={`text-[11px] font-medium flex items-center gap-1 ${product.stock > 5 ? 'text-slate-400 dark:text-slate-500' : 'text-red-500 font-semibold'}`}>
              {product.stock > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {product.stock} dispo
                </>
              ) : (
                'Rupture'
              )}
            </span>
          </div>
        </div>

        <div>
          {/* Price & Action Button */}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold leading-none">Prix Cash</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {product.price.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center ${
                product.stock === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-indigo-600 hover:to-blue-600 text-white shadow-md shadow-indigo-600/20'
              }`}
              title="Ajouter au panier"
              id={`btn-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

