import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Check, X, Clock } from 'lucide-react';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';

interface NeighborhoodSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  lang?: 'fr' | 'en';
}

export default function NeighborhoodSelectModal({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  lang = 'fr',
}: NeighborhoodSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Unique list of neighborhoods (de-duplicating by name/ID display)
  const uniqueNeighborhoods = React.useMemo(() => {
    const seen = new Set<string>();
    return BAFOUSSAM_NEIGHBORHOODS.filter((nh) => {
      if (seen.has(nh.name)) return false;
      seen.add(nh.name);
      return true;
    });
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return uniqueNeighborhoods;
    const q = searchQuery.toLowerCase().trim();
    return uniqueNeighborhoods.filter(
      (nh) =>
        nh.name.toLowerCase().includes(q) ||
        nh.id.toLowerCase().includes(q)
    );
  }, [searchQuery, uniqueNeighborhoods]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-[#16A34A] flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'fr' ? 'Votre quartier à Bafoussam' : 'Your neighborhood in Bafoussam'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'fr'
                    ? 'Sélectionnez votre zone de livraison'
                    : 'Select your delivery area'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 bg-slate-50/60 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Rechercher un quartier (ex: Tamdja, Marché A...)'
                    : 'Search neighborhood...'
                }
                className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List of Neighborhoods */}
          <div className="p-3 overflow-y-auto space-y-1.5 flex-1 min-h-[220px]">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">
                  {lang === 'fr' ? 'Aucun quartier trouvé' : 'No neighborhood found'}
                </p>
                <p className="text-xs mt-1 text-slate-400">
                  {lang === 'fr'
                    ? 'Essayez avec un autre nom de quartier'
                    : 'Try another search term'}
                </p>
              </div>
            ) : (
              filtered.map((nh) => {
                const isSelected =
                  selectedId === nh.id ||
                  selectedId.toLowerCase() === nh.name.toLowerCase();

                return (
                  <button
                    key={nh.id}
                    type="button"
                    onClick={() => {
                      onSelect(nh.id, nh.name);
                      onClose();
                    }}
                    className={`w-full p-3.5 rounded-2xl transition-all duration-150 flex items-center justify-between text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-2 border-[#16A34A] text-[#16A34A] shadow-xs'
                        : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm">{nh.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {lang === 'fr'
                              ? `Livraison estimée : ~${nh.estMinutes} min`
                              : `Estimated delivery: ~${nh.estMinutes} min`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
