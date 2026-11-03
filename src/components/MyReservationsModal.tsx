import React, { useState } from 'react';
import { Reservation } from '../types';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  Printer,
  Download,
  FileCheck,
} from 'lucide-react';
import { GuestGuideModal } from './GuestGuideModal';
import { ReservationVoucherModal } from './ReservationVoucherModal';

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  isOpen,
  onClose,
  reservations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedGuideReservation, setSelectedGuideReservation] = useState<Reservation | null>(null);
  const [selectedVoucherReservation, setSelectedVoucherReservation] = useState<Reservation | null>(null);

  if (!isOpen) return null;

  const foundReservations = reservations.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return false;
    return (
      r.code.toLowerCase().includes(term) ||
      r.guestEmail.toLowerCase().includes(term) ||
      r.guestPhone.toLowerCase().includes(term) ||
      r.guestName.toLowerCase().includes(term)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Consultar Mi Reserva</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresá tu código de reserva (ej: PM-7842) o tu correo electrónico.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearched(false);
                }}
                placeholder="Código PM-XXXX, email o teléfono..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4D7080]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4D7080] hover:bg-[#375663] text-white text-sm font-bold rounded-xl transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>

          {/* Results */}
          <div className="mt-6 space-y-4">
            {searched && foundReservations.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No encontramos reservas con ese dato.</p>
                <p className="text-xs mt-1">
                  Verificá que el código o correo coincida exactamente con el de la solicitud.
                </p>
              </div>
            )}

            {foundReservations.map((res) => (
              <div
                key={res.id}
                className="bg-[#FBF8F3] rounded-2xl p-5 border border-slate-200 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Código de Reserva
                    </span>
                    <h4 className="text-lg font-black text-[#4D7080]">{res.code}</h4>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      res.status === 'confirmada'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : res.status === 'cancelada'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {res.status === 'confirmada'
                      ? '✓ Reserva Confirmada'
                      : res.status === 'cancelada'
                      ? '✕ Reserva Cancelada'
                      : '⏳ Pendiente de Seña (50%)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Huésped Titular</span>
                    <span className="font-bold text-slate-800">{res.guestName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-in</span>
                    <span className="font-bold text-slate-800">{res.checkIn} (14 a 20hs)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-out</span>
                    <span className="font-bold text-slate-800">{res.checkOut} (10hs)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Estadía</span>
                    <span className="font-bold text-slate-800">
                      {res.nights} noches · {res.guestsCount} pers.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Estadía</span>
                    <span className="font-bold text-slate-800">{formatCurrency(res.totalPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Seña (50%)</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(res.depositAmount)}</span>
                  </div>
                </div>

                {res.stayReason && (
                  <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">Motivo de estadía: </span>
                    <span>{res.stayReason}</span>
                  </div>
                )}

                {res.status === 'confirmada' && (
                  <div className="bg-emerald-50 border border-emerald-200/90 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950">
                          ¡Seña del 50% Confirmada! Lugar asegurado.
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Tu voucher oficial y comprobante definitivo ya está listo para imprimir o guardar.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedVoucherReservation(res)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / Guardar Voucher</span>
                    </button>
                  </div>
                )}

                {res.status === 'pendiente_sena' && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                    <p className="font-bold text-slate-800">
                      Recordá transferir la seña del 50% ({formatCurrency(res.depositAmount)}) a:
                    </p>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                      <span className="font-mono text-slate-700">Alias: {BANK_DETAILS.alias}</span>
                      <button
                        onClick={() => copyToClipboard(BANK_DETAILS.alias, 'alias')}
                        className="text-xs font-bold text-[#4D7080] hover:underline"
                      >
                        {copiedField === 'alias' ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}

                {res.status === 'cancelada' && (
                  <div className="bg-red-50 border border-red-200/90 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <p className="font-bold">Esta reserva fue cancelada en el sistema.</p>
                      <p className="text-[11px] text-red-700">Las fechas quedaron liberadas para otros huéspedes. Si tenés consultas o deseás volver a reservar, comunicate con Rodrigo por WhatsApp.</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVoucherReservation(res)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer ${
                      res.status === 'confirmada'
                        ? 'bg-[#4D7080] hover:bg-[#375663] text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                    title="Imprimir o guardar voucher y comprobante en PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{res.status === 'confirmada' ? 'Imprimir / Guardar Voucher' : 'Ver Comprobante Solicitud'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGuideReservation(res)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>GUÍA DEL HUÉSPED</span>
                  </button>

                  <a
                    href={`https://wa.me/${LODGING_INFO.phoneRaw}?text=Hola%20Rodrigo,%20consulto%20por%20mi%20reserva%20código%20${res.code}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Contactar a Rodrigo por WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Guide Modal */}
        {selectedGuideReservation && (
          <GuestGuideModal
            isOpen={!!selectedGuideReservation}
            onClose={() => setSelectedGuideReservation(null)}
            reservationCode={selectedGuideReservation.code}
            guestName={selectedGuideReservation.guestName}
          />
        )}

        {/* Official Printable Voucher Modal */}
        {selectedVoucherReservation && (
          <ReservationVoucherModal
            isOpen={!!selectedVoucherReservation}
            onClose={() => setSelectedVoucherReservation(null)}
            reservation={selectedVoucherReservation}
          />
        )}
      </div>
    </div>
  );
};
