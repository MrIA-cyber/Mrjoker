import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, Search, Store, User, ChevronRight, Clock, Sparkles, Loader2, Plus, ArrowRight
} from 'lucide-react';
import { ChatThread, subscribeToUserChats } from '../services/chatService';

interface ChatListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'client' | 'vendeur';
  onSelectChat: (thread: ChatThread) => void;
  onStartNewChatWithMerchant?: (merchantId: string, merchantName: string) => void;
  availableMerchants?: Array<{ id: string; name: string; shopName: string; location: string }>;
}

export default function ChatListModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  onSelectChat,
  onStartNewChatWithMerchant,
  availableMerchants = []
}: ChatListModalProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discussions' | 'nouveau'>('discussions');

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    setIsLoading(true);
    const unsubscribe = subscribeToUserChats(currentUserId, currentUserRole, (userThreads) => {
      setThreads(userThreads);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, currentUserId, currentUserRole]);

  if (!isOpen) return null;

  const filteredThreads = threads.filter(t => {
    const term = searchQuery.toLowerCase();
    const otherName = currentUserRole === 'client' ? t.merchantName : t.clientName;
    const prodName = t.productName || '';
    const lastMsg = t.lastMessage || '';
    return (
      otherName.toLowerCase().includes(term) ||
      prodName.toLowerCase().includes(term) ||
      lastMsg.toLowerCase().includes(term)
    );
  });

  const totalUnread = threads.reduce((acc, t) => {
    return acc + (currentUserRole === 'vendeur' ? t.unreadCountMerchant : t.unreadCountClient);
  }, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[620px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 shrink-0 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Messagerie Instantanée</span>
                    {totalUnread > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                        {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {currentUserRole === 'client' ? 'Échanges en direct avec les commerçants de Bafoussam' : 'Espace de discussion clients Bafoussam Market'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'discussions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussions ({threads.length})</span>
              </button>

              {currentUserRole === 'client' && availableMerchants.length > 0 && (
                <button
                  onClick={() => setActiveTab('nouveau')}
                  className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'nouveau' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Contacter Commerçant</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          {activeTab === 'discussions' && (
            <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une conversation ou un produit..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300">
            {activeTab === 'discussions' ? (
              isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold">Chargement des conversations...</p>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    Aucune discussion en cours
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {currentUserRole === 'client' 
                      ? 'Contactez un vendeur depuis un produit ou le catalogue pour engager la discussion.' 
                      : 'Les messages des acheteurs apparaîtront ici dès leur premier contact.'}
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const unread = currentUserRole === 'vendeur' ? thread.unreadCountMerchant : thread.unreadCountClient;
                  const otherName = currentUserRole === 'client' ? thread.merchantName : thread.clientName;

                  return (
                    <motion.div
                      key={thread.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelectChat(thread)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        unread > 0 
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                          : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center shrink-0">
                          {currentUserRole === 'client' ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-900 truncate">
                              {otherName}
                            </h4>
                            {unread > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white shrink-0">
                                {unread}
                              </span>
                            )}
                          </div>

                          {thread.productName && (
                            <p className="text-[10px] font-bold text-emerald-700 truncate mt-0.5">
                              🛍️ {thread.productName}
                            </p>
                          )}

                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {thread.lastMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(thread.updatedAt || thread.lastMessageTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </motion.div>
                  );
                })
              )
            ) : (
              /* New Chat Tab */
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Sélectionnez un commerçant certifié de Bafoussam pour ouvrir une ligne de discussion directe :
                </p>
                {availableMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    onClick={() => onStartNewChatWithMerchant && onStartNewChatWithMerchant(merchant.id, merchant.shopName || merchant.name)}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{merchant.shopName || merchant.name}</h4>
                        <p className="text-[10px] text-slate-500">📍 {merchant.location}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1">
                      <span>Démarrer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
