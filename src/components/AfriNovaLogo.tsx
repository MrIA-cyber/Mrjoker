import React from 'react';

export type LogoVariant = 'horizontal' | 'vertical' | 'icon' | 'favicon' | 'dark' | 'light' | 'monochrome' | '4k';

export interface AfriNovaLogoProps {
  variant?: LogoVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showText?: boolean;
  showSlogan?: boolean;
  lang?: 'fr' | 'en';
  customHeight?: number | string;
  customWidth?: number | string;
}

/**
 * Official HD Vector Logo for AfriNova
 * Faithful to the official visual identity:
 * 1. Deep Navy Blue Africa Silhouette (#0F172A / #1E293B)
 * 2. Vibrant Emerald Green Letter "A" (#16A34A / #22C55E)
 * 3. Golden Ascending Growth Arrow (#F59E0B / #FBBF24)
 * 4. Luminous Digital Network Nodes & Connections across Africa
 * 5. Official Brand Typography: "Afri" in Deep Navy, "Nova" in Emerald Green
 * 6. Official Slogan: "L'Afrique connectée au monde." / "Africa connected to the world."
 */
export const AfriNovaLogo: React.FC<AfriNovaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showText = true,
  showSlogan = false,
  lang = 'fr',
  customHeight,
  customWidth,
}) => {
  // Height sizing presets
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
    '2xl': 'h-28',
    custom: '',
  };

  const isDarkBg = variant === 'dark' || variant === '4k';
  const isMono = variant === 'monochrome';
  const isIconOnly = variant === 'icon' || variant === 'favicon';
  const isVertical = variant === 'vertical';

  // Palette definitions
  const navyColor = isMono ? 'currentColor' : (isDarkBg ? '#FFFFFF' : '#0F172A');
  const africaMapColor = isMono ? 'currentColor' : (isDarkBg ? '#1E293B' : '#0F172A');
  const emeraldColor = isMono ? 'currentColor' : '#16A34A';
  const goldColor = isMono ? 'currentColor' : '#F59E0B';
  const nodeCyan = isMono ? 'currentColor' : '#38BDF8';
  const nodeEmerald = isMono ? 'currentColor' : '#34D399';
  const sloganTextColor = isMono ? 'currentColor' : (isDarkBg ? '#94A3B8' : '#64748B');

  const sloganText = lang === 'en' ? "Africa connected to the world." : "L'Afrique connectée au monde.";

  // High Definition SVG Vector Emblem
  const renderVectorMark = () => (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size] || 'h-10'} w-auto shrink-0 select-none transition-transform duration-300 transform hover:scale-[1.02]`}
      style={{ height: customHeight, width: customWidth }}
      aria-label="AfriNova Official Logo Symbol"
    >
      <defs>
        {/* Africa Continent Gradient */}
        <linearGradient id="afrinova-africa-grad" x1="15" y1="10" x2="105" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDarkBg ? "#1E293B" : "#0F172A"} />
          <stop offset="100%" stopColor={isDarkBg ? "#0F172A" : "#1E3A8A"} />
        </linearGradient>

        {/* Letter A Emerald Gradient */}
        <linearGradient id="afrinova-a-emerald" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Gold Arrow Gradient */}
        <linearGradient id="afrinova-gold-arrow" x1="45" y1="95" x2="98" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Subtle Glow Filter */}
        <filter id="afrinova-glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. SILHOUETTE DE LA CARTE DE L'AFRIQUE (Bleu nuit HD) */}
      <path
        d="M 58 12 
           C 66 12, 78 14, 84 18 
           C 90 22, 98 28, 96 36 
           C 94 44, 88 52, 85 60 
           C 82 68, 76 82, 66 94 
           C 61 100, 56 106, 52 106 
           C 48 106, 44 98, 40 92 
           C 35 84, 30 76, 25 66 
           C 20 56, 14 46, 18 36 
           C 22 26, 32 20, 42 16 
           C 48 14, 53 12, 58 12 Z"
        fill={isMono ? 'currentColor' : 'url(#afrinova-africa-grad)'}
        opacity={isMono ? 0.25 : 0.95}
        stroke={isDarkBg ? '#334155' : '#1E293B'}
        strokeWidth="1.5"
      />

      {/* Madagascar Detail */}
      <ellipse
        cx="92"
        cy="80"
        rx="3.5"
        ry="8"
        transform="rotate(-20 92 80)"
        fill={isMono ? 'currentColor' : 'url(#afrinova-africa-grad)'}
        opacity={0.85}
      />

      {/* 2. RÉSEAU NUMÉRIQUE & CONNEXIONS (Lignes et points) */}
      {/* Network Lines */}
      <g opacity={isMono ? 0.3 : 0.65} stroke={nodeCyan} strokeWidth="1.2" strokeDasharray="3 2">
        <path d="M 32 38 L 60 22 L 85 40" />
        <path d="M 32 38 L 52 62 L 85 40" />
        <path d="M 52 62 L 56 96" />
        <path d="M 85 40 L 92 80" />
        <path d="M 60 22 L 52 62" />
      </g>

      {/* 3. LE GRAND "A" VERT PLACÉ AU CENTRE */}
      {/* Outer Stem & Geometry of Letter 'A' */}
      <path
        d="M 60 20 L 88 92 H 72 L 65 68 H 55 L 48 92 H 32 L 60 20 Z"
        fill={isMono ? 'currentColor' : 'url(#afrinova-a-emerald)'}
        filter={variant === '4k' ? 'url(#afrinova-glow)' : undefined}
      />

      {/* Inner Triangle Cutout of Letter 'A' */}
      <path
        d="M 60 40 L 65 56 H 55 L 60 40 Z"
        fill={isDarkBg ? '#0F172A' : '#FFFFFF'}
      />

      {/* 4. LA FLÈCHE ASCENDANTE DORÉE INTÉGRÉE AU "A" */}
      {/* Diagonal Shaft & Arrowhead */}
      <g filter="url(#afrinova-glow)">
        {/* Shaft */}
        <path
          d="M 46 88 L 94 30"
          stroke={isMono ? 'currentColor' : 'url(#afrinova-gold-arrow)'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        <path
          d="M 78 28 L 96 28 L 96 46"
          stroke={isMono ? 'currentColor' : 'url(#afrinova-gold-arrow)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* 5. POINTS DE CONNEXIONS NUMÉRIQUES (Glowing Nodes) */}
      <circle cx="60" cy="20" r="4" fill={nodeEmerald} />
      <circle cx="32" cy="38" r="3.5" fill={nodeCyan} />
      <circle cx="85" cy="40" r="3.5" fill={nodeCyan} />
      <circle cx="52" cy="62" r="3" fill={nodeEmerald} />
      <circle cx="56" cy="96" r="3.5" fill={nodeEmerald} />
      <circle cx="96" cy="28" r="4.5" fill={goldColor} />
      <circle cx="92" cy="80" r="2.5" fill={nodeCyan} />
    </svg>
  );

  // Favicon or App Icon standard rendering
  if (isIconOnly) {
    if (variant === 'favicon') {
      return renderVectorMark();
    }

    return (
      <div className={`relative inline-flex items-center justify-center rounded-2xl p-2 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-700/50 shadow-md ${className}`}>
        {renderVectorMark()}
      </div>
    );
  }

  return (
    <div className={`inline-flex ${isVertical ? 'flex-col text-center' : 'items-center'} gap-2.5 select-none ${className}`}>
      {/* Vector Icon */}
      {renderVectorMark()}

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-black font-display tracking-tight text-xl sm:text-2xl">
              <span style={{ color: navyColor }}>Afri</span>
              <span style={{ color: emeraldColor }}>Nova</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          </div>

          {showSlogan && (
            <p
              className="text-[11px] sm:text-xs font-semibold tracking-tight mt-1 whitespace-nowrap"
              style={{ color: sloganTextColor }}
            >
              « {sloganText} »
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AfriNovaLogo;
