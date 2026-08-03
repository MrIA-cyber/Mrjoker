import React, { useState, useRef, useEffect } from 'react';
import { AccountType } from '../types';

interface VerifiedBadgeProps {
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
  isVerified?: boolean;
  role?: AccountType | string;
}

export default function VerifiedBadge({ id, className = '', size = 'sm', isVerified = true, role = 'vendeur' }: VerifiedBadgeProps) {
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

  const badgeSizeClasses = size === 'sm' 
    ? "text-[9px] px-1.5 py-0.5" 
    : "text-[10px] px-2 py-0.5";

  const checkSizeClasses = size === 'sm'
    ? "w-3 h-3 text-[7px]"
    : "w-3.5 h-3.5 text-[8px]";

  const getRoleLabel = () => {
    switch (role?.toLowerCase()) {
      case 'client':
        return 'Client Vérifié';
      case 'vendeur':
      case 'boutique':
        return 'Boutique Agréée';
      case 'entreprise':
        return 'Entreprise B2B';
      case 'prestataire':
        return 'Prestataire Certifié';
      case 'livreur':
        return 'Livreur Agréé';
      case 'admin':
        return 'Super Admin';
      default:
        return 'Vérifiée';
    }
  };

  const getRoleColor = () => {
    switch (role?.toLowerCase()) {
      case 'client':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'vendeur':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'entreprise':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'prestataire':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'livreur':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'admin':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-100/40';
    }
  };

  if (!isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-slate-400 bg-slate-100 rounded-full text-[9px] px-2 py-0.5 border border-slate-200 ${className}`}>
        En attente CNI
      </span>
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
        className={`inline-flex items-center gap-1 font-extrabold rounded-full uppercase tracking-wider select-none cursor-help border transition hover:opacity-90 ${getRoleColor()} ${badgeSizeClasses}`}
      >
        <span className="bg-current text-white rounded-full w-3 h-3 flex items-center justify-center font-black leading-none shrink-0 text-[8px]">
          ✓
        </span>
        <span>{getRoleLabel()}</span>
      </button>

      {/* Tooltip element */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-50 text-center font-medium normal-case leading-normal border border-slate-800 pointer-events-none animate-fade-in"
          style={{ animationDuration: '150ms' }}
        >
          Ce compte ({getRoleLabel()}) a été officiellement vérifié par l'équipe AfriNova (CNI, emplacement et activité validés).
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
