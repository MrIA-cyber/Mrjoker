import React, { useState, useRef, useEffect } from 'react';
import { Product, Review, Merchant } from '../types';
import { 
  X, Star, ShoppingCart, ShieldCheck, MapPin, Sparkles, Truck, 
  Heart, Share2, Phone, MessageSquare, Check, ChevronRight, ChevronLeft, 
  Play, Maximize2, Building2, Calendar, ThumbsUp, Camera, 
  ArrowRight, RotateCcw, Award, Info, Box, BadgeCheck, CheckCircle2, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VerifiedBadge from './VerifiedBadge';
import SmartProductImage from './SmartProductImage';
import { getProductVerifiedImage } from '../utils/productImageValidator';
import { translations, Language } from '../translations';

interface ProductDetailsModalProps {
  product: Product;
  isMerchantVerified?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  reviews: Review[];
  lang: Language;
  allProducts?: Product[];
  merchants?: Merchant[];
  onSelectProduct?: (product: Product) => void;
  onAddReview?: (orderId: string, rating: number, comment: string, clientName: string) => void;
  onStartChat?: (merchantId: string, merchantName: string, productId?: string, productName?: string) => void;
}

// Multi-media gallery generator derived strictly from the selected product's actual media
function getProductGallery(product: Product) {
  const media: { id: string; type: 'image' | 'video'; url: string; poster?: string; title: string }[] = [];

  const mainVerifiedImg = getProductVerifiedImage(product) || product.image;

  // 1. Primary main image
  if (mainVerifiedImg) {
    media.push({
      id: `img-main-${product.id}`,
      type: 'image',
      url: mainVerifiedImg,
      title: 'Image principale',
    });
  }

  // 2. Secondary images (strictly from product.images if present)
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((imgUrl, index) => {
      if (imgUrl && imgUrl !== product.image) {
        media.push({
          id: `img-sec-${product.id}-${index}`,
          type: 'image',
          url: imgUrl,
          title: `Photo ${index + 2}`,
        });
      }
    });
  }

  // 3. Videos (strictly from product.videos or product.videoUrl if present)
  const videoSources = product.videos && product.videos.length > 0 
    ? product.videos 
    : (product.videoUrl ? [product.videoUrl] : []);

  videoSources.forEach((vidUrl, index) => {
    if (vidUrl) {
      media.push({
        id: `vid-${product.id}-${index}`,
        type: 'video',
        url: vidUrl,
        poster: product.image,
        title: `Vidéo de présentation ${index + 1}`,
      });
    }
  });

  return media;
}

// Generate specs strictly for the selected product
function getProductSpecs(product: Product, lang: Language) {
  const isFr = lang === 'fr';

  // If product has custom specifications defined by vendor
  if (product.specifications && product.specifications.length > 0) {
    return product.specifications;
  }

  const defaultSpecs = [
    { label: isFr ? 'Catégorie' : 'Category', value: product.category },
    { label: isFr ? 'Provenance' : 'Origin', value: product.origin },
  ];

  if (product.brand) {
    defaultSpecs.push({ label: isFr ? 'Marque' : 'Brand', value: product.brand });
  }
  if (product.condition) {
    defaultSpecs.push({ label: isFr ? 'État du produit' : 'Condition', value: product.condition });
  }
  if (product.subCategory) {
    defaultSpecs.push({ label: isFr ? 'Sous-catégorie' : 'Sub-category', value: product.subCategory });
  }
  if (product.weight) {
    defaultSpecs.push({ label: isFr ? 'Poids' : 'Weight', value: product.weight });
  }
  if (product.dimensions) {
    defaultSpecs.push({ label: isFr ? 'Dimensions' : 'Dimensions', value: product.dimensions });
  }
  if (product.materials) {
    defaultSpecs.push({ label: isFr ? 'Matériaux' : 'Materials', value: product.materials });
  }
  if (product.warranty) {
    defaultSpecs.push({ label: isFr ? 'Garantie' : 'Warranty', value: product.warranty });
  }

  return defaultSpecs;
}

// Sample buyer photos for reviews
const SAMPLE_BUYER_PHOTOS = [
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
];

export default function ProductDetailsModal({
  product,
  isMerchantVerified = false,
  onClose,
  onAddToCart,
  onBuyNow,
  reviews,
  lang,
  allProducts = [],
  merchants = [],
  onSelectProduct,
  onAddReview,
  onStartChat,
}: ProductDetailsModalProps) {
  const t = translations[lang];
  const isFr = lang === 'fr';

  // Gallery State
  const gallery = getProductGallery(product);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Quantity & Option States
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Default');

  // Active Tab State (Description / Specs / Merchant / Reviews / Shipping)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'merchant' | 'reviews' | 'shipping'>('desc');

  // Wishlist State with local persistence
  const [isWishlisted, setIsWishlisted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_wishlist');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        return list.includes(product.id);
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  // Seller Contact Drawer/Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

  // Review Filter & Form State
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all'>('all');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState('');

  // Reset gallery and tab states when selected product changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setQuantity(1);
    setActiveTab('desc');
  }, [product.id]);

  // Merchant details & Product-specific reviews
  const merchant = merchants.find(m => m.id === product.merchantId);
  const productReviews = reviews.filter(r => r.productId === product.id || (!r.productId && r.merchantId === product.merchantId));
  const merchantReviews = reviews.filter(r => r.merchantId === product.merchantId);
  const avgMerchantRating = merchantReviews.length > 0 
    ? (merchantReviews.reduce((sum, r) => sum + r.rating, 0) / merchantReviews.length).toFixed(1)
    : "4.9";

  // Similar & Merchant Products
  const similarProducts = allProducts.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const sameMerchantProducts = allProducts.filter(
    p => p.merchantId === product.merchantId && p.id !== product.id
  ).slice(0, 4);

  // Specs
  const specs = getProductSpecs(product, lang);

  // Calculated old price & savings
  const oldPrice = product.oldPrice;
  const discountPercent = product.discountPercent || (oldPrice && oldPrice > product.price ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : undefined);

  // Toggle Wishlist
  const handleToggleWishlist = () => {
    try {
      const saved = localStorage.getItem('bafoussam_wishlist');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (isWishlisted) {
        list = list.filter(id => id !== product.id);
      } else {
        list.push(product.id);
      }
      localStorage.setItem('bafoussam_wishlist', JSON.stringify(list));
      setIsWishlisted(!isWishlisted);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Share link
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvrez "${product.name}" à ${product.price.toLocaleString('fr-FR')} FCFA sur Bafoussam Market !`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareSuccessToast(true);
      setTimeout(() => setShareSuccessToast(false), 3000);
    }
  };

  // Handle Adding Review
  const handleSubmitNewReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    if (onAddReview) {
      onAddReview(
        `order-${Date.now()}`,
        newReviewRating,
        newReviewComment,
        newReviewName.trim() || (isFr ? 'Client Bafoussam' : 'Bafoussam Client')
      );
    }

    setNewReviewComment('');
    setNewReviewName('');
    setIsWritingReview(false);
  };

  // Image Zoom Lens calculation
  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Current active media
  const activeMedia = gallery[activeMediaIndex] || gallery[0];

  // Filtered reviews
  const filteredReviews = merchantReviews.filter(r => {
    if (reviewRatingFilter === 'all') return true;
    return r.rating === reviewRatingFilter;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-950/75 backdrop-blur-md font-sans overflow-hidden animate-fade-in" 
      id="product-details-modal-overlay"
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full md:h-[92vh] md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col relative overflow-hidden transition-colors duration-200"
      >
        {/* Top Floating Action Bar Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 z-20 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md shrink-0">
              {product.category}
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist Heart button */}
            <button
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-full transition cursor-pointer flex items-center justify-center ${
                isWishlisted 
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isWishlisted ? (isFr ? 'Retirer des favoris' : 'Remove from wishlist') : (isFr ? 'Ajouter aux favoris' : 'Add to wishlist')}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : ''}`} />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full cursor-pointer transition flex items-center justify-center"
              title={isFr ? 'Partager le produit' : 'Share product'}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close modal button */}
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full cursor-pointer transition flex items-center justify-center"
              id="btn-close-details-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Copy Success Toast */}
        {shareSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isFr ? 'Lien du produit copié dans le presse-papier !' : 'Product link copied to clipboard!'}</span>
          </motion.div>
        )}

        {/* Main Body Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 pb-28 md:pb-8">
          
          {/* TOP SECTION: 2-COLUMN GRID (Gallery Left / Product Summary Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: MULTIMEDIA GALLERY (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Media Viewer Frame */}
              <div 
                className="aspect-square md:aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 group shadow-md"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMoveZoom}
              >
                {/* Image or Video */}
                {activeMedia.type === 'image' ? (
                  <div className="w-full h-full relative overflow-hidden cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                    <img
                      src={activeMedia.url}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={
                        isZooming ? {
                          transform: 'scale(1.8)',
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                        } : {}
                      }
                    />
                    
                    {/* Zoom Lens Hint Icon */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 text-xs font-bold pointer-events-none">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Cliquer pour agrandir' : 'Click to enlarge'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
                    <video
                      src={activeMedia.url}
                      controls
                      autoPlay
                      muted
                      loop
                      poster={activeMedia.poster}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Play className="w-3 h-3 fill-white" />
                      <span>VIDÉO DÉMO 4K</span>
                    </div>
                  </div>
                )}

                {/* Floating Promotional Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                  {/* Discount Badge */}
                  {discountPercent && discountPercent > 0 && (
                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>-{discountPercent}% OFF</span>
                    </span>
                  )}

                  {/* Boosted Sponsor Badge */}
                  {product.isBoosted && (
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-white" />
                      <span>SPONSORISÉ</span>
                    </span>
                  )}

                  {/* Origin Badge */}
                  <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    📍 {product.origin}
                  </span>
                </div>

                {/* Gallery Next / Prev Navigation Buttons */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg backdrop-blur-md transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg backdrop-blur-md transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Media Counter Pill */}
                <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  {activeMediaIndex + 1} / {gallery.length}
                </div>
              </div>

              {/* Thumbnails Carousel Bar */}
              <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1">
                {gallery.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      activeMediaIndex === idx 
                        ? 'border-indigo-600 dark:border-indigo-400 scale-105 shadow-md' 
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={item.type === 'image' ? item.url : item.poster} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Trust Features Bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Livraison 30-45 min' : '30-45 min Delivery'}
                  </span>
                  <span className="text-[9px] text-slate-400">Moto-Taxi Bafoussam</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Paiement Sécurisé' : 'Secure Payment'}
                  </span>
                  <span className="text-[9px] text-slate-400">MoMo / Cash Livraison</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Garantie Retours' : 'Easy Returns'}
                  </span>
                  <span className="text-[9px] text-slate-400">Conforme ou Remplacé</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PRODUCT INFORMATION & ACTIONS (5 Cols on desktop) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Brand & Stock Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{product.merchantName}</span>
                  </span>

                  {/* Stock Availability Pill */}
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    product.stock > 0 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                    <span>
                      {product.stock > 0 
                        ? (isFr ? `En Stock (${product.stock} dispo)` : `In Stock (${product.stock} avail)`) 
                        : (isFr ? 'Rupture de Stock' : 'Out of Stock')}
                    </span>
                  </span>
                </div>

                {/* Main Product Title */}
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Sales count row */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">/ 5</span>
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({product.reviewsCount} {isFr ? 'avis clients' : 'reviews'})
                  </span>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>1 240+ {isFr ? 'commandes validées' : 'orders fulfilled'}</span>
                  </span>
                </div>
              </div>

              {/* Price Banner Box (Lightning Deal Style) */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      {isFr ? 'Prix Promo Bafoussam' : 'Promo Price'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-mono">
                        {(product.price * quantity).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">FCFA</span>
                    </div>
                  </div>

                  {/* Strikethrough comparison price */}
                  {oldPrice && oldPrice > product.price ? (
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-400 line-through font-mono block">
                        {(oldPrice * quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-md">
                        Économisez {((oldPrice - product.price) * quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 px-2.5 py-1 rounded-lg block">
                        {isFr ? 'Prix direct boutique' : 'Direct shop price'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock meter */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span>🔥 {isFr ? 'Niveau des stocks à Bafoussam' : 'Stock level in Bafoussam'}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{product.stock} {isFr ? 'restants' : 'left'}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Color Swatch / Options selector */}
              {((product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)) && (
                <div className="space-y-4">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {isFr ? 'Couleurs disponibles' : 'Available Colors'}
                      </label>
                      <div className="flex items-center flex-wrap gap-2">
                        {product.colors.map((colorName) => (
                          <button
                            key={colorName}
                            onClick={() => setSelectedColor(colorName)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                              selectedColor === colorName
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            <span>{colorName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {isFr ? 'Tailles disponibles' : 'Available Sizes'}
                      </label>
                      <div className="flex items-center flex-wrap gap-2">
                        {product.sizes.map((sizeName) => (
                          <button
                            key={sizeName}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500"
                          >
                            <span>{sizeName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {isFr ? 'Quantité souhaitée' : 'Select Quantity'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-black text-lg flex items-center justify-center hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-black text-slate-900 dark:text-white text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-black text-lg flex items-center justify-center hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    {isFr ? 'Maximum 10 unités par commande' : 'Max 10 units per order'}
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  {/* Add to Cart button */}
                  <button
                    onClick={() => {
                      for (let i = 0; i < quantity; i++) {
                        onAddToCart(product);
                      }
                    }}
                    disabled={product.stock === 0}
                    className="py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    id={`btn-details-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </button>

                  {/* Buy Now button */}
                  <button
                    onClick={() => {
                      if (onBuyNow) {
                        onBuyNow(product);
                      } else {
                        onAddToCart(product);
                        onClose();
                      }
                    }}
                    disabled={product.stock === 0}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    id={`btn-details-buy-now-${product.id}`}
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{isFr ? 'Acheter Maintenant' : 'Buy Now'}</span>
                  </button>
                </div>

                {/* Secondary Contact Seller Button */}
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{isFr ? 'Contacter le Vendeur (WhatsApp / Appel)' : 'Contact Seller (WhatsApp / Call)'}</span>
                </button>
              </div>

              {/* Merchant Card Highlight (Alibaba Style Gold Supplier) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={merchant?.logo || product.image} 
                      alt={product.merchantName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">
                          {product.merchantName}
                        </h4>
                        {isMerchantVerified && <VerifiedBadge id="merchant-card-badge" />}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>{merchant?.location || product.origin}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200">
                    {isFr ? 'Vendeur Vérifié' : 'Verified Merchant'}
                  </span>
                </div>

                {/* Seller Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      ★ {avgMerchantRating}
                    </span>
                    <span className="text-[10px] text-slate-400">{isFr ? 'Note Vendeur' : 'Seller Rating'}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      98%
                    </span>
                    <span className="text-[10px] text-slate-400">{isFr ? 'Taux Réponse' : 'Response Rate'}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      1 240+
                    </span>
                    <span className="text-[10px] text-slate-400">{isFr ? 'Ventes Bafoussam' : 'Sales'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TABBED SECTIONS (Description, Fiche Technique, Avis Clients, Livraison) */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
            
            {/* Tab Navigation Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar pb-1">
              {[
                { id: 'desc', label: isFr ? 'Description Produit' : 'Product Description', icon: Info },
                { id: 'specs', label: isFr ? 'Fiche Technique & Spécifications' : 'Technical Specifications', icon: Box },
                { id: 'reviews', label: `${isFr ? 'Avis Clients' : 'Reviews'} (${merchantReviews.length})`, icon: Star },
                { id: 'merchant', label: isFr ? 'Infos Vendeur & Boutique' : 'Seller Info', icon: Building2 },
                { id: 'shipping', label: isFr ? 'Livraison à Bafoussam' : 'Delivery & Returns', icon: Truck },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 font-extrabold text-xs transition cursor-pointer border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT PANELS */}
            <div>
              {/* TAB 1: DESCRIPTION */}
              {activeTab === 'desc' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3">
                      {isFr ? 'Présentation détaillée du produit' : 'Product Overview'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                      {product.description}
                    </p>
                  </div>

                  {/* Highlights Bullet points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          {isFr ? 'Qualité Supérieure Certifiée' : 'Certified Top Quality'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {isFr ? 'Inspecté et validé par notre équipe qualité sur le Marché A & B de Bafoussam.' : 'Inspected & validated by our Bafoussam quality control team.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                      <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          {isFr ? 'Expédition Immédiate Moto-Taxi' : 'Express Motorcycle Courier'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {isFr ? 'Livré directement à domicile ou au carrefour le plus proche sous 30 minutes.' : 'Delivered straight to your doorstep or neighborhood junction in 30 mins.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS TABLE */}
              {activeTab === 'specs' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                    {isFr ? 'Caractéristiques & Fiche Technique' : 'Technical Specifications'}
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        {specs.map((spec, idx) => (
                          <tr 
                            key={idx}
                            className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-900'}
                          >
                            <td className="py-3.5 px-5 font-bold text-slate-500 dark:text-slate-400 w-1/3 border-r border-slate-100 dark:border-slate-800">
                              {spec.label}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS & BUYER PHOTOS */}
              {activeTab === 'reviews' && (
                <div className="animate-fade-in space-y-6">
                  
                  {/* Rating Summary Header */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-4 md:pb-0 md:pr-6">
                      <span className="text-5xl font-black text-slate-900 dark:text-white font-mono">
                        {product.rating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-500 stroke-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-bold">
                        {merchantReviews.length} {isFr ? 'Avis Vérifiés Bafoussam' : 'Verified Bafoussam Reviews'}
                      </span>
                    </div>

                    {/* Progress Bars */}
                    <div className="md:col-span-8 space-y-2">
                      {[5, 4, 3, 2, 1].map((starNum) => {
                        const count = merchantReviews.filter(r => Math.round(r.rating) === starNum).length;
                        const pct = merchantReviews.length > 0 ? (count / merchantReviews.length) * 100 : (starNum === 5 ? 85 : 15);
                        return (
                          <div key={starNum} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-bold text-slate-600 dark:text-slate-400 shrink-0">
                              {starNum} ★
                            </span>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-500 h-full rounded-full" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                            <span className="w-10 text-right font-mono text-slate-400 text-[11px]">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Buyer Photos Showcase */}
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>{isFr ? 'Photos réelles publiées par les clients à Bafoussam' : 'Customer Buyer Photos'}</span>
                    </h4>
                    <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                      {SAMPLE_BUYER_PHOTOS.map((photo, i) => (
                        <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-xs">
                          <img src={photo} alt="Acheteur Bafoussam" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Filter Chips & Write Review Button */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 mr-1">{isFr ? 'Filtrer :' : 'Filter:'}</span>
                      {['all', 5, 4, 3].map((val) => (
                        <button
                          key={val}
                          onClick={() => setReviewRatingFilter(val as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            reviewRatingFilter === val 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {val === 'all' ? (isFr ? 'Tous les avis' : 'All') : `${val} ★`}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsWritingReview(!isWritingReview)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{isFr ? 'Écrire un avis client' : 'Write a Review'}</span>
                    </button>
                  </div>

                  {/* Add Review Form */}
                  {isWritingReview && (
                    <form onSubmit={handleSubmitNewReview} className="bg-indigo-50/50 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800 space-y-4 animate-fade-in">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {isFr ? 'Partagez votre avis sur ce produit' : 'Share your review'}
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{isFr ? 'Votre Nom / Pseudo' : 'Your Name'}</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Jean Kamdem"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{isFr ? 'Votre Note (1 à 5 étoiles)' : 'Your Rating'}</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="p-1 cursor-pointer"
                            >
                              <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{isFr ? 'Votre Commentaire' : 'Your Comment'}</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Ex: Produit conforme à Bafoussam, livré super vite !"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsWritingReview(false)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          {isFr ? 'Annuler' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                        >
                          {isFr ? 'Publier mon avis' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3.5">
                    {filteredReviews.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                        {t.noReviews}
                      </p>
                    ) : (
                      filteredReviews.map((review) => (
                        <div 
                          key={review.id} 
                          className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                                {review.clientName || t.clientAnonymous}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Achat Vérifié Bafoussam</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, s) => (
                                <Star 
                                  key={s} 
                                  className={`w-3.5 h-3.5 ${s < review.rating ? 'fill-amber-500 stroke-amber-500' : 'text-slate-300'}`} 
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            "{review.comment}"
                          </p>

                          <span className="text-[10px] text-slate-400 font-bold block">
                            {new Date(review.createdAt).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

              {/* TAB 4: MERCHANT INFO */}
              {activeTab === 'merchant' && (
                <div className="animate-fade-in space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={merchant?.logo || product.image} 
                        alt={product.merchantName} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-lg">
                            {product.merchantName}
                          </h3>
                          {isMerchantVerified && <VerifiedBadge id="merchant-tab-badge" />}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{merchant?.location || product.origin}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-center">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base block">★ {avgMerchantRating}</span>
                        <span className="text-[10px] text-slate-400">{isFr ? 'Note boutique' : 'Shop rating'}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base block">1 240+</span>
                        <span className="text-[10px] text-slate-400">{isFr ? 'Ventes réalisées' : 'Completed sales'}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base block">98%</span>
                        <span className="text-[10px] text-slate-400">{isFr ? 'Taux de réponse' : 'Response rate'}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base block">2023</span>
                        <span className="text-[10px] text-slate-400">{isFr ? 'Membre depuis' : 'Member since'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SHIPPING INFO */}
              {activeTab === 'shipping' && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isFr ? 'Modalités de livraison à Bafoussam' : 'Delivery details in Bafoussam'}
                    </h3>
                    
                    <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block">{isFr ? 'Livraison Moto-Taxi Express' : 'Motorcycle Express Delivery'}</strong>
                          <span>{isFr ? 'Livraison sous 30 à 45 minutes dans tous les quartiers de Bafoussam (Tamdja, Djeleng, Banengo, Kouogouo, Kamkop, Akwa, etc.).' : 'Delivery in 30-45 minutes to all Bafoussam neighborhoods.'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block">{isFr ? 'Paiement à la Livraison ou Mobile Money' : 'Pay on Delivery or MoMo'}</strong>
                          <span>{isFr ? 'Payez en espèces à la livraison au livreur moto ou via MTN MoMo / Orange Money.' : 'Pay cash to driver or via MTN MoMo / Orange Money.'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* SIMILAR & RECOMMENDED PRODUCTS SLIDER/GRID */}
          {similarProducts.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isFr ? 'Produits Similaires Recommandés' : 'Similar Products You Might Like'}
                </h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {isFr ? 'Voir tout' : 'See all'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((simProd) => (
                  <div
                    key={simProd.id}
                    onClick={() => onSelectProduct && onSelectProduct(simProd)}
                    className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-200">
                      <SmartProductImage product={simProd} containerClassName="w-full h-full" aspectRatio="square" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {simProd.name}
                    </h4>
                    <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 block font-mono mt-1">
                      {simProd.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MOBILE FIXED BOTTOM STICKY ACTION BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 z-40 flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">{isFr ? 'Total :' : 'Total:'}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {(product.price * quantity).toLocaleString('fr-FR')} <span className="text-xs font-bold text-indigo-600">FCFA</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-extrabold text-xs cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {t.addToCart}
            </button>

            <button
              onClick={() => {
                if (onBuyNow) {
                  onBuyNow(product);
                } else {
                  onAddToCart(product);
                  onClose();
                }
              }}
              disabled={product.stock === 0}
              className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-extrabold text-xs cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {isFr ? 'Acheter' : 'Buy Now'}
            </button>
          </div>
        </div>

      </div>

      {/* CONTACT SELLER DIRECT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {isFr ? 'Contacter le Vendeur' : 'Contact Merchant'}
              </h3>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <img src={merchant?.logo || product.image} alt="Logo" referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{product.merchantName}</h4>
                <p className="text-xs text-slate-500">{merchant?.location || product.origin}</p>
                <p className="text-xs text-emerald-600 font-bold font-mono mt-0.5">{merchant?.phone || '+237 677 89 45 12'}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  if (onStartChat) {
                    onStartChat(product.merchantId, product.merchantName, product.id, product.name);
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Messagerie Instantanée (Firestore En Direct)</span>
              </button>

              <a
                href={`https://wa.me/237${(merchant?.phone || '677894512').replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, je vous contacte depuis Bafoussam Market concernant le produit "${product.name}" (${product.price} FCFA).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discuter via WhatsApp</span>
              </a>

              <a
                href={`tel:${merchant?.phone || '+237677894512'}`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler directement le vendeur</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX FULLSCREEN IMAGE MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full cursor-pointer transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activeMedia.url} 
            alt="HD Lightbox"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
}
