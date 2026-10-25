import React, { useState } from 'react';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import { Reservation, DiscountCoupon } from '../types';
import { api, HostSettings } from '../services/api';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import {
  getAllUnavailableDates,
  checkRangeAvailability,
  formatFriendlyDate,
  getDaysDifference,
} from '../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  Sparkles,
  CreditCard,
  Copy,
  Check,
  Send,
  Download,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Ban,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Ticket,
  Tag,
  X,
} from 'lucide-react';
import { GuestGuideModal } from './GuestGuideModal';

interface BookingSystemProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number) => void;
  onReservationCreated: (reservation: Reservation) => void;
  existingReservations: Reservation[];
  hostSettings: HostSettings;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestsCount,
  setGuestsCount,
  onReservationCreated,
  existingReservations,
  hostSettings,
}) => {
  // Guest form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestDni, setGuestDni] = useState('');
  const [guestOrigin, setGuestOrigin] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('16:00 hs');
  const [specialRequests, setSpecialRequests] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // UI state
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Fechas & Precios, 2: Datos, 3: Confirmación
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepSuccessNotice, setStepSuccessNotice] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Calculate unavailable dates (excluding currently confirmed reservation so it doesn't conflict with itself)
  const otherReservations = existingReservations.filter(
    (r) => !confirmedReservation || r.id !== confirmedReservation.id
  );

  const unavailableDates = getAllUnavailableDates(
    otherReservations,
    hostSettings?.blockedDates || []
  );

  // Check if current date range is free of blocked dates
  const rangeCheck = checkRangeAvailability(checkInDate, checkOutDate, unavailableDates);
  const isRangeAvailable = rangeCheck.available;

  // Calculate nights safely using timezone-safe UTC difference
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = getDaysDifference(checkInDate, checkOutDate);
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const pricePerNight = hostSettings?.baseNightPrice || LODGING_INFO.baseNightPrice;
  const subtotal = nights * pricePerNight;

  // Bonus discount for 3 or more nights (from PDF page 5)
  const discountThreshold = LODGING_INFO.discountThresholdNights;
  const discountRate = hostSettings?.discountPercentage ?? LODGING_INFO.discountPercentage;
  const hasDiscount = nights >= discountThreshold;
  const discountPercentage = hasDiscount ? discountRate : 0;
  const stayDiscountAmount = hasDiscount ? Math.round((subtotal * discountPercentage) / 100) : 0;
  const priceAfterStayDiscount = subtotal - stayDiscountAmount;

  // Coupon discount calculation
  const couponDiscountAmount = appliedCoupon
    ? Math.round((priceAfterStayDiscount * appliedCoupon.discountPercentage) / 100)
    : 0;

  const totalDiscountAmount = stayDiscountAmount + couponDiscountAmount;
  const discountAmount = totalDiscountAmount;
  const totalPrice = Math.max(0, subtotal - totalDiscountAmount);
  const depositAmount = Math.round(totalPrice * (LODGING_INFO.depositPercentage / 100));
  const balanceDue = totalPrice - depositAmount;

  // Coupon handlers
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Por favor ingresá el código de tu cupón.');
      return;
    }
    const availableCoupons = hostSettings?.coupons || [];
    const matched = availableCoupons.find(
      (c) => c.code.trim().toUpperCase() === code && c.enabled !== false
    );

    if (matched) {
      setAppliedCoupon(matched);
      setCouponSuccess(`¡Cupón "${matched.code}" aplicado! Tenés un ${matched.discountPercentage}% de descuento.`);
      setCouponError(null);
    } else {
      setCouponError(`El cupón "${code}" no es válido o ya no se encuentra activo.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Step 1 validation with explicit user alerts
  const handleGoToStep2 = () => {
    if (!checkInDate) {
      setFormError('Por favor seleccioná la fecha de ingreso (check-in) en el calendario.');
      setStepSuccessNotice(null);
      return;
    }
    if (!checkOutDate) {
      setFormError('Por favor seleccioná la fecha de salida (check-out) en el calendario.');
      setStepSuccessNotice(null);
      return;
    }
    if (nights <= 0) {
      setFormError('La fecha de salida debe ser posterior a la fecha de ingreso.');
      setStepSuccessNotice(null);
      return;
    }
    if (!isRangeAvailable) {
      const conflictMsg = rangeCheck.conflictDate
        ? `El día ${formatFriendlyDate(rangeCheck.conflictDate)} ya se encuentra ocupado o reservado.`
        : 'Las fechas seleccionadas ya no se encuentran disponibles.';
      setFormError(`Elige una fecha que no esté ocupada: ${conflictMsg} Por favor seleccioná días disponibles marcados en verde en el calendario.`);
      setStepSuccessNotice(null);
      return;
    }

    setFormError(null);
    setStepSuccessNotice(
      `¡Fechas disponibles! El período del ${formatFriendlyDate(checkInDate)} al ${formatFriendlyDate(checkOutDate)} (${nights} noche${nights > 1 ? 's' : ''}) está libre. Avanzando al siguiente paso...`
    );
    setStep(2);

    const bookingEl = document.getElementById('reservas');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearDates = () => {
    setCheckInDate('');
    setCheckOutDate('');
    setFormError(null);
    setStepSuccessNotice('Fechas deseleccionadas. Podés elegir un nuevo rango en el calendario.');
    setTimeout(() => {
      setStepSuccessNotice((curr) =>
        curr?.includes('Fechas deseleccionadas') ? null : curr
      );
    }, 3000);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setFormError('Por favor completá nombre, teléfono / WhatsApp y correo electrónico.');
      setStepSuccessNotice(null);
      return;
    }

    if (!isRangeAvailable) {
      const conflictMsg = rangeCheck.conflictDate
        ? `El día ${formatFriendlyDate(rangeCheck.conflictDate)} ya se encuentra ocupado.`
        : 'Una o más fechas ya fueron reservadas.';
      setFormError(`Elige una fecha que no esté ocupada: ${conflictMsg}`);
      setStepSuccessNotice(null);
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const specialReqsWithCoupon = [
      specialRequests.trim(),
      appliedCoupon ? `[Cupón aplicado: ${appliedCoupon.code} (-${appliedCoupon.discountPercentage}%)]` : '',
    ].filter(Boolean).join(' | ');

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      code: `PM-${randomDigits}`,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      guestDni: guestDni.trim() || undefined,
      guestOrigin: guestOrigin.trim() || undefined,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guestsCount,
      estimatedArrival,
      specialRequests: specialReqsWithCoupon || undefined,
      pricePerNight,
      subtotal,
      discountAmount: totalDiscountAmount,
      discountPercentage: hasDiscount ? discountPercentage : 0,
      couponCode: appliedCoupon?.code,
      couponDiscount: couponDiscountAmount,
      totalPrice,
      depositAmount,
      balanceDue,
      status: 'pendiente_sena',
      createdAt: new Date().toISOString(),
    };

    const savedReservation = await api.createReservation(newReservation);
    setConfirmedReservation(savedReservation);
    onReservationCreated(savedReservation);
    setFormError(null);
    setStepSuccessNotice(
      `¡Paso realizado correctamente! Tu reserva con código ${savedReservation.code} ha sido registrada con éxito en la base de datos.`
    );
    setStep(3);

    const bookingEl = document.getElementById('reservas');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const generateWhatsAppMessage = (res: Reservation) => {
    const text = `¡Hola Rodrigo! Acabo de registrar una solicitud de reserva en la web de Pasaje Montes:

📌 *Código:* ${res.code}
👤 *Huésped:* ${res.guestName}
📅 *Ingreso:* ${res.checkIn} (14:00 a 20:00hs)
📅 *Salida:* ${res.checkOut} (10:00hs)
🌙 *Estadía:* ${res.nights} noche(s) para ${res.guestsCount} persona(s)
💰 *Total:* ${formatCurrency(res.totalPrice)}${res.couponCode ? ` (Cupón ${res.couponCode}: -${formatCurrency(res.couponDiscount || 0)})` : ''}
💳 *Seña 50%:* ${formatCurrency(res.depositAmount)}
🕒 *Llegada estimada:* ${res.estimatedArrival}
${res.specialRequests ? `📝 *Observaciones:* ${res.specialRequests}` : ''}

Te escribo para enviar el comprobante de transferencia y confirmar la reserva.`;

    return `https://wa.me/${LODGING_INFO.phoneRaw}?text=${encodeURIComponent(text)}`;
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const resetForm = () => {
    setCheckInDate('');
    setCheckOutDate('');
    setStep(1);
    setConfirmedReservation(null);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestDni('');
    setGuestOrigin('');
    setSpecialRequests('');
    setFormError(null);
    setStepSuccessNotice(null);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  return (
    <section id="reservas" className="py-20 bg-white scroll-mt-20 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D7080]/10 text-[#4D7080] text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Sistema de Reservas en Línea</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Reservá tu estadía en Pasaje Montes
          </h2>
          <p className="text-base text-slate-600">
            Consultá el calendario de disponibilidad en tiempo real. Congelá tu fecha con solo el 50% de seña por transferencia.
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex items-center justify-center max-w-lg mx-auto mb-10">
          <div className="flex items-center w-full">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                step >= 1 ? 'bg-[#4D7080] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 2 ? 'bg-[#4D7080]' : 'bg-slate-200'
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                step >= 2 ? 'bg-[#4D7080] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 3 ? 'bg-[#4D7080]' : 'bg-slate-200'
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step Success Alert (shows when dates are available or step completes) */}
        {stepSuccessNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">¡Paso realizado correctamente!</p>
              <p className="text-xs text-emerald-800 mt-0.5">{stepSuccessNotice}</p>
            </div>
          </div>
        )}

        {/* Error / Conflict Alert */}
        {formError && step !== 3 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Atención con la reserva</p>
              <p className="text-xs text-red-700 mt-0.5">{formError}</p>
            </div>
          </div>
        )}

        {/* Unavailability conflict banner (only on Step 1 when choosing dates) */}
        {step === 1 && !confirmedReservation && checkInDate && checkOutDate && !isRangeAvailable && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-start gap-3 shadow-xs">
            <Ban className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">⚠️ Fechas no disponibles para hospedaje</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Elige una fecha que no esté ocupada: El día <strong>{rangeCheck.conflictDate ? formatFriendlyDate(rangeCheck.conflictDate) : ''}</strong> ya se encuentra bloqueado o reservado por otro huésped. Por favor elegí días libres en verde en el calendario.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Fechas & Cotización */}
        {step === 1 && (
          <div className="bg-[#FBF8F3] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Visual Calendar & Date Inputs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Paso 1: Calendario & Fechas</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {(checkInDate || checkOutDate) && (
                      <button
                        type="button"
                        onClick={handleClearDates}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        title="Deseleccionar fechas y elegir un nuevo rango"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Borrar selección</span>
                      </button>
                    )}
                    <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                      Tocá las fechas libres para elegirlas
                    </span>
                  </div>
                </div>

                {/* Interactive Visual Calendar */}
                <AvailabilityCalendar
                  checkInDate={checkInDate}
                  setCheckInDate={(date) => {
                    setCheckInDate(date);
                    setFormError(null);
                  }}
                  checkOutDate={checkOutDate}
                  setCheckOutDate={(date) => {
                    setCheckOutDate(date);
                    setFormError(null);
                  }}
                  unavailableDates={unavailableDates}
                  onClearSelection={handleClearDates}
                  onSelectionError={(msg) => {
                    setFormError(msg);
                    setStepSuccessNotice(null);
                  }}
                  onSelectionSuccess={(msg) => {
                    setStepSuccessNotice(msg);
                    setFormError(null);
                  }}
                />

                {/* Traditional Inputs for accessibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Check-in */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Ingreso (Check-in)</span>
                      <span className="text-[11px] text-[#4D7080] font-normal">14:00 a 20:00hs</span>
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setFormError(null);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                    />
                  </div>

                  {/* Check-out */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Salida (Check-out)</span>
                      <span className="text-[11px] text-[#4D7080] font-normal">Hasta 10:00hs</span>
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setFormError(null);
                      }}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Guests count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Cantidad de Huéspedes</span>
                    <span className="text-[11px] text-slate-500">Capacidad máxima: 3 personas</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestsCount(num)}
                        className={`py-2.5 px-3 rounded-xl border text-center font-bold text-sm transition-all ${
                          guestsCount === num
                            ? 'bg-[#4D7080] text-white border-[#4D7080] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-base">{num}</span>
                        <span className="block text-[10px] font-normal mt-0.5">
                          {num === 1 ? '1 persona' : `${num} personas`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo notification badge */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">
                      Beneficio por estadía prolongada:
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Al reservar 3 o más noches se aplica automáticamente una bonificación del {discountRate}% en el precio total.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-time Price Breakdown Box */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
                <div>
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Detalle de Cotización
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isRangeAvailable && nights > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Fechas Disponibles
                          </span>
                        ) : checkInDate && checkOutDate && !isRangeAvailable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <Ban className="w-3 h-3" /> Fechas Ocupadas
                          </span>
                        ) : null}
                        {(checkInDate || checkOutDate) && (
                          <button
                            type="button"
                            onClick={handleClearDates}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Borrar fechas seleccionadas"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Borrar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 mt-1">
                      {nights > 0 ? `${nights} Noche${nights > 1 ? 's' : ''}` : 'Seleccioná fechas'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tarifa: {formatCurrency(pricePerNight)} / noche
                    </p>
                  </div>

                  {nights > 0 ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({nights} noches)</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                      </div>

                      {hasDiscount && (
                        <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                          <span className="flex items-center gap-1 text-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            Bonificación 3+ noches ({discountPercentage}%)
                          </span>
                          <span>-{formatCurrency(stayDiscountAmount)}</span>
                        </div>
                      )}

                      {/* Espacio para Cupón de Descuento */}
                      <div className="pt-2 pb-1 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-purple-600" />
                            <span>¿Tenés un cupón de descuento?</span>
                          </label>
                          {appliedCoupon && (
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                            >
                              Quitar cupón
                            </button>
                          )}
                        </div>

                        {!appliedCoupon ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError(null);
                              }}
                              placeholder="Ingresá tu código"
                              className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Aplicar
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                              <div className="text-xs">
                                <span className="font-mono font-bold text-purple-950">
                                  {appliedCoupon.code}
                                </span>
                                <span className="ml-1.5 font-bold text-purple-700">
                                  (-{appliedCoupon.discountPercentage}% OFF)
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-purple-900">
                              -{formatCurrency(couponDiscountAmount)}
                            </span>
                          </div>
                        )}

                        {couponError && (
                          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 shrink-0" />
                            <span>{couponSuccess}</span>
                          </p>
                        )}
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-purple-700 font-semibold bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 text-xs">
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3.5 h-3.5" />
                            Descuento Cupón {appliedCoupon.code} ({appliedCoupon.discountPercentage}%)
                          </span>
                          <span className="font-bold">-{formatCurrency(couponDiscountAmount)}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                        <div>
                          <span className="text-base font-bold text-slate-900 block">Total Estadía:</span>
                          {totalDiscountAmount > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700">
                              ¡Ahorrás {formatCurrency(totalDiscountAmount)} en total!
                            </span>
                          )}
                        </div>
                        <span className="text-2xl font-black text-[#4D7080]">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>

                      {/* 50% deposit breakdown */}
                      <div className="mt-4 p-3.5 rounded-xl bg-[#F8F6F0] border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Seña del 50% (para reservar):</span>
                          <span className="text-emerald-700">{formatCurrency(depositAmount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Saldo restante al ingreso:</span>
                          <span>{formatCurrency(balanceDue)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Seleccioná fecha de ingreso y salida en el calendario para cotizar.
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleGoToStep2}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      nights > 0 && isRangeAvailable
                        ? 'bg-[#4D7080] hover:bg-[#375663] text-white hover:shadow-md'
                        : nights > 0 && !isRangeAvailable
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                        : 'bg-[#4D7080]/80 hover:bg-[#4D7080] text-white'
                    }`}
                  >
                    {nights <= 0 ? (
                      <span>Elegir fechas en el calendario para cotizar</span>
                    ) : !isRangeAvailable ? (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>Fechas Ocupadas (Clic para ver aviso)</span>
                      </>
                    ) : (
                      <>
                        <span>Continuar con mis datos</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                    {!isRangeAvailable
                      ? '⚠️ Una o más fechas seleccionadas están ocupadas. Elegí fechas libres en verde para avanzar.'
                      : nights <= 0
                      ? 'Hacé clic en el día de llegada y luego en el día de salida en el calendario.'
                      : '✓ Fechas disponibles. Hacé clic para completar tus datos y generar la reserva.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Datos del Huésped */}
        {step === 2 && (
          <form
            onSubmit={handleConfirmReservation}
            className="bg-[#FBF8F3] rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Paso 1 completado: Fechas disponibles</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Paso 2: Datos del Titular de la Reserva
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs text-slate-600 font-medium">
                      Estadía del {checkInDate} al {checkOutDate} ({nights} noche{nights > 1 ? 's' : ''}, {guestsCount} persona{guestsCount > 1 ? 's' : ''})
                    </p>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-bold text-slate-800">
                      Total: {formatCurrency(totalPrice)}
                    </span>
                    {appliedCoupon && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        <Ticket className="w-3 h-3" />
                        Cupón {appliedCoupon.code} (-{appliedCoupon.discountPercentage}% OFF)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormError(null);
                  }}
                  className="text-xs font-semibold text-[#4D7080] hover:underline cursor-pointer"
                >
                  ← Cambiar fechas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: Laura Martínez"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Ej: +54 9 351 123-4567"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Ej: laura@gmail.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    DNI / Pasaporte
                  </label>
                  <input
                    type="text"
                    value={guestDni}
                    onChange={(e) => setGuestDni(e.target.value)}
                    placeholder="Ej: 32.456.789"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ciudad o Localidad de Origen
                  </label>
                  <input
                    type="text"
                    value={guestOrigin}
                    onChange={(e) => setGuestOrigin(e.target.value)}
                    placeholder="Ej: Córdoba Capital, Rosario, Bs As..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario estimado de llegada
                  </label>
                  <select
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  >
                    <option value="14:00 hs">14:00 hs (Apertura Check-in)</option>
                    <option value="15:00 hs">15:00 hs</option>
                    <option value="16:00 hs">16:00 hs</option>
                    <option value="17:00 hs">17:00 hs</option>
                    <option value="18:00 hs">18:00 hs</option>
                    <option value="19:00 hs">19:00 hs</option>
                    <option value="20:00 hs">20:00 hs (Límite Check-in)</option>
                    <option value="A coordinar">A coordinar con Rodrigo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peticiones especiales o notas (opcional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Ej: Estaremos ingresando con camioneta en la cochera, llegaremos con un niño, etc."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-semibold"
                >
                  Volver a cotización
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>Generar Solicitud de Reserva</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Confirmación & Datos de Transferencia */}
        {step === 3 && confirmedReservation && (
          <div className="bg-[#FBF8F3] rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-300/80 print:p-0 print:border-none print:shadow-none animate-in fade-in duration-300">
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <FileCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#4D7080]">
                ¡Solicitud Registrada con Éxito!
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Código de Reserva: <span className="text-[#4D7080]">{confirmedReservation.code}</span>
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Para confirmar definitivamente tu lugar en Pasaje Montes, transferí el 50% de seña y enviale el comprobante a Rodrigo Sanz vía WhatsApp.
              </p>
            </div>

            {/* Voucher Details Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Titular</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{confirmedReservation.guestName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Fechas</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {confirmedReservation.checkIn} al {confirmedReservation.checkOut}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Estadía & Huéspedes</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {confirmedReservation.nights} noche(s) · {confirmedReservation.guestsCount} pers.
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Estadía</span>
                  <p className="text-sm font-black text-[#4D7080] mt-0.5">
                    {formatCurrency(confirmedReservation.totalPrice)}
                  </p>
                  {confirmedReservation.couponCode && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 mt-1">
                      <Ticket className="w-2.5 h-2.5" /> Cupón: {confirmedReservation.couponCode}
                      {confirmedReservation.couponDiscount ? ` (-${formatCurrency(confirmedReservation.couponDiscount)})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Bank Details Box */}
              <div className="bg-[#F8F6F0] rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#4D7080]" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Datos Bancarios para la Seña del 50% ({formatCurrency(confirmedReservation.depositAmount)})
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Seña: 50%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ALIAS CBU</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {BANK_DETAILS.alias}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.alias, 'alias')}
                      className="p-1.5 text-[#4D7080] hover:bg-slate-100 rounded-md transition-colors"
                      title="Copiar Alias"
                    >
                      {copiedField === 'alias' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CBU</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {BANK_DETAILS.cbu}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.cbu, 'cbu')}
                      className="p-1.5 text-[#4D7080] hover:bg-slate-100 rounded-md transition-colors"
                      title="Copiar CBU"
                    >
                      {copiedField === 'cbu' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">TITULAR</span>
                    <span className="font-bold text-slate-800">{BANK_DETAILS.titular}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">BANCO / ENTIDAD</span>
                    <span className="font-bold text-slate-800">{BANK_DETAILS.banco}</span>
                  </div>
                </div>
              </div>

              {/* Prominent Guía del Huésped Card */}
              <div className="bg-gradient-to-br from-[#4D7080]/10 via-[#4D7080]/5 to-amber-500/10 rounded-2xl p-5 sm:p-6 border border-[#4D7080]/25 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4D7080] text-white flex items-center justify-center shrink-0 shadow-md">
                    <BookOpen className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#4D7080] bg-[#4D7080]/15 px-2.5 py-0.5 rounded-full">
                        Importante para tu estadía
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Reglamento, Uso de Artefactos & Recomendaciones de Cruz del Eje
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                      Tené a mano las normas de convivencia, cómo activar la climatización, instrucciones del termotanque, qué conocer y los mejores lugares para comer o pedir delivery.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="w-full md:w-auto px-7 py-3.5 bg-[#4D7080] hover:bg-[#395663] text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 border border-[#4D7080] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>GUÍA DEL HUÉSPED</span>
                </button>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
              <a
                href={generateWhatsAppMessage(confirmedReservation)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar por WhatsApp con Rodrigo</span>
              </a>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>GUÍA DEL HUÉSPED</span>
              </button>

              <button
                onClick={handlePrintVoucher}
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir / Guardar Voucher</span>
              </button>

              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-3.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Hacer otra reserva
              </button>
            </div>

            {/* Interactive Guest Guide Modal */}
            <GuestGuideModal
              isOpen={isGuideOpen}
              onClose={() => setIsGuideOpen(false)}
              reservationCode={confirmedReservation.code}
              guestName={confirmedReservation.guestName}
            />
          </div>
        )}
      </div>
    </section>
  );
};
