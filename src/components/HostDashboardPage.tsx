import React, { useState, useEffect } from 'react';
import { Reservation, PromoBannerConfig, PromoBannerTheme, PromoBannerIcon, DiscountCoupon, CommercialPartnership, ActivityLog } from '../types';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import { api, HostSettings, DEFAULT_PROMO_BANNER, DEFAULT_COUPONS, DEFAULT_PARTNERSHIPS, getPricePerNightForGuests } from '../services/api';
import { formatDate, formatFriendlyDate, getAllUnavailableDates, getDaysDifference, addDays, checkRangeAvailability } from '../utils/dateUtils';
import { generateDepositConfirmationMessage } from '../utils/emailTemplate';
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
  ShieldCheck,
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
  Ticket,
  History,
  ClipboardList,
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  BedDouble,
  Activity,
  Receipt,
  Info,
  HelpCircle,
  XCircle,
  X,
  Store,
  Edit2,
  MapPin,
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
    text: 'Desconectate en Cruz del Eje. Departamento completo con cochera cubierta.',
    mobileText: 'Cochera techada incluida.',
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
    coupons: DEFAULT_COUPONS,
    promoBanner: DEFAULT_PROMO_BANNER,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservas' | 'nueva' | 'calendario' | 'promos' | 'configuracion' | 'historial'>('calendario');

  // Activity Audit Log state (permanent tracking in Firestore)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'create' | 'update' | 'delete' | 'settings'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Deletion modal state (fixes iframe window.confirm blocking bug)
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);

  // Cancellation modal state (allows host to cancel before or after deposit confirmation and release dates)
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [reactivatingReservationId, setReactivatingReservationId] = useState<string | null>(null);

  // Dashboard Metrics Details Modals
  const [billingDetailModalOpen, setBillingDetailModalOpen] = useState(false);
  const [cancelledDetailModalOpen, setCancelledDetailModalOpen] = useState(false);

  // Email confirmation modal state for seña confirmada
  const [emailModalReservation, setEmailModalReservation] = useState<Reservation | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

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

  // Coupons state (managed in "Precios & PIN" tab)
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(DEFAULT_COUPONS);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [couponFormError, setCouponFormError] = useState<string | null>(null);

  // Commercial Partnerships state (managed in "Promos & barra superior" tab)
  const [partnerships, setPartnerships] = useState<CommercialPartnership[]>(DEFAULT_PARTNERSHIPS);
  const [partBusinessName, setPartBusinessName] = useState('');
  const [partCategory, setPartCategory] = useState('');
  const [partDiscountText, setPartDiscountText] = useState('');
  const [partDetails, setPartDetails] = useState('');
  const [partValidHours, setPartValidHours] = useState('');
  const [partAddress, setPartAddress] = useState('');
  const [partWhatsapp, setPartWhatsapp] = useState('');
  const [partHowToRedeem, setPartHowToRedeem] = useState('');
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [partFormError, setPartFormError] = useState<string | null>(null);
  const [savingPartnership, setSavingPartnership] = useState(false);

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
  const [newStayReason, setNewStayReason] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Settings form state
  const [editPrice, setEditPrice] = useState(45000);
  const [editPrice1Guest, setEditPrice1Guest] = useState(40000);
  const [editPrice2Guests, setEditPrice2Guests] = useState(45000);
  const [editPrice3Guests, setEditPrice3Guests] = useState(52000);
  const [editPin, setEditPin] = useState('2026');
  const [editDiscount, setEditDiscount] = useState(12);

  // Date blocking input range
  const [blockRangeStart, setBlockRangeStart] = useState('');
  const [blockRangeEnd, setBlockRangeEnd] = useState('');
  const [hostCalendarMonth, setHostCalendarMonth] = useState<Date>(new Date());

  // Connection & Live Synchronization State
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Fetch data from backend with selective input preservation
  const loadData = async (initial = false) => {
    if (initial) setIsLoading(true);
    setConnectionStatus('syncing');
    try {
      const [resList, setts, logs] = await Promise.all([
        api.getReservations(),
        api.getSettings(),
        api.getActivityLogs(),
      ]);
      setReservations(resList);
      setSettings(setts);
      setActivityLogs(logs);
      setLastSyncTime(new Date());
      setConnectionStatus('connected');

      // Only populate editable form inputs on initial mount, so live background polling doesn't overwrite what Rodrigo is typing
      if (initial) {
        setEditPrice(setts.baseNightPrice);
        setEditPrice1Guest(setts.price1Guest ?? (setts.baseNightPrice > 5000 ? setts.baseNightPrice - 5000 : setts.baseNightPrice));
        setEditPrice2Guests(setts.price2Guests ?? setts.baseNightPrice);
        setEditPrice3Guests(setts.price3Guests ?? Math.round(setts.baseNightPrice * 1.15));
        setEditPin(setts.hostPin);
        setEditDiscount(setts.discountPercentage);
        if (setts.coupons && Array.isArray(setts.coupons)) {
          setCoupons(setts.coupons);
        } else {
          setCoupons(DEFAULT_COUPONS);
        }
        if (setts.partnerships && Array.isArray(setts.partnerships)) {
          setPartnerships(setts.partnerships);
        } else {
          setPartnerships(DEFAULT_PARTNERSHIPS);
        }
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
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setConnectionStatus('offline');
    } finally {
      if (initial) setIsLoading(false);
      setIsManualSyncing(false);
    }
  };

  // Live real-time sync with database events and background polling
  useEffect(() => {
    if (!isAuthenticated) return;

    loadData(true);

    const handleDbUpdate = () => {
      loadData(false);
    };

    window.addEventListener('pasaje_montes_db_update', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);

    const handleVisibility = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };
    window.addEventListener('focus', handleDbUpdate);
    document.addEventListener('visibilitychange', handleVisibility);

    // Active live polling every 4 seconds ensures any new public client reservation appears instantly in host admin
    const interval = setInterval(() => {
      loadData(false);
    }, 4000);

    return () => {
      window.removeEventListener('pasaje_montes_db_update', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
      window.removeEventListener('focus', handleDbUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await loadData(false);
    showTemporaryNotice('✓ Conexión activa: Base de datos y web pública 100% sincronizadas en vivo.');
  };

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
        setPinError('El PIN ingresado es incorrecto.');
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
        api.getActivityLogs().then(setActivityLogs).catch(() => {});

        // If host confirmed deposit received ("confirmada"), open email modal & dispatch confirmation
        if (newStatus === 'confirmada') {
          setEmailModalReservation(updated);
          api.sendConfirmationEmail(updated).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    setIsDeletingReservation(true);
    try {
      const ok = await api.deleteReservation(reservationToDelete.id);
      if (ok) {
        setReservations((prev) => prev.filter((r) => r.id !== reservationToDelete.id));
        showTemporaryNotice(`✓ Reserva ${reservationToDelete.code} eliminada de la base de datos.`);
        api.getActivityLogs().then(setActivityLogs).catch(() => {});
      } else {
        showTemporaryNotice('No se pudo eliminar la reserva. Verificá la conexión.');
      }
    } catch (err) {
      console.error(err);
      showTemporaryNotice('Error de conexión al eliminar la reserva.');
    } finally {
      setIsDeletingReservation(false);
      setReservationToDelete(null);
    }
  };

  // Confirm cancel reservation (available before and after confirming deposit)
  const handleConfirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    setIsCancellingReservation(true);
    try {
      const updated = await api.updateReservation(reservationToCancel.id, { status: 'cancelada' });
      if (updated) {
        setReservations((prev) => prev.map((r) => (r.id === reservationToCancel.id ? updated : r)));
        showTemporaryNotice(
          `✓ Reserva ${reservationToCancel.code} cancelada exitosamente. Las fechas (${reservationToCancel.checkIn} al ${reservationToCancel.checkOut}) quedaron liberadas en la web.`
        );
        api.getActivityLogs().then(setActivityLogs).catch(() => {});
      } else {
        showTemporaryNotice('⚠️ No se pudo cancelar la reserva. Verificá la conexión.');
      }
    } catch (err) {
      console.error(err);
      showTemporaryNotice('⚠️ Error de conexión al cancelar la reserva.');
    } finally {
      setIsCancellingReservation(false);
      setReservationToCancel(null);
    }
  };

  // Reactivate a cancelled reservation
  const handleReactivateReservation = async (
    res: Reservation,
    targetStatus: 'pendiente_sena' | 'confirmada'
  ) => {
    setReactivatingReservationId(res.id);
    try {
      const otherActiveReservations = reservations.filter(
        (r) => r.id !== res.id && r.status !== 'cancelada'
      );
      const unavailableDates = getAllUnavailableDates(
        otherActiveReservations,
        settings.blockedDates
      );

      const check = checkRangeAvailability(res.checkIn, res.checkOut, unavailableDates);
      if (!check.available) {
        showTemporaryNotice(
          `⚠️ Conflicto de fechas: el rango del ${res.checkIn} al ${res.checkOut} ya está ocupado o bloqueado por otra reserva.`
        );
        return;
      }

      const updated = await api.updateReservation(res.id, { status: targetStatus });
      if (updated) {
        setReservations((prev) => prev.map((r) => (r.id === res.id ? updated : r)));
        showTemporaryNotice(
          `✓ Reserva ${res.code} reactivada como "${targetStatus === 'confirmada' ? 'Confirmada' : 'Pendiente de seña'}". Fechas reservadas nuevamente en la web.`
        );
        api.getActivityLogs().then(setActivityLogs).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      showTemporaryNotice('Error al reactivar la reserva.');
    } finally {
      setReactivatingReservationId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = editPin.trim();
    if (!cleanPin) {
      showTemporaryNotice('⚠️ El PIN de seguridad no puede quedar en blanco.');
      return;
    }

    try {
      const p1 = Number(editPrice1Guest) || 40000;
      const p2 = Number(editPrice2Guests) || Number(editPrice) || 45000;
      const p3 = Number(editPrice3Guests) || 52000;

      const updated = await api.updateSettings({
        baseNightPrice: p2,
        price1Guest: p1,
        price2Guests: p2,
        price3Guests: p3,
        hostPin: cleanPin,
        discountPercentage: Number(editDiscount),
        coupons,
      });
      setSettings(updated);
      showTemporaryNotice(`✓ Tarifas guardadas (1 pers: $${p1.toLocaleString('es-AR')} | 2 pers: $${p2.toLocaleString('es-AR')} | 3 pers: $${p3.toLocaleString('es-AR')}). PIN activo: ${cleanPin}`);
      api.getActivityLogs().then(setActivityLogs).catch(() => {});
    } catch (err) {
      console.error(err);
      showTemporaryNotice('Error al guardar la configuración.');
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError(null);
    const cleanCode = newCouponCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      setCouponFormError('Por favor ingresá un código para el cupón (ej: DESCUENTO10).');
      return;
    }
    if (coupons.some((c) => c.code === cleanCode)) {
      setCouponFormError(`El cupón "${cleanCode}" ya existe. Podés activarlo o editar su descuento.`);
      return;
    }
    const discountNum = Number(newCouponDiscount);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 90) {
      setCouponFormError('El porcentaje de descuento debe ser entre 1% y 90%.');
      return;
    }

    const newCoupon: DiscountCoupon = {
      id: `coup-${Date.now()}`,
      code: cleanCode,
      discountPercentage: discountNum,
      description: newCouponDesc.trim() || `${discountNum}% de descuento en el total`,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const updatedCoupons = [newCoupon, ...coupons];
    setCoupons(updatedCoupons);
    setNewCouponCode('');
    setNewCouponDesc('');

    try {
      const updated = await api.updateSettings({ coupons: updatedCoupons });
      setSettings(updated);
      showTemporaryNotice(`✓ Cupón ${cleanCode} (${discountNum}% OFF) creado y guardado en la base de datos.`);
    } catch (err) {
      console.error('Error saving new coupon:', err);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    const updatedCoupons = coupons.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    setCoupons(updatedCoupons);
    try {
      const updated = await api.updateSettings({ coupons: updatedCoupons });
      setSettings(updated);
      const target = updatedCoupons.find((c) => c.id === id);
      showTemporaryNotice(`Cupón ${target?.code} ${target?.enabled ? 'activado' : 'pausado'}.`);
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    const updatedCoupons = coupons.filter((c) => c.id !== id);
    setCoupons(updatedCoupons);
    try {
      const updated = await api.updateSettings({ coupons: updatedCoupons });
      setSettings(updated);
      showTemporaryNotice(`Cupón ${code} eliminado de la base de datos.`);
    } catch (err) {
      console.error('Error deleting coupon:', err);
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
      showTemporaryNotice('⚠️ Error de conexión al guardar la barra de promociones.');
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

  const handleSaveOrUpdatePartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartFormError(null);

    const name = partBusinessName.trim();
    const discount = partDiscountText.trim();
    if (!name) {
      setPartFormError('Por favor indicá el nombre del comercio (ej: Panadería Kyrios).');
      return;
    }
    if (!discount) {
      setPartFormError('Por favor indicá el beneficio o descuento (ej: 20% OFF en meriendas).');
      return;
    }

    setSavingPartnership(true);
    try {
      let updatedList: CommercialPartnership[];
      if (editingPartId) {
        // Edit existing
        updatedList = partnerships.map((p) =>
          p.id === editingPartId
            ? {
                ...p,
                businessName: name,
                category: partCategory.trim() || 'Comercio Amigo',
                discountText: discount,
                details: partDetails.trim() || `Beneficio especial para huéspedes de Pasaje Montes: ${discount}`,
                validHours: partValidHours.trim() || undefined,
                address: partAddress.trim() || undefined,
                whatsapp: partWhatsapp.trim() || undefined,
                howToRedeem: partHowToRedeem.trim() || undefined,
              }
            : p
        );
        showTemporaryNotice(`✓ Convenio con "${name}" modificado exitosamente.`);
      } else {
        // Create new
        const newPart: CommercialPartnership = {
          id: `part-${Date.now()}`,
          businessName: name,
          category: partCategory.trim() || 'Comercio Amigo',
          discountText: discount,
          details: partDetails.trim() || `Beneficio especial para huéspedes de Pasaje Montes: ${discount}`,
          validHours: partValidHours.trim() || undefined,
          address: partAddress.trim() || undefined,
          whatsapp: partWhatsapp.trim() || undefined,
          howToRedeem: partHowToRedeem.trim() || undefined,
          enabled: true,
          createdAt: new Date().toISOString(),
        };
        updatedList = [newPart, ...partnerships];
        showTemporaryNotice(`✓ Nuevo convenio con "${name}" guardado y publicado en la web.`);
      }

      setPartnerships(updatedList);
      const updated = await api.updateSettings({ partnerships: updatedList });
      setSettings(updated);

      // Reset form
      setPartBusinessName('');
      setPartCategory('');
      setPartDiscountText('');
      setPartDetails('');
      setPartValidHours('');
      setPartAddress('');
      setPartWhatsapp('');
      setPartHowToRedeem('');
      setEditingPartId(null);
    } catch (err) {
      console.error('Error saving partnership:', err);
      showTemporaryNotice('⚠️ Error al guardar el convenio en la base de datos.');
    } finally {
      setSavingPartnership(false);
    }
  };

  const handleEditPartnership = (p: CommercialPartnership) => {
    setEditingPartId(p.id);
    setPartBusinessName(p.businessName);
    setPartCategory(p.category || '');
    setPartDiscountText(p.discountText);
    setPartDetails(p.details);
    setPartValidHours(p.validHours || '');
    setPartAddress(p.address || '');
    setPartWhatsapp(p.whatsapp || '');
    setPartHowToRedeem(p.howToRedeem || '');
    setPartFormError(null);
    showTemporaryNotice(`Editando convenio con "${p.businessName}". Hacé los cambios en el formulario.`);
  };

  const handleCancelEditPartnership = () => {
    setEditingPartId(null);
    setPartBusinessName('');
    setPartCategory('');
    setPartDiscountText('');
    setPartDetails('');
    setPartValidHours('');
    setPartAddress('');
    setPartWhatsapp('');
    setPartHowToRedeem('');
    setPartFormError(null);
  };

  const handleTogglePartnership = async (id: string) => {
    const updatedList = partnerships.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setPartnerships(updatedList);
    try {
      const updated = await api.updateSettings({ partnerships: updatedList });
      setSettings(updated);
      const target = updatedList.find((p) => p.id === id);
      showTemporaryNotice(`Convenio con "${target?.businessName}" ${target?.enabled ? 'activado' : 'pausado'}.`);
    } catch (err) {
      console.error('Error toggling partnership:', err);
    }
  };

  const handleDeletePartnership = async (id: string, name: string) => {
    const updatedList = partnerships.filter((p) => p.id !== id);
    setPartnerships(updatedList);
    if (editingPartId === id) {
      handleCancelEditPartnership();
    }
    try {
      const updated = await api.updateSettings({ partnerships: updatedList });
      setSettings(updated);
      showTemporaryNotice(`Convenio con "${name}" eliminado de la base de datos.`);
    } catch (err) {
      console.error('Error deleting partnership:', err);
    }
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
      showTemporaryNotice('⚠️ Por favor elegí fecha Desde y fecha Hasta.');
      return;
    }

    const diff = getDaysDifference(blockRangeStart, blockRangeEnd);
    if (diff < 0) {
      showTemporaryNotice('⚠️ La fecha Desde debe ser anterior o igual a la fecha Hasta.');
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
    const updated = await api.updateSettings({ blockedDates: [] });
    setSettings(updated);
    showTemporaryNotice('Todas las fechas bloqueadas manualmente fueron liberadas.');
  };

  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newCheckIn || !newCheckOut) {
      showTemporaryNotice('⚠️ Por favor completá nombre, fecha de check-in y fecha de check-out.');
      return;
    }

    const start = new Date(newCheckIn + 'T00:00:00');
    const end = new Date(newCheckOut + 'T00:00:00');
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const pricePerNight = getPricePerNightForGuests(settings, newGuestsCount);
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
      guestDni: '',
      guestOrigin: '',
      stayReason: newStayReason.trim() || '',
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
      couponCode: '',
      couponDiscount: 0,
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
    setNewStayReason('');
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
      'Motivo',
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
      `"${r.stayReason || ''}"`,
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

  // Filtered Activity Audit Logs
  const filteredActivityLogs = activityLogs
    .filter((log) => {
      if (logFilter === 'all') return true;
      if (logFilter === 'create') return log.action === 'creacion_reserva';
      if (logFilter === 'update') return log.action === 'modificacion_estado';
      if (logFilter === 'delete') return log.action === 'eliminacion_reserva';
      if (logFilter === 'settings') {
        return (
          log.action === 'cambio_tarifa' ||
          log.action === 'creacion_cupon' ||
          log.action === 'bloqueo_fechas' ||
          log.action === 'cambio_promo'
        );
      }
      return true;
    })
    .filter((log) => {
      if (!logSearchQuery) return true;
      const q = logSearchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    });

  const formatLogDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleExportLogsCSV = () => {
    const headers = ['Fecha y Hora', 'Tipo', 'Accion', 'Detalles', 'Responsable'];
    const rows = activityLogs.map((l) => [
      `"${formatLogDate(l.timestamp)}"`,
      `"${l.type}"`,
      `"${l.title}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.performedBy}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Historial_Auditoria_Pasaje_Montes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTemporaryNotice('Historial de cambios exportado en CSV.');
  };

  // Host Financial Metrics & Facturación
  const totalReservations = reservations.length;
  const confirmedList = reservations.filter((r) => r.status === 'confirmada');
  const pendingList = reservations.filter((r) => r.status === 'pendiente_sena');
  const cancelledList = reservations.filter((r) => r.status === 'cancelada');

  // Monto Total Facturado (Reservas Confirmadas)
  const totalBilledAmount = confirmedList.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalIncomeExpected = totalBilledAmount;
  const totalDepositsReceived = confirmedList.reduce((acc, curr) => acc + curr.depositAmount, 0);
  const totalBalancesPending = confirmedList.reduce((acc, curr) => acc + curr.balanceDue, 0);
  const totalNightsBooked = confirmedList.reduce((acc, curr) => acc + curr.nights, 0);

  // Montos de Reservas Canceladas
  const totalCancelledAmount = cancelledList.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalCancelledNights = cancelledList.reduce((acc, curr) => acc + curr.nights, 0);
  const totalCancelledDeposits = cancelledList.reduce((acc, curr) => acc + curr.depositAmount, 0);

  const avgNightsPerStay = confirmedList.length > 0 ? (totalNightsBooked / confirmedList.length).toFixed(1) : '0';
  const avgStayPrice = confirmedList.length > 0 ? Math.round(totalIncomeExpected / confirmedList.length) : 0;

  // Capacity breakdown (guestsCount: 1, 2, 3)
  const count1Guest = reservations.filter((r) => r.guestsCount === 1).length;
  const count2Guests = reservations.filter((r) => r.guestsCount === 2).length;
  const count3Guests = reservations.filter((r) => r.guestsCount >= 3).length;

  // Monthly revenue stats for Bar Chart
  const monthlyStats = React.useMemo(() => {
    const monthsMap: Record<string, { label: string; yearMonth: string; revenue: number; nights: number; count: number }> = {};
    reservations.forEach((r) => {
      if (r.checkIn) {
        const ym = r.checkIn.slice(0, 7); // "YYYY-MM"
        const [y, m] = ym.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1, 1);
        const monthLabel = dateObj.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
        if (!monthsMap[ym]) {
          monthsMap[ym] = { label: monthLabel.toUpperCase(), yearMonth: ym, revenue: 0, nights: 0, count: 0 };
        }
        if (r.status !== 'cancelada') {
          monthsMap[ym].revenue += r.totalPrice;
          monthsMap[ym].nights += r.nights;
          monthsMap[ym].count += 1;
        }
      }
    });

    return Object.values(monthsMap).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  }, [reservations]);

  const maxMonthRevenue = Math.max(...monthlyStats.map((m) => m.revenue), 1);

  // Activity breakdown counts for Activity Chart
  const countCreateLogs = activityLogs.filter((l) => l.action === 'creacion_reserva').length;
  const countUpdateLogs = activityLogs.filter((l) => l.action === 'modificacion_estado').length;
  const countDeleteLogs = activityLogs.filter((l) => l.action === 'eliminacion_reserva').length;
  const countSettingsLogs = activityLogs.filter(
    (l) =>
      l.action === 'cambio_tarifa' ||
      l.action === 'creacion_cupon' ||
      l.action === 'bloqueo_fechas' ||
      l.action === 'cambio_promo'
  ).length;

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
                Acceso privado
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Panel de Administración
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
                  placeholder="Ingresá tu PIN"
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
            </button>
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
                  Panel de Administración
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Connection & Sync Status Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : connectionStatus === 'syncing'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-red-500/20 text-red-300 border-red-400/40'
              }`}
              title={
                connectionStatus === 'connected'
                  ? `Sincronizado con la base de datos (${lastSyncTime.toLocaleTimeString('es-AR')})`
                  : connectionStatus === 'syncing'
                  ? 'Sincronizando con el servidor...'
                  : 'Modo seguro local activo'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : connectionStatus === 'syncing'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-red-400'
                }`}
              />
              <span className="hidden sm:inline">
                {connectionStatus === 'connected'
                  ? 'En Vivo · Sincronizado'
                  : connectionStatus === 'syncing'
                  ? 'Sincronizando...'
                  : 'Modo Local Seguro'}
              </span>
            </div>

            {/* Quick Sync Button */}
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 transition-colors cursor-pointer"
              title="Forzar actualización y sincronizar con la base de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
              <span className="hidden md:inline text-[11px]">Sincronizar</span>
            </button>

            {/* Direct Link to test public view */}
            <button
              onClick={onBackToPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
              title="Ir a la página pública para ver cómo ven los clientes tus cambios"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Página Pública</span>
            </button>

            {/* Copy Secret Bookmark Link */}
            <button
              onClick={handleCopyPrivateUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 transition-colors cursor-pointer"
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
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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

            <button
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'historial'
                  ? 'bg-[#4D7080] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              <span>Dashboard ({activityLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
           
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
                <button
                  onClick={() => setStatusFilter('cancelada')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'cancelada'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-800 hover:bg-red-100'
                  }`}
                >
                  Canceladas ({cancelledList.length})
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
                            {res.stayReason ? ` · Motivo: ${res.stayReason}` : ''}
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
                            ? '✕ Cancelada · Fechas Libres'
                            : '⏳ Pendiente de Seña'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setReservationToDelete(res)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar registro de la base de datos"
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
                        {res.couponCode && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-0.5">
                            <Ticket className="w-2.5 h-2.5" /> Cupón: {res.couponCode}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Saldo al Ingreso</span>
                        <span className="font-bold text-slate-800">{formatCurrency(res.balanceDue)}</span>
                      </div>
                    </div>

                    {res.status === 'cancelada' && (
                      <div className="p-2.5 rounded-lg bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>Reserva cancelada:</strong> Las fechas <strong>{res.checkIn} al {res.checkOut}</strong> están <strong>libres y disponibles nuevamente</strong> en la página web pública.
                        </span>
                      </div>
                    )}

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

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Estado: Pendiente de seña */}
                        {res.status === 'pendiente_sena' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(res.id, 'confirmada')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirmar Seña Recibida</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReservationToCancel(res)}
                              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Cancelar esta reserva y liberar las fechas en la web pública"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancelar Reserva</span>
                            </button>
                          </>
                        )}

                        {/* Estado: Confirmada */}
                        {res.status === 'confirmada' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEmailModalReservation(res)}
                              className="px-3 py-1.5 bg-[#4D7080] hover:bg-[#375663] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Ver o reenviar email de confirmación de seña y bienvenida"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email Confirmación</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(res.id, 'pendiente_sena')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Marcar Pendiente
                            </button>

                            <button
                              type="button"
                              onClick={() => setReservationToCancel(res)}
                              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Cancelar esta reserva y liberar las fechas en la web pública"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancelar Reserva</span>
                            </button>
                          </>
                        )}

                        {/* Estado: Cancelada */}
                        {res.status === 'cancelada' && (
                          <>
                            <button
                              type="button"
                              disabled={reactivatingReservationId === res.id}
                              onClick={() => handleReactivateReservation(res, 'pendiente_sena')}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Reactivar reserva en estado pendiente de seña"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Reactivar (Pendiente)</span>
                            </button>

                            <button
                              type="button"
                              disabled={reactivatingReservationId === res.id}
                              onClick={() => handleReactivateReservation(res, 'confirmada')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Reactivar reserva con seña confirmada"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Reactivar (Confirmada)</span>
                            </button>
                          </>
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo de estadía:
                  </label>
                  <input
                    type="text"
                    value={newStayReason}
                    onChange={(e) => setNewStayReason(e.target.value)}
                    placeholder="Ej: Turismo, descanso, trabajo, visita familiar..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
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

            {/* SECCIÓN DE ALIANZAS Y CONVENIOS COMERCIALES (CRUZ DEL EJE) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      Comercios de la Ciudad & Red de Descuentos
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {partnerships.filter((p) => p.enabled).length} de {partnerships.length} activos
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Alianzas y Descuentos con Comercios Locales
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Gestioná los convenios del hospedaje con locales de Cruz del Eje. Aparecen en el menú público bajo <strong>&quot;Alianzas y Descuentos&quot;</strong> dentro de la sección de Tarifas y Condiciones.
                  </p>
                </div>
              </div>

              {/* Formulario de Carga / Edición de Convenio */}
              <form onSubmit={handleSaveOrUpdatePartnership} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {editingPartId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {editingPartId ? 'Modificar Convenio Comercial' : 'Agregar Nuevo Convenio Comercial'}
                    </h4>
                  </div>
                  {editingPartId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPartnership}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>

                {partFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{partFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre del comercio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre del Comercio *
                    </label>
                    <input
                      type="text"
                      value={partBusinessName}
                      onChange={(e) => setPartBusinessName(e.target.value)}
                      placeholder="Ej: Panadería Kyrios"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Rubro / Categoría */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rubro o Categoría
                    </label>
                    <input
                      type="text"
                      value={partCategory}
                      onChange={(e) => setPartCategory(e.target.value)}
                      placeholder="Ej: Panadería & Cafetería / Gastronomía / Regionales"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Beneficio o Descuento destacado */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Beneficio o Descuento Destacado *
                    </label>
                    <input
                      type="text"
                      value={partDiscountText}
                      onChange={(e) => setPartDiscountText(e.target.value)}
                      placeholder="Ej: 20% OFF en meriendas / 15% en aceites / Postre de cortesía"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Días y Horarios válidos */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Días y Horarios Válidos
                    </label>
                    <input
                      type="text"
                      value={partValidHours}
                      onChange={(e) => setPartValidHours(e.target.value)}
                      placeholder="Ej: Lunes a Sábados de 16:30 a 20:30 hs (tal hora a tal hora)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Dirección del local */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dirección en Cruz del Eje
                    </label>
                    <input
                      type="text"
                      value={partAddress}
                      onChange={(e) => setPartAddress(e.target.value)}
                      placeholder="Ej: Av. Sarmiento esq. Eva Perón, Cruz del Eje"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* WhatsApp del comercio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp de Contacto (con código de área)
                    </label>
                    <input
                      type="text"
                      value={partWhatsapp}
                      onChange={(e) => setPartWhatsapp(e.target.value)}
                      placeholder="Ej: 5493549432101 o 3549 43-2101"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Detalle extendido de la promo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detalle de la Promoción o Beneficio
                  </label>
                  <textarea
                    rows={2}
                    value={partDetails}
                    onChange={(e) => setPartDetails(e.target.value)}
                    placeholder="Ej: Reservando hoy lunes 9 de noviembre tenés un 20% off en combos de meriendas artesanales seleccionados."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Cómo canjear el beneficio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instrucción para el Huésped (Cómo Canjearlo)
                  </label>
                  <input
                    type="text"
                    value={partHowToRedeem}
                    onChange={(e) => setPartHowToRedeem(e.target.value)}
                    placeholder="Ej: Mencioná tu código de reserva de Pasaje Montes o mostrá tu voucher en el mostrador."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Botón de acción */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {editingPartId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPartnership}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingPartnership}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {savingPartnership
                        ? 'Guardando...'
                        : editingPartId
                        ? 'Actualizar Convenio'
                        : 'Guardar y Publicar Convenio'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Listado de Convenios Existentes */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Convenios Cargados en el Sistema ({partnerships.length})
                </h4>

                {partnerships.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No hay convenios cargados todavía. Agregá el primero usando el formulario de arriba.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {partnerships.map((p) => (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          p.enabled
                            ? 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                            : 'bg-slate-50/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-extrabold text-slate-900">
                              {p.businessName}
                            </h5>
                            <span className="text-[10px] font-semibold text-[#4D7080] bg-[#4D7080]/10 px-2 py-0.5 rounded-md">
                              {p.category || 'Comercio'}
                            </span>
                            <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>{p.discountText}</span>
                            </span>
                            {p.enabled ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Visible en la web
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                Pausado (Oculto)
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {p.details}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                            {p.validHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{p.validHours}</span>
                              </span>
                            )}
                            {p.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{p.address}</span>
                              </span>
                            )}
                            {p.whatsapp && (
                              <span className="flex items-center gap-1 font-mono text-emerald-700">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{p.whatsapp}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => handleEditPartnership(p)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Modificar datos del convenio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePartnership(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              p.enabled
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={p.enabled ? 'Pausar convenio en la web' : 'Activar convenio en la web'}
                          >
                            {p.enabled ? 'Pausar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePartnership(p.id, p.businessName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar convenio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
              {/* Tarifas manuales por cantidad de personas */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>💵</span> Tarifas Base por Noche según Huéspedes (ARS $)
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Cotización en tiempo real
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Configurá el valor por noche para cada capacidad. El cotizador de la web calculará automáticamente el monto según la cantidad de personas elegida por el cliente.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1 Persona */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:border-emerald-500 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                        <span>👤</span> 1 Persona
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Individual</span>
                    </div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Precio por noche (ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={editPrice1Guest}
                        onChange={(e) => setEditPrice1Guest(Number(e.target.value))}
                        className="w-full pl-6 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="40000"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ej: ${Number(editPrice1Guest || 40000).toLocaleString('es-AR')} / noche
                    </p>
                  </div>

                  {/* 2 Personas */}
                  <div className="bg-white p-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/20 shadow-sm focus-within:border-emerald-500 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                        <span>👥</span> 2 Personas
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Estándar</span>
                    </div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Precio por noche (ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={editPrice2Guests}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditPrice2Guests(val);
                          setEditPrice(val);
                        }}
                        className="w-full pl-6 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="45000"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ej: ${Number(editPrice2Guests || 45000).toLocaleString('es-AR')} / noche
                    </p>
                  </div>

                  {/* 3 Personas */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:border-emerald-500 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                        <span>👥+</span> 3 Personas
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Máx. depto</span>
                    </div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Precio por noche (ARS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={editPrice3Guests}
                        onChange={(e) => setEditPrice3Guests(Number(e.target.value))}
                        className="w-full pl-6 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="52000"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ej: ${Number(editPrice3Guests || 52000).toLocaleString('es-AR')} / noche
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200/60 rounded-lg flex items-center gap-2 text-[11px] text-emerald-900">
                  <span className="text-emerald-600 font-bold">ℹ️ En la web:</span>
                  <span>
                    El cliente verá los botones <strong>1 pers ($ {Number(editPrice1Guest || 40000).toLocaleString('es-AR')})</strong>, <strong>2 pers ($ {Number(editPrice2Guests || 45000).toLocaleString('es-AR')})</strong> y <strong>3 pers ($ {Number(editPrice3Guests || 52000).toLocaleString('es-AR')})</strong> y el desglose de cotización se ajustará al instante.
                  </span>
                </div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>PIN Secreto de Acceso al Panel</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Único código activo
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="Ej: 8492"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono font-bold tracking-widest text-slate-900 bg-white"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  🔒 Al cambiar y guardar un nuevo PIN, el código anterior queda <strong>invalidado de inmediato</strong> y solo podrás acceder con el nuevo.
                </span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4D7080] hover:bg-[#375663] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Tarifas y PIN</span>
                </button>
              </div>
            </form>

            {/* SECCIÓN DEDICADA: GESTIÓN DE CUPONES DE DESCUENTO */}
            <div className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cupones de Descuento Promocionales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Creá cupones con el código y porcentaje (%) que quieras. Los huéspedes podrán ingresarlo en la web para obtener el descuento automático.
                  </p>
                </div>
              </div>

              {/* Add New Coupon Form */}
              <form onSubmit={handleAddCoupon} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Código del Cupón *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: AMIGOS20"
                      value={newCouponCode}
                      onChange={(e) => {
                        setNewCouponCode(e.target.value.toUpperCase());
                        setCouponFormError(null);
                      }}
                      className="w-full px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-purple-300 rounded-xl bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Descuento (% Total) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        required
                        value={newCouponDiscount}
                        onChange={(e) => {
                          setNewCouponDiscount(Number(e.target.value));
                          setCouponFormError(null);
                        }}
                        className="w-full px-3 py-2 pr-7 text-xs font-bold border border-purple-300 rounded-xl bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nota / Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Para familiares y amigos"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-purple-300 rounded-xl bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {couponFormError && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{couponFormError}</span>
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Cupón</span>
                  </button>
                </div>
              </form>

              {/* List of Coupons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cupones Configurados ({coupons.length})
                </h4>

                {coupons.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    No hay cupones creados todavía. Creá uno arriba para comenzar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                          coupon.enabled
                            ? 'bg-white border-slate-200 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            coupon.enabled
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            <Ticket className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                                {coupon.code}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {coupon.discountPercentage}% OFF
                              </span>
                              {coupon.enabled ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Activo
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                  Pausado
                                </span>
                              )}
                            </div>
                            {coupon.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(coupon.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              coupon.enabled
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {coupon.enabled ? 'Pausar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cupón"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DASHBOARD CON MÉTRICAS, GRÁFICOS Y AUDITORÍA PERMANENTE */}
        {activeTab === 'historial' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4D7080]/15 text-[#4D7080] border border-[#4D7080]/30">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard & Gráficos
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Google Cloud Firestore
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Dashboard de Rendimiento & Estadísticas</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    Visualizá de forma simple e intuitiva los ingresos, evolución mensual, estado de reservas y el registro permanente de cambios en la nube.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const logs = await api.getActivityLogs();
                      setActivityLogs(logs);
                      showTemporaryNotice('Datos y gráficos actualizados en vivo.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    title="Actualizar registros y gráficos desde la base de datos"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Actualizar Datos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLogsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#4D7080] hover:bg-[#3D5A67] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Descargar historial completo en archivo CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN DE GRÁFICOS VISUALES FÁCILES DE ENTENDER */}
              <div className="pt-6 space-y-6">
                {/* 1. PRINCIPALES MÉTRICAS FINANCIERAS Y FACTURACIÓN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Monto Total Facturado */}
                  <div className="bg-gradient-to-br from-[#FBF8F3] to-emerald-50/60 p-5 rounded-2xl border-2 border-emerald-300/80 shadow-xs space-y-3 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                            Monto Total Facturado
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                            Ingresos Confirmados
                          </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                          {formatCurrency(totalBilledAmount)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Breakdown pill tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-emerald-900 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Señas 50% cobradas: {formatCurrency(totalDepositsReceived)}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-700 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Saldos al ingresar: {formatCurrency(totalBalancesPending)}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-100/70 text-emerald-950 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                        {confirmedList.length} {confirmedList.length === 1 ? 'reserva confirmada' : 'reservas confirmadas'}
                      </span>
                    </div>

                    {/* Explicación clara de qué significa */}
                    <div className="p-3 bg-white/90 rounded-xl border border-emerald-200/70 text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-emerald-950 block mb-0.5 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ¿Qué significa este monto?
                      </strong>
                      Es el <strong>volumen total de ventas cerrado y confirmado</strong> en Pasaje Montes. Representa la suma íntegra de las estadías vendidas (tanto el 50% ya transferido como el 50% que los huéspedes pagan al ingresar).
                    </div>

                    {/* Acciones para Monto Total Facturado */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 border-t border-emerald-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('reservas');
                          setStatusFilter('confirmada');
                        }}
                        className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="Ver todas las reservas confirmadas que componen esta facturación"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Ver Reservas Confirmadas →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBillingDetailModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        title="Ver desglose detallado de la facturación"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Detalle de Facturación</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Montos de Reservas Canceladas */}
                  <div className="bg-gradient-to-br from-[#FBF8F3] to-red-50/60 p-5 rounded-2xl border-2 border-red-300/80 shadow-xs space-y-3 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          <span className="text-xs font-black uppercase tracking-wider text-red-900">
                            Montos de Reservas Canceladas
                          </span>
                          <span className="text-[10px] font-bold text-red-700 bg-red-100/90 px-2 py-0.5 rounded-full border border-red-300">
                            Fechas Liberadas
                          </span>
                        </div>
                        <p className="text-3xl font-black text-red-900 tracking-tight">
                          {formatCurrency(totalCancelledAmount)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Ban className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Breakdown pill tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-red-200 font-bold text-red-800 shadow-2xs">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        {cancelledList.length} {cancelledList.length === 1 ? 'reserva cancelada' : 'reservas canceladas'}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-emerald-800 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {totalCancelledNights} noches liberadas en la web
                      </span>
                      {totalCancelledDeposits > 0 && (
                        <span className="inline-flex items-center gap-1 bg-red-100/70 text-red-950 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          Señas asociadas: {formatCurrency(totalCancelledDeposits)}
                        </span>
                      )}
                    </div>

                    {/* Explicación clara de qué significa */}
                    <div className="p-3 bg-white/90 rounded-xl border border-red-200/70 text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-red-950 block mb-0.5 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        ¿Qué significa este monto?
                      </strong>
                      Es el importe económico de las reservas que <strong>fueron canceladas</strong> (ya sea antes de abonar la seña o posterior a ella). <strong>No se computa como ingreso</strong> en caja y sus fechas han sido <strong>desbloqueadas automáticamente</strong> para permitir nuevas reservas.
                    </div>

                    {/* Acciones para Reservas Canceladas */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 border-t border-red-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('reservas');
                          setStatusFilter('cancelada');
                        }}
                        className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="Ver listado filtrado de reservas canceladas"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Ver Reservas Canceladas →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelledDetailModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-900 border border-red-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        title="Ver detalle del impacto de las cancelaciones"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-red-700" />
                        <span>Detalle de Cancelaciones</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Tarjetas Complementarias de Rendimiento */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span>Señas Cobradas (50%)</span>
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(totalDepositsReceived)}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Acreditado en Mercado Pago / Banco
                    </p>
                  </div>

                  <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>Saldos a Cobrar al Ingreso</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(totalBalancesPending)}</p>
                    <p className="text-[11px] text-amber-700 font-medium">
                      A percibir en el check-in (llave)
                    </p>
                  </div>

                  <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-purple-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                      <span>Noches Vendidas</span>
                      <BedDouble className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-black text-purple-900">{totalNightsBooked} noches</p>
                    <p className="text-[11px] text-purple-700 font-medium">
                      Promedio: {avgNightsPerStay} noches / estadía
                    </p>
                  </div>

                  <div className="bg-[#FBF8F3] p-4 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Tarifa Promedio</span>
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                    </div>
                    <p className="text-2xl font-black text-[#4D7080]">{formatCurrency(avgStayPrice || settings.baseNightPrice)}</p>
                    <p className="text-[11px] text-slate-500">
                      Base actual: {formatCurrency(settings.baseNightPrice)} / noche
                    </p>
                  </div>
                </div>

                {/* 2. Main Charts Grid: Monthly Revenue Bars + Donut Status */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Gráfico 1: Barras de Ingresos por Mes */}
                  <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#4D7080]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Evolución de Ingresos y Estadías por Mes
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Total {monthlyStats.length} {monthlyStats.length === 1 ? 'mes registrado' : 'meses registrados'}
                      </span>
                    </div>

                    {monthlyStats.length === 0 ? (
                      <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                        No hay reservas con fechas registradas aún.
                      </div>
                    ) : (
                      <div className="pt-4">
                        <div className="h-44 flex items-end justify-around gap-2 px-2 border-b border-slate-200 pb-2">
                          {monthlyStats.map((m) => {
                            const barHeightPercent = Math.max(18, Math.round((m.revenue / maxMonthRevenue) * 100));
                            return (
                              <div key={m.yearMonth} className="flex-1 max-w-[90px] flex flex-col items-center gap-1.5 group">
                                <span className="text-[10px] font-bold text-slate-700 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  ${Math.round(m.revenue / 1000)}k
                                </span>
                                <div className="w-full bg-slate-200/70 rounded-t-xl h-36 flex items-end p-1">
                                  <div
                                    style={{ height: `${barHeightPercent}%` }}
                                    className="w-full bg-gradient-to-t from-[#4D7080] to-emerald-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-xs"
                                    title={`${m.label}: ${formatCurrency(m.revenue)} (${m.nights} noches, ${m.count} reservas)`}
                                  />
                                </div>
                                <span className="text-[11px] font-black text-slate-800">{m.label}</span>
                                <span className="text-[9px] font-medium text-slate-500">
                                  {m.nights} n · {m.count} res
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-[#4D7080] to-emerald-500" />
                            Ingresos confirmados por mes
                          </span>
                          <span className="font-semibold text-slate-700">
                            Pico máximo: {formatCurrency(maxMonthRevenue)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gráfico 2: Donut Circular de Estados de Reserva */}
                  <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Estado de las Reservas
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {totalReservations} en total
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                      {/* SVG Donut */}
                      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                        {(() => {
                          const total = Math.max(totalReservations, 1);
                          const C = 226.2; // 2 * pi * 36
                          const confDash = (confirmedList.length / total) * C;
                          const pendDash = (pendingList.length / total) * C;
                          const cancDash = (cancelledList.length / total) * C;
                          const confPercent = Math.round((confirmedList.length / total) * 100);

                          return (
                            <>
                              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle cx="50" cy="50" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                                {/* Confirmed slice (emerald) */}
                                {confirmedList.length > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="36"
                                    fill="transparent"
                                    stroke="#10B981"
                                    strokeWidth="12"
                                    strokeDasharray={`${confDash} ${C}`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                  />
                                )}
                                {/* Pending slice (amber) */}
                                {pendingList.length > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="36"
                                    fill="transparent"
                                    stroke="#F59E0B"
                                    strokeWidth="12"
                                    strokeDasharray={`${pendDash} ${C}`}
                                    strokeDashoffset={`-${confDash}`}
                                  />
                                )}
                                {/* Cancelled slice (rose) */}
                                {cancelledList.length > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="36"
                                    fill="transparent"
                                    stroke="#EF4444"
                                    strokeWidth="12"
                                    strokeDasharray={`${cancDash} ${C}`}
                                    strokeDashoffset={`-${confDash + pendDash}`}
                                  />
                                )}
                              </svg>
                              <div className="absolute text-center">
                                <span className="text-xl font-black text-slate-900 block leading-tight">{confPercent}%</span>
                                <span className="text-[10px] font-bold uppercase text-emerald-700">Confirmadas</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Legend and progress bars */}
                      <div className="w-full space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-emerald-800">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              Confirmadas ({confirmedList.length})
                            </span>
                            <span className="font-bold text-slate-800">
                              {Math.round((confirmedList.length / Math.max(totalReservations, 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.round((confirmedList.length / Math.max(totalReservations, 1)) * 100)}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-800 block font-medium">
                            Facturado: {formatCurrency(totalBilledAmount)} (Señas 50%: {formatCurrency(totalDepositsReceived)})
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-amber-800">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              Pendientes de seña ({pendingList.length})
                            </span>
                            <span className="font-bold text-slate-800">
                              {Math.round((pendingList.length / Math.max(totalReservations, 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.round((pendingList.length / Math.max(totalReservations, 1)) * 100)}%` }}
                              className="h-full bg-amber-500 rounded-full"
                            />
                          </div>
                        </div>

                        {cancelledList.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span className="flex items-center gap-1.5 text-rose-800">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                Canceladas ({cancelledList.length})
                              </span>
                              <span className="font-bold text-slate-800">
                                {Math.round((cancelledList.length / Math.max(totalReservations, 1)) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.round((cancelledList.length / Math.max(totalReservations, 1)) * 100)}%` }}
                                className="h-full bg-rose-500 rounded-full"
                              />
                            </div>
                            <span className="text-[10px] text-rose-700 block font-medium">
                              Monto cancelado: {formatCurrency(totalCancelledAmount)} · {totalCancelledNights} noches liberadas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Secondary Charts Grid: Guest Profile + Activity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfico 3: Capacidad y Perfil de Huéspedes */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Perfil de Huéspedes (Capacidad del Depto)
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">Máx 3 huéspedes</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">Parejas / 2 Personas (Sommier Queen)</span>
                          <span className="font-bold text-slate-900">
                            {count2Guests} ({Math.round((count2Guests / Math.max(totalReservations, 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.round((count2Guests / Math.max(totalReservations, 1)) * 100)}%` }}
                            className="h-full bg-purple-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">Familias / 3 Personas (Queen + 1 Plaza)</span>
                          <span className="font-bold text-slate-900">
                            {count3Guests} ({Math.round((count3Guests / Math.max(totalReservations, 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.round((count3Guests / Math.max(totalReservations, 1)) * 100)}%` }}
                            className="h-full bg-[#4D7080] rounded-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">Viajero Individual (1 Persona)</span>
                          <span className="font-bold text-slate-900">
                            {count1Guest} ({Math.round((count1Guest / Math.max(totalReservations, 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.round((count1Guest / Math.max(totalReservations, 1)) * 100)}%` }}
                            className="h-full bg-sky-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico 4: Distribución de Eventos y Auditoría */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Distribución de Actividad del Sistema
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {activityLogs.length} eventos registrados
                      </span>
                    </div>

                    {/* Stacked multi-color progress bar */}
                    <div className="space-y-3 pt-1">
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${(countCreateLogs / Math.max(activityLogs.length, 1)) * 100}%` }}
                          className="h-full bg-emerald-500"
                          title={`Nuevas reservas: ${countCreateLogs}`}
                        />
                        <div
                          style={{ width: `${(countUpdateLogs / Math.max(activityLogs.length, 1)) * 100}%` }}
                          className="h-full bg-sky-500"
                          title={`Modificaciones: ${countUpdateLogs}`}
                        />
                        <div
                          style={{ width: `${(countSettingsLogs / Math.max(activityLogs.length, 1)) * 100}%` }}
                          className="h-full bg-amber-500"
                          title={`Tarifas / Ajustes: ${countSettingsLogs}`}
                        />
                        <div
                          style={{ width: `${(countDeleteLogs / Math.max(activityLogs.length, 1)) * 100}%` }}
                          className="h-full bg-red-500"
                          title={`Eliminaciones: ${countDeleteLogs}`}
                        />
                      </div>

                      {/* Legend grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>Nuevas Reservas: <strong>{countCreateLogs}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                          <span>Modificaciones: <strong>{countUpdateLogs}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Ajustes / Precios: <strong>{countSettingsLogs}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                          <span>Eliminaciones: <strong>{countDeleteLogs}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Firestore Cloud Storage Summary Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1E3A45] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Base de datos en la nube 100% activa (Firebase Firestore)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Los datos persisten en Google Cloud: aunque el hosting se reinicie o entres desde tu celular, tus reservas y este historial nunca se borran.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Total Registros Auditados</span>
                  <span className="text-2xl font-black text-white">{activityLogs.length}</span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Buscar por código, huésped, acción o detalle..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4D7080]/30 focus:border-[#4D7080]"
                  />
                  {logSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLogSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLogFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      logFilter === 'all'
                        ? 'bg-[#4D7080] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({activityLogs.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('delete')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      logFilter === 'delete'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminaciones ({activityLogs.filter((l) => l.action === 'eliminacion_reserva').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('create')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      logFilter === 'create'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nuevas Reservas ({activityLogs.filter((l) => l.action === 'creacion_reserva').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('update')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      logFilter === 'update'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Modificaciones ({activityLogs.filter((l) => l.action === 'modificacion_estado').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogFilter('settings')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      logFilter === 'settings'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                    <span>Ajustes & Precios</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of activity cards */}
            {filteredActivityLogs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">No hay registros para este filtro</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {logSearchQuery
                    ? `No se encontraron coincidencias para "${logSearchQuery}". Probá con otro término.`
                    : 'A medida que se creen, modifiquen o eliminen reservas, aparecerán listados aquí en orden cronológico.'}
                </p>
                {logSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLogSearchQuery('')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivityLogs.map((log) => {
                  const isDelete = log.action === 'eliminacion_reserva' || log.type === 'danger';
                  const isCreate = log.action === 'creacion_reserva' || log.type === 'success';
                  const isUpdate = log.action === 'modificacion_estado';
                  const isSettings =
                    log.action === 'cambio_tarifa' ||
                    log.action === 'creacion_cupon' ||
                    log.action === 'bloqueo_fechas' ||
                    log.action === 'cambio_promo';

                  let badgeBorder = 'border-slate-200 bg-white';
                  let badgeText = 'text-slate-700';
                  let badgeLabel = 'ACTIVIDAD';
                  let iconBg = 'bg-slate-100 text-slate-600';
                  let IconComponent = ClipboardList;

                  if (isDelete) {
                    badgeBorder = 'border-red-200 bg-red-50/40 hover:bg-red-50';
                    badgeText = 'text-red-700 bg-red-100 border-red-200';
                    badgeLabel = 'REGISTRO ELIMINADO';
                    iconBg = 'bg-red-100 text-red-600';
                    IconComponent = Trash2;
                  } else if (isCreate) {
                    badgeBorder = 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50';
                    badgeText = 'text-emerald-800 bg-emerald-100 border-emerald-200';
                    badgeLabel = 'NUEVA RESERVA';
                    iconBg = 'bg-emerald-100 text-emerald-600';
                    IconComponent = Plus;
                  } else if (isUpdate) {
                    badgeBorder = 'border-sky-200 bg-sky-50/30 hover:bg-sky-50';
                    badgeText = 'text-sky-800 bg-sky-100 border-sky-200';
                    badgeLabel = 'CAMBIO DE ESTADO';
                    iconBg = 'bg-sky-100 text-sky-600';
                    IconComponent = RefreshCw;
                  } else if (isSettings) {
                    badgeBorder = 'border-amber-200 bg-amber-50/30 hover:bg-amber-50';
                    badgeText = 'text-amber-800 bg-amber-100 border-amber-200';
                    badgeLabel = 'CONFIGURACIÓN';
                    iconBg = 'bg-amber-100 text-amber-600';
                    IconComponent = Settings;
                  }

                  return (
                    <div
                      key={log.id}
                      className={`p-5 rounded-2xl border transition-all shadow-xs ${badgeBorder}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeText}`}>
                                {badgeLabel}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                Por: <strong className="text-slate-800">{log.performedBy}</strong>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                              {log.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatLogDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail description box */}
                      <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-mono sm:font-sans whitespace-pre-wrap">
                        {log.details}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Reservation Confirmation Modal (Fixes iframe window.confirm blocking bug) */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Eliminar reserva de la Base de Datos?
              </h3>
              <p className="text-xs text-slate-500">
                Esta acción borrará de forma permanente el registro del sistema de Pasaje Montes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Código de Reserva:</span>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {reservationToDelete.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Huésped:</span>
                <span className="font-bold text-slate-900">{reservationToDelete.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fechas:</span>
                <span className="font-semibold text-slate-800">
                  {reservationToDelete.checkIn} al {reservationToDelete.checkOut} ({reservationToDelete.nights} noches)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto Total:</span>
                <span className="font-black text-emerald-700">{formatCurrency(reservationToDelete.totalPrice)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingReservation}
                onClick={() => setReservationToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingReservation}
                onClick={handleConfirmDeleteReservation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingReservation ? 'Borrando...' : 'Sí, Eliminar Registro'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reservation Confirmation Modal (Frees up dates on the public website) */}
      {reservationToCancel && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Cancelar Reserva y Liberar Fechas?
              </h3>
              <p className="text-xs text-slate-500">
                Al cancelar, las fechas de esta reserva quedarán <strong>nuevamente libres y disponibles en la página web pública</strong> para que otros huéspedes puedan reservar.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Código de Reserva:</span>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {reservationToCancel.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Huésped:</span>
                <span className="font-bold text-slate-900">{reservationToCancel.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fechas a liberar:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {reservationToCancel.checkIn} al {reservationToCancel.checkOut} ({reservationToCancel.nights} noches)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado actual:</span>
                <span className="font-semibold text-slate-800">
                  {reservationToCancel.status === 'confirmada' ? '✓ Seña Confirmada' : '⏳ Pendiente de Seña'}
                </span>
              </div>
              {reservationToCancel.status === 'confirmada' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                  <span className="font-bold block">⚠️ Seña previa registrada:</span>
                  <span>Esta reserva contaba con seña del 50% ({formatCurrency(reservationToCancel.depositAmount)}). Al cancelarla, el estado cambiará a &quot;Cancelada&quot; en la base de datos Firestore y en el Dashboard.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isCancellingReservation}
                onClick={() => setReservationToCancel(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                No cancelar / Volver
              </button>
              <button
                type="button"
                disabled={isCancellingReservation}
                onClick={handleConfirmCancelReservation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>{isCancellingReservation ? 'Cancelando...' : 'Sí, Cancelar y Liberar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {emailModalReservation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                    ✓ Seña Recibida Confirmada en Base de Datos
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                    Email de Agradecimiento & Bienvenida al Huésped
                  </h3>
                  <p className="text-xs text-slate-600">
                    Reserva <strong>{emailModalReservation.code}</strong> para <strong>{emailModalReservation.guestName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEmailModalReservation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  Email del Huésped: {emailModalReservation.guestEmail}
                </span>
                <span className="bg-emerald-200/70 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded">
                  Seña Recibida: {formatCurrency(emailModalReservation.depositAmount)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Mensaje personalizado listo para enviar. Agradece la seña, confirma las fechas bloqueadas y detalla el ingreso a <strong>Pasaje Montes - Alojamiento</strong>.
              </p>
            </div>

            {/* Email Body Preview Box */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5 font-sans text-xs text-slate-700 max-h-64">
              <div className="border-b border-slate-200/80 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asunto del Correo:</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {generateDepositConfirmationMessage(emailModalReservation).subject}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contenido del Mensaje de Bienvenida:</span>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 select-all">
                  {generateDepositConfirmationMessage(emailModalReservation).bodyPlain}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Open in Mail Client */}
                <a
                  href={generateDepositConfirmationMessage(emailModalReservation).mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar por Correo (Gmail / Outlook)</span>
                </a>

                {/* Copy Message */}
                <button
                  type="button"
                  onClick={() => {
                    const msg = generateDepositConfirmationMessage(emailModalReservation);
                    navigator.clipboard.writeText(msg.bodyPlain);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2500);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {emailCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{emailCopied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* WhatsApp share */}
                <a
                  href={`https://wa.me/${emailModalReservation.guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    generateDepositConfirmationMessage(emailModalReservation).bodyPlain
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setEmailModalReservation(null)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE MONTO TOTAL FACTURADO */}
      {billingDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                    Métricas de Facturación
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ¿Qué quiere decir &quot;Monto Total Facturado&quot;?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Desglose económico de las estadías vendidas y confirmadas en Pasaje Montes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBillingDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl text-xs text-emerald-950 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Info className="w-4 h-4 text-emerald-700" />
                Significado y Composición:
              </h4>
              <p className="leading-relaxed">
                El <strong>Monto Total Facturado ({formatCurrency(totalBilledAmount)})</strong> representa el volumen bruto de ventas consolidado de todas las reservas que tienen su <strong>seña confirmada</strong> en la base de datos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <span className="font-black text-emerald-800 block">1. Señas Cobradas (50%):</span>
                  <span className="text-slate-700">
                    <strong>{formatCurrency(totalDepositsReceived)}</strong> ya transferidos y cobrados en tu cuenta de Mercado Pago o bancaria.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-black text-amber-800 block">2. Saldos a Cobrar (50%):</span>
                  <span className="text-slate-700">
                    <strong>{formatCurrency(totalBalancesPending)}</strong> a percibir cuando el huésped hace su ingreso (check-in) al departamento.
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmed items list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60 pr-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Reservas que componen este monto ({confirmedList.length}):
              </span>
              {confirmedList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Aún no hay reservas confirmadas registradas.
                </div>
              ) : (
                confirmedList.map((res) => (
                  <div key={res.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-[#4D7080] text-white px-2 py-0.5 rounded text-[10px]">
                          {res.code}
                        </span>
                        <strong className="text-slate-900">{res.guestName}</strong>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {res.checkIn} al {res.checkOut} ({res.nights} noches · {res.guestsCount} pers.)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 block">{formatCurrency(res.totalPrice)}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Seña: {formatCurrency(res.depositAmount)} · Saldo: {formatCurrency(res.balanceDue)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions footer */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setBillingDetailModalOpen(false);
                  setActiveTab('reservas');
                  setStatusFilter('confirmada');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ir al Listado de Reservas Confirmadas</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE MONTOS DE RESERVAS CANCELADAS */}
      {cancelledDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 inline-block">
                    Gestión de Cancelaciones
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ¿Qué quiere decir &quot;Montos de Reservas Canceladas&quot;?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Historial de reservas canceladas, impacto contable y liberación de fechas en la web.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCancelledDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-red-50/70 border border-red-200/90 rounded-2xl text-xs text-red-950 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-red-900">
                <Info className="w-4 h-4 text-red-700" />
                Significado y Reglas de Funcionamiento:
              </h4>
              <p className="leading-relaxed">
                El <strong>Monto de Reservas Canceladas ({formatCurrency(totalCancelledAmount)})</strong> es la sumatoria del valor económico de todas aquellas solicitudes o estadías que fueron canceladas en el sistema (tanto antes de la seña como después de ella).
              </p>
              <div className="space-y-1.5 pt-1 text-[11px] text-slate-700">
                <div className="p-2.5 rounded-xl bg-white border border-red-200 flex items-start gap-2 shadow-2xs">
                  <span className="font-bold text-red-700 shrink-0">1. No suma en Facturación:</span>
                  <span>Este dinero no computa en los ingresos netos de tu propiedad para garantizar estadísticas 100% reales.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-start gap-2 shadow-2xs">
                  <span className="font-bold text-emerald-800 shrink-0">2. Fechas Liberadas en la Web:</span>
                  <span>Al cancelar la reserva, el sistema desbloquea automáticamente los días <strong>({totalCancelledNights} noches liberadas en total)</strong> en el cotizador y calendario público para que otros huéspedes puedan reservar.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 shadow-2xs">
                  <span className="font-bold text-slate-800 shrink-0">3. Posibilidad de Reactivación:</span>
                  <span>Si el huésped cambia de opinión o fue un error, podés reactivar la reserva en cualquier momento desde la pestaña &quot;Reservas&quot; (siempre que las fechas no hayan sido tomadas por otro cliente).</span>
                </div>
              </div>
            </div>

            {/* Cancelled items list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60 pr-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Reservas canceladas ({cancelledList.length}):
              </span>
              {cancelledList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No tenés reservas canceladas registradas en la base de datos.
                </div>
              ) : (
                cancelledList.map((res) => (
                  <div key={res.id} className="p-3 rounded-xl bg-red-50/40 border border-red-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">
                          {res.code}
                        </span>
                        <strong className="text-slate-900">{res.guestName}</strong>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          ✓ Fechas libres en la web
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {res.checkIn} al {res.checkOut} ({res.nights} noches liberadas)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-red-900 block">{formatCurrency(res.totalPrice)}</span>
                      <span className="text-[10px] text-slate-500">
                        {res.depositAmount > 0 ? `Seña: ${formatCurrency(res.depositAmount)}` : 'Sin seña confirmada'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions footer */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCancelledDetailModalOpen(false);
                  setActiveTab('reservas');
                  setStatusFilter('cancelada');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Ir al Listado de Canceladas</span>
              </button>

              <button
                type="button"
                onClick={() => setCancelledDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

