import React, { useState, useEffect } from 'react';
import { Reservation, PromoBannerConfig, PromoBannerTheme, PromoBannerIcon } from '../types';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import { api, HostSettings, DEFAULT_PROMO_BANNER } from '../services/api';
import { formatDate, formatFriendlyDate, getAllUnavailableDates, getDaysDifference, addDays } from '../utils/dateUtils';
import { Logo } from './Logo';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Save,
  Check,
  Copy,
  Users,
  Settings,
  CalendarDays,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Ban,
  AlertTriangle,
  Megaphone,
  Sparkles,
  Tag,
  Gift,
  Percent,
  Heart,
  Flame,
  Bell,
  ArrowRight,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface HostDashboardPageProps {
  onBackToPublicSite: () => void;
}

const PROMO_THEME_OPTIONS: { id: PromoBannerTheme; label: string; chipClass: string; badgeClasses: string }[] = [
  { id: 'emerald', label: 'Verde Esmeralda', chipClass: 'bg-emerald-600', badgeClasses: 'bg-[#4D7080] text-emerald-200 border-emerald-300/30' },
  { id: 'amber', label: 'Dorado / Ámbar', chipClass: 'bg-amber-500', badgeClasses: 'bg-amber-400/20 text-amber-200 border-amber-400/40' },
  { id: 'blue', label: 'Azul Océano', chipClass: 'bg-sky-500', badgeClasses: 'bg-sky-400/20 text-sky-200 border-sky-400/40' },
  { id: 'purple', label: 'Púrpura Exclusivo', chipClass: 'bg-purple-600', badgeClasses: 'bg-purple-400/20 text-purple-200 border-purple-400/40' },
  { id: 'rose', label: 'Rosa Coral / Rubí', chipClass: 'bg-rose-500', badgeClasses: 'bg-rose-400/20 text-rose-200 border-rose-400/40' },
  { id: 'slate', label: 'Gris Pizarra / Neutro', chipClass: 'bg-slate-600', badgeClasses: 'bg-slate-700/60 text-slate-200 border-slate-500/40' },
];

const PROMO_ICON_OPTIONS: { id: PromoBannerIcon; label: string }[] = [
  { id: 'sparkles', label: '✨ Chispas / Destacado' },
  { id: 'tag', label: '🏷️ Etiqueta de Descuento' },
  { id: 'gift', label: '🎁 Regalo / Beneficio' },
  { id: 'percent', label: '% Porcentaje OFF' },
  { id: 'flame', label: '🔥 Oferta / Tendencia' },
  { id: 'heart', label: '❤️ Escapada / Relax' },
  { id: 'bell', label: '🔔 Anuncio Importante' },
];

const PROMO_PRESETS = [
  {
    title: '🌟 Promo 3+ Noches (Actual)',
    badge: 'Promo 3+ Noches',
    text: 'Al reservar 3 o más noches recibís una bonificación especial en el precio total.',
    mobileText: 'Bonificación especial a partir de 3 noches.',
    theme: 'emerald' as PromoBannerTheme,
    icon: 'sparkles' as PromoBannerIcon,
    actionText: 'Reservar ahora',
    actionType: 'booking' as const,
  },
  {
    title: '🏖️ Escapada Fin de Semana',
    badge: 'Escapada Finde',
    text: 'Desconectate en Cruz del Eje. Departamento completo con cochera cubierta y asador.',
    mobileText: 'Cochera techada y asador incluidos.',
    theme: 'amber' as PromoBannerTheme,
    icon: 'heart' as PromoBannerIcon,
    actionText: 'Ver fechas',
    actionType: 'booking' as const,
  },
  {
    title: '☀️ Temporada Verano / Relax',
    badge: 'Temporada Verano',
    text: '¡Aire acondicionado, WiFi veloz y comodidad absoluta! Asegurá tus fechas con tiempo.',
    mobileText: 'Aire acondicionado y comodidad absoluta.',
    theme: 'blue' as PromoBannerTheme,
    icon: 'flame' as PromoBannerIcon,
    actionText: 'Consultar',
    actionType: 'booking' as const,
  },
  {
    title: '🏷️ 15% OFF Reserva Directa',
    badge: '15% OFF Directo',
    text: 'Aprovechá 15% de descuento reservando de forma directa sin comisiones de intermediarios.',
    mobileText: '15% OFF reservando directo.',
    theme: 'purple' as PromoBannerTheme,
    icon: 'percent' as PromoBannerIcon,
    actionText: 'Aprovechar Promo',
    actionType: 'booking' as const,
  },
  {
    title: '💬 Atención Personalizada WhatsApp',
    badge: 'Atención Directa',
    text: '¿Dudas sobre tu estadía? Hablá directo con Rodrigo Sanz para tarifas a medida y grupos.',
    mobileText: 'Hablá directo con Rodrigo por WhatsApp.',
    theme: 'emerald' as PromoBannerTheme,
    icon: 'bell' as PromoBannerIcon,
    actionText: 'Escribir a Rodrigo',
    actionType: 'whatsapp' as const,
  },
  {
    title: '🎁 Estadía Prolongada (7+ Noches)',
    badge: 'Beneficio 7+ Noches',
    text: 'Tarifa súper preferencial para vacaciones o viajes de trabajo prolongados.',
    mobileText: 'Tarifa preferencial para 7+ noches.',
    theme: 'rose' as PromoBannerTheme,
    icon: 'gift' as PromoBannerIcon,
    actionText: 'Consultar tarifa',
    actionType: 'whatsapp' as const,
  },
];

function renderPreviewIcon(icon?: string) {
  const className = 'w-3.5 h-3.5 shrink-0';
  switch (icon) {
    case 'tag':
      return <Tag className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'percent':
      return <Percent className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'bell':
      return <Bell className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

export const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ onBackToPublicSite }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pasaje_montes_host_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Dashboard Data State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<HostSettings>({
    baseNightPrice: 45000,
    hostPin: '2026',
    blockedDates: [],
    discountPercentage: 12,
    promoBanner: DEFAULT_PROMO_BANNER,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservas' | 'nueva' | 'calendario' | 'promos' | 'configuracion'>('calendario');

  // Promo Banner state
  const [promoEnabled, setPromoEnabled] = useState(true);
  const [promoBadge, setPromoBadge] = useState('Promo 3+ Noches');
  const [promoText, setPromoText] = useState('Al reservar 3 o más noches recibís una bonificación especial en el precio total.');
  const [promoMobileText, setPromoMobileText] = useState('Bonificación especial a partir de 3 noches.');
  const [promoTheme, setPromoTheme] = useState<PromoBannerTheme>('emerald');
  const [promoIcon, setPromoIcon] = useState<PromoBannerIcon>('sparkles');
  const [promoActionText, setPromoActionText] = useState('Reservar ahora');
  const [promoActionType, setPromoActionType] = useState<'booking' | 'whatsapp' | 'none'>('booking');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [savingPromo, setSavingPromo] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente_sena' | 'confirmada' | 'cancelada'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications / copied state
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New manual booking form state
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newGuestsCount, setNewGuestsCount] = useState(2);
  const [newStatus, setNewStatus] = useState<Reservation['status']>('confirmada');
  const [newNotes, setNewNotes] = useState('');

  // Settings form state
  const [editPrice, setEditPrice] = useState(45000);
  const [editPin, setEditPin] = useState('2026');
  const [editDiscount, setEditDiscount] = useState(12);

  // Date blocking input range
  const [blockRangeStart, setBlockRangeStart] = useState('');
  const [blockRangeEnd, setBlockRangeEnd] = useState('');
  const [hostCalendarMonth, setHostCalendarMonth] = useState<Date>(new Date());

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resList, setts] = await Promise.all([api.getReservations(), api.getSettings()]);
      setReservations(resList);
      setSettings(setts);
      setEditPrice(setts.baseNightPrice);
      setEditPin(setts.hostPin);
      setEditDiscount(setts.discountPercentage);
      if (setts.promoBanner) {
        setPromoEnabled(setts.promoBanner.enabled ?? true);
        setPromoBadge(setts.promoBanner.badge || 'Promo 3+ Noches');
        setPromoText(setts.promoBanner.text || '');
        setPromoMobileText(setts.promoBanner.mobileText || '');
        setPromoTheme(setts.promoBanner.theme || 'emerald');
        setPromoIcon(setts.promoBanner.icon || 'sparkles');
        setPromoActionText(setts.promoBanner.actionText || '');
        setPromoActionType(setts.promoBanner.actionType || 'none');
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setPinError(null);
    try {
      const isValid = await api.verifyPin(pinInput.trim());
      if (isValid) {
        setIsAuthenticated(true);
        localStorage.setItem('pasaje_montes_host_auth', 'true');
      } else {
        setPinError('El PIN ingresado es incorrecto. (PIN predeterminado: 2026)');
      }
    } catch {
      setPinError('Error de verificación. Intentá nuevamente.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pasaje_montes_host_auth');
    setPinInput('');
  };

  const handleUpdateStatus = async (id: string, newStatus: Reservation['status']) => {
    try {
      const updated = await api.updateReservation(id, { status: newStatus });
      if (updated) {
        setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showTemporaryNotice(`Estado de la reserva actualizado a "${newStatus === 'confirmada' ? 'Confirmada' : newStatus}".`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReservation = async (id: string, code: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la reserva ${code}? Esta acción borrará el registro de la base de datos.`)) {
      return;
    }
    try {
      const ok = await api.deleteReservation(id);
      if (ok) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
        showTemporaryNotice(`Reserva ${code} eliminada de la base de datos.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings({
        baseNightPrice: Number(editPrice),
        hostPin: editPin.trim() || '2026',
        discountPercentage: Number(editDiscount),
      });
      setSettings(updated);
      showTemporaryNotice('Configuración y tarifas guardadas exitosamente en la base de datos.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromoBanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingPromo(true);
    try {
      const bannerPayload: PromoBannerConfig = {
        enabled: promoEnabled,
        badge: promoBadge.trim() || 'Promo Especial',
        text: promoText.trim() || 'Consultá nuestras promociones y beneficios exclusivos.',
        mobileText: promoMobileText.trim() || undefined,
        theme: promoTheme,
        icon: promoIcon,
        actionText: promoActionText.trim() || undefined,
        actionType: promoActionType,
      };

      const updated = await api.updateSettings({
        promoBanner: bannerPayload,
      });
      setSettings(updated);
      showTemporaryNotice('✓ Barra de promociones y beneficios guardada con éxito en la base de datos.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la barra de promociones.');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleApplyPreset = (preset: (typeof PROMO_PRESETS)[0]) => {
    setPromoBadge(preset.badge);
    setPromoText(preset.text);
    setPromoMobileText(preset.mobileText || '');
    setPromoTheme(preset.theme);
    setPromoIcon(preset.icon);
    setPromoActionText(preset.actionText || '');
    setPromoActionType(preset.actionType || 'none');
    setPromoEnabled(true);
    showTemporaryNotice(`Plantilla "${preset.title}" cargada en el formulario. Guardá para aplicarla.`);
  };

  // Toggle single date block via calendar click
  const handleToggleDateBlock = async (dateStr: string) => {
    const isCurrentlyBlocked = settings.blockedDates.includes(dateStr);
    let updatedDates: string[];

    if (isCurrentlyBlocked) {
      updatedDates = settings.blockedDates.filter((d) => d !== dateStr);
      showTemporaryNotice(`Fecha ${dateStr} desbloqueada (ahora libre en la web).`);
    } else {
      updatedDates = [...settings.blockedDates, dateStr].sort();
      showTemporaryNotice(`✓ Fecha ${dateStr} bloqueada. Ahora figura como ocupada en la página pública.`);
    }

    const updated = await api.updateSettings({ blockedDates: updatedDates });
    setSettings(updated);
  };

  // Block range of dates
  const handleBlockRange = async () => {
    if (!blockRangeStart || !blockRangeEnd) {
      alert('Por favor elegí fecha Desde y fecha Hasta.');
      return;
    }

    const diff = getDaysDifference(blockRangeStart, blockRangeEnd);
    if (diff < 0) {
      alert('La fecha Desde debe ser anterior o igual a la fecha Hasta.');
      return;
    }

    const newBlockedSet = new Set(settings.blockedDates);
    for (let i = 0; i <= diff; i++) {
      newBlockedSet.add(addDays(blockRangeStart, i));
    }

    const updatedDates = Array.from(newBlockedSet).sort();
    const updated = await api.updateSettings({ blockedDates: updatedDates });
    setSettings(updated);
    setBlockRangeStart('');
    setBlockRangeEnd('');
    showTemporaryNotice(`✓ Rango bloqueado exitosamente (${blockRangeStart} al ${blockRangeEnd}). Figuran ocupadas en la web.`);
  };

  const handleRemoveBlockedDate = async (dateStr: string) => {
    const updatedDates = settings.blockedDates.filter((d) => d !== dateStr);
    const updated = await api.updateSettings({ blockedDates: updatedDates });
    setSettings(updated);
    showTemporaryNotice(`Fecha ${dateStr} desbloqueada.`);
  };

  const handleClearAllBlockedDates = async () => {
    if (settings.blockedDates.length === 0) return;
    if (!window.confirm('¿Deseas desbloquear todas las fechas bloqueadas manualmente?')) return;
    const updated = await api.updateSettings({ blockedDates: [] });
    setSettings(updated);
    showTemporaryNotice('Todas las fechas bloqueadas manualmente fueron liberadas.');
  };

  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newCheckIn || !newCheckOut) {
      alert('Por favor completá nombre, fecha de check-in y fecha de check-out.');
      return;
    }

    const start = new Date(newCheckIn + 'T00:00:00');
    const end = new Date(newCheckOut + 'T00:00:00');
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const pricePerNight = settings.baseNightPrice;
    const subtotal = nights * pricePerNight;
    const hasDiscount = nights >= 3;
    const discountAmount = hasDiscount ? Math.round((subtotal * settings.discountPercentage) / 100) : 0;
    const totalPrice = subtotal - discountAmount;
    const depositAmount = Math.round(totalPrice * 0.5);
    const balanceDue = totalPrice - depositAmount;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const manualRes: Reservation = {
      id: `res-${Date.now()}`,
      code: `PM-${randomDigits}`,
      guestName: newGuestName.trim(),
      guestEmail: newGuestEmail.trim() || 'manual@pasajemontes.com',
      guestPhone: newGuestPhone.trim() || 'No especificado',
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nights,
      guestsCount: newGuestsCount,
      estimatedArrival: '16:00 hs',
      specialRequests: newNotes.trim() ? `[Cargada Manualmente]: ${newNotes.trim()}` : '[Cargada Manualmente por Rodrigo]',
      pricePerNight,
      subtotal,
      discountAmount,
      discountPercentage: hasDiscount ? settings.discountPercentage : 0,
      totalPrice,
      depositAmount,
      balanceDue,
      status: newStatus,
      createdAt: new Date().toISOString(),
    };

    const saved = await api.createReservation(manualRes);
    setReservations((prev) => [saved, ...prev]);
    setActiveTab('reservas');
    showTemporaryNotice(`¡Reserva ${saved.code} para ${saved.guestName} agregada con éxito!`);

    // Reset fields
    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestEmail('');
    setNewCheckIn('');
    setNewCheckOut('');
    setNewNotes('');
  };

  const showTemporaryNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Codigo',
      'Huesped',
      'Telefono',
      'Email',
      'DNI',
      'Origen',
      'Check-in',
      'Check-out',
      'Noches',
      'Huespedes',
      'Llegada',
      'Total',
      'Sena_50',
      'Saldo',
      'Estado',
      'Fecha_Creacion',
      'Notas',
    ];

    const rows = reservations.map((r) => [
      `"${r.code}"`,
      `"${r.guestName}"`,
      `"${r.guestPhone}"`,
      `"${r.guestEmail}"`,
      `"${r.guestDni || ''}"`,
      `"${r.guestOrigin || ''}"`,
      `"${r.checkIn}"`,
      `"${r.checkOut}"`,
      r.nights,
      r.guestsCount,
      `"${r.estimatedArrival}"`,
      r.totalPrice,
      r.depositAmount,
      r.balanceDue,
      `"${r.status}"`,
      `"${r.createdAt}"`,
      `"${(r.specialRequests || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reservas_Pasaje_Montes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTemporaryNotice('Archivo CSV descargado exitosamente.');
  };

  const handleCopyPrivateUrl = () => {
    const directUrl = `${window.location.origin}/anfitrion`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find if a date is booked by an active reservation
  const getBookingForDate = (dateStr: string): Reservation | undefined => {
    return reservations.find((r) => {
      if (r.status === 'cancelada') return false;
      return dateStr >= r.checkIn && dateStr < r.checkOut;
    });
  };

  // Filtered reservations
  const filteredReservations = reservations
    .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.guestEmail.toLowerCase().includes(q) ||
        r.guestPhone.toLowerCase().includes(q)
      );
    });

  // Host Financial Metrics
  const totalReservations = reservations.length;
  const confirmedList = reservations.filter((r) => r.status === 'confirmada');
  const pendingList = reservations.filter((r) => r.status === 'pendiente_sena');
  const totalIncomeExpected = confirmedList.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalDepositsReceived = confirmedList.reduce((acc, curr) => acc + curr.depositAmount, 0);
  const totalNightsBooked = confirmedList.reduce((acc, curr) => acc + curr.nights, 0);

  // 1. PIN LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#24424D] via-[#375663] to-[#1E3A45] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 text-slate-800">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-[#4D7080]/10 text-[#4D7080] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#4D7080]">
                Acceso Privado & Exclusivo
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Panel del Anfitrión
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Base de datos de reservas de {LODGING_INFO.fullName}.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>PIN de Seguridad</span>
                <span className="text-[11px] text-slate-400 font-normal">PIN inicial: 2026</span>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="Ingresá tu PIN (ej: 2026)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest font-bold focus:ring-2 focus:ring-[#4D7080] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  aria-label="Ver u ocultar PIN"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingAuth || !pinInput}
              className="w-full py-3.5 bg-[#4D7080] hover:bg-[#375663] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loadingAuth ? 'Verificando...' : 'Ingresar a mi Base de Datos'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={onBackToPublicSite}
              className="hover:text-slate-900 underline flex items-center gap-1"
            >
              ← Volver al sitio público
            </button>
            <span className="text-[10px] text-slate-400">Rodrigo Sanz</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper for calendar month display in host tab
  const hostYear = hostCalendarMonth.getFullYear();
  const hostMonth = hostCalendarMonth.getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const firstDayOfHostMonth = new Date(hostYear, hostMonth, 1);
  let hostStartDay = firstDayOfHostMonth.getDay() - 1;
  if (hostStartDay === -1) hostStartDay = 6;
  const daysInHostMonth = new Date(hostYear, hostMonth + 1, 0).getDate();

  // 2. AUTHENTICATED HOST DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Bar for Host */}
      <header className="bg-[#24424D] text-white py-3.5 px-4 sm:px-8 border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-handwriting text-2xl font-bold text-white leading-none">
                  Pasaje Montes
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  Base de Datos Privada
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Panel exclusivo del anfitrión: <strong>Rodrigo Sanz</strong> · Cruz del Eje
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Link to test public view */}
            <button
              onClick={onBackToPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
              title="Ir a la página pública para ver la disponibilidad"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Página Pública</span>
            </button>

            {/* Copy Secret Bookmark Link */}
            <button
              onClick={handleCopyPrivateUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 transition-colors"
              title="Copiar enlace directo para guardar en favoritos de tu teléfono o navegador"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Copiar Link Privado</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar sesión de anfitrión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Temporary Success Toast */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Reservas</span>
              <Users className="w-4 h-4 text-[#4D7080]" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalReservations}</p>
            <p className="text-[11px] text-slate-500">
              {confirmedList.length} confirmadas · {pendingList.length} pendientes
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase">
              <span>Señas Cobradas (50%)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalDepositsReceived)}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Dinero ingresado por transferencias
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Facturación Total</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrency(totalIncomeExpected)}
            </p>
            <p className="text-[11px] text-slate-500">
              {totalNightsBooked} noches reservadas en total
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Tarifa Activa</span>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-[#4D7080]">
              {formatCurrency(settings.baseNightPrice)}
            </p>
            <p className="text-[11px] text-slate-500">
              Por noche · Bonificación del {settings.discountPercentage}% (3+ noches)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calendario')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'calendario'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Bloquear Fechas ({settings.blockedDates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reservas')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'reservas'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Base de Datos ({reservations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('nueva')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'nueva'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Cargar Reserva Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Promos & Barra Superior</span>
              {promoEnabled ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Activa en la web"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" title="Oculta"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('configuracion')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'configuracion'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Precios & PIN</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToPublicSite}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <span>Probar en la Página Pública →</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CALENDARIO & BLOQUEO DE FECHAS (PRIORIDAD) */}
        {activeTab === 'calendario' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#4D7080]" />
                    <span>Control de Disponibilidad y Bloqueo de Fechas</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    Cada fecha que marques aquí como <strong>Bloqueada (Rojo)</strong> aparecerá <strong>inmediatamente como NO DISPONIBLE en la página web pública</strong>, impidiendo que cualquier persona la reserve.
                  </p>
                </div>

                <button
                  onClick={onBackToPublicSite}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verificar en la Web Pública</span>
                </button>
              </div>

              {/* Range Blocker Box */}
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#FBF8F3] border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-red-600" />
                  <span>Bloquear un Rango de Fechas (Varios días juntos)</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-auto flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Fecha Desde:
                    </label>
                    <input
                      type="date"
                      value={blockRangeStart}
                      onChange={(e) => setBlockRangeStart(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div className="w-full sm:w-auto flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Fecha Hasta:
                    </label>
                    <input
                      type="date"
                      value={blockRangeEnd}
                      min={blockRangeStart}
                      onChange={(e) => setBlockRangeEnd(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div className="w-full sm:w-auto shrink-0 sm:pt-5">
                    <button
                      type="button"
                      onClick={handleBlockRange}
                      disabled={!blockRangeStart || !blockRangeEnd}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                    >
                      Bloquear Rango en la Web
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Calendar Grid for Host */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 capitalize">
                      {monthNames[hostMonth]} {hostYear}
                    </span>
                    <span className="text-xs text-slate-400">
                      (Hacé clic en cualquier día para bloquearlo o liberarlo)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHostCalendarMonth(new Date(hostYear, hostMonth - 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHostCalendarMonth(new Date(hostYear, hostMonth + 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                    <span key={i} className="text-xs font-bold text-slate-400 py-1">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {/* Empty cells before month start */}
                  {Array.from({ length: hostStartDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16" />
                  ))}

                  {Array.from({ length: daysInHostMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dayDate = new Date(hostYear, hostMonth, dayNum);
                    const dayStr = formatDate(dayDate);
                    const isManuallyBlocked = settings.blockedDates.includes(dayStr);
                    const booking = getBookingForDate(dayStr);

                    return (
                      <div
                        key={dayStr}
                        onClick={() => handleToggleDateBlock(dayStr)}
                        className={`h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all cursor-pointer border ${
                          isManuallyBlocked
                            ? 'bg-red-500 text-white border-red-600 shadow-xs hover:bg-red-600'
                            : booking
                            ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                        }`}
                        title={
                          isManuallyBlocked
                            ? `Día ${dayStr}: Bloqueado manualmente. Clic para desbloquear.`
                            : booking
                            ? `Día ${dayStr}: Reservado por ${booking.guestName} (${booking.code})`
                            : `Día ${dayStr}: Disponible. Clic para bloquear.`
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{dayNum}</span>
                          {isManuallyBlocked && (
                            <Ban className="w-3.5 h-3.5 text-white" />
                          )}
                          {booking && (
                            <span className="text-[9px] font-bold bg-purple-700 text-white px-1 rounded">
                              {booking.code}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] leading-tight font-medium truncate">
                          {isManuallyBlocked ? (
                            <span className="font-bold">BLOQUEADO</span>
                          ) : booking ? (
                            <span>{booking.guestName.split(' ')[0]}</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Disponible</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300"></span>
                      <span>Disponible (clic para bloquear)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-red-500 text-white"></span>
                      <span className="font-bold text-red-600">Bloqueado por Rodrigo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-purple-200 border border-purple-400"></span>
                      <span>Ocupado por Reserva Web</span>
                    </div>
                  </div>

                  {settings.blockedDates.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllBlockedDates}
                      className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                    >
                      Desbloquear todas las fechas ({settings.blockedDates.length})
                    </button>
                  )}
                </div>
              </div>

              {/* List of blocked dates pills */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-3">
                  Listado de fechas bloqueadas activas ({settings.blockedDates.length}):
                </h4>

                {settings.blockedDates.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No tenés fechas bloqueadas actualmente. Todas las fechas libres aparecen como disponibles en la página.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.blockedDates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 text-xs font-bold"
                      >
                        <Ban className="w-3 h-3 text-red-500" />
                        <span>{formatFriendlyDate(d)}</span>
                        <button
                          onClick={() => handleRemoveBlockedDate(d)}
                          className="text-red-400 hover:text-red-900 ml-1 text-sm font-black"
                          title="Eliminar bloqueo"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESERVAS TABLE */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            {/* Table Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas ({reservations.length})
                </button>
                <button
                  onClick={() => setStatusFilter('confirmada')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'confirmada'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Confirmadas ({confirmedList.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pendiente_sena')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'pendiente_sena'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Pendientes ({pendingList.length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por código, huésped, teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D7080]"
                />
              </div>
            </div>

            {/* Reservations Cards / Table */}
            {filteredReservations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No se encontraron reservas con los filtros aplicados.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-[#FBF8F3]/60 hover:bg-[#FBF8F3] transition-colors space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm bg-[#4D7080] text-white px-2.5 py-1 rounded-lg">
                          {res.code}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{res.guestName}</h4>
                          <span className="text-xs text-slate-500">
                            {res.guestOrigin || 'Origen no especificado'} · DNI: {res.guestDni || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                            ? '✓ Seña Confirmada'
                            : res.status === 'cancelada'
                            ? 'Cancelada'
                            : '⏳ Pendiente de Seña'}
                        </span>

                        <button
                          onClick={() => handleDeleteReservation(res.id, res.code)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Período</span>
                        <span className="font-bold text-slate-800">
                          {res.checkIn} al {res.checkOut}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estadía & Personas</span>
                        <span className="font-bold text-slate-800">
                          {res.nights} noches · {res.guestsCount} pers.
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total / Seña (50%)</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(res.totalPrice)}{' '}
                          <span className="text-emerald-700">({formatCurrency(res.depositAmount)})</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Saldo al Ingreso</span>
                        <span className="font-bold text-slate-800">{formatCurrency(res.balanceDue)}</span>
                      </div>
                    </div>

                    {res.specialRequests && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Notas / Peticiones: </span>
                        {res.specialRequests}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {res.guestPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {res.guestEmail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {res.status === 'pendiente_sena' && (
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'confirmada')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmar Seña Recibida</span>
                          </button>
                        )}

                        {res.status === 'confirmada' && (
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'pendiente_sena')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                          >
                            Marcar como Pendiente
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${res.guestPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                            res.guestName
                          )},%20te%20contacto%20de%20Pasaje%20Montes%20por%20tu%20reserva%20código%20${res.code}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CARGAR RESERVA MANUAL */}
        {activeTab === 'nueva' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Registrar Nueva Reserva Manual
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Usá este formulario para registrar un huésped que te contactó por teléfono o WhatsApp directamente.
              </p>
            </div>

            <form onSubmit={handleCreateManualReservation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Huésped *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Ej: Marcos Rodríguez"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="Ej: 351 123 4567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Ingreso *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Salida *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cantidad de Huéspedes
                  </label>
                  <select
                    value={newGuestsCount}
                    onChange={(e) => setNewGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  >
                    <option value={1}>1 persona</option>
                    <option value={2}>2 personas</option>
                    <option value={3}>3 personas (máximo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Reservation['status'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  >
                    <option value="confirmada">Confirmada (Seña ya cobrada)</option>
                    <option value="pendiente_sena">Pendiente de seña</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej: Reserva telefónica, viene en camioneta."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('reservas')}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar en la Base de Datos</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: GESTIÓN DE PROMOS & BARRA SUPERIOR */}
        {activeTab === 'promos' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Gestión de Promociones y Barra Superior
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  Configurá el anuncio que aparece <strong>arriba de todo en la cabecera de la página web pública</strong>. Podés cambiar el mensaje, el distintivo, los colores, beneficios especiales por temporada y el botón de acción en tiempo real.
                </p>
              </div>

              <div className="shrink-0">
                {promoEnabled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Barra Activa en la Web
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Barra Oculta
                  </span>
                )}
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Vista Previa en Vivo (Así se verá arriba de todo en tu sitio web)</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-[#4D7080] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>PC / Notebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-[#4D7080] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Celular</span>
                  </button>
                </div>
              </div>

              {/* Simulated Top Announcement Bar */}
              <div
                className={`transition-all duration-300 mx-auto ${
                  previewMode === 'mobile' ? 'max-w-md' : 'w-full'
                }`}
              >
                <div className="bg-[#375663] text-white text-xs py-2.5 px-4 rounded-xl border border-white/10 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {promoEnabled ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Dynamic Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs transition-colors ${
                            PROMO_THEME_OPTIONS.find((t) => t.id === promoTheme)?.badgeClasses ||
                            'bg-[#4D7080] text-emerald-200 border-emerald-300/30'
                          }`}
                        >
                          {renderPreviewIcon(promoIcon)}
                          <span>{promoBadge || 'Distintivo'}</span>
                        </span>

                        {/* Text */}
                        <span className="text-slate-200 text-xs">
                          {previewMode === 'mobile'
                            ? promoMobileText || promoText || 'Texto promocional para celulares'
                            : promoText || 'Texto promocional para computadoras'}
                        </span>

                        {/* Optional Action Button */}
                        {promoActionText && promoActionType !== 'none' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 underline underline-offset-2 ml-1">
                            <span>{promoActionText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-300 text-xs">
                        <span className="font-semibold text-white">Pasaje Montes</span>
                        <span className="text-white/40">·</span>
                        <span>Alojamiento temporario en Cruz del Eje</span>
                      </div>
                    )}

                    {/* Right side contact (visible on desktop preview) */}
                    {previewMode === 'desktop' && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-300 ml-auto">
                        <span className="flex items-center gap-1 text-emerald-300">
                          <Phone className="w-3 h-3" />
                          <span>Rodrigo Sanz ({LODGING_INFO.phoneDisplay})</span>
                        </span>
                        <span className="text-white/20">|</span>
                        <span className="text-amber-200 font-medium">Guía del Huésped</span>
                        <span className="text-white/20">|</span>
                        <span>Consultar Mi Reserva</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Cualquier cambio que realices abajo se refleja de inmediato en esta vista previa.
              </p>
            </div>

            {/* Quick Templates / Presets */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Plantillas Rápidas de Promociones</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hacé clic en cualquiera para cargar sus textos y colores listos para usar:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {PROMO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-3 rounded-2xl border border-slate-200 hover:border-[#4D7080] hover:bg-slate-50/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#375663]">
                          {preset.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            PROMO_THEME_OPTIONS.find((t) => t.id === preset.theme)?.badgeClasses || ''
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {preset.text}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold mt-2 inline-flex items-center gap-1 group-hover:underline">
                      <span>Cargar esta plantilla</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSavePromoBanner} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              {/* Enable / Disable toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="block text-sm font-bold text-slate-900">
                    ¿Mostrar la barra de promociones en la página web?
                  </span>
                  <span className="text-xs text-slate-500">
                    Si la desactivás, los visitantes verán solo la cabecera limpia con datos de contacto.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={promoEnabled}
                    onChange={(e) => setPromoEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-700">
                    {promoEnabled ? 'Activada' : 'Desactivada'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badge Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Texto del Distintivo / Etiqueta *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoBadge}
                    onChange={(e) => setPromoBadge(e.target.value)}
                    placeholder="Ej: Promo 3+ Noches"
                    className="w-full px-3 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:border-[#4D7080] focus:ring-1 focus:ring-[#4D7080]"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Es la píldora destacada al comienzo (ej: &quot;Promo 3+ Noches&quot;, &quot;Escapada Finde&quot;).
                  </span>
                </div>

                {/* Theme selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Color del Distintivo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROMO_THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setPromoTheme(theme.id)}
                        className={`p-2 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
                          promoTheme === theme.id
                            ? 'border-[#4D7080] bg-slate-100 ring-2 ring-[#4D7080]/30 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${theme.chipClass}`}></span>
                        <span className="truncate">{theme.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ícono del Distintivo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROMO_ICON_OPTIONS.map((iconOpt) => (
                      <button
                        key={iconOpt.id}
                        type="button"
                        onClick={() => setPromoIcon(iconOpt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          promoIcon === iconOpt.id
                            ? 'bg-[#4D7080] text-white border-[#4D7080] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {renderPreviewIcon(iconOpt.id)}
                        <span>{iconOpt.label.split(' ')[1] || iconOpt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Message for PC */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mensaje Principal (Para Computadoras y Tablets) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={promoText}
                    onChange={(e) => setPromoText(e.target.value)}
                    placeholder="Ej: Al reservar 3 o más noches recibís una bonificación especial en el precio total."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#4D7080] focus:ring-1 focus:ring-[#4D7080]"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Texto completo que se mostrará en pantallas medianas y grandes.
                  </span>
                </div>

                {/* Short message for mobile */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mensaje Corto para Celulares (Opcional)
                  </label>
                  <input
                    type="text"
                    value={promoMobileText}
                    onChange={(e) => setPromoMobileText(e.target.value)}
                    placeholder="Ej: Bonificación especial a partir de 3 noches."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#4D7080] focus:ring-1 focus:ring-[#4D7080]"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Si lo dejas vacío, en celulares se usará el mensaje principal.
                  </span>
                </div>

                {/* Action Link Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Acción al hacer Clic en la Promo
                  </label>
                  <select
                    value={promoActionType}
                    onChange={(e) => setPromoActionType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#4D7080] focus:ring-1 focus:ring-[#4D7080]"
                  >
                    <option value="booking">Ir al Calendario y Motor de Reservas (#reservas)</option>
                    <option value="whatsapp">Abrir WhatsApp directo con Rodrigo Sanz</option>
                    <option value="none">Ninguna acción (Solo informativo)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    ¿Qué sucede cuando el visitante hace clic en el enlace de la promo?
                  </span>
                </div>

                {/* Action Button Text */}
                {promoActionType !== 'none' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Texto del Botón o Enlace
                    </label>
                    <input
                      type="text"
                      value={promoActionText}
                      onChange={(e) => setPromoActionText(e.target.value)}
                      placeholder="Ej: Reservar ahora / Aprovechar"
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:border-[#4D7080] focus:ring-1 focus:ring-[#4D7080]"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Texto que acompaña a la flechita (ej: &quot;Reservar ahora&quot;, &quot;Ver fechas&quot;, etc.)
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onBackToPublicSite}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <span>Ver Página Pública</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  disabled={savingPromo}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingPromo ? 'Guardando en Base de Datos...' : 'Guardar y Publicar en la Web'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: CONFIGURACIÓN & PRECIOS */}
        {activeTab === 'configuracion' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-xl mx-auto space-y-6">
            {/* Shortcut to Promos Banner */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Barra Superior de Promos y Beneficios</h4>
                  <p className="text-[11px] text-slate-600">Personalizá el mensaje, íconos y distintivo superior desde su pestaña dedicada.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('promos')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
              >
                Ir a Promos →
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Ajustes de Tarifas y Seguridad
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Modificá el precio por noche, porcentaje de bonificación y tu PIN de acceso exclusivo.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Precio Base por Noche (ARS $)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bonificación para 3 o más noches (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Secreto de Acceso al Panel
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono font-bold tracking-widest text-slate-900"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Este es el PIN que solo vos sabés para entrar a este panel.
                </span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4D7080] hover:bg-[#375663] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
