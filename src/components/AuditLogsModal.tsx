import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Lock, X, RefreshCw, Trash2, Search, Filter, ShieldCheck, Clock, User, FileText } from 'lucide-react';
import { getAuditLogs, clearAuditLogs, AuditLogEntry } from '../lib/auditLogger';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditLogsModal({ isOpen, onClose }: AuditLogsModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
          id="audit-logs-modal"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span>Journaux d'Audit & Sécurité RBAC</span>
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/30">
                    SÉCURISÉ
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Historique des tentatives d'accès, violations d'accès refusé et logs d'authentification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadLogs}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par utilisateur, rôle, ressource..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">Tous les événements ({logs.length})</option>
                <option value="DENIED">Accès Refusé (Violations)</option>
                <option value="ALLOWED">Accès Autorisé</option>
                <option value="LOGIN">Connexions</option>
              </select>

              <button
                onClick={() => {
                  if (confirm('Voulez-vous réinitialiser les journaux d\'audit ?')) {
                    clearAuditLogs();
                    loadLogs();
                  }
                }}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer border border-rose-200 dark:border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purger</span>
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500/50" />
                <p className="font-bold text-sm">Aucun événement d'audit trouvé</p>
                <p className="text-xs text-slate-500">Les accès autorisés et refusés apparaîtront ici automatiquement.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    log.status === 'DENIED'
                      ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                      : log.status === 'LOGIN'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          log.status === 'DENIED'
                            ? 'bg-rose-600 text-white'
                            : log.status === 'LOGIN'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {log.status === 'DENIED' ? 'ACCÈS REFUSÉ' : log.status}
                      </span>

                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {log.userName}
                      </span>

                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        Rôle: {log.userRole}
                      </span>
                    </div>

                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      Ressource: <span className="font-mono font-bold">{log.resource}</span> — Action: <span className="font-bold">{log.action}</span>
                    </p>

                    {log.reason && (
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        Raison: {log.reason}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
