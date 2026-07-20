import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Anomalie interceptée par ErrorBoundary:", error, errorInfo);
    
    // Auto-healing logic: corrects corrupted data and triggers auto-refresh safely
    try {
      const errorSessionKey = 'bafoussam_consecutive_errors';
      const consecutiveErrors = parseInt(sessionStorage.getItem(errorSessionKey) || '0', 10);
      
      if (consecutiveErrors < 3) {
        sessionStorage.setItem(errorSessionKey, (consecutiveErrors + 1).toString());
        
        // Clean potentially corrupted transient storage
        localStorage.removeItem('bafoussam_cart');
        
        // Auto-refresh the page to heal the screen after 2.5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        // Deep reset if we are in an error loop
        sessionStorage.setItem(errorSessionKey, '0');
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('bafoussam_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (e) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  private handleReset = () => {
    try {
      // Clear specific corrupted storage items if any, then reload
      localStorage.removeItem('bafoussam_cart');
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-5"></div>
          
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
            {/* Top red warning light icon with custom glow */}
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
              <span className="text-xl animate-spin">⏳</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">Auto-Correction Active • Bafoussam Direct</span>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Auto-Correction en cours...</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Une anomalie d'affichage a été détectée sur la plateforme. Notre système d'auto-guérison de la Mifi réinitialise les caches corrompus et actualise la page dans quelques instants.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Rapport de Résolution</span>
                <p className="font-mono text-[10px] text-indigo-300 break-all leading-normal">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Simulated Live status bar */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-amber-400 font-bold bg-amber-500/10 py-2 px-4 rounded-xl border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Restauration de l'affichage en cours...</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Forcer l'actualisation</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Réinitialisation Totale</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Support technique de la Mifi : <span className="font-bold text-slate-400">640 40 64 12</span>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
