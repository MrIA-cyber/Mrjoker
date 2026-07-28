import React, { useState } from 'react';
import { Search, Filter, Star, ShoppingCart, Sparkles, ShieldCheck, Tag, ChevronDown, Check } from 'lucide-react';

interface Screen7MarketplaceProps {
  onSelectProduct?: (productId: string) => void;
}

export default function Screen7Marketplace({ onSelectProduct }: Screen7MarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState('Tous');

  const products = [
    {
      id: '1',
      name: 'Samsung Galaxy A54 5G 256Go',
      category: 'High-Tech',
      price: 215000,
      oldPrice: 240000,
      discount: '-10%',
      rating: 4.9,
      reviews: 42,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
      merchant: 'Bafoussam HighTech (Marché A)',
      isVerified: true
    },
    {
      id: '2',
      name: 'Chaussures Nike Air Max Bafoussam',
      category: 'Mode',
      price: 35000,
      oldPrice: 45000,
      discount: '-22%',
      rating: 4.8,
      reviews: 28,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      merchant: 'Boutique Mode Ouest (Marché B)',
      isVerified: true
    },
    {
      id: '3',
      name: 'Sac à Main Luxe Cuir Véritable',
      category: 'Mode',
      price: 28000,
      oldPrice: 35000,
      discount: '-20%',
      rating: 4.7,
      reviews: 19,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
      merchant: 'Maroquinerie du Centre',
      isVerified: true
    },
    {
      id: '4',
      name: 'Montre Homme Élégante Chronographe',
      category: 'Bijoux & Montres',
      price: 42000,
      oldPrice: 50000,
      discount: '-16%',
      rating: 5.0,
      reviews: 31,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      merchant: 'Horlogerie Bafoussam',
      isVerified: true
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 p-4 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
              B
            </div>
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">ÉCRAN 7 — MARKETPLACE</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Marché A & B Bafoussam
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Samsung, Nike, Sac à main, Montre..."
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white flex items-center gap-1 text-xs font-bold transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['Tous', 'High-Tech', 'Mode', 'Maison', 'Santé', 'Beauté', 'Alimentation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#16A34A] text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[440px]">
        {products.map((product) => (
          <div 
            key={product.id}
            onClick={() => onSelectProduct && onSelectProduct(product.id)}
            className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md transition flex gap-3 cursor-pointer group"
          >
            {/* Image Box */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <span className="absolute top-1 left-1 bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                {product.discount}
              </span>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[9px] font-extrabold uppercase text-[#16A34A]">{product.category}</span>
                  <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400">({product.reviews})</span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900 truncate leading-snug">{product.name}</h3>
                
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{product.merchant}</span>
                </div>
              </div>

              {/* Price & Stock & Buy Button */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-black text-[#16A34A]">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="text-[10px] text-slate-400 line-through">
                    {product.oldPrice.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectProduct) onSelectProduct(product.id);
                  }}
                  className="px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Acheter</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
