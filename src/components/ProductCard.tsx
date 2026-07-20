import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Sparkles, MapPin } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onSelect }: ProductCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition duration-300 flex flex-col overflow-hidden group relative ${
        product.isBoosted
          ? 'border-indigo-200 dark:border-indigo-900 shadow-md shadow-indigo-500/5 hover:shadow-indigo-500/10 bg-indigo-50/5 dark:bg-indigo-950/10'
          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Premium Boost Badge & Sparkles Overlay */}
      {product.isBoosted && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
          <Sparkles className="w-3 h-3 text-white fill-white" />
          <span>PREMIUM • Ouest</span>
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
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-950/5 opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Merchant & Market */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            <MapPin className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
            <span className="truncate max-w-[180px]">{product.merchantName} ({product.origin.includes('Local') ? 'Local' : 'Import'})</span>
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
            <span className={`text-[11px] font-medium ${product.stock > 5 ? 'text-slate-400 dark:text-slate-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} dispo` : 'Rupture'}
            </span>
          </div>
        </div>

        <div>
          {/* Price & Action Button */}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold leading-none">Prix Cash</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {product.price.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
              </span>
            </div>

            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center ${
                product.stock === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
              title="Ajouter au panier"
              id={`btn-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
