import React, { useState } from 'react';
import { BROCHURE_PAGES, LODGING_INFO } from '../data/lodgingData';
import { X, ChevronLeft, ChevronRight, Download, FileText, Calendar } from 'lucide-react';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const page = BROCHURE_PAGES[currentPage];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between text-white py-2">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm sm:text-base">
            Folleto Oficial {LODGING_INFO.name}
          </h3>
          <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
            Página {currentPage + 1} de {BROCHURE_PAGES.length}: {page.title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar folleto"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Viewer */}
      <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-auto overflow-hidden">
        <img
          src={page.image}
          alt={page.title}
          className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
        />

        {/* Prev */}
        <button
          onClick={() => setCurrentPage((prev) => (prev - 1 + BROCHURE_PAGES.length) % BROCHURE_PAGES.length)}
          className="absolute left-2 sm:left-4 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20 shadow-lg"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next */}
        <button
          onClick={() => setCurrentPage((prev) => (prev + 1) % BROCHURE_PAGES.length)}
          className="absolute right-2 sm:right-4 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-colors border border-white/20 shadow-lg"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip & Actions */}
      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 text-white border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
          {BROCHURE_PAGES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-14 w-10 shrink-0 rounded border overflow-hidden transition-all ${
                currentPage === idx
                  ? 'border-emerald-400 scale-105 shadow-md'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/assets/aistudio/001_-_HOSPEDAJE_PASAJE_MONTES_-_CRUZ_DEL_EJE_e5ead137.pdf"
            download="Folleto_Pasaje_Montes.pdf"
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
