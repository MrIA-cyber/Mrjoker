import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Maximize2, 
  RotateCcw, 
  X, 
  Loader2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';
import { AfriNovaLogo } from './AfriNovaLogo';

// Critical UI image assets to preload in parallel
const CRITICAL_IMAGES = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
];

interface SplashScreenProps {
  onComplete?: () => void;
  isStandalonePreview?: boolean;
  onClosePreview?: () => void;
  lang?: Language;
  autoComplete?: boolean;
}

/**
 * Preloads a single image with a strict per-image timeout so slow network never blocks startup.
 */
function preloadImage(url: string, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      resolve(true);
    };

    img.onerror = () => {
      cleanup();
      resolve(false);
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    img.src = url;
  });
}

export default function SplashScreen({
  onComplete,
  isStandalonePreview = false,
  onClosePreview,
  lang = 'fr',
  autoComplete = true,
}: SplashScreenProps) {
  const isFr = lang === 'fr';

  // State for continuous 60fps loading progress (0 to 100%)
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const resourceProgressRef = useRef<number>(0);
  const isDoneRef = useRef<boolean>(false);

  // Clock for mobile status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Main 60 FPS loading engine & parallel resource preloader
  const startLoadingProcess = () => {
    setProgress(0);
    setIsLoaded(false);
    setIsExiting(false);
    setIsSlowNetwork(false);
    isDoneRef.current = false;
    resourceProgressRef.current = 0;
    startTimeRef.current = Date.now();

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // 1. Parallel Resource Preloading (Images + Fonts)
    let completedCount = 0;
    const totalResources = CRITICAL_IMAGES.length + 1; // +1 for fonts

    const updateResourceRatio = () => {
      completedCount++;
      resourceProgressRef.current = Math.min(1, completedCount / totalResources);
    };

    // Parallel preloading with Promise.all
    Promise.all(CRITICAL_IMAGES.map((url) => preloadImage(url))).then(() => {
      updateResourceRatio();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(updateResourceRatio)
        .catch(updateResourceRatio);
    } else {
      updateResourceRatio();
    }

    // 2. Continuous 60 FPS RAF Loop
    const TARGET_DURATION_MS = 1400; // 1.4s target for lightning fast startup
    let currentDisplayedVal = 0;

    const tick = () => {
      if (isDoneRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      
      const timeRatio = Math.min(1, elapsed / TARGET_DURATION_MS);
      const resRatio = resourceProgressRef.current;

      let targetVal = Math.min(100, Math.max(timeRatio * 100, resRatio * 100));

      // Slow network fallback notice at 4 seconds
      if (elapsed > 4000 && targetVal < 100) {
        setIsSlowNetwork(true);
        targetVal = 100; // Force finish so user is never stuck
      }

      // Smooth easing interpolation for 60fps progress bar
      currentDisplayedVal += (targetVal - currentDisplayedVal) * 0.22;

      if (currentDisplayedVal >= 99.2) {
        currentDisplayedVal = 100;
        setProgress(100);
        setIsLoaded(true);
        isDoneRef.current = true;
        return;
      }

      setProgress(Math.round(currentDisplayedVal));
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startLoadingProcess();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Fluid transition (280ms exit) as soon as loading reaches 100%
  useEffect(() => {
    if (isLoaded && autoComplete && onComplete) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true); // Smooth 280ms Fade + Scale transition
        const finishTimer = setTimeout(() => {
          onComplete();
        }, 280);
        return () => clearTimeout(finishTimer);
      }, 80);

      return () => clearTimeout(exitTimer);
    }
  }, [isLoaded, autoComplete, onComplete]);

  const handleReplay = () => {
    startLoadingProcess();
  };

  const handleEnterApp = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else if (onClosePreview) {
        onClosePreview();
      }
    }, 280);
  };

  return (
    <motion.div 
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: isExiting ? 0 : 1, 
        scale: isExiting ? 1.03 : 1,
        y: isExiting ? -10 : 0
      }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center justify-center font-sans select-none overflow-hidden will-change-transform ${
        isStandalonePreview 
          ? 'fixed inset-0 z-[100] bg-[#0B1120]/95 backdrop-blur-xl p-2 sm:p-6' 
          : 'w-full min-h-screen bg-[#0F172A]'
      }`}
    >

      {/* TOP FLOATING CONTROL BAR (Only visible during preview) */}
      {(isStandalonePreview || !onComplete) && (
        <div className="absolute top-4 left-4 right-4 z-[110] flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#0F172A]/90 border border-emerald-500/30 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl text-white text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="font-black tracking-wide uppercase text-[11px] text-emerald-400">
              AfriNova
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
              className="px-3.5 py-2 bg-[#0F172A]/90 hover:bg-[#1E293B] border border-slate-700/80 backdrop-blur-md text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg transition"
              title={isPhoneFrameMode ? "Passer en Plein Écran" : "Vue Smartphone Frame"}
            >
              {isPhoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">
                {isPhoneFrameMode ? (isFr ? 'Plein Écran' : 'Full Screen') : (isFr ? 'Format Smartphone' : 'Phone Frame')}
              </span>
            </button>

            <button
              onClick={handleReplay}
              className="p-2 bg-[#0F172A]/90 hover:bg-[#1E293B] border border-slate-700/80 backdrop-blur-md text-slate-200 rounded-2xl cursor-pointer shadow-lg transition"
              title={isFr ? "Rejouer l'animation de démarrage" : "Replay Splash Animation"}
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
            </button>

            {onClosePreview && (
              <button
                onClick={onClosePreview}
                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl cursor-pointer shadow-lg transition ml-1"
                title={isFr ? "Fermer la prévisualisation" : "Close Preview"}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SMARTPHONE / FULLSCREEN CONTAINER */}
      <div 
        className={`relative transition-all duration-300 ease-out flex flex-col overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#111C35] to-[#0A0F1D] ${
          isPhoneFrameMode 
            ? 'w-full max-w-[420px] h-[92vh] max-h-[880px] rounded-[48px] border-[10px] border-slate-800/90 ring-1 ring-slate-700 shadow-[0_0_80px_rgba(22,163,74,0.25)]' 
            : 'w-full h-full min-h-screen rounded-none border-none ring-0'
        }`}
      >
        {/* AMBIENT BACKGROUND GLOW LIGHTS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#16A34A]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl" />
          <div className="absolute top-10 left-10 w-60 h-60 bg-[#F59E0B]/10 rounded-full blur-3xl" />
        </div>

        {/* TOP STATUS BAR */}
        <div className="relative z-30 px-7 pt-3 pb-1 flex items-center justify-between text-white text-[11px] font-extrabold tracking-tight shrink-0">
          <span>{currentTime || '08:30'}</span>
          
          <div className="w-24 h-4 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-mono font-bold text-emerald-400">5G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* MAIN SPLASH CONTENT */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-between px-6 pt-10 pb-10 text-center text-white">
          
          {/* TOP PAN-AFRICAN TECH BADGE */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/40 backdrop-blur-md shadow-lg"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-300">
              Plateforme Panafricaine
            </span>
          </motion.div>

          {/* CENTER OFFICIAL LOGO & SLOGAN */}
          <div className="flex flex-col items-center my-auto space-y-6 max-w-sm">
            
            {/* LOGO ICON WITH FADE IN + SCALE (0.95 -> 1.0) + SUBTLE AURA */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Discrete Glow Aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A] via-[#0F172A] to-[#F59E0B] rounded-[36px] blur-2xl opacity-60 group-hover:opacity-80 transition duration-500 animate-pulse" />

              {/* Glassmorphism Shield */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-[38px] bg-gradient-to-b from-white/15 via-white/5 to-[#0F172A]/80 p-4 border border-white/20 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex items-center justify-center">
                <AfriNovaLogo variant="icon" size="custom" customHeight="100%" customWidth="100%" />
              </div>
            </motion.div>

            {/* BRAND NAME */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display text-white">
                Afri<span className="text-[#16A34A]">Nova</span>
              </h1>
            </motion.div>

            {/* OFFICIAL SLOGAN WITH PROGRESSIVE FADE IN */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="space-y-1.5"
            >
              <p className="text-base sm:text-lg font-bold text-slate-200 tracking-tight font-display">
                « L'Afrique connectée au monde. »
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Technologie, Commerce & Services Panafricains
              </p>
            </motion.div>

          </div>

          {/* BOTTOM CONTINUOUS 60FPS PROGRESS BAR */}
          <div className="w-full max-w-xs space-y-3 pt-2">
            
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                {isLoaded ? (isFr ? 'Prêt à explorer' : 'Ready') : (isFr ? 'Initialisation...' : 'Initializing...')}
              </span>
              <span className="font-mono text-emerald-400 font-extrabold">{progress}%</span>
            </div>

            {/* Smooth 60 FPS Emerald & Gold Progress Bar */}
            <div className="w-full h-2 bg-slate-900/90 border border-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#F59E0B] rounded-full shadow-[0_0_12px_#16A34A] transition-all duration-75 ease-out will-change-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* DISCREET SLOW NETWORK NOTICE */}
            <AnimatePresence>
              {isSlowNetwork && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center text-slate-300 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A] shrink-0" />
                  <span>Préparation de votre expérience…</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ENTER BUTTON FALLBACK */}
            <AnimatePresence>
              {isLoaded && !autoComplete && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleEnterApp}
                  className="w-full py-3 px-6 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm rounded-2xl shadow-lg transition active:scale-98 cursor-pointer"
                >
                  Ouvrir AfriNova
                </motion.button>
              )}
            </AnimatePresence>

            {/* FOOTER */}
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase pt-1">
              AfriNova • v2.0 • Global Tech
            </p>

          </div>

        </div>

      </div>

    </motion.div>
  );
}
