import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import { UserRole, getDashboardForRole } from '../lib/rbac';

interface AccessDeniedModalProps {
  isOpen: boolean;
  userRole?: UserRole;
  attemptedResource: string;
  onClose: () => void;
  onRedirectToHome: () => void;
}

export default function AccessDeniedModal({
  isOpen,
  userRole = 'CLIENT',
  attemptedResource,
  onClose,
  onRedirectToHome,
}: AccessDeniedModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden relative"
          id="access-denied-modal"
        >
          {/* Top Security Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 animate-pulse"></div>

          <div className="p-6 sm:p-8 text-center space-y-6">
            
            {/* Warning Shield Badge */}
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>

            {/* Error Messages */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <Lock className="w-3 h-3" />
                Erreur RBAC — Sec-403
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                Accès refusé
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Vous n'avez pas l'autorisation d'accéder à l'espace ou à la ressource <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">"{attemptedResource}"</span>.
              </p>
            </div>

            {/* Role Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Votre Rôle Actuel:</span>
                <span className="font-black text-slate-900 dark:text-white bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                  {userRole}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Contrôle de sécurité:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Isolation Stricte
                </span>
              </div>
              <div className="pt-2 text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Cette tentative d'accès non autorisé a été consignée dans le journal d'audit de sécurité.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onRedirectToHome();
                }}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-2xl text-xs font-black transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Retourner à mon tableau de bord ({userRole})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
