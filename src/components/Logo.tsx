import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'header';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'header',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-28',
  };

  if (variant === 'light') {
    // For white backgrounds
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src="/photos/logo_brand.png"
          alt="Pasaje Montes - Alojamiento"
          className={`${sizeMap[size]} object-contain rounded-lg shadow-sm border border-[#4D7080]/20 bg-[#4D7080]`}
        />
        <div className="flex flex-col">
          <span className="font-handwriting text-2xl font-bold tracking-wide text-[#375663] leading-none">
            Pasaje Montes
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#4D7080] mt-0.5">
            Alojamiento
          </span>
          <span className="text-[9px] text-slate-500 font-medium">Cruz del Eje, Córdoba</span>
        </div>
      </div>
    );
  }

  // Header or dark context
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <img
          src="/photos/logo_brand.png"
          alt="Pasaje Montes - Alojamiento"
          className={`${sizeMap[size]} object-contain rounded-lg transition-transform group-hover:scale-105 border border-white/10 shadow-sm`}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-handwriting text-2xl font-bold tracking-wide text-white leading-none drop-shadow-sm">
          Pasaje Montes
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="h-[1px] w-3 bg-[#89B3C6]/60"></div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#E0EEF5]">
            Alojamiento
          </span>
          <div className="h-[1px] w-3 bg-[#89B3C6]/60"></div>
        </div>
        <span className="text-[9px] text-[#C1D7E3] font-light">Cruz del Eje · Depto. Temporario</span>
      </div>
    </div>
  );
};
