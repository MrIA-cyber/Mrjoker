import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product, Review } from '../types';
import { Star, ShoppingCart, Sparkles, MapPin, Heart, Flag, Zap, ShieldCheck } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import SmartProductImage from './SmartProductImage';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  isMerchantVerified?: boolean;
  onAddToCart: (product: Product) => void;
  onSelect: (product: Product) => void;
  onToggleFavorite?: (e: React.MouseEvent, productId: string) => void;
  onReport?: (product: Product) => void;
  onInstantBuy?: (product: Product) => void;
  isFavorite?: boolean;
  reviews?: Review[];
  lang?: string;
  index?: number;
}

export default function ProductCard({ 
  product, 
  isMerchantVerified = false, 
  onAddToCart, 
  onSelect,
  onToggleFavorite,
  onReport,
  onInstantBuy,
  isFavorite = false,
  reviews = [],
  lang = 'fr',
  index = 0,
}: ProductCardProps) {
  const [favoriteState, setFavoriteState] = useState(isFavorite);
  const isBoostedActive = product.isBoosted && (!product.boostExpiryDate || new Date(product.boostExpiryDate) >= new Date());

  // Compute merchant rating if reviews are provided
  const merchantReviews = reviews.filter(r => r.merchantId === product.merchantId);
  const avgRating = merchantReviews.length > 0
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : product.rating?.toFixed(1) || '4.8';

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteState(!favoriteState);
    if (onToggleFavorite) {
      onToggleFavorite(e, product.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.03, 0.3),
        ease: [0.25, 1, 0.5, 1] 
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`bg-white dark:bg-slate-900 rounded-[20px] border transition-all duration-200 flex flex-col justify-between overflow-hidden group relative shadow-2xs hover:shadow-xl h-full ${
        isBoostedActive
          ? 'border-indigo-200 dark:border-indigo-800/80 shadow-indigo-500/10 hover:shadow-indigo-500/20 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600'
          : 'border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Light Reflection / Shine Effect traversing top strip on hover */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[20px]">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
      </div>

      <div>
        {/* Product Image Frame - 4:3 Aspect Ratio reduces card height by ~25% */}
        <div
          className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 relative overflow-hidden cursor-pointer rounded-t-[20px]"
          onClick={() => onSelect(product)}
        >
          <SmartProductImage
            product={product}
            aspectRatio="4/3"
            containerClassName="rounded-t-[20px]"
          />

          {/* Premium Boost Badge Overlay */}
          {product.isBoosted && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-indigo-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300 animate-pulse" />
              <span>SPONSORISÉ</span>
            </div>
          )}

          {/* Neighborhood Pill if available */}
          {!product.isBoosted && product.neighborhood && (
            <span className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-emerald-400" />
              <span className="truncate max-w-[80px]">{product.neighborhood}</span>
            </span>
          )}

          {/* Top-Right Discrete 36px Action Buttons (Favorite & Report) - Minimalist overlay */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {onReport && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(product);
                }}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-rose-400 transition cursor-pointer shadow-2xs"
                title="Signaler"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleFavClick}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer shadow-2xs"
              title="Favoris"
            >
              <Heart className={`w-3.5 h-3.5 ${favoriteState ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Details Content Box with Compact Spacing */}
        <div className="p-2.5 sm:p-3 space-y-1">
          {/* Merchant & Rating Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold gap-1">
            <div className="flex items-center gap-1 truncate">
              <span className="truncate font-medium text-slate-600 dark:text-slate-300">{product.merchantName || 'Boutique AfriNova'}</span>
              {(isMerchantVerified || product.merchantVerified) && (
                <VerifiedBadge id={`verified-badge-card-${product.id}`} />
              )}
            </div>
            
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0 font-extrabold">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{avgRating}</span>
            </div>
          </div>

          {/* Title clamped to strictly 2 lines */}
          <h4
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition line-clamp-2 leading-snug min-h-[2.2rem]"
            onClick={() => onSelect(product)}
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Price Tag - Clear & Highlighted without dominating */}
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {product.price ? product.price.toLocaleString('fr-FR') : '0'}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500">FCFA</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through ml-1">
                {product.oldPrice.toLocaleString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Compact 36px height with quick action */}
      <div className="p-2.5 sm:p-3 pt-0 flex items-center gap-1.5 mt-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`flex-1 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
            product.stock === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
          }`}
          title="Ajouter au panier"
          id={`btn-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Au Panier</span>
        </motion.button>

        {onInstantBuy && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onInstantBuy(product);
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
            title="Achat direct"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}


