import React, { useState } from 'react';
import { Star, ShieldCheck, Truck, Store, ShoppingCart, Heart, Share2, Sparkles, ArrowLeft, Check, ChevronRight } from 'lucide-react';

interface Screen8DetailProduitProps {
  onBack?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export default function Screen8DetailProduit({ onBack, onAddToCart, onBuyNow }: Screen8DetailProduitProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">ÉCRAN 8 — DÉTAIL PRODUIT</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </button>
          <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Product Content Scroll */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[480px]">
        
        {/* Main HD Image & Gallery */}
        <div className="space-y-2">
          <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img src={images[selectedImage]} alt="Samsung Galaxy A54 5G" className="w-full h-full object-cover" />
            
            <div className="absolute top-3 left-3 bg-[#16A34A] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              -10% PROMO OUEST
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Stock: 12 disponibles
            </div>
          </div>

          {/* Thumbnails Gallery */}
          <div className="flex gap-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === idx ? 'border-[#16A34A] ring-2 ring-[#16A34A]/20 scale-105' : 'border-slate-200 opacity-60'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Title & Rating */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#16A34A]">High-Tech & Smartphones</span>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>4.9 / 5 (42 avis)</span>
            </div>
          </div>

          <h1 className="text-base font-black text-slate-900 leading-snug">
            Samsung Galaxy A54 5G 256Go RAM 8Go — Noir Sublime
          </h1>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl font-black text-[#16A34A]">215 000 FCFA</span>
            <span className="text-xs text-slate-400 line-through">240 000 FCFA</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Économisez 25 000 FCFA</span>
          </div>
        </div>

        {/* Verified Merchant Badge */}
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-sm shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                <span>Bafoussam HighTech</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[10px] text-slate-600">Commerçant Vérifié • Marché A, Bafoussam</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#16A34A]">Pro</span>
        </div>

        {/* Specifications & Delivery Options */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Caractéristiques & Livraison</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
            <div className="p-2 bg-slate-50 rounded-xl"><strong>Écran:</strong> Super AMOLED 120Hz</div>
            <div className="p-2 bg-slate-50 rounded-xl"><strong>Stockage:</strong> 256Go + MicroSD</div>
            <div className="p-2 bg-slate-50 rounded-xl"><strong>Batterie:</strong> 5000 mAh (2 jours)</div>
            <div className="p-2 bg-slate-50 rounded-xl"><strong>Garantie:</strong> 12 Mois Officiel</div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pt-1">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Livraison à Bafoussam: 1 000 FCFA (20-30 min)</span>
          </div>
        </div>

      </div>

      {/* Action Buttons Footer */}
      <div className="bg-white border-t border-slate-200 p-3 grid grid-cols-2 gap-2 z-10">
        <button
          onClick={onAddToCart}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Ajouter au panier</span>
        </button>

        <button
          onClick={onBuyNow}
          className="py-3 px-4 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <span>Acheter maintenant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
