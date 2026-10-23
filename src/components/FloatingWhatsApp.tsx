import React, { useState } from 'react';
import { LODGING_INFO } from '../data/lodgingData';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="mb-3 max-w-xs bg-white text-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs relative animate-in fade-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2.5 pr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
            <div>
              <p className="font-bold text-slate-900">¿Consultas sobre tu estadía?</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Escribile a Rodrigo Sanz (+54 9 3549 52-4627) para una respuesta inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA */}
      <a
        href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20te%20contacto%20desde%20la%20web%20de%20Pasaje%20Montes.`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-108 transition-all transform active:scale-95 group border-2 border-white"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500 transition-transform group-hover:rotate-6" />
      </a>
    </div>
  );
};
