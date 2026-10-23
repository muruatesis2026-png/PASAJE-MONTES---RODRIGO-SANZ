import React from 'react';
import { LODGING_INFO, NEARBY_POINTS } from '../data/lodgingData';
import { MapPin, Navigation, Compass, ExternalLink, Clock, Car } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Benito Bracamonte 201, Cruz del Eje, Córdoba, Argentina'
  )}`;

  return (
    <section id="ubicacion" className="py-20 bg-white scroll-mt-20 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Cruz del Eje, Córdoba</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ubicación Privilegiada
          </h2>
          <p className="text-lg text-[#375663] font-medium">
            Todas las comodidades que necesitás a minutos.
          </p>
          <p className="text-sm text-slate-600">
            Situado en una zona residencial tranquila y vistosa, con acceso rápido a las principales rutas, atractivos turísticos y el centro de la ciudad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Points of Interest & Distances */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FBF8F3] rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#4D7080] text-white rounded-2xl shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dirección Exacta
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Benito Bracamonte 201
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Cruz del Eje · Provincia de Córdoba · República Argentina
                  </p>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    Zona residencial tranquila y vistosa
                  </span>
                </div>
              </div>

              {/* Distances from PDF */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tiempos de Llegada y Distancias Clave
                </h4>

                <div className="space-y-2.5">
                  {NEARBY_POINTS.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{pt.name}</span>
                          <span className="text-[10px] text-slate-400">({pt.category})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{pt.desc}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-[#4D7080] bg-[#4D7080]/10 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {pt.time}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{pt.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#4D7080] hover:bg-[#375663] text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Cómo Llegar en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dique Card & Map Preview */}
          <div className="lg:col-span-6 space-y-6">
            {/* Dique Spotlight Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 group">
              <div className="h-64 sm:h-72 overflow-hidden relative">
                <img
                  src="/photos/dique_clean.jpg"
                  alt="Dique Arturo Illia Cruz del Eje"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#375663] text-xs font-bold px-3 py-1 rounded-full shadow">
                  A solo 9 min. de Pasaje Montes
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Atracción Imperdible
                  </span>
                  <h3 className="text-2xl font-black mt-1">Dique Arturo U. Illia</h3>
                  <p className="text-xs text-slate-200 mt-1 max-w-md">
                    El gran lago de Cruz del Eje. El bulevar de acceso cuenta con ciclovía y senda peatonal, ideal para caminatas al atardecer, mate y actividades náuticas.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Map / Interactive Map Frame */}
            <div className="bg-[#F8F6F0] rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#4D7080]" />
                  Mapa de la Zona y Accesos
                </span>
                <span className="text-slate-400">Ruta Nac. 38 · Cruz del Eje</span>
              </div>

              {/* Clean Map Container */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
                <iframe
                  title="Ubicación Pasaje Montes"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://maps.google.com/maps?q=Cruz%20del%20Eje,%20Cordoba&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Coordenadas de referencia: Benito Bracamonte 201, Cruz del Eje. Estacionamiento privado disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
