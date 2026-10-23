import React, { useState } from 'react';
import { Reservation } from '../types';
import { LODGING_INFO } from '../data/lodgingData';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  Search,
} from 'lucide-react';

interface AdminReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onUpdateStatus: (id: string, newStatus: Reservation['status']) => void;
}

export const AdminReservationsModal: React.FC<AdminReservationsModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'pendiente_sena' | 'confirmada'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = reservations
    .filter((r) => (filter === 'all' ? true : r.status === filter))
    .filter(
      (r) =>
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.guestName.toLowerCase().includes(search.toLowerCase()) ||
        r.guestEmail.toLowerCase().includes(search.toLowerCase())
    );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalConfirmed = reservations.filter((r) => r.status === 'confirmada').length;
  const totalPending = reservations.filter((r) => r.status === 'pendiente_sena').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xl font-bold text-slate-900">
                Panel de Administración · {LODGING_INFO.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión directa de reservas y consultas para el anfitrión {LODGING_INFO.hostName}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Host Stats */}
        <div className="p-6 bg-[#FBF8F3] border-b border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Registradas</span>
            <p className="text-xl font-black text-slate-800">{reservations.length}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Confirmadas</span>
            <p className="text-xl font-black text-emerald-700">{totalConfirmed}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] text-amber-600 font-bold uppercase">Pendientes Seña</span>
            <p className="text-xl font-black text-amber-700">{totalPending}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-[#4D7080] font-bold uppercase">Tarifa Noche</span>
            <p className="text-xl font-black text-[#4D7080]">{formatCurrency(LODGING_INFO.baseNightPrice)}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-[#4D7080] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({reservations.length})
            </button>
            <button
              onClick={() => setFilter('pendiente_sena')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === 'pendiente_sena'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Pendientes ({totalPending})
            </button>
            <button
              onClick={() => setFilter('confirmada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === 'confirmada'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Confirmadas ({totalConfirmed})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar reserva..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4D7080]"
            />
          </div>
        </div>

        {/* Reservations List */}
        <div className="p-4 sm:p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No hay reservas en este estado.
            </div>
          ) : (
            filtered.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#4D7080] text-white font-mono font-bold text-xs rounded-lg">
                      {res.code}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{res.guestName}</span>
                    {res.guestOrigin && (
                      <span className="text-xs text-slate-400 hidden sm:inline">({res.guestOrigin})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        res.status === 'confirmada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {res.status === 'confirmada' ? 'Confirmada' : 'Pendiente Seña'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fechas</span>
                    <span className="font-semibold text-slate-800">
                      {res.checkIn} → {res.checkOut}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estadía</span>
                    <span className="font-semibold text-slate-800">
                      {res.nights} noches · {res.guestsCount} huéspedes
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total / Seña 50%</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(res.totalPrice)} ({formatCurrency(res.depositAmount)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Llegada aprox.</span>
                    <span className="font-semibold text-slate-800">{res.estimatedArrival}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
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
                    {res.status === 'pendiente_sena' ? (
                      <button
                        onClick={() => onUpdateStatus(res.id, 'confirmada')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar Seña</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStatus(res.id, 'pendiente_sena')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                      >
                        Pasar a Pendiente
                      </button>
                    )}

                    <a
                      href={`https://wa.me/${res.guestPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                        res.guestName
                      )},%20te%20contacto%20de%20Pasaje%20Montes%20por%20tu%20reserva%20${res.code}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Huésped</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
