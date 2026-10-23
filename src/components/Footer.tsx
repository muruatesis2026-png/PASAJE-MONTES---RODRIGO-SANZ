import React from 'react';
import { Logo } from './Logo';
import { LODGING_INFO } from '../data/lodgingData';
import { Phone, Mail, MapPin, Calendar, Heart, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenBrochure: () => void;
  onOpenMyBooking: () => void;
  onOpenGuide?: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenBrochure,
  onOpenMyBooking,
  onOpenGuide,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#28414D] text-white border-t border-white/10">
      {/* Upper Footer: CTA Strip */}
      <div className="bg-[#375663] py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="font-handwriting text-2xl text-emerald-300">
              Un descanso camino al lago
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Listo para desconectar en Cruz del Eje?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Departamento de residencia temporaria moderno, confortable y totalmente equipado para hasta 3 personas.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>¡RESERVÁ HOY!</span>
            </button>

            <a
              href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20te%20contacto%20desde%20la%20web%20para%20consultar%20por%20Pasaje%20Montes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors text-sm flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Logo size="lg" />
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mt-3">
              Departamento de residencia temporaria pensado para quienes valoran la tranquilidad, el buen descanso, la conectividad y la cercanía al Dique de Cruz del Eje.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-300">
              <Shield className="w-4 h-4" />
              <span>Atención personalizada por su dueño · Rodrigo Sanz</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#A2C7D6]">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#departamento" className="hover:text-white transition-colors">
                  El Departamento
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-white transition-colors">
                  Galería de Fotos
                </a>
              </li>
              <li>
                <a href="#comodidades" className="hover:text-white transition-colors">
                  Comodidades & Confort
                </a>
              </li>
              <li>
                <a href="#tarifas" className="hover:text-white transition-colors">
                  Tarifas y Condiciones
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-white transition-colors">
                  Ubicación & Dique Illia
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBrochure}
                  className="hover:text-white transition-colors flex items-center gap-1 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Folleto Oficial (PDF)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMyBooking}
                  className="hover:text-white transition-colors text-left text-emerald-300 font-semibold"
                >
                  Consultar Mi Reserva
                </button>
              </li>
              {onOpenGuide && (
                <li>
                  <button
                    onClick={onOpenGuide}
                    className="hover:text-white transition-colors text-left text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>📖 Guía del Huésped</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Direct Contact from PDF */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#A2C7D6]">
              Contacto Directo
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Benito Bracamonte 201</span>
                  <span>Cruz del Eje, Córdoba, Argentina</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">3549 52-4627</span>
                  <span>Rodrigo Sanz</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${LODGING_INFO.email}`}
                  className="hover:text-white transition-colors"
                >
                  {LODGING_INFO.email}
                </a>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400">
              <p>Horario de atención: 08:00hs a 21:00hs</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} {LODGING_INFO.fullName}. Todos los derechos reservados.
            <button
              onClick={onOpenAdmin}
              className="ml-2 text-slate-500 hover:text-slate-400 opacity-20 hover:opacity-100 transition-opacity"
              title="Acceso exclusivo anfitrión"
            >
              🔒
            </button>
          </p>
          <p className="flex items-center gap-1">
            <span>Cruz del Eje, Córdoba · Un descanso camino al lago</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
