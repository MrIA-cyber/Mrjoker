import React from 'react';

export type LogoVariant = 'horizontal' | 'icon' | 'dark' | 'light' | 'monochrome' | '4k';

interface AfriNovaLogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showSlogan?: boolean;
  customHeight?: number | string;
  customWidth?: number | string;
}

/**
 * Official AfriNova Flat Vector Logo
 * Features:
 * - Stylized African Continent integrated with modern letter 'A'
 * - Digital network nodes & simplified connection lines
 * - Golden upward growth arrow (#F59E0B)
 * - Emerald Green (#16A34A), Deep Navy Blue (#0F172A), White (#FFFFFF), Gold (#F59E0B)
 * - Official Slogan: "L'Afrique connectée au monde."
 */
export const AfriNovaLogo: React.FC<AfriNovaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSlogan = true,
  customHeight,
  customWidth,
}) => {
  // Size mapping for convenient usage
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-24',
    custom: '',
  };

  const isDarkBg = variant === 'dark' || variant === '4k';
  const isMono = variant === 'monochrome';
  const isIconOnly = variant === 'icon';

  // Colors
  const emerald = isMono ? 'currentColor' : '#16A34A';
  const navy = isMono ? 'currentColor' : (isDarkBg ? '#FFFFFF' : '#0F172A');
  const gold = isMono ? 'currentColor' : '#F59E0B';
  const nodeColor = isMono ? 'currentColor' : '#34D399';
  const sloganColor = isMono ? 'currentColor' : (isDarkBg ? '#94A3B8' : '#64748B');

  // App Icon only component
  if (isIconOnly) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto ${className}`}
        style={{ height: customHeight, width: customWidth }}
      >
        <defs>
          <linearGradient id="afrinova-icon-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="afrinova-emerald-grad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="afrinova-gold-grad" x1="50" y1="80" x2="75" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Rounded Container Box */}
        <rect width="100" height="100" rx="28" fill="url(#afrinova-icon-bg)" />
        <rect x="2" y="2" width="96" height="96" rx="26" stroke="#334155" strokeWidth="2" strokeOpacity="0.4" fill="none" />

        {/* Network Lines */}
        <path d="M 28 68 L 48 30 L 68 68" stroke="#334155" strokeWidth="3" strokeDasharray="3 3" opacity="0.6" />
        <path d="M 38 48 L 58 48" stroke="#334155" strokeWidth="2" opacity="0.6" />

        {/* Stylized 'A' + Africa Shape */}
        <path
          d="M 50 16 
             C 55 16, 68 28, 72 38 
             C 76 48, 70 58, 68 68 
             C 66 78, 55 84, 50 84 
             C 45 84, 34 78, 32 68 
             C 30 58, 24 48, 28 38 
             C 32 28, 45 16, 50 16 Z"
          fill="url(#afrinova-emerald-grad)"
          opacity="0.25"
        />

        {/* Modern Bold 'A' Geometry */}
        <path
          d="M 50 20 L 72 74 H 58 L 50 52 L 42 74 H 28 L 50 20 Z"
          fill="url(#afrinova-emerald-grad)"
        />
        {/* Inner 'A' Triangle Cutout */}
        <path d="M 50 36 L 55 48 H 45 L 50 36 Z" fill="#0F172A" />

        {/* Golden Upward Growth Arrow */}
        <path
          d="M 52 78 L 74 34 M 74 34 H 60 M 74 34 V 48"
          stroke="url(#afrinova-gold-grad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Digital Network Nodes */}
        <circle cx="50" cy="20" r="4" fill="#34D399" />
        <circle cx="28" cy="74" r="3.5" fill="#34D399" />
        <circle cx="72" cy="74" r="3.5" fill="#FBBF24" />
        <circle cx="50" cy="52" r="3" fill="#6EE7B7" />
        <circle cx="74" cy="34" r="4" fill="#F59E0B" />
      </svg>
    );
  }

  // Full Horizontal or Vertical / 4K / Dark / Light Logo
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Mark */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size] || 'h-10'} w-auto shrink-0`}
        style={{ height: customHeight, width: customWidth }}
      >
        <defs>
          <linearGradient id="afrinova-mark-emerald" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="afrinova-mark-gold" x1="40" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Stylized Africa Silhouette aura */}
        <path
          d="M 50 12 C 60 12, 75 25, 78 40 C 82 55, 72 70, 68 80 C 62 88, 52 90, 48 90 C 40 90, 32 82, 28 70 C 22 55, 20 40, 26 28 C 32 16, 42 12, 50 12 Z"
          fill={emerald}
          opacity={isMono ? 0.2 : 0.15}
        />

        {/* Modern Letter 'A' Structure */}
        <path
          d="M 50 18 L 74 78 H 60 L 52 56 H 48 L 40 78 H 26 L 50 18 Z"
          fill={isMono ? 'currentColor' : 'url(#afrinova-mark-emerald)'}
        />
        {/* Inner 'A' Counter */}
        <path
          d="M 50 34 L 55 48 H 45 L 50 34 Z"
          fill={isDarkBg ? '#0F172A' : '#FFFFFF'}
        />

        {/* Network Connection Lines */}
        <path d="M 26 78 L 50 18 L 74 78" stroke={navy} strokeWidth="2" strokeOpacity="0.3" />
        <path d="M 36 56 H 64" stroke={navy} strokeWidth="2" strokeOpacity="0.3" />

        {/* Golden Upward Growth Arrow */}
        <path
          d="M 48 82 L 78 30 M 78 30 H 62 M 78 30 V 46"
          stroke={isMono ? 'currentColor' : 'url(#afrinova-mark-gold)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Digital Network Nodes */}
        <circle cx="50" cy="18" r="4.5" fill={nodeColor} />
        <circle cx="26" cy="78" r="4" fill={nodeColor} />
        <circle cx="74" cy="78" r="4" fill={gold} />
        <circle cx="78" cy="30" r="4.5" fill={gold} />
      </svg>

      {/* Typography & Slogan */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span 
            className="font-black font-display tracking-tight text-[#0F172A] text-xl sm:text-2xl"
            style={{ color: navy }}
          >
            Afri<span style={{ color: emerald }}>Nova</span>
          </span>
          <span 
            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider text-white shadow-2xs"
            style={{ backgroundColor: emerald }}
          >
            TECH
          </span>
        </div>

        {showSlogan && (
          <p 
            className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap"
            style={{ color: sloganColor }}
          >
            « L'Afrique connectée au monde. »
          </p>
        )}
      </div>
    </div>
  );
};

export default AfriNovaLogo;
