import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Maximize2, 
  MapPin, 
  X,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

// Sunrise Bafoussam aerial generated background image
const sunriseAerialBg = '/src/assets/images/bafoussam_aerial_sunrise_1785224477926.jpg';

// Critical assets to preload in parallel
const CRITICAL_IMAGES = [
  sunriseAerialBg,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60'
];

interface SplashScreenProps {
  onComplete?: () => void;
  isStandalonePreview?: boolean;
  onClosePreview?: () => void;
  lang?: Language;
  autoComplete?: boolean;
}

/**
 * Preloads a single image with a strict per-image timeout so slow assets never block startup.
 */
function preloadImage(url: string, timeoutMs = 1500): Promise<boolean> {
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
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(!isStandalonePreview && false);
  const [currentTime, setCurrentTime] = useState('');

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const resourceProgressRef = useRef<number>(0);
  const isDoneRef = useRef<boolean>(false);

  // Clock for top mobile status bar
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

  // Main 60 FPS loading engine & resource preloader
  const startLoadingProcess = () => {
    // Reset states
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

    CRITICAL_IMAGES.forEach((url) => {
      preloadImage(url).then(updateResourceRatio);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(updateResourceRatio)
        .catch(updateResourceRatio);
    } else {
      updateResourceRatio();
    }

    // 2. Continuous 60 FPS RAF Loop
    const TARGET_DURATION_MS = 1800; // 1.8s ideal target for cached/fast loading
    let currentDisplayedVal = 0;

    const tick = () => {
      if (isDoneRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      
      // Calculate time-based progress ratio (0 to 1)
      const timeRatio = Math.min(1, elapsed / TARGET_DURATION_MS);
      const resRatio = resourceProgressRef.current;

      // Target progress is max of time progress and loaded resources
      let targetVal = Math.min(100, Math.max(timeRatio * 100, resRatio * 100));

      // Slow network notice at 5 seconds
      if (elapsed > 5000 && targetVal < 100) {
        setIsSlowNetwork(true);
        targetVal = 100; // Force completion so user is never stuck
      }

      // Smooth interpolation for 60fps continuous progress bar
      currentDisplayedVal += (targetVal - currentDisplayedVal) * 0.18;

      if (currentDisplayedVal >= 99.4) {
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
      }, 120);

      return () => clearTimeout(exitTimer);
    }
  }, [isLoaded, autoComplete, onComplete]);

  // Handle manual replay of splash animation
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
        scale: isExiting ? 1.04 : 1 
      }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center justify-center font-sans select-none overflow-hidden will-change-transform ${
        isStandalonePreview 
          ? 'fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-2 sm:p-6' 
          : 'w-full min-h-screen bg-slate-950'
      }`}
    >

      {/* TOP FLOATING CONTROL BAR (Only visible during preview or standalone mode) */}
      {(isStandalonePreview || !onComplete) && (
        <div className="absolute top-4 left-4 right-4 z-[110] flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl text-white text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-black tracking-wide uppercase text-[11px] text-emerald-400">
              AfriNova • Bafoussam Market
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg transition"
              title={isPhoneFrameMode ? "Passer en Plein Écran" : "Vue Smartphone Frame"}
            >
              {isPhoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">
                {isPhoneFrameMode ? (isFr ? 'Plein Écran' : 'Full Screen') : (isFr ? 'Format Smartphone' : 'Phone Frame')}
              </span>
            </button>

            <button
              onClick={handleReplay}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-slate-200 rounded-2xl cursor-pointer shadow-lg transition"
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

      {/* SMARTPHONE DEVICE WRAPPER */}
      <div 
        className={`relative transition-all duration-300 ease-out flex flex-col overflow-hidden shadow-2xl ${
          isPhoneFrameMode 
            ? 'w-full max-w-[420px] h-[92vh] max-h-[880px] rounded-[48px] border-[10px] border-slate-800/90 ring-1 ring-slate-700 shadow-[0_0_80px_rgba(22,163,74,0.25)]' 
            : 'w-full h-full min-h-screen rounded-none border-none ring-0'
        }`}
      >
        {/* AERIAL SUNRISE BACKGROUND IMAGE WITH LIGHT GRADIENT & BLUR */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={sunriseAerialBg}
            alt="Vue Aérienne Bafoussam Lever du Soleil"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 filter blur-[1.5px] brightness-[0.85] contrast-[1.05]"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-slate-950/75 to-blue-950/90" />
          
          {/* Decorative ambient light orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#4F46E5]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-10 w-64 h-64 bg-[#2563EB]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* TOP SMARTPHONE STATUS BAR */}
        <div className="relative z-30 px-7 pt-3 pb-1 flex items-center justify-between text-white text-[11px] font-extrabold tracking-tight shrink-0">
          <span>{currentTime || '08:30'}</span>
          
          {/* Dynamic Island Notch */}
          <div className="w-24 h-4 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-mono font-bold text-emerald-400">5G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* MAIN SPLASH SCREEN CONTENT */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-between px-6 pt-6 pb-8 text-center text-white">
          
          {/* TOP TAG / LOCATION & AFRINOVA BRAND BADGE */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 border border-emerald-500/40 backdrop-blur-md shadow-lg"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-300">
              AfriNova • Bafoussam • Cameroun
            </span>
          </motion.div>

          {/* CENTER BRANDING & AFRINOVA / BAFOUSSAM MARKET LOGO */}
          <div className="flex flex-col items-center my-auto space-y-5 max-w-sm">
            
            {/* ELEGANT LOGO WITH FADE-IN + ZOOM + GLOW AURA */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.04, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Outer Glowing Aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#10B981] rounded-[36px] blur-2xl opacity-75 group-hover:opacity-90 transition duration-500 animate-pulse" />

              {/* Glassmorphism Shield Card */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[36px] bg-gradient-to-b from-white/25 via-white/10 to-indigo-950/60 p-4 border border-white/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
                
                {/* Shopping Bag Vector Icon Design */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#4F46E5] via-[#2563EB] to-[#1d4ed8] rounded-[26px] p-3 shadow-inner flex flex-col items-center justify-center border border-indigo-300/40 overflow-hidden">
                  
                  {/* Shopping Bag Handles at top */}
                  <div className="absolute -top-1 w-12 h-6 border-2 border-white/90 rounded-t-full bg-transparent shadow-xs" />
                  
                  {/* Bag body accent sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />

                  {/* Letter "B" White Icon */}
                  <span className="text-5xl sm:text-6xl font-black text-white font-display tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] relative z-10 pt-2">
                    B
                  </span>

                  {/* Emerald Green bottom detail line */}
                  <div className="absolute bottom-1.5 w-10 h-1 bg-[#10B981] rounded-full shadow-sm" />
                </div>
              </div>
            </motion.div>

            {/* BRAND NAME */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-center gap-1.5 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Plateforme AfriNova</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display text-white drop-shadow-md">
                BAFOUSSAM
              </h1>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                MARKET
              </h1>
            </motion.div>

            {/* SLOGAN WITH PROGRESSIVE FADE-IN */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="space-y-2"
            >
              <p className="text-base sm:text-lg font-black text-amber-300 tracking-wide drop-shadow-xs">
                Tout Bafoussam à portée de clic !
              </p>

              <p className="text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed px-2 drop-shadow-xs">
                « La plateforme qui connecte les habitants, les commerçants, les entreprises et les prestataires de services de Bafoussam. »
              </p>
            </motion.div>

          </div>

          {/* BOTTOM SECTION: CONTINUOUS 60FPS PROGRESS BAR & NOTICE */}
          <div className="w-full space-y-3 pt-2">
            
            {/* Loading Bar Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                  {isLoaded ? (isFr ? 'Prêt à explorer' : 'Ready to Launch') : (isFr ? 'Chargement en cours' : 'Loading Super App')}
                </span>
                {!isLoaded && (
                  <div className="flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  </div>
                )}
              </div>
              <span className="font-mono text-emerald-400 font-extrabold">{progress}%</span>
            </div>

            {/* Glowing Deep Violet to Electric Blue to Emerald Progress Bar (60 FPS Hardware Accelerated) */}
            <div className="w-full h-2.5 bg-slate-900/80 border border-white/20 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981] rounded-full shadow-[0_0_15px_#2563EB] transition-all duration-75 ease-out will-change-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* DISCREET SLOW NETWORK / PREPARATION NOTICE (Appears if loading > 5 seconds) */}
            <AnimatePresence>
              {isSlowNetwork && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-indigo-950/80 border border-indigo-400/30 rounded-xl text-center text-indigo-200 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                  <span>{isFr ? 'Préparation de votre expérience…' : 'Preparing your experience…'}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ENTER APP BUTTON (Fallback manual click option) */}
            <AnimatePresence>
              {isLoaded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleEnterApp}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981] hover:from-indigo-600 hover:to-emerald-500 text-white font-black text-sm rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border border-white/20"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{isFr ? 'Entrer dans Bafoussam Market' : 'Enter Bafoussam Market'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* DISCREET FOOTER */}
            <div className="pt-1 text-center text-[10px] font-medium text-slate-300/80 space-y-0.5">
              <p className="font-mono uppercase tracking-widest text-[9.5px]">
                Version 1.0 • AfriNova Ecosystem
              </p>
              <p className="font-semibold text-white/90">
                © 2026 Bafoussam Market
              </p>
            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}
