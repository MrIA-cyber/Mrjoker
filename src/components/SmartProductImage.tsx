import React, { useState, useEffect } from 'react';
import { getProductVerifiedImage } from '../utils/productImageValidator';
import { ShoppingBag, ImageOff } from 'lucide-react';

interface SmartProductImageProps {
  product: {
    id?: string;
    name?: string;
    category?: string;
    image?: string;
    images?: string[];
  };
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | 'square' | '16/9' | 'auto';
  containerClassName?: string;
  showHoverZoom?: boolean;
}

export default function SmartProductImage({
  product,
  alt,
  className = 'w-full h-full object-cover',
  aspectRatio = '4/3',
  containerClassName = '',
  showHoverZoom = true,
}: SmartProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    const verifiedUrl = getProductVerifiedImage(product);
    setImgSrc(verifiedUrl);
  }, [product.id, product.image, product.images, product.name]);

  const aspectClass = 
    aspectRatio === '4/3' ? 'aspect-[4/3]' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === '16/9' ? 'aspect-video' : '';

  // Neutral AfriNova Fallback if image fails to load or no image match exists
  if (hasError || !imgSrc) {
    return (
      <div 
        className={`w-full ${aspectClass} bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 flex flex-col items-center justify-center p-3 text-center rounded-xl overflow-hidden relative border border-slate-200/60 dark:border-slate-800/80 ${containerClassName}`}
        title={`${product.name || 'Produit'} - Image en attente`}
      >
        <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-sm shadow-sm mb-1.5 ring-2 ring-emerald-500/20">
          A
        </div>
        <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <ShoppingBag className="w-3 h-3 text-[#16A34A]" />
          <span>AfriNova</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
          Image en attente
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full ${aspectClass} relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center z-1">
          <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt || product.name || 'Produit AfriNova'}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`${className} ${showHoverZoom ? 'group-hover:scale-105 transition duration-300 ease-out' : ''}`}
      />
    </div>
  );
}
