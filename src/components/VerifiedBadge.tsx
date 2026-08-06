import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { AccountType } from '../types';

interface VerifiedBadgeProps {
  id?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isVerified?: boolean;
  role?: AccountType | string;
  certificationDate?: string;
  showText?: boolean;
  showFullBanner?: boolean;
}

export default function VerifiedBadge({ 
  id, 
  className = '', 
  size = 'sm', 
  isVerified = true, 
  role = 'vendeur',
  certificationDate,
  showText = true,
  showFullBanner = false
}: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // PROFIL STANDARD: Ne pas afficher de badge.
  if (!isVerified) {
    return null;
  }

  const badgeSizeClasses = size === 'sm' 
    ? "text-[9px] px-2 py-0.5" 
    : size === 'lg'
    ? "text-xs px-3 py-1"
    : "text-[10px] px-2.5 py-0.5";

  const formattedDate = certificationDate 
    ? new Date(certificationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : undefined;

  if (showFullBanner) {
    return (
      <div className={`inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-extrabold ${className}`}>
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <div>
          <span className="block font-black text-emerald-900 leading-tight">Afrinova Verified</span>
          <span className="block text-[10px] text-emerald-700 font-medium">
            Profil vérifié par Afrinova {formattedDate ? `• Certifié le ${formattedDate}` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block shrink-0 ${className}`}
      id={id}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className={`inline-flex items-center gap-1.5 font-black rounded-full tracking-wide select-none cursor-help border transition shadow-2xs hover:scale-105 bg-emerald-600 text-white border-emerald-700 ${badgeSizeClasses}`}
      >
        <span className="bg-white text-emerald-700 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black shrink-0 text-[9px] shadow-xs">
          ✓
        </span>
        {showText && <span>Afrinova Verified</span>}
      </button>

      {/* Tooltip indication "Profil vérifié par Afrinova" */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-950 text-white text-[11px] rounded-2xl shadow-2xl z-50 text-center font-medium normal-case leading-snug border border-emerald-500/40 pointer-events-none animate-fade-in"
          style={{ animationDuration: '150ms' }}
        >
          <div className="flex items-center justify-center gap-1.5 font-black text-emerald-400 mb-1 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Profil vérifié par Afrinova</span>
          </div>
          <p className="text-slate-300 text-[10px]">
            Identité, documents légaux et localisation officiellement authentifiés par Afrinova.
          </p>
          {formattedDate && (
            <span className="inline-block mt-1.5 text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              Certifié le {formattedDate}
            </span>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950"></div>
        </div>
      )}
    </div>
  );
}
