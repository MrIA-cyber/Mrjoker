import React, { createContext, useContext, useState, useEffect } from 'react';

export type DeviceType = 'android' | 'iphone' | 'ipad' | 'android-tablet' | 'mac' | 'pc' | 'unknown';
export type DeviceCategory = 'mobile' | 'mobile-lg' | 'tablet' | 'desktop' | 'desktop-xl';
export type Orientation = 'portrait' | 'landscape';

export interface ResponsiveContextType {
  deviceType: DeviceType;
  deviceCategory: DeviceCategory;
  orientation: Orientation;
  width: number;
  height: number;
  pixelRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  recommendedGridCols: number;
}

function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  
  const isAndroid = /android/i.test(ua);
  const isIos = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isTabletScreen = Math.min(window.innerWidth, window.innerHeight) >= 600;

  if (isIos) {
    if (/ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'ipad';
    }
    return 'iphone';
  }

  if (isAndroid) {
    if (isTabletScreen || /tablet/i.test(ua)) {
      return 'android-tablet';
    }
    return 'android';
  }

  if (/macintosh|mac os x/i.test(ua)) {
    return 'mac';
  }

  if (/windows|linux/i.test(ua)) {
    return 'pc';
  }

  return 'unknown';
}

function getDeviceCategory(width: number): DeviceCategory {
  if (width < 640) return 'mobile';
  if (width < 768) return 'mobile-lg';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'desktop';
  return 'desktop-xl';
}

function getRecommendedGridCols(width: number): number {
  if (width < 480) return 1;
  if (width < 640) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  if (width < 1536) return 5;
  return 6;
}

const ResponsiveContext = createContext<ResponsiveContextType | null>(null);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveContextType>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const cat = getDeviceCategory(w);

    return {
      deviceType: detectDeviceType(),
      deviceCategory: cat,
      orientation: w > h ? 'landscape' : 'portrait',
      width: w,
      height: h,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isTouchDevice: typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,
      recommendedGridCols: getRecommendedGridCols(w)
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: any = null;

    const handleResize = () => {
      // Debounce window resize
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cat = getDeviceCategory(w);

        setResponsiveState({
          deviceType: detectDeviceType(),
          deviceCategory: cat,
          orientation: w > h ? 'landscape' : 'portrait',
          width: w,
          height: h,
          pixelRatio: window.devicePixelRatio || 1,
          isMobile: w < 768,
          isTablet: w >= 768 && w < 1024,
          isDesktop: w >= 1024,
          isTouchDevice: ('ontouchstart' in window || navigator.maxTouchPoints > 0),
          recommendedGridCols: getRecommendedGridCols(w)
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={responsiveState}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export function useResponsive(): ResponsiveContextType {
  const context = useContext(ResponsiveContext);
  if (!context) {
    // Fallback if rendered outside provider
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      deviceType: detectDeviceType(),
      deviceCategory: getDeviceCategory(w),
      orientation: w > h ? 'landscape' : 'portrait',
      width: w,
      height: h,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isTouchDevice: typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,
      recommendedGridCols: getRecommendedGridCols(w)
    };
  }
  return context;
}
