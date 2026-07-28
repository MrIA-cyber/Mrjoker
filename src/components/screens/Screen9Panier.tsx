import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, MapPin, Truck } from 'lucide-react';

interface Screen9PanierProps {
  onCheckout?: () => void;
  onContinueShopping?: () => void;
}

export default function Screen9Panier({ onCheckout, onContinueShopping }: Screen9PanierProps) {
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Samsung Galaxy A54 5G 256Go',
      price: 215000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
      merchant: 'Bafoussam HighTech'
    },
    {
      id: '2',
      name: 'Chaussures Nike Air Max Bafoussam',
      price: 35000,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
      merchant: 'Boutique Mode Ouest'
    }
  ]);

  const deliveryFee = 1000; // 1,000 FCFA delivery in Bafoussam
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee;

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
            B
          </div>
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">ÉCRAN 9 — PANIER</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span>{items.reduce((acc, item) => acc + item.quantity, 0)} articles</span>
        </div>
      </div>

      {/* Cart Content */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[440px]">
        
        {/* Delivery Address Pill */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Livré à Bafoussam</div>
              <div className="text-[10px] text-slate-500">Quartier Carrefour Bamiléké • ~25 min</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#16A34A]">Modifier</span>
        </div>

        {/* Product Items List */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                <div className="text-[10px] text-slate-400 mb-1">{item.merchant}</div>
                <div className="text-xs font-black text-[#16A34A]">
                  {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)} 
                    className="w-5 h-5 bg-white rounded flex items-center justify-center text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)} 
                    className="w-5 h-5 bg-white rounded flex items-center justify-center text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
            Résumé de la commande
          </h3>

          <div className="flex justify-between text-slate-600">
            <span>Sous-total articles:</span>
            <span className="font-bold text-slate-900">{subtotal.toLocaleString('fr-FR')} FCFA</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Livraison Bafoussam:</span>
            </span>
            <span className="font-bold text-emerald-700">{deliveryFee.toLocaleString('fr-FR')} FCFA</span>
          </div>

          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total général:</span>
            <span className="text-[#16A34A] text-base">{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

      </div>

      {/* Checkout Button */}
      <div className="bg-white border-t border-slate-200 p-3 z-10">
        <button
          onClick={onCheckout}
          className="w-full py-3.5 px-6 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
        >
          <span>Passer la commande ({total.toLocaleString('fr-FR')} FCFA)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
