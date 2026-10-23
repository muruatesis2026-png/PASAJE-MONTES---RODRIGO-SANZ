import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { LODGING_INFO } from '../data/lodgingData';
import {
  Phone,
  Calendar,
  Menu,
  X,
  FileText,
  Sparkles,
  MapPin,
  Tag,
  Gift,
  Percent,
  Flame,
  Heart,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { PromoBannerConfig } from '../types';

interface NavbarProps {
  onOpenBrochure: () => void;
  onOpenBooking: () => void;
  onOpenMyBooking: () => void;
  onOpenGuide?: () => void;
  onOpenAdmin?: () => void;
  promoBanner?: PromoBannerConfig;
}

function getBadgeStyles(theme?: string) {
  switch (theme) {
    case 'amber':
      return 'bg-amber-400/20 text-amber-200 border-amber-400/40';
    case 'blue':
      return 'bg-sky-400/20 text-sky-200 border-sky-400/40';
    case 'rose':
      return 'bg-rose-400/20 text-rose-200 border-rose-400/40';
    case 'purple':
      return 'bg-purple-400/20 text-purple-200 border-purple-400/40';
    case 'slate':
      return 'bg-slate-700/60 text-slate-200 border-slate-500/40';
    case 'emerald':
    default:
      return 'bg-[#4D7080] text-emerald-200 border-emerald-300/30';
  }
}

function renderPromoIcon(icon?: string) {
  const className = 'w-3 h-3 shrink-0';
  switch (icon) {
    case 'tag':
      return <Tag className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'percent':
      return <Percent className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'bell':
      return <Bell className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBrochure,
  onOpenBooking,
  onOpenMyBooking,
  onOpenGuide,
  onOpenAdmin,
  promoBanner,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'El Departamento', href: '#departamento' },
    { label: 'Galería de Fotos', href: '#galeria' },
    { label: 'Comodidades', href: '#comodidades' },
    { label: 'Tarifas & Condiciones', href: '#tarifas' },
    { label: 'Ubicación', href: '#ubicacion' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Banner */}
      <div className="bg-[#375663] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {promoBanner && promoBanner.enabled ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs transition-colors ${getBadgeStyles(
                  promoBanner.theme
                )}`}
              >
                {renderPromoIcon(promoBanner.icon)}
                <span>{promoBanner.badge}</span>
              </span>
              <span className="hidden sm:inline text-slate-200">
                {promoBanner.text}
              </span>
              <span className="sm:hidden text-slate-200">
                {promoBanner.mobileText || promoBanner.text}
              </span>
              {promoBanner.actionText && promoBanner.actionType && promoBanner.actionType !== 'none' && (
                promoBanner.actionType === 'whatsapp' ? (
                  <a
                    href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=${encodeURIComponent(
                      `Hola Rodrigo, te consulto por la promo "${promoBanner.badge}": ${promoBanner.text}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white underline underline-offset-2 transition-colors ml-1"
                  >
                    <span>{promoBanner.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={onOpenBooking}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white underline underline-offset-2 transition-colors ml-1 cursor-pointer"
                  >
                    <span>{promoBanner.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <span className="font-semibold text-white">Pasaje Montes</span>
              <span className="text-white/40">·</span>
              <span>Alojamiento temporario en Cruz del Eje, Córdoba</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-[11px] ml-auto">
            <a
              href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20te%20escribo%20desde%20la%20web%20de%20Pasaje%20Montes%20para%20consultar%20por%20disponibilidad.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rodrigo Sanz ({LODGING_INFO.phoneDisplay})</span>
            </a>
            <span className="text-white/30 hidden md:inline">|</span>
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="hidden md:inline hover:underline text-amber-200 hover:text-white font-semibold"
              >
                Guía del Huésped
              </button>
            )}
            <span className="text-white/30 hidden md:inline">|</span>
            <button
              onClick={onOpenMyBooking}
              className="hidden md:inline hover:underline text-slate-200 hover:text-white"
            >
              Consultar Mi Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#4D7080]/95 backdrop-blur-md shadow-lg py-2.5 border-b border-white/10'
            : 'bg-[#4D7080] py-3.5 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <Logo size={isScrolled ? 'sm' : 'md'} />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-100">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-white transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenBrochure}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors border border-white/15"
              title="Ver folleto en PDF"
            >
              <FileText className="w-4 h-4 text-slate-200" />
              <span>Folleto PDF</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-4 h-4" />
              <span>¡Reservá Hoy!</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-md"
            >
              Reservar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#375663] border-t border-white/10 px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2.5 rounded-lg text-slate-100 hover:text-white hover:bg-white/10 font-medium text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar en Línea (50% Seña)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBrochure();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium"
                >
                  <FileText className="w-4 h-4 text-slate-300" />
                  <span>Folleto PDF</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMyBooking();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium"
                >
                  <span>Mi Reserva</span>
                </button>
                {onOpenGuide && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenGuide();
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-300/30 rounded-lg font-bold"
                  >
                    <span>📖 Guía del Huésped (PDF & Normas)</span>
                  </button>
                )}
              </div>

              <a
                href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20te%20escribo%20desde%20la%20web%20de%20Pasaje%20Montes.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-300 hover:text-emerald-200 font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: {LODGING_INFO.phoneDisplay} (Rodrigo)</span>
              </a>

              <div className="flex justify-start items-center text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Benito Bracamonte 201 · Cruz del Eje
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
