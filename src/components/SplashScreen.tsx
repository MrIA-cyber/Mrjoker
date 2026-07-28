import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ShoppingBag, 
  MapPin, 
  X,
  Play,
  RotateCcw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

// Sunrise Bafoussam aerial generated background image
const sunriseAerialBg = '/src/assets/images/bafoussam_aerial_sunrise_1785224477926.jpg';

interface SplashScreenProps {
  onComplete?: () => void;
  isStandalonePreview?: boolean;
  onClosePreview?: () => void;
  lang?: Language;
  autoComplete?: boolean;
}

export default function SplashScreen({
  onComplete,
  isStandalonePreview = false,
  onClosePreview,
  lang = 'fr',
  autoComplete = true,
}: SplashScreenProps) {
  const isFr = lang === 'fr';

  // State for loading progress simulation (0 to 100%)
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(!isStandalonePreview && false);
  const [currentTime, setCurrentTime] = useState('');

  const startTimeRef = React.useRef<number>(Date.now());

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

  // Simulate progress bar loading animation (reaches 100% in ~2.8 seconds)
  useEffect(() => {
    setProgress(0);
    setIsLoaded(false);
    setIsExiting(false);
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          return 100;
        }
        // Smooth progression over ~2.8 seconds
        const step = Math.floor(Math.random() * 3) + 3;
        return Math.min(100, prev + step);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Guarantee minimum 3000ms display time, followed by fluid Fade + Zoom exit transition
  useEffect(() => {
    if (isLoaded && autoComplete && onComplete) {
      const elapsed = Date.now() - startTimeRef.current;
      const minDisplayTime = 3000; // 3 seconds minimum display
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      const exitTimer = setTimeout(() => {
        setIsExiting(true); // Smooth Fade + Scale zoom out

        const completeTimer = setTimeout(() => {
          onComplete();
        }, 450);

        return () => clearTimeout(completeTimer);
      }, remainingTime);

      return () => clearTimeout(exitTimer);
    }
  }, [isLoaded, autoComplete, onComplete]);

  // Handle manual replay of splash animation
  const handleReplay = () => {
    setProgress(0);
    setIsLoaded(false);
    setIsExiting(false);
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 3) + 3;
        return Math.min(100, prev + step);
      });
    }, 80);
  };

  const handleEnterApp = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else if (onClosePreview) {
        onClosePreview();
      }
    }, 450);
  };

  return (
    <motion.div 
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 1.05 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className={`relative flex items-center justify-center font-sans select-none overflow-hidden ${
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
              Bafoussam Market • Splash Screen 8K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg transition"
              title={isPhoneFrameMode ? "Passer en Plein Écran" : "Vue Smartphone Frame (9:19.5)"}
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

      {/* SMARTPHONE DEVICE WRAPPER (9:19.5 ASPECT RATIO MOCKUP OR FULLSCREEN) */}
      <div 
        className={`relative transition-all duration-500 ease-out flex flex-col overflow-hidden shadow-2xl ${
          isPhoneFrameMode 
            ? 'w-full max-w-[420px] h-[92vh] max-h-[880px] rounded-[48px] border-[10px] border-slate-800/90 ring-1 ring-slate-700 shadow-[0_0_80px_rgba(22,163,74,0.25)]' 
            : 'w-full h-full min-h-screen rounded-none border-none ring-0'
        }`}
      >
        {/* AERIAL SUNRISE BACKGROUND IMAGE WITH BLUR & DARK GRADIENT */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={sunriseAerialBg}
            alt="Vue Aérienne Bafoussam Lever du Soleil"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 filter blur-[2px] brightness-[0.85] contrast-[1.05]"
          />
          {/* Subtle dark gradient overlay for crystal-clear readability & ultra-premium depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-slate-950/70 to-blue-950/90" />
          
          {/* Decorative ambient light orbs matching official palette */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#4F46E5]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-10 w-64 h-64 bg-[#2563EB]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* TOP SMARTPHONE STATUS BAR (Time, Battery, Wifi, Dynamic Island) */}
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
        <div className="relative z-20 flex-1 flex flex-col items-center justify-between px-6 pt-8 pb-8 text-center text-white">
          
          {/* TOP TAG / LOCATION BADGE */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 border border-emerald-500/40 backdrop-blur-md shadow-lg"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-300">
              Bafoussam • Cameroun
            </span>
          </motion.div>

          {/* CENTER BRANDING & ORIGINAL SHOPPING BAG LOGO */}
          <div className="flex flex-col items-center my-auto space-y-6 max-w-sm">
            
            {/* ORIGINAL LOGO CONTAINER (Deep Violet to Electric Blue Bag with White "B" & Emerald Detail) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative group"
            >
              {/* Outer Glowing Pulse Aura with Violet, Electric Blue, and Emerald */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#10B981] rounded-[36px] blur-2xl opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse" />

              {/* Glassmorphism Shield Card */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[36px] bg-gradient-to-b from-white/25 via-white/10 to-indigo-950/60 p-4 border border-white/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
                
                {/* Shopping Bag Vector Icon Design */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#4F46E5] via-[#2563EB] to-[#1d4ed8] rounded-[26px] p-3 shadow-inner flex flex-col items-center justify-center border border-indigo-300/40 overflow-hidden">
                  
                  {/* Shopping Bag Handles at the top */}
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

            {/* BRAND NAME: BAFOUSSAM (White) / MARKET (Deep Violet to Electric Blue to Emerald Gradient) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display text-white drop-shadow-md">
                BAFOUSSAM
              </h1>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-display bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                MARKET
              </h1>
            </motion.div>

            {/* SLOGAN */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
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

          {/* BOTTOM SECTION: LOADING BAR & THREE ANIMATED DOTS */}
          <div className="w-full space-y-4 pt-4">
            
            {/* Loading Bar Header + 3 Dots */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                  {isLoaded ? (isFr ? 'Prêt à explorer' : 'Ready to Launch') : (isFr ? 'Chargement de la Super App' : 'Loading Super App')}
                </span>
                {/* 3 Animated Loading Dots */}
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

            {/* Glowing Deep Violet to Electric Blue to Emerald Progress Bar */}
            <div className="w-full h-2.5 bg-slate-900/80 border border-white/20 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-inner relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981] rounded-full shadow-[0_0_15px_#2563EB] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* ENTER APP BUTTON (Appears when progress reaches 100% or can be clicked immediately) */}
            <AnimatePresence>
              {isLoaded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleEnterApp}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981] hover:from-indigo-600 hover:to-emerald-500 text-white font-black text-sm rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border border-white/20"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{isFr ? 'Entrer dans Bafoussam Market' : 'Enter Bafoussam Market'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* DISCREET FOOTER */}
            <div className="pt-2 text-center text-[10px] font-medium text-slate-300/80 space-y-0.5">
              <p className="font-mono uppercase tracking-widest text-[9.5px]">
                Version 1.0
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
