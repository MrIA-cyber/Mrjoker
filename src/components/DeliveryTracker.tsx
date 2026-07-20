import React, { useEffect, useState } from 'react';
import { Order, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { Truck, CheckCircle2, Clock, Phone, MapPin, Navigation, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface DeliveryTrackerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'delivering' | 'completed') => void;
}

export default function DeliveryTracker({ orders, onUpdateOrderStatus }: DeliveryTrackerProps) {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [motoPos, setMotoPos] = useState({ x: 150, y: 180 }); // start coordinates: Marche A
  const [progressPercent, setProgressPercent] = useState(0);

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  useEffect(() => {
    if (orders.length > 0 && !activeOrderId) {
      setActiveOrderId(orders[0].id);
    }
  }, [orders, activeOrderId]);

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
      // Auto transition to delivering in 6 seconds
      timer = setTimeout(() => {
        onUpdateOrderStatus(activeOrder.id, 'delivering');
      }, 6000);
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
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200">
          <Truck className="w-10 h-10 text-slate-400 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Aucune livraison en cours</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Lorsque vous passez commande dans l'onglet <strong className="text-slate-800">Acheter</strong>, votre colis apparaîtra ici avec un suivi GPS en temps réel.
        </p>
      </div>
    );
  }

  // Find corresponding neighborhood details
  const targetNeighborhood = BAFOUSSAM_NEIGHBORHOODS.find(
    n => n.name.toLowerCase().includes(activeOrder?.deliveryNeighborhood?.toLowerCase())
  ) || BAFOUSSAM_NEIGHBORHOODS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="delivery-tracker-container">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live SVG Map tracking coordinates - Col 7 */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Suivi GPS Temps Réel - Bafoussam</h3>
              <p className="text-xs text-slate-400 mt-0.5">Moto-taxi n° BAF-452 • En route vers {activeOrder.deliveryNeighborhood}</p>
            </div>
            {activeOrder.status === 'delivering' && (
              <span className="bg-indigo-100 text-indigo-900 font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse">
                {progressPercent}% DU TRAJET EFFECTUÉ
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
              {/* Avenue de l'Hôpital */}
              <line x1="50" y1="180" x2="350" y2="180" stroke="#334155" strokeWidth="4" />
              {/* Route de Bamendzi */}
              <line x1="150" y1="50" x2="150" y2="350" stroke="#334155" strokeWidth="4" />
              {/* Route de Foumbot */}
              <line x1="50" y1="120" x2="350" y2="280" stroke="#334155" strokeWidth="2.5" strokeDasharray="5,5" />
              {/* Bypass roads */}
              <line x1="100" y1="260" x2="280" y2="220" stroke="#1e293b" strokeWidth="3" />
              <line x1="120" y1="150" x2="250" y2="110" stroke="#1e293b" strokeWidth="3" />

              {/* Major Landmarks */}
              {/* Marché A - Source */}
              <circle cx="150" cy="180" r="10" fill="#3b82f6" fillOpacity="0.2" />
              <circle cx="150" cy="180" r="5" fill="#3b82f6" />
              <text x="163" y="184" fill="#94a3b8" fontSize="9" fontWeight="bold">Marché A (Départ)</text>

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
                <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Mise à jour Coursier</span>
                <span className="text-xs text-white mt-0.5 block font-medium">
                  {activeOrder.status === 'pending' && 'Attribution d\'un coursier de confiance à Bafoussam...'}
                  {activeOrder.status === 'preparing' && 'Votre marchand prépare soigneusement vos articles...'}
                  {activeOrder.status === 'delivering' && `Jean-Baptiste traverse les axes de Bafoussam vers ${activeOrder.deliveryNeighborhood}...`}
                  {activeOrder.status === 'completed' && 'Votre colis a été remis en main propre ! Merci pour votre confiance.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order summary and progress timeline - Col 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Orders List Switcher */}
          {orders.length > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Vos commandes actives</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {orders.map((o, idx) => (
                  <button
                    key={o.id}
                    onClick={() => setActiveOrderId(o.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      activeOrderId === o.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Commande #{orders.length - idx} ({o.items.length} art.)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Timeline card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Commande: #{activeOrder.id.slice(-6)}</span>
                <h4 className="font-extrabold text-slate-900 text-base mt-0.5">Suivi de Livraison</h4>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 py-1 px-3 rounded-full font-bold">
                {activeOrder.paymentMethod === 'momo' ? 'Payé par MoMo' : 'Payé par Orange OM'}
              </span>
            </div>

            {/* Visual Timeline Nodes */}
            <div className="relative pl-6 space-y-6">
              {/* vertical connecting line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {/* Node 1: Registered */}
              <div className="relative">
                <div className={`absolute -left-[21px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                  activeOrder.status !== 'pending' 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-white border-indigo-600 text-indigo-600 animate-pulse'
                }`}>
                  {activeOrder.status !== 'pending' ? '✓' : '1'}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Commande payée & enregistrée</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Passerelle mobile de {activeOrder.paymentMethod === 'momo' ? 'MTN' : 'Orange'} approuvée.</p>
                </div>
              </div>

              {/* Node 2: Preparing */}
              <div className="relative">
                <div className={`absolute -left-[21px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                  activeOrder.status === 'delivering' || activeOrder.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : activeOrder.status === 'preparing'
                    ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {activeOrder.status === 'delivering' || activeOrder.status === 'completed' ? '✓' : '2'}
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${activeOrder.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>Préparation chez le marchand</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Emballage soigné du café, taro ou Ndop.</p>
                </div>
              </div>

              {/* Node 3: Transit */}
              <div className="relative">
                <div className={`absolute -left-[21px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                  activeOrder.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : activeOrder.status === 'delivering'
                    ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {activeOrder.status === 'completed' ? '✓' : '3'}
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${activeOrder.status === 'delivering' || activeOrder.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>Coursier en transit moto</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vitesse de livraison maximisée par nos moto-taximen.</p>
                </div>
              </div>

              {/* Node 4: Completed */}
              <div className="relative">
                <div className={`absolute -left-[21px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                  activeOrder.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white animate-bounce'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  4
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${activeOrder.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>Livré à domicile !</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Colis réceptionné à votre repère à {activeOrder.deliveryNeighborhood}.</p>
                </div>
              </div>
            </div>

            {/* Courier Info card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-lg">
                  🛵
                </div>
                <div>
                  <p className="font-bold text-slate-900">Jean-Baptiste (Moto Bafoussam)</p>
                  <p className="text-[10px] text-slate-400">Agent de livraison certifié local</p>
                </div>
              </div>
              <a
                href="tel:640406412"
                className="bg-white hover:bg-slate-100 p-2 border border-slate-200 rounded-xl text-slate-800 flex items-center justify-center shrink-0 transition shadow-xs"
                title="Appeler le coursier ou le support"
              >
                <Phone className="w-4 h-4 text-slate-700" />
              </a>
            </div>

            {/* Order Items detail dropdown */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>Détail de vos articles</span>
              </h5>

              <div className="space-y-2">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center bg-slate-50/50 px-3.5 py-2 rounded-xl text-xs border border-slate-100/50"
                  >
                    <div className="flex-1 truncate pr-4">
                      <span className="font-semibold text-slate-800">{item.product.name}</span>
                      <span className="text-slate-400 text-[10px] ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-950">{(item.product.price * item.quantity).toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center text-xs pt-2.5 font-bold text-slate-900">
                  <span>Frais de livraison ({activeOrder.deliveryNeighborhood})</span>
                  <span>{targetNeighborhood.deliveryFee.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-200 mt-2 font-extrabold text-slate-950">
                  <span>Grand Total Payé</span>
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
