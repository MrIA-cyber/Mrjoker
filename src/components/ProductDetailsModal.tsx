import React from 'react';
import { Product, Review } from '../types';
import { X, Star, ShoppingCart, ShieldCheck, MapPin, Sparkles, Truck } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { translations, Language } from '../translations';

interface ProductDetailsModalProps {
  product: Product;
  isMerchantVerified?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  reviews: Review[];
  lang: Language;
}

export default function ProductDetailsModal({ 
  product, 
  isMerchantVerified = false, 
  onClose, 
  onAddToCart,
  reviews,
  lang,
}: ProductDetailsModalProps) {
  const t = translations[lang];

  // Calculate merchant specific average rating & total count from live reviews
  const merchantReviews = reviews.filter(r => r.merchantId === product.merchantId);
  const avgRating = merchantReviews.length > 0 
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : "5.0";
  const totalReviewsCount = merchantReviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in" id="product-details-modal-overlay">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col relative animate-scale-up transition-colors duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 p-2 rounded-full cursor-pointer transition"
          id="btn-close-details-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Product Image */}
            <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.isBoosted && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                  <Sparkles className="w-3 h-3 text-white fill-white" />
                  <span>PREMIUM SPONSORISÉ</span>
                </div>
              )}
            </div>

            {/* Description Details */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category & Origin */}
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-3">
                  {lang === 'fr' ? product.category : (
                    product.category === 'Alimentation & Épicerie' ? 'Food & Grocery' :
                    product.category === 'Artisanat & Mode' ? 'Crafts & Fashion' :
                    product.category === 'Électronique & Tech' ? 'Electronics & Tech' : product.category
                  )}
                </span>

                {/* Name */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {product.name}
                </h3>

                {/* Rating & reviews */}
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-500 stroke-amber-500'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {product.rating.toFixed(1)} / 5
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">({product.reviewsCount} {lang === 'fr' ? 'avis clients' : 'customer reviews'})</span>
                </div>

                {/* Location & Shop info block with average rating */}
                <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{product.merchantName}</p>
                        {isMerchantVerified && (
                          <VerifiedBadge id="verified-badge-modal" />
                        )}
                      </div>
                      
                      {/* Shop Rating Display right below shop name */}
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-extrabold mt-1" id="shop-rating-display">
                        <span className="text-sm">★</span>
                        <span>{avgRating}</span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1">
                          ({totalReviewsCount} {totalReviewsCount > 1 ? (lang === 'fr' ? 'avis' : 'reviews') : (lang === 'fr' ? 'avis' : 'review')})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Boutique locale à {product.origin}</p>
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{lang === 'fr' ? 'Livraison moto-taxi express dans tout Bafoussam' : 'Express moto-taxi delivery across Bafoussam'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{lang === 'fr' ? 'Paiement à la livraison ou par Mobile Money sécurisé' : 'Pay on delivery or secure Mobile Money'}</span>
                  </div>
                </div>
              </div>

              {/* Price & Purchase controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {product.price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500">FCFA</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition ${
                      product.stock === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }`}
                    id={`btn-modal-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">Description du Produit</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Real Live Boutique Reviews list */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              {t.recentReviews}
            </h4>
            
            {merchantReviews.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-center">
                {t.noReviews}
              </p>
            ) : (
              <div className="space-y-3.5">
                {merchantReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {review.clientName || t.clientAnonymous}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            className={`w-3.5 h-3.5 ${starIdx < review.rating ? 'fill-amber-500 stroke-amber-500' : 'text-slate-200 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      "{review.comment}"
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2 font-semibold">
                      {new Date(review.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
