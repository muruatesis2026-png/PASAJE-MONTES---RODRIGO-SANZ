import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  LayoutGrid,
  Car,
  Laptop,
  Flame,
  UtensilsCrossed,
  Sparkles,
  Maximize2,
  Calendar,
  Image as ImageIcon,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/lodgingData';
import { GalleryPhoto } from '../types';

interface ApartmentOverviewProps {
  onOpenBooking: () => void;
  selectedPhotoId?: string | null;
  onCloseSelectedPhoto?: () => void;
}

export const ApartmentOverview: React.FC<ApartmentOverviewProps> = ({
  onOpenBooking,
  selectedPhotoId,
  onCloseSelectedPhoto,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // If selectedPhotoId prop changes, open that photo in lightbox
  useEffect(() => {
    if (selectedPhotoId) {
      const idx = GALLERY_PHOTOS.findIndex((p) => p.id === selectedPhotoId);
      if (idx !== -1) {
        setLightboxIndex(idx);
      }
    }
  }, [selectedPhotoId]);

  const categories = [
    { id: 'all', label: 'Todas las fotos' },
    { id: 'dormitorio', label: 'Dormitorio' },
    { id: 'living', label: 'Living & Estar' },
    { id: 'cocina', label: 'Cocina Equipada' },
    { id: 'bano', label: 'Baño & Patio' },
    { id: 'exterior', label: 'Fachada & Cochera' },
    { id: 'entorno', label: 'Dique & Entorno' },
  ];

  const filteredPhotos =
    activeFilter === 'all'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((photo) => photo.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev! + 1) % GALLERY_PHOTOS.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev! - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const closeLightbox = () => {
    setLightboxIndex(null);
    if (onCloseSelectedPhoto) {
      onCloseSelectedPhoto();
    }
  };

  const currentPhoto: GalleryPhoto | null =
    lightboxIndex !== null ? GALLERY_PHOTOS[lightboxIndex] : null;

  const keyFeatures = [
    {
      icon: BedDouble,
      title: 'Sommier Matrimonial Queen + 1 Plaza',
      desc: 'Dormitorio amplio con sommier Queen de máxima calidad y sommier auxiliar. Ropa de cama y toallas incluidas.',
      tag: 'Hasta 3 personas',
    },
    {
      icon: LayoutGrid,
      title: '2 Ambientes Amplios & Patio Interno',
      desc: 'Estar-comedor integrado, baño completo con jabón de cuerpo y shampoo, y patio interno privado descubierto.',
      tag: 'Luz natural',
    },
    {
      icon: Car,
      title: 'Cochera Cubierta con Portón Corredizo',
      desc: 'Tu vehículo seguro y bajo techo dentro del predio. Portón corredizo con traba y vigilancia externa perimetral.',
      tag: 'Acceso directo',
    },
    {
      icon: Laptop,
      title: 'Fibra Óptica & Workspace Funcional',
      desc: 'Wi-Fi de excelente velocidad para home office o streaming, escritorio cómodo y Smart TV con aplicaciones.',
      tag: 'Conectividad',
    },
    {
      icon: Flame,
      title: 'Calefacción Gas Natural & Split Frío/Calor',
      desc: 'Termotanque a gas de alta recuperación para agua caliente continua y climatización para cualquier época del año.',
      tag: 'Todo el año',
    },
    {
      icon: UtensilsCrossed,
      title: 'Cocina Equipada & Infusiones',
      desc: 'Vajilla completa, heladera frigobar, microondas, pava eléctrica y surtido de té y café de bienvenida.',
      tag: 'Equipamiento',
    },
  ];

  return (
    <section id="departamento" className="py-16 bg-[#FBF8F3] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Departamento de Residencia Temporaria</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            El Departamento & Galería de Fotos
          </h2>
          <p className="text-base sm:text-lg text-[#375663] font-medium">
            Cómodo, luminoso y funcional para hasta 3 personas en Cruz del Eje.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Todos los ambientes en planta baja sin escaleras, con cochera techada privada, climatización continua y la calidez de tu propio hogar para descansar o trabajar.
          </p>
        </div>

        {/* Compact Key Features Grid (Conserves all information without duplicate photos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {keyFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#4D7080]/10 text-[#4D7080] group-hover:bg-[#4D7080] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#4D7080] transition-colors truncate">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-[#4D7080] bg-[#4D7080]/10 px-2 py-0.5 rounded-md">
                    {feat.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inner Anchor for #galeria links */}
        <div id="galeria" className="pt-2 scroll-mt-24">
          {/* Gallery Header & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#4D7080]" />
              <h3 className="text-xl font-bold text-slate-900">
                Fotografías Reales de Cada Espacio
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              {categories.map((cat) => {
                const isActive = activeFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#4D7080] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Photo Gallery Grid (No duplicates) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filteredPhotos.map((photo) => {
              const globalIndex = GALLERY_PHOTOS.findIndex((p) => p.id === photo.id);
              return (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(globalIndex)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/80 cursor-pointer flex flex-col"
                >
                  <div className="relative h-56 sm:h-60 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity"></div>

                    {photo.badge && (
                      <span className="absolute top-3 left-3 bg-[#4D7080]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                        {photo.badge}
                      </span>
                    )}

                    <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm sm:text-base leading-snug drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                        {photo.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {photo.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#4D7080] font-semibold">
                      <span>Click para ampliar foto</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Booking CTA Bar */}
          <div className="mt-8 bg-gradient-to-r from-[#4D7080] to-[#375663] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold">
                ¿Listo para disfrutar de Pasaje Montes?
              </h4>
              <p className="text-xs text-slate-200">
                Asegurá tu estadía con el 50% de seña por transferencia.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Fechas Disponibles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white py-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-[#4D7080] px-3 py-1 rounded-full">
                Foto {lightboxIndex + 1} de {GALLERY_PHOTOS.length}
              </span>
              <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
                {currentPhoto.title}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar vista ampliada"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image Container */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto overflow-hidden">
            <img
              src={currentPhoto.imageUrl}
              alt={currentPhoto.title}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
            />

            {/* Prev button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  (prev) => (prev! - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length
                );
              }}
              className="absolute left-2 sm:left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20 cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! + 1) % GALLERY_PHOTOS.length);
              }}
              className="absolute right-2 sm:right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20 cursor-pointer"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption & Action */}
          <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 text-white border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div>
              <h3 className="text-base font-bold text-emerald-300">{currentPhoto.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">{currentPhoto.description}</p>
            </div>

            <button
              onClick={() => {
                closeLightbox();
                onOpenBooking();
              }}
              className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Fechas</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
