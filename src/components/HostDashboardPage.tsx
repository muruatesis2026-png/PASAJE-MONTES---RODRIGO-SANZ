import React, { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { LODGING_INFO, BANK_DETAILS } from '../data/lodgingData';
import { api, HostSettings } from '../services/api';
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
} from 'lucide-react';

interface HostDashboardPageProps {
  onBackToPublicSite: () => void;
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservas' | 'nueva' | 'calendario' | 'configuracion'>('calendario');

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

        {/* TAB 4: CONFIGURACIÓN & PRECIOS */}
        {activeTab === 'configuracion' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-xl mx-auto space-y-6">
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
