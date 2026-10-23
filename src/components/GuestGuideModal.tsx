import React, { useState } from 'react';
import {
  GUEST_GUIDE_DATA,
  GUEST_GUIDE_PDF_URL,
  DeliveryPlace,
} from '../data/guestGuideData';
import {
  X,
  BookOpen,
  FileText,
  Download,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  Flame,
  Tv,
  Zap,
  ShieldAlert,
  PhoneCall,
  Search,
  ExternalLink,
  MapPin,
  UtensilsCrossed,
  Info,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface GuestGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationCode?: string;
  guestName?: string;
}

export const GuestGuideModal: React.FC<GuestGuideModalProps> = ({
  isOpen,
  onClose,
  reservationCode,
  guestName,
}) => {
  const [activeTab, setActiveTab] = useState<'reglamento' | 'artefactos' | 'paseos' | 'deliverys'>(
    'reglamento'
  );
  const [foodSearch, setFoodSearch] = useState('');
  const [foodFilter, setFoodFilter] = useState<'all' | 'resto' | 'delivery' | 'heladeria' | 'panaderia'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleShareGuide = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + GUEST_GUIDE_PDF_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredPlaces = GUEST_GUIDE_DATA.diningAndDelivery.filter((place) => {
    const matchesFilter = foodFilter === 'all' || place.type === foodFilter;
    const matchesSearch =
      place.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      place.specialty.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#4D7080] text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Guía Oficial del Huésped</span>
              {reservationCode && (
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {reservationCode}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pasaje Montes · Guía de Estadía
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
              {guestName ? `¡Hola ${guestName}! ` : ''}Reglamento de convivencia, instrucciones de artefactos y recomendaciones gastronómicas y turísticas de Cruz del Eje.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GUEST_GUIDE_PDF_URL}
              download="Guia_Huesped_Pasaje_Montes.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20"
              title="Descargar PDF Original"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors"
              aria-label="Cerrar guía"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-start sm:justify-between overflow-x-auto shrink-0 gap-2 py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('reglamento')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'reglamento'
                  ? 'bg-white text-[#4D7080] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              📋 Estadía & Convivencia
            </button>
            <button
              onClick={() => setActiveTab('artefactos')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'artefactos'
                  ? 'bg-white text-[#4D7080] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              ⚡ Uso de Artefactos
            </button>
            <button
              onClick={() => setActiveTab('paseos')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'paseos'
                  ? 'bg-white text-[#4D7080] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              🗺️ Qué Conocer
            </button>
            <button
              onClick={() => setActiveTab('deliverys')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'deliverys'
                  ? 'bg-white text-[#4D7080] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              🍽️ Dónde Comer ({GUEST_GUIDE_DATA.diningAndDelivery.length})
            </button>
          </div>

          <a
            href={GUEST_GUIDE_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden text-xs font-bold text-[#4D7080] underline flex items-center gap-1 shrink-0 ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 bg-[#FBF8F3]">
          {/* TAB 1: REGLAMENTO & CONVIVENCIA */}
          {activeTab === 'reglamento' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Welcome box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>¡Bienvenid@s a Pasaje Montes!</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {GUEST_GUIDE_DATA.welcomeMessage}
                </p>
              </div>

              {/* Stay key details */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4D7080]" />
                  <span>Datos Clave de tu Estadía</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GUEST_GUIDE_DATA.stayDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        detail.highlight
                          ? 'bg-amber-50/90 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {detail.label}
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.value}</p>
                      <p className="text-xs text-slate-600 mt-1">{detail.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#4D7080]" />
                    <span>Reglamento de Convivencia</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Aceptación automática al reservar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {GUEST_GUIDE_DATA.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        rule.warning
                          ? 'bg-red-50/80 border-red-200 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          rule.warning ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-[#4D7080]'
                        }`}
                      >
                        {rule.warning ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rule.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTEFACTOS & SEGURIDAD */}
          {activeTab === 'artefactos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Important security & key alert */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Seguridad & Llave de Entrada</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                  {GUEST_GUIDE_DATA.securityTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Appliances list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#4D7080]" />
                  <span>Uso de Artefactos y Elementos del Departamento</span>
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {GUEST_GUIDE_DATA.applianceGuide.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl border ${
                        item.critical
                          ? 'bg-rose-50/70 border-rose-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            item.critical
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUÉ CONOCER EN CRUZ DEL EJE */}
          {activeTab === 'paseos' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs sm:text-sm text-slate-700">
                Cruz del Eje combina sierras, un gran embalse y una tradición olivícola centenaria. Te compartimos los puntos imprescindibles para tu estadía:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GUEST_GUIDE_DATA.placesToVisit.map((place, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D7080] bg-[#4D7080]/10 px-2 py-0.5 rounded-md">
                          {place.tag}
                        </span>
                        <MapPin className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{place.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{place.description}</p>
                    </div>

                    {place.phone && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">Visitas guiadas:</span>
                        <a
                          href={`tel:${place.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Llamar {place.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DÓNDE COMER & DELIVERYS */}
          {activeTab === 'deliverys' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Notice */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Recomendaciones de los propios comensales
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tocá el teléfono para llamar directamente o pedir por delivery.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  <button
                    onClick={() => setFoodFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      foodFilter === 'all'
                        ? 'bg-[#4D7080] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFoodFilter('resto')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      foodFilter === 'resto'
                        ? 'bg-[#4D7080] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Restó/Bodegón
                  </button>
                  <button
                    onClick={() => setFoodFilter('delivery')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      foodFilter === 'delivery'
                        ? 'bg-[#4D7080] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Delivery/Pizzas
                  </button>
                  <button
                    onClick={() => setFoodFilter('heladeria')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      foodFilter === 'heladeria'
                        ? 'bg-[#4D7080] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Helados
                  </button>
                </div>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Buscar pizza, sushi, hamburguesas, bodegón..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4D7080]"
                />
              </div>

              {/* Places grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlaces.map((place, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{place.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {place.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{place.specialty}</p>
                      {place.instagram && (
                        <p className="text-[11px] text-pink-600 font-medium mt-1">
                          IG: @{place.instagram}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {place.phoneDisplay}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${place.phone}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3 text-[#4D7080]" />
                          <span>Llamar</span>
                        </a>
                        <a
                          href={`https://wa.me/549${place.phone}?text=Hola,%20quisiera%20consultar%20por%20un%20pedido%20de%20comida.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPlaces.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron comercios con esa búsqueda.
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic text-center">
                Nota: Las calificaciones y direcciones exactas pueden cambiar; recomendamos confirmar horarios y zona de cobertura antes de pedir.
              </p>
            </div>
          )}

          {/* Warm closing note */}
          <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-center text-xs text-slate-600">
            {GUEST_GUIDE_DATA.closingMessage}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={GUEST_GUIDE_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir PDF en pestaña nueva</span>
            </a>

            <button
              onClick={handleShareGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace copiado!' : 'Copiar enlace al PDF'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4D7080] hover:bg-[#385563] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Entendido, cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
};
