import React from 'react';
import { Reservation } from '../types';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  ShieldCheck,
  Send,
  Ticket,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { formatFriendlyDate } from '../utils/dateUtils';

interface ReservationVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export const ReservationVoucherModal: React.FC<ReservationVoucherModalProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  if (!isOpen || !reservation) return null;

  const isConfirmed = reservation.status === 'confirmada';
  const isCancelled = reservation.status === 'cancelada';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppShare = () => {
    const text = `Hola Rodrigo, te comparto el comprobante de mi reserva ${reservation.code} en Pasaje Montes:
Titular: ${reservation.guestName}
Fechas: ${reservation.checkIn} al ${reservation.checkOut} (${reservation.nights} noches)
Total: ${formatCurrency(reservation.totalPrice)}
Seña: ${formatCurrency(reservation.depositAmount)}`;
    return `https://wa.me/${LODGING_INFO.phoneRaw}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 print:max-h-none print:overflow-visible print:shadow-none print:border-none print:m-0 print:p-0">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 rounded-t-3xl print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">
              {isConfirmed ? 'Voucher Oficial de Estadía Confirmada' : 'Comprobante de Solicitud de Reserva'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              title="Imprimir o Guardar como PDF en tu dispositivo"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <a
              href={generateWhatsAppShare()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition-colors"
              title="Compartir por WhatsApp"
            >
              <Send className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Document Container */}
        <div id="voucher-printable-content" className="p-6 sm:p-10 space-y-6 text-slate-800 bg-white">
          
          {/* Voucher Header with Lodging Identity */}
          <div className="border-b-2 border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-handwriting text-3xl sm:text-4xl font-bold text-[#4D7080] block">
                Pasaje Montes
              </span>
              <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mt-0.5">
                Departamento de Residencia Temporaria · Cruz del Eje
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Benito Bracamonte 201, Cruz del Eje, Córdoba</span>
              </p>
            </div>

            <div className="text-left sm:text-right bg-[#FBF8F3] sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-slate-200 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Código de Reserva
              </span>
              <span className="font-mono text-2xl font-black text-[#4D7080] tracking-wider block">
                {reservation.code}
              </span>
              <span className="text-[11px] text-slate-400">
                Fecha emisión: {new Date(reservation.createdAt || Date.now()).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>

          {/* Official Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isConfirmed
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : isCancelled
                ? 'bg-red-50/90 border-red-300 text-red-950'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isConfirmed ? 'bg-emerald-600 text-white' : isCancelled ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {isConfirmed ? <CheckCircle2 className="w-6 h-6" /> : isCancelled ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wide">
                  {isConfirmed
                    ? '✓ Reserva Confirmada · Seña del 50% Acreditada'
                    : isCancelled
                    ? '✕ Reserva Cancelada · Fechas Liberadas'
                    : '⏳ Solicitud Registrada · Pendiente de Seña (50%)'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">
                  {isConfirmed
                    ? 'Tu lugar está 100% asegurado en Pasaje Montes. Presentá este voucher al ingresar.'
                    : isCancelled
                    ? 'Esta reserva fue cancelada en el sistema de Pasaje Montes y sus fechas quedaron liberadas.'
                    : 'Para congelar definitivamente tu fecha, transferí el 50% de seña y avisale a Rodrigo por WhatsApp.'}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                isConfirmed
                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                  : isCancelled
                  ? 'bg-red-200 text-red-900 border border-red-300'
                  : 'bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              {isConfirmed ? 'CONFIRMADO' : isCancelled ? 'CANCELADA' : 'PENDIENTE'}
            </span>
          </div>

          {/* Details Grid: Guest & Stay Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Guest Information */}
            <div className="bg-[#F8F6F0] p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D7080] block pb-1 border-b border-slate-200/80">
                Datos del Titular de la Reserva
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular:</span>
                  <span className="font-bold text-slate-900">{reservation.guestName}</span>
                </div>
                {reservation.guestDni && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">DNI / Identificación:</span>
                    <span className="font-semibold text-slate-900">{reservation.guestDni}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono / WhatsApp:</span>
                  <span className="font-semibold text-slate-900">{reservation.guestPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Correo Electrónico:</span>
                  <span className="font-semibold text-slate-900">{reservation.guestEmail}</span>
                </div>
                {reservation.guestOrigin && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ciudad de Origen:</span>
                    <span className="font-semibold text-slate-900">{reservation.guestOrigin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stay Dates & Timing */}
            <div className="bg-[#F8F6F0] p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D7080] block pb-1 border-b border-slate-200/80">
                Fechas & Horarios de Estadía
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha de Ingreso (Check-in):</span>
                  <span className="font-bold text-slate-900">{reservation.checkIn} (14:00 a 20:00 hs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha de Salida (Check-out):</span>
                  <span className="font-bold text-slate-900">{reservation.checkOut} (Hasta las 10:00 hs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cantidad de Noches:</span>
                  <span className="font-bold text-slate-900">{reservation.nights} noche{reservation.nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cantidad de Huéspedes:</span>
                  <span className="font-bold text-slate-900">{reservation.guestsCount} persona{reservation.guestsCount > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Llegada Estimada:</span>
                  <span className="font-semibold text-slate-900">{reservation.estimatedArrival || '16:00 hs'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Detalle Económico & Estado de Pago
              </span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({reservation.nights} noches x {formatCurrency(reservation.pricePerNight)}):</span>
                <span>{formatCurrency(reservation.subtotal)}</span>
              </div>

              {reservation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded">
                  <span>Bonificación por estadía prolongada:</span>
                  <span>-{formatCurrency(reservation.discountAmount)}</span>
                </div>
              )}

              {reservation.couponCode && (
                <div className="flex justify-between text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    Cupón aplicado ({reservation.couponCode}):
                  </span>
                  <span>-{formatCurrency(reservation.couponDiscount || 0)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-sm text-slate-900">
                <span>TOTAL ESTADÍA:</span>
                <span className="text-base text-[#4D7080]">{formatCurrency(reservation.totalPrice)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isConfirmed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase block">
                      Seña 50% {isConfirmed ? '(Acreditada)' : '(A Pagar)'}
                    </span>
                    <span className="font-bold text-sm">{formatCurrency(reservation.depositAmount)}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isConfirmed ? '✓ PAGADO' : 'PENDIENTE'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Saldo al Ingreso (Check-in)
                    </span>
                    <span className="font-bold text-sm text-slate-900">{formatCurrency(reservation.balanceDue)}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Abonar al llegar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observations if any */}
          {reservation.specialRequests && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-700">Observaciones del huésped: </span>
              {reservation.specialRequests}
            </div>
          )}

          {/* Important Arrival Instructions */}
          <div className="p-4 bg-[#FBF8F3] rounded-2xl border border-[#4D7080]/30 text-xs space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4D7080]" />
              <span>Instrucciones Importantes para el Ingreso:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>El check-in se realiza entre las 14:00 hs y las 20:00 hs en <strong>Benito Bracamonte 201</strong>, Cruz del Eje.</li>
              <li>Avisá a Rodrigo Sanz (3549 52-4627) 30 minutos antes de llegar para coordinar la entrega de llaves.</li>
              <li>El departamento cuenta con cochera cubierta privada sin costo adicional.</li>
              <li>El saldo restante se abona en efectivo o transferencia bancaria al momento del check-in.</li>
            </ul>
          </div>

          {/* Footer of the voucher */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Pasaje Montes · Rodrigo Sanz · Cruz del Eje, Córdoba</span>
            <span className="font-mono">Voucher generado en línea · Código {reservation.code}</span>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-3xl print:hidden">
          <p className="text-xs text-slate-500">
            {isConfirmed
              ? '✓ Tu voucher está listo. Podés imprimirlo en papel o guardarlo como archivo PDF.'
              : 'Podés imprimir este comprobante como constancia provisoria de tu solicitud.'}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#4D7080] hover:bg-[#375663] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
