import React, { useState, useEffect } from 'react';
import { GALLERY_PHOTOS } from '../data/lodgingData';
import { GalleryPhoto } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface PhotoGalleryProps {
  selectedPhotoId?: string | null;
  onCloseSelectedPhoto?: () => void;
  onOpenBooking: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  selectedPhotoId,
  onCloseSelectedPhoto,
  onOpenBooking,
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

  return (
    <section id="galeria" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galería Fotográfica Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Conocé Pasaje Montes por dentro y por fuera
          </h2>
          <p className="text-base text-slate-600">
            Fotografías directas de las instalaciones, comodidades y el maravilloso entorno del Dique de Cruz del Eje.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4D7080] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => {
            const globalIndex = GALLERY_PHOTOS.findIndex((p) => p.id === photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(globalIndex)}
                className="group relative bg-[#FBF8F3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60 cursor-pointer flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                  {photo.badge && (
                    <span className="absolute top-3 left-3 bg-[#4D7080]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">
                      {photo.badge}
                    </span>
                  )}

                  <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base leading-snug drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                      {photo.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {photo.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#4D7080] font-semibold">
                    <span>Ampliar fotografía</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-[#F8F6F0] rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-base font-bold text-slate-800">
              ¿Te gusta lo que ves? El departamento está listo para recibirte.
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Reservá con el 50% de seña por transferencia y asegurá tu descanso camino al lago.
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="shrink-0 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservar Ahora</span>
          </button>
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
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
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
              className="absolute left-2 sm:left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20"
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
              className="absolute right-2 sm:right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20"
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
              className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
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
