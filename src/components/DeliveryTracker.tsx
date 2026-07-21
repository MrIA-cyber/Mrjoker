import React, { useEffect, useState } from 'react';
import { Order, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { Truck, CheckCircle2, Clock, Phone, MapPin, Navigation, Sparkles, ShoppingBag, Box, Bike, Home, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

interface DeliveryTrackerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'picked_up' | 'delivering' | 'completed') => void;
  lang: Language;
  onAddReview?: (orderId: string, rating: number, comment: string, clientName: string) => void;
}

export default function DeliveryTracker({ orders, onUpdateOrderStatus, lang, onAddReview }: DeliveryTrackerProps) {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [motoPos, setMotoPos] = useState({ x: 150, y: 180 }); // start coordinates: Marche A
  const [progressPercent, setProgressPercent] = useState(0);

  // Review Form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewClientName, setReviewClientName] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const t = translations[lang];

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  useEffect(() => {
    if (orders.length > 0 && !activeOrderId) {
      setActiveOrderId(orders[0].id);
    }
  }, [orders, activeOrderId]);

  // Set default client name in review form when active order changes
  useEffect(() => {
    if (activeOrder) {
      setReviewClientName(activeOrder.userName || '');
      setReviewComment('');
      setReviewRating(5);
    }
  }, [activeOrder]);

  // Simulate active courier dispatch and live location animation
  useEffect(() => {
    if (!activeOrder) return;
    
    // Find target neighborhood coordinates
    const targetNeighborhood = BAFOUSSAM_NEIGHBORHOODS.find(
      n => n.name.toLowerCase().includes(activeOrder.deliveryNeighborhood.toLowerCase())
    ) || BAFOUSSAM_NEIGHBORHOODS[0];

    const startX = 150; // Marché A (Centre) coordinates
    const startY = 180;
    const endX = targetNeighborhood.coordinates.x;
    const endY = targetNeighborhood.coordinates.y;

    let timer: NodeJS.Timeout;

    if (activeOrder.status === 'pending') {
      // Auto transition to preparing in 4 seconds
      timer = setTimeout(() => {
        onUpdateOrderStatus(activeOrder.id, 'preparing');
      }, 4000);
    } else if (activeOrder.status === 'preparing') {
      // Auto transition to picked_up in 6 seconds
      timer = setTimeout(() => {
        onUpdateOrderStatus(activeOrder.id, 'picked_up');
      }, 6000);
    } else if (activeOrder.status === 'picked_up') {
      // Auto transition to delivering in 4 seconds
      timer = setTimeout(() => {
        onUpdateOrderStatus(activeOrder.id, 'delivering');
      }, 4000);
    } else if (activeOrder.status === 'delivering') {
      // Animate moto-taxi movement along the path over 12 seconds
      let steps = 0;
      const totalSteps = 120; // 100ms interval for 12 seconds
      
      const interval = setInterval(() => {
        steps++;
        const ratio = steps / totalSteps;
        
        // Linear interpolation for simplicity (representing path travel across Bafoussam)
        const currentX = startX + (endX - startX) * ratio;
        const currentY = startY + (endY - startY) * ratio;
        
        setMotoPos({ x: currentX, y: currentY });
        setProgressPercent(Math.floor(ratio * 100));

        if (steps >= totalSteps) {
          clearInterval(interval);
          onUpdateOrderStatus(activeOrder.id, 'completed');
        }
      }, 100);

      return () => clearInterval(interval);
    }

    return () => clearTimeout(timer);
  }, [activeOrder, activeOrderId, onUpdateOrderStatus]);

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans" id="no-active-delivery-container">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200 dark:border-slate-700">
          <Truck className="w-10 h-10 text-slate-400 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {lang === 'fr' ? 'Aucune livraison en cours' : 'No deliveries in progress'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {lang === 'fr' 
            ? "Lorsque vous passez commande dans l'onglet Acheter, votre colis apparaîtra ici avec un suivi GPS en temps réel."
            : "When you place an order in the Buy tab, your package will appear here with real-time GPS tracking."
          }
        </p>
      </div>
    );
  }

  // Find corresponding neighborhood details
  const targetNeighborhood = BAFOUSSAM_NEIGHBORHOODS.find(
    n => n.name.toLowerCase().includes(activeOrder?.deliveryNeighborhood?.toLowerCase())
  ) || BAFOUSSAM_NEIGHBORHOODS[0];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddReview && activeOrder) {
      onAddReview(activeOrder.id, reviewRating, reviewComment, reviewClientName);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="delivery-tracker-container">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live SVG Map tracking coordinates - Col 7 */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {lang === 'fr' ? 'Suivi GPS Temps Réel - Bafoussam' : 'Real-Time GPS Tracking - Bafoussam'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {lang === 'fr' 
                  ? `Moto-taxi n° BAF-452 • En route vers ${activeOrder.deliveryNeighborhood}`
                  : `Moto-taxi No. BAF-452 • En route to ${activeOrder.deliveryNeighborhood}`
                }
              </p>
            </div>
            {activeOrder.status === 'delivering' && (
              <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse">
                {progressPercent}% {lang === 'fr' ? 'DU TRAJET EFFECTUÉ' : 'OF TRIP COMPLETED'}
              </span>
            )}
          </div>

          {/* SVG Map of Bafoussam */}
          <div className="bg-slate-900 rounded-2xl aspect-video relative overflow-hidden border border-slate-800 shadow-inner">
            <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              {/* Map grid pattern background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Styled Main Streets and Arteries of Bafoussam */}
              <line x1="50" y1="180" x2="350" y2="180" stroke="#334155" strokeWidth="4" />
              <line x1="150" y1="50" x2="150" y2="350" stroke="#334155" strokeWidth="4" />
              <line x1="50" y1="120" x2="350" y2="280" stroke="#334155" strokeWidth="2.5" strokeDasharray="5,5" />
              <line x1="100" y1="260" x2="280" y2="220" stroke="#1e293b" strokeWidth="3" />
              <line x1="120" y1="150" x2="250" y2="110" stroke="#1e293b" strokeWidth="3" />

              {/* Major Landmarks */}
              <circle cx="150" cy="180" r="10" fill="#3b82f6" fillOpacity="0.2" />
              <circle cx="150" cy="180" r="5" fill="#3b82f6" />
              <text x="163" y="184" fill="#94a3b8" fontSize="9" fontWeight="bold">
                {lang === 'fr' ? 'Marché A (Départ)' : 'Marché A (Start)'}
              </text>

              {/* Neighborhood landmark target */}
              <circle cx={targetNeighborhood.coordinates.x} cy={targetNeighborhood.coordinates.y} r="14" fill="#ef4444" fillOpacity="0.2" />
              <circle cx={targetNeighborhood.coordinates.x} cy={targetNeighborhood.coordinates.y} r="6" fill="#ef4444" />
              <text x={targetNeighborhood.coordinates.x + 16} y={targetNeighborhood.coordinates.y + 4} fill="#f1f5f9" fontSize="10" fontWeight="extrabold">
                {targetNeighborhood.name}
              </text>

              {/* Dynamic Path line from Marché A to Target when delivering */}
              {activeOrder.status === 'delivering' && (
                <line 
                  x1="150" 
                  y1="180" 
                  x2={motoPos.x} 
                  y2={motoPos.y} 
                  stroke="#4f46e5" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              )}

              {/* Animated Moto taxi indicator */}
              {(activeOrder.status === 'delivering' || activeOrder.status === 'completed') && (
                <g transform={`translate(${activeOrder.status === 'completed' ? targetNeighborhood.coordinates.x : motoPos.x - 10}, ${activeOrder.status === 'completed' ? targetNeighborhood.coordinates.y : motoPos.y - 10})`}>
                  <rect width="20" height="20" rx="6" fill="#4f46e5" className="animate-bounce" />
                  <text x="4" y="14" fill="#ffffff" fontSize="11">🏍️</text>
                </g>
              )}
            </svg>

            {/* Simulated Live Alert message overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-white fill-white animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">
                  {lang === 'fr' ? 'Mise à jour Coursier' : 'Courier Update'}
                </span>
                <span className="text-xs text-white mt-0.5 block font-medium">
                  {activeOrder.status === 'pending' && (lang === 'fr' ? 'Attribution d\'un coursier de confiance à Bafoussam...' : 'Assigning a trusted courier in Bafoussam...')}
                  {activeOrder.status === 'preparing' && (lang === 'fr' ? 'Votre marchand prépare soigneusement vos articles...' : 'Your merchant is carefully preparing your items...')}
                  {activeOrder.status === 'delivering' && (lang === 'fr' ? `Jean-Baptiste traverse les axes de Bafoussam vers ${activeOrder.deliveryNeighborhood}...` : `Jean-Baptiste is navigating the streets of Bafoussam to ${activeOrder.deliveryNeighborhood}...`)}
                  {activeOrder.status === 'completed' && (lang === 'fr' ? 'Votre colis a été remis en main propre ! Merci pour votre confiance.' : 'Your package has been hand-delivered! Thank you for your trust.')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order summary and progress timeline - Col 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Orders List Switcher */}
          {orders.length > 1 && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                {lang === 'fr' ? 'Vos commandes actives' : 'Your active orders'}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {orders.map((o, idx) => (
                  <button
                    key={o.id}
                    onClick={() => setActiveOrderId(o.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      activeOrderId === o.id
                        ? 'bg-slate-900 text-white dark:bg-slate-800'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Commande #{orders.length - idx} ({o.items.length} art.)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Timeline card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">ID: #{activeOrder.id.slice(-6)}</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 flex items-center gap-1.5">
                  <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>{lang === 'fr' ? 'Suivi de Livraison' : 'Delivery Tracking'}</span>
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 py-1 px-3 rounded-full font-bold inline-block">
                  {activeOrder.paymentMethod === 'momo' ? 'Mtn MoMo' : 
                   activeOrder.paymentMethod === 'orange' ? 'Orange Money' : 'À la livraison'}
                </span>
                
                {/* Remaining Time estimation display */}
                <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5 flex items-center justify-end gap-1" id="remaining-delivery-time-badge">
                  <Clock className="w-3 h-3 text-indigo-500 animate-pulse" />
                  <span>
                    {activeOrder.status === 'pending' && `${lang === 'fr' ? 'Estimé:' : 'Est:'} ~${activeOrder.deliveryTimeEstimated || 20} min`}
                    {activeOrder.status === 'preparing' && `${lang === 'fr' ? 'Estimé:' : 'Est:'} ~${Math.round((activeOrder.deliveryTimeEstimated || 20) * 0.8)} min`}
                    {activeOrder.status === 'picked_up' && `${lang === 'fr' ? 'Estimé:' : 'Est:'} ~${Math.round((activeOrder.deliveryTimeEstimated || 20) * 0.5)} min`}
                    {activeOrder.status === 'delivering' && `${lang === 'fr' ? 'Estimé:' : 'Est:'} ~${Math.max(2, Math.round((activeOrder.deliveryTimeEstimated || 20) * (1 - progressPercent / 100)))} min`}
                    {activeOrder.status === 'completed' && (lang === 'fr' ? 'Livrée !' : 'Delivered!')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Timeline Nodes */}
            <div className="relative pl-7 space-y-6">
              {/* vertical connecting line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

              {/* Helper variables to check active and already passed steps */}
              {(() => {
                const STATUS_ORDER = ['pending', 'preparing', 'picked_up', 'delivering', 'completed'];
                const currentIdx = STATUS_ORDER.indexOf(activeOrder.status);

                const renderStep = (stepIdx: number, stepStatus: string, title: string, desc: string, icon: React.ReactNode) => {
                  const isReached = currentIdx >= stepIdx;
                  const isActive = currentIdx === stepIdx;
                  
                  return (
                    <div className="relative flex gap-3 items-start" key={stepStatus}>
                      <div className={`absolute -left-[27px] w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm shadow-indigo-600/20 scale-110 z-10 animate-pulse dark:bg-slate-950'
                          : isReached
                          ? 'bg-indigo-600 border-indigo-600 text-white z-10'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 z-10'
                      }`}>
                        {isReached && !isActive ? (
                          <span className="text-[9px] font-bold">✓</span>
                        ) : (
                          <span className="text-[10px] font-bold font-mono">{stepIdx + 1}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg border mt-0.5 ${
                          isActive 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900'
                            : isReached
                            ? 'bg-indigo-50/40 border-indigo-100/30 text-indigo-500 dark:bg-indigo-950/10'
                            : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-slate-300'
                        }`}>
                          {icon}
                        </div>
                        <div>
                          <h5 className={`font-bold text-xs leading-snug transition-colors ${
                            isActive ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : isReached ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                          }`}>
                            {title}
                          </h5>
                          <p className={`text-[10.5px] mt-0.5 leading-normal transition-colors ${
                            isActive ? 'text-slate-600 dark:text-slate-400 font-medium' : isReached ? 'text-slate-400' : 'text-slate-300'
                          }`}>
                            {desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {renderStep(
                      0, 
                      'pending', 
                      lang === 'fr' ? 'Commande reçue' : 'Order received', 
                      lang === 'fr' ? 'Passerelle approuvée. Commande enregistrée.' : 'Payment approved. Order registered.', 
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {renderStep(
                      1, 
                      'preparing', 
                      lang === 'fr' ? 'En préparation par le commerçant' : 'In preparation by merchant', 
                      lang === 'fr' ? 'Le marchand prépare et emballe vos articles soigneusement.' : 'The merchant is carefully preparing and packaging your items.', 
                      <Box className="w-3.5 h-3.5" />
                    )}
                    {renderStep(
                      2, 
                      'picked_up', 
                      lang === 'fr' ? 'Récupérée par le livreur' : 'Picked up by courier', 
                      lang === 'fr' ? 'Le livreur a validé la cueillette des articles.' : 'The courier has validated the pickup of your items.', 
                      <Bike className="w-3.5 h-3.5" />
                    )}
                    {renderStep(
                      3, 
                      'delivering', 
                      lang === 'fr' ? 'En route vers vous' : 'On its way to you', 
                      lang === 'fr' ? 'Votre colis est en transit express sur les axes de Bafoussam.' : 'Your package is in express transit across the streets of Bafoussam.', 
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                    {renderStep(
                      4, 
                      'completed', 
                      lang === 'fr' ? 'Livrée !' : 'Delivered!', 
                      lang === 'fr' ? `Colis remis en main propre à Bafoussam (${activeOrder.deliveryNeighborhood}).` : `Package hand-delivered in Bafoussam (${activeOrder.deliveryNeighborhood}).`, 
                      <Home className="w-3.5 h-3.5" />
                    )}
                  </>
                );
              })()}
            </div>

            {/* Courier Info card - Visible from step 3 (picked_up) onwards */}
            {(activeOrder.status === 'picked_up' || activeOrder.status === 'delivering' || activeOrder.status === 'completed') ? (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/60 rounded-2xl p-4 flex items-center justify-between text-xs" id="courier-tracker-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                    🛵
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100">{activeOrder.courierName || 'Jean-Baptiste (Moto Bafoussam)'}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {lang === 'fr' ? 'Livreur assigné à votre commande' : 'Courier assigned to your order'}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Tél : {activeOrder.courierPhone || '640406412'}</p>
                  </div>
                </div>
                <a
                  href={`tel:${activeOrder.courierPhone || '640406412'}`}
                  className="bg-white dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-indigo-50 p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 transition shadow-2xs"
                  title="Appeler le coursier"
                  id="btn-call-courier"
                >
                  <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4.5 text-center" id="courier-waiting-placeholder">
                <p className="text-[10.5px] text-slate-400 font-medium">
                  {lang === 'fr' 
                    ? "🛵 En attente de l'attribution d'un livreur moto certifié Bafoussam Direct."
                    : "🛵 Waiting for a certified Bafoussam Direct moto courier."
                  }
                </p>
              </div>
            )}

            {/* Interactive Review Form for Delivered Order (one per order) */}
            {activeOrder.status === 'completed' && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4" id="completed-order-review-block">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h5 className="font-extrabold text-xs uppercase tracking-wider">
                    {t.reviewsTitle}
                  </h5>
                </div>

                {activeOrder.isReviewed ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{lang === 'fr' ? 'Votre avis a été soumis avec succès ! Merci de votre retour.' : 'Your review was successfully submitted! Thank you.'}</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                    {/* Star selection */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {lang === 'fr' ? 'Votre note' : 'Your Rating'}
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer bg-transparent border-none"
                            title={`${star} ${lang === 'fr' ? 'étoile' : 'star'}`}
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverRating ?? reviewRating) 
                                  ? 'fill-amber-400 stroke-amber-400' 
                                  : 'text-slate-300 dark:text-slate-600'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {lang === 'fr' ? 'Votre nom (optionnel)' : 'Your Name (optional)'}
                      </label>
                      <input 
                        type="text" 
                        placeholder={lang === 'fr' ? 'Ex: Alain Fogué (ou laisser vide pour anonyme)' : 'Ex: Alain Fogué (or leave blank for anonymous)'}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={reviewClientName}
                        onChange={(e) => setReviewClientName(e.target.value)}
                      />
                    </div>

                    {/* Comment input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {lang === 'fr' ? 'Commentaire' : 'Comment'}
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder={lang === 'fr' ? 'Comment s’est déroulée votre livraison ? La qualité du produit ?' : 'How was your delivery? Product quality?'}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-xs text-center"
                    >
                      {lang === 'fr' ? 'Soumettre mon avis' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Order Items detail dropdown */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>{lang === 'fr' ? 'Détail de vos articles' : 'Your Items Details'}</span>
              </h5>

              <div className="space-y-2">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 px-3.5 py-2 rounded-xl text-xs border border-slate-100/50 dark:border-slate-800/50"
                  >
                    <div className="flex-1 truncate pr-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</span>
                      <span className="text-slate-400 text-[10px] ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-950 dark:text-slate-100">{(item.product.price * item.quantity).toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center text-xs pt-2.5 font-bold text-slate-900 dark:text-slate-100">
                  <span>{lang === 'fr' ? `Frais de livraison (${activeOrder.deliveryNeighborhood})` : `Delivery fee (${activeOrder.deliveryNeighborhood})`}</span>
                  <span>{targetNeighborhood.deliveryFee.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-200 dark:border-slate-700 mt-2 font-extrabold text-slate-950 dark:text-slate-100">
                  <span>{lang === 'fr' ? 'Grand Total Payé' : 'Grand Total Paid'}</span>
                  <span>{activeOrder.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
