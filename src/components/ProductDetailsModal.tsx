import React from 'react';
import { Product } from '../types';
import { X, Star, ShoppingCart, ShieldCheck, MapPin, Sparkles, Truck } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

interface ProductDetailsModalProps {
  product: Product;
  isMerchantVerified?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailsModal({ product, isMerchantVerified = false, onClose, onAddToCart }: ProductDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in" id="product-details-modal-overlay">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-full cursor-pointer transition"
          id="btn-close-details-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Product Image */}
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100">
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
                <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-3">
                  {product.category}
                </span>

                {/* Name */}
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
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
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {product.rating.toFixed(1)} / 5
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">({product.reviewsCount} avis clients)</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-slate-800">{product.merchantName}</p>
                      {isMerchantVerified && (
                        <VerifiedBadge id="verified-badge-modal" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Boutique locale à {product.origin}</p>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Livraison moto-taxi express dans tout Bafoussam</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Paiement à la livraison ou par Mobile Money sécurisé</span>
                  </div>
                </div>
              </div>

              {/* Price & Purchase controls */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-2xl font-extrabold text-slate-900">
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
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }`}
                    id={`btn-modal-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-2">Description du Produit</h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Localized reviews section */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3">Avis de résidents de Bafoussam</h4>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Alain Fogué (Quartier Tamdja)</span>
                  <span className="text-amber-500 font-semibold">★ 5.0</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  "Produit livré par moto-taxi en moins de 15 minutes à Tamdja. La qualité est irréprochable, très bon service sécurisé et rapide."
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Sandrine Ngo (Bamendzi)</span>
                  <span className="text-amber-500 font-semibold">★ 4.8</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  "Très contente de mon achat ! Inscription à 4000 F rentabilisée dès la première commande. C'est génial pour acheter directement auprès des commerçants du Marché A sans se déplacer."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
