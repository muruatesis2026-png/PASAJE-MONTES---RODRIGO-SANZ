import React from 'react';
import { LODGING_INFO } from '../data/lodgingData';
import { checkRangeAvailability } from '../utils/dateUtils';
import {
  Calendar,
  Users,
  Car,
  Wifi,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Ban,
} from 'lucide-react';

interface HeroProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number) => void;
  onSearchClick: () => void;
  onOpenBrochure: () => void;
  unavailableDates?: Set<string>;
}

export const Hero: React.FC<HeroProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestsCount,
  setGuestsCount,
  onSearchClick,
  onOpenBrochure,
  unavailableDates = new Set(),
}) => {
  const hasRangeSelected = Boolean(checkInDate && checkOutDate);
  const rangeCheck = checkRangeAvailability(checkInDate, checkOutDate, unavailableDates);
  const isConflict = hasRangeSelected && !rangeCheck.available;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#375663] via-[#4D7080] to-[#FBF8F3] pt-6 pb-20">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-emerald-300 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headings & Value Proposition */}
          <div className="lg:col-span-7 text-white space-y-6 pt-2 lg:pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium">
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>Benito Bracamonte 201 · Cruz del Eje, Córdoba</span>
            </div>

            <div className="space-y-2">
              <span className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-[#D8EBF3] block drop-shadow">
                Un descanso camino al lago
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Tu lugar para <span className="text-emerald-300 underline decoration-emerald-400/50 underline-offset-8">desconectar</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-slate-100 max-w-2xl leading-relaxed font-normal">
              Con la tranquilidad que necesitás y ambientes amenos para sentirte a gusto, el lugar te invita a un descanso placentero. A minutos del Dique de Cruz del Eje y de la Plaza 25 de Mayo.
            </p>

            {/* Quick feature pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-medium text-slate-100">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <Users className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Hasta 3 personas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <Car className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Cochera cubierta</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Wi-Fi veloz + TV</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <Flame className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Gas Natural & A/C</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Vigilancia externa</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Bonif. 3+ noches</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
            </div>
          </div>

          {/* Right Column: Featured Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white">
              {/* Main Image */}
              <div className="relative h-72 sm:h-84 overflow-hidden">
                <img
                  src="/photos/exterior_main_clean.jpg"
                  alt="Fachada de Pasaje Montes Alojamiento"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                <div className="absolute top-3 left-3 bg-[#375663]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-md border border-white/20">
                  Departamento de residencia temporaria
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-sm font-semibold tracking-wide text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Totalmente Equipado & Confort Asegurado
                  </p>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Sommier matrimonial Queen + individual de 1 plaza · Cochera cubierta privada
                  </p>
                </div>
              </div>

              {/* Sub-gallery strip */}
              <div className="grid grid-cols-3 p-2.5 gap-2 bg-[#F8F6F0]">
                <div className="relative rounded-lg overflow-hidden h-20 shadow-sm border border-slate-200">
                  <img
                    src="/photos/bedroom_clean.jpg"
                    alt="Sommier Queen"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded">
                    Dormitorio
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden h-20 shadow-sm border border-slate-200">
                  <img
                    src="/photos/living_clean.jpg"
                    alt="Living y TV"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded">
                    Living & TV
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden h-20 shadow-sm border border-slate-200">
                  <img
                    src="/photos/dique_clean.jpg"
                    alt="Dique de Cruz del Eje"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 bg-[#4D7080]/90 text-[9px] text-white px-1.5 py-0.5 rounded font-medium">
                    Dique (9 min)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Quick Search Floating Box */}
        <div className="mt-10 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4D7080] block mb-1">
                Cotizador Rápido en Línea
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Seleccioná tus fechas de estadía
              </h2>
            </div>

            <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Check-In */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ingreso (Check-in 14:00hs)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D7080] focus:border-transparent text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Check-Out */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Salida (Check-out 10:00hs)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D7080] focus:border-transparent text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Huéspedes (Máx. 3 pers.)
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D7080] focus:border-transparent text-slate-800 font-medium cursor-pointer"
                >
                  <option value={1}>1 persona (Sommier Queen)</option>
                  <option value={2}>2 personas (Sommier Queen)</option>
                  <option value={3}>3 personas (Queen + 1 Plaza)</option>
                </select>
              </div>
            </div>

            {/* Action CTA */}
            <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
              <button
                onClick={onSearchClick}
                className={`w-full md:w-auto px-6 py-3 font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer ${
                  isConflict
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#4D7080] hover:bg-[#375663] text-white'
                }`}
              >
                <span>
                  {isConflict
                    ? 'Ver Calendario Libre'
                    : hasRangeSelected
                    ? 'Cotizar y Reservar'
                    : 'Elegir Fechas en el Calendario'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isConflict && (
                <span className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Fecha ocupada o bloqueada
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
