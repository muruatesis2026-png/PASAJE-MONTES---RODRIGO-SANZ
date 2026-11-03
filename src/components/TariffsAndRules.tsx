import React, { useState } from 'react';
import { LODGING_INFO } from '../data/lodgingData';
import {
  Clock,
  CreditCard,
  Sparkles,
  ShieldAlert,
  Users,
  CheckCircle2,
  ChevronDown,
  Info,
  CalendarCheck,
  Tag,
  MapPin,
  MessageCircle,
  ExternalLink,
  Store,
  Gift,
} from 'lucide-react';
import { CommercialPartnership } from '../types';

interface TariffsAndRulesProps {
  onOpenBooking: () => void;
  partnerships?: CommercialPartnership[];
}

export const TariffsAndRules: React.FC<TariffsAndRulesProps> = ({ onOpenBooking, partnerships = [] }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const conditions = [
    {
      title: 'Disponibilidad Flexible',
      subtitle: 'Para 1, 2 o 3 personas',
      desc: 'El departamento cuenta con sommier matrimonial Queen + individual de 1 plaza en 2 ambientes confortables.',
      icon: Users,
      badge: '1 a 3 huéspedes',
    },
    {
      title: 'Horarios de Registro',
      subtitle: 'Check-in: 14:00hs a 20:00hs',
      desc: 'Check-out hasta las 10:00hs. Horarios flexibles de ingreso previa coordinación con Rodrigo Sanz.',
      icon: Clock,
      badge: 'Ingreso puntual',
    },
    {
      title: 'Condición de Reserva',
      subtitle: '50% por transferencia bancaria',
      desc: 'Asegurás tu fecha mediante seña del 50%. El saldo restante se cancela al ingresar al departamento.',
      icon: CreditCard,
      badge: 'Seña 50%',
    },
    {
      title: 'Beneficio Adicional',
      subtitle: 'Bonificación en estadías de 3+ noches',
      desc: 'Al reservar 3 o más noches, obtenés una bonificación especial sobre el valor total de tu estadía.',
      icon: Sparkles,
      badge: 'Descuento automático',
    },
    {
      title: 'Cancelación por Fuerza Mayor',
      subtitle: 'Hasta 10 días antes con reintegro total',
      desc: 'Ante cualquier imprevisto de fuerza mayor, avisando con hasta 10 días de anticipación tenés reintegro del 100%.',
      icon: ShieldAlert,
      badge: 'Garantía 100%',
    },
  ];

  const faqs = [
    {
      q: '¿Cómo confirmo mi reserva de forma segura?',
      a: 'Completás el formulario con tus fechas deseadas, el cotizador calcula el 50% de seña y te proporciona el alias/CBU bancario. Al enviarnos el comprobante por WhatsApp a Rodrigo, tu fecha queda formalmente reservada.',
    },
    {
      q: '¿La cochera cubierta tiene costo adicional?',
      a: 'No, el uso de la cochera cubierta privada con portón corredizo está incluido sin cargo dentro de la tarifa de la estadía.',
    },
    {
      q: '¿Se proveen toallas y sábanas?',
      a: 'Sí, entregamos ropa de cama limpia, frazadas, almohadas de calidad y juegos de toallas y toallones para cada huésped.',
    },
    {
      q: '¿Qué tipo de calefacción y climatización posee?',
      a: 'Cuenta con calefacción a gas natural para un abrigo parejo y seguro en invierno, además de equipo de aire acondicionado split frío/calor y termotanque a gas de alto rendimiento.',
    },
    {
      q: '¿A qué distancia queda del Dique de Cruz del Eje y del centro?',
      a: 'El departamento está a solo 9 minutos del Dique Arturo Illia (por un bulevar con ciclovía ideal para caminar) y a 3 minutos de la Plaza 25 de Mayo (área gastronómica, heladerías y comercios).',
    },
  ];

  return (
    <section id="tarifas" className="py-20 bg-[#FBF8F3] scroll-mt-20 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Condiciones Claras & Transparentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tarifas y Condiciones
          </h2>
          <p className="text-lg text-[#375663] font-medium">
            Flexibilidad, buen precio y condiciones simples.
          </p>
          <p className="text-sm text-slate-600">
            Todo establecido con claridad desde el primer momento para que tu experiencia sea agradable de principio a fin.
          </p>
        </div>

        {/* 5 Conditions Cards from PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {conditions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-[#4D7080]/10 text-[#4D7080] rounded-xl">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs font-semibold text-[#4D7080] mt-0.5">{item.subtitle}</p>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Garantizado en Pasaje Montes</span>
                </div>
              </div>
            );
          })}

          {/* Direct CTA card */}
          <div className="bg-gradient-to-br from-[#4D7080] to-[#375663] rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Contacto Directo
              </span>
              <h3 className="text-xl font-bold">¿Tenés una consulta específica?</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Hablale directamente al anfitrión Rodrigo Sanz para consultar fechas particulares o estadías prolongadas.
              </p>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20tengo%20una%20consulta%20sobre%20las%20tarifas%20de%20Pasaje%20Montes.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs text-center block transition-colors"
              >
                Escribir a Rodrigo (+54 9 3549 52-4627)
              </a>
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl text-xs text-center block transition-colors"
              >
                Cotizar en el sistema online
              </button>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <Info className="w-5 h-5 text-[#4D7080]" />
            <h3 className="text-lg font-bold">Preguntas Frecuentes</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/70 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180 text-[#4D7080]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ALIANZAS Y DESCUENTOS - CONVENIOS CON COMERCIOS LOCALES */}
        <div id="alianzas" className="scroll-mt-24 mt-20 pt-16 border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Beneficios en la Ciudad de Cruz del Eje</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alianzas y Descuentos Comerciales
            </h3>
            <p className="text-sm sm:text-base text-[#375663] font-medium">
              Convenios exclusivos de Pasaje Montes con comercios locales para que ahorres y disfrutes más durante tu estadía.
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              Al confirmar tu reserva, presentás tu confirmación o código de estadía en los locales adheridos y accedés automáticamente a las promociones.
            </p>
          </div>

          {/* Cards Grid */}
          {partnerships && partnerships.filter((p) => p.enabled).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerships
                .filter((p) => p.enabled)
                .map((partnership) => {
                  const cleanWhatsapp = partnership.whatsapp ? partnership.whatsapp.replace(/\D/g, '') : '';
                  const waMessage = encodeURIComponent(
                    `Hola ${partnership.businessName}, soy huésped de Pasaje Montes y quisiera consultar por su beneficio "${partnership.discountText}".`
                  );

                  return (
                    <div
                      key={partnership.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 hover:shadow-md hover:border-emerald-300/80 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        {/* Header: Name & Category */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-semibold text-[#4D7080] uppercase tracking-wider block mb-1">
                              {partnership.category || 'Comercio Amigo'}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {partnership.businessName}
                            </h4>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                            <Store className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Discount Highlight Badge */}
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                          <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                            {partnership.discountText}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {partnership.details}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          {partnership.validHours && (
                            <div className="flex items-start gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#4D7080] shrink-0 mt-0.5" />
                              <span className="font-medium text-slate-700">{partnership.validHours}</span>
                            </div>
                          )}
                          {partnership.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#4D7080] shrink-0 mt-0.5" />
                              <span>{partnership.address}</span>
                            </div>
                          )}
                          {partnership.howToRedeem && (
                            <div className="flex items-start gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{partnership.howToRedeem}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                        {cleanWhatsapp ? (
                          <a
                            href={`https://wa.me/${cleanWhatsapp}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Consultar por WhatsApp</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center max-w-xl mx-auto border border-dashed border-slate-300">
              <Store className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Convenios en proceso de incorporación</p>
              <p className="text-xs text-slate-500 mt-1">
                Estamos coordinando nuevos beneficios con comercios de la ciudad. Consultale directamente al anfitrión Rodrigo para recomendaciones locales.
              </p>
            </div>
          )}

          {/* Invitation banner for local businesses */}
          <div className="mt-10 max-w-3xl mx-auto bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-slate-900">¿Tenés un comercio en Cruz del Eje?</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sumate a nuestra red de beneficios para que los huéspedes de Pasaje Montes conozcan tus productos y servicios.
              </p>
            </div>
            <a
              href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=${encodeURIComponent(
                'Hola Rodrigo, tengo un comercio en Cruz del Eje y me gustaría sumarme a la red de Alianzas y Descuentos de Pasaje Montes.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 bg-[#375663] hover:bg-[#2b444f] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>Coordinar Alianza</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
