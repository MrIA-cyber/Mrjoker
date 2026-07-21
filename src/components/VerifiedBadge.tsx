import React, { useState, useRef, useEffect } from 'react';

interface VerifiedBadgeProps {
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ id, className = '', size = 'sm' }: VerifiedBadgeProps) {
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
        className={`inline-flex items-center gap-0.5 font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded-full uppercase tracking-wider select-none cursor-help border border-blue-100/40 dark:border-blue-900/40 transition hover:bg-blue-100/60 dark:hover:bg-blue-900/30 ${badgeSizeClasses}`}
      >
        <span className={`bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-black leading-none shrink-0 ${checkSizeClasses}`}>
          ✓
        </span>
        <span>Vérifiée</span>
      </button>

      {/* Tooltip element */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-xl shadow-xl z-50 text-center font-medium normal-case leading-normal border border-slate-800 dark:border-slate-700 pointer-events-none animate-fade-in"
          style={{ animationDuration: '150ms' }}
        >
          Cette boutique a été vérifiée par notre équipe (identité et activité confirmées).
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
}
