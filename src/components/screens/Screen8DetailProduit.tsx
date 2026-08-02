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
    <div className="w-full max-w-5xl mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-3.5 sm:p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">DÉTAIL PRODUIT — BAFOUSSAM</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Content Scroll */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[580px]">
        
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

        {/* Customer Reviews & Interactive Rating Submission */}
        <ProductReviewsSection />

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

function ProductReviewsSection() {
  const [reviews, setReviews] = useState([
    {
      id: 'r1',
      author: 'Erick N. (Bafoussam)',
      rating: 5,
      date: 'Hier, 14:30',
      comment: 'Téléphone reçu très rapidement en 25 minutes devant le Marché A. Qualité au top, totalement authentique !',
      verified: true
    },
    {
      id: 'r2',
      author: 'Chantal M. (Tamdja)',
      rating: 5,
      date: 'Il y a 3 jours',
      comment: 'Vendeur très sérieux, écran magnifique et la batterie tient très bien toute la journée.',
      verified: true
    }
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const reviewObj = {
      id: 'r_' + Date.now(),
      author: authorName.trim() ? `${authorName.trim()} (Bafoussam)` : 'Client Anonyme (Bafoussam)',
      rating: newRating,
      date: 'À l\'instant',
      comment: newComment.trim(),
      verified: true
    };

    setReviews([reviewObj, ...reviews]);
    setNewComment('');
    setAuthorName('');
    setShowForm(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 col-span-1 md:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Avis Clients ({reviews.length})
          </h3>
          <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>4.9/5</span>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
        >
          {showForm ? 'Fermer le formulaire' : '+ Donner mon avis'}
        </button>
      </div>

      {submitSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Merci ! Votre avis a été publié avec succès.</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Votre note :</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Votre nom ou ville (ex: Paul M. - Dschang)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
          />

          <textarea
            required
            rows={2}
            placeholder="Partagez votre expérience sur ce produit..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            className="w-full py-2 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold rounded-lg transition"
          >
            Publier mon avis
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-2.5 pt-1">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{rev.author}</span>
                {rev.verified && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    Achat Vérifié
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">{rev.date}</span>
            </div>

            <div className="flex text-amber-400">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>

            <p className="text-slate-700 leading-relaxed text-[11px]">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
