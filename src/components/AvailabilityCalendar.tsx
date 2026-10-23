import React, { useState } from 'react';
import {
  buildDateStr,
  getTodayDateStr,
  parseDateParts,
  addDays,
  getDaysDifference,
  formatFriendlyDate,
} from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Ban } from 'lucide-react';

interface AvailabilityCalendarProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  unavailableDates: Set<string>;
  onSelectionError?: (msg: string) => void;
  onSelectionSuccess?: (msg: string) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  unavailableDates,
  onSelectionError,
  onSelectionSuccess,
}) => {
  // Calendar current display month: year & month (1-12)
  const todayParts = parseDateParts(getTodayDateStr()) || { year: 2026, month: 10, day: 23 };

  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (checkInDate) {
      const p = parseDateParts(checkInDate);
      if (p) return p.year;
    }
    return todayParts.year;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (checkInDate) {
      const p = parseDateParts(checkInDate);
      if (p) return p.month;
    }
    return todayParts.month;
  });

  const todayStr = getTodayDateStr();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Start day of week (Monday = 0, Sunday = 6) using UTC
  const firstDayUtc = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  let startDayOfWeek = firstDayUtc.getUTCDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Days in month
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();

  // Handle clicking a day
  const handleDayClick = (dayStr: string) => {
    // 1. Past dates
    if (dayStr < todayStr) {
      if (onSelectionError) {
        onSelectionError('No es posible seleccionar una fecha anterior al día de hoy.');
      }
      return;
    }

    // 2. Clicked date is blocked or occupied
    if (unavailableDates.has(dayStr)) {
      if (onSelectionError) {
        onSelectionError(`Elige una fecha que no esté ocupada: El día ${formatFriendlyDate(dayStr)} ya se encuentra reservado.`);
      }
      return;
    }

    // 3. Selection logic
    // If no check-in is selected, or if both were already selected, start a fresh selection
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dayStr);
      setCheckOutDate('');
      if (onSelectionSuccess) {
        onSelectionSuccess(`Ingreso seleccionado: ${formatFriendlyDate(dayStr)}. Ahora seleccioná la fecha de salida (Check-out).`);
      }
      return;
    }

    // If checkInDate is selected and we are picking checkOutDate
    if (checkInDate && !checkOutDate) {
      if (dayStr <= checkInDate) {
        // Clicked same or earlier day: reset check-in to this date
        setCheckInDate(dayStr);
        setCheckOutDate('');
        if (onSelectionSuccess) {
          onSelectionSuccess(`Nuevo ingreso seleccionado: ${formatFriendlyDate(dayStr)}. Elegí la fecha de salida.`);
        }
        return;
      }

      // Check if any date in between is occupied
      const nights = getDaysDifference(checkInDate, dayStr);
      let conflictDate = '';

      for (let i = 0; i < nights; i++) {
        const intermediate = addDays(checkInDate, i);
        if (unavailableDates.has(intermediate)) {
          conflictDate = intermediate;
          break;
        }
      }

      if (conflictDate) {
        if (onSelectionError) {
          onSelectionError(
            `Elige una fecha que no esté ocupada: El día ${formatFriendlyDate(conflictDate)} dentro del rango ya se encuentra reservado.`
          );
        }
        return;
      }

      // Valid range!
      setCheckOutDate(dayStr);
      if (onSelectionSuccess) {
        onSelectionSuccess(
          `¡Fechas 100% disponibles! Del ${formatFriendlyDate(checkInDate)} al ${formatFriendlyDate(dayStr)} (${nights} noches).`
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#4D7080]" />
          <h4 className="text-sm font-bold text-slate-800 capitalize">
            {monthNames[currentMonth - 1]} {currentYear}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {daysOfWeek.map((d, idx) => (
          <span key={idx} className="text-[11px] font-bold text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty cells before month start */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-11" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = buildDateStr(currentYear, currentMonth, dayNum);

          const isPast = dayStr < todayStr;
          const isBlocked = unavailableDates.has(dayStr);
          const isCheckIn = dayStr === checkInDate;
          const isCheckOut = dayStr === checkOutDate;
          const isInRange =
            Boolean(checkInDate) &&
            Boolean(checkOutDate) &&
            dayStr > checkInDate &&
            dayStr < checkOutDate;

          let dayClasses = 'relative h-10 sm:h-11 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ';

          if (isPast) {
            dayClasses += 'text-slate-300 bg-slate-50 cursor-not-allowed';
          } else if (isBlocked) {
            dayClasses += 'bg-red-50 text-red-600 font-bold border border-red-200 line-through shadow-2xs hover:bg-red-100 active:scale-95';
          } else if (isCheckIn) {
            dayClasses += 'bg-[#4D7080] text-white font-bold shadow-md ring-2 ring-[#4D7080]/30 z-10';
          } else if (isCheckOut) {
            dayClasses += 'bg-[#4D7080] text-white font-bold shadow-md ring-2 ring-[#4D7080]/30 z-10';
          } else if (isInRange) {
            dayClasses += 'bg-[#4D7080]/15 text-[#24424D] font-bold';
          } else {
            dayClasses += 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 hover:border-emerald-300 active:scale-95';
          }

          return (
            <button
              key={dayStr}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(dayStr)}
              className={dayClasses}
              title={
                isBlocked
                  ? `Fecha ocupada / reservada (${formatFriendlyDate(dayStr)}). Clic para ver aviso.`
                  : isCheckIn
                  ? `Check-in: ${formatFriendlyDate(dayStr)}`
                  : isCheckOut
                  ? `Check-out: ${formatFriendlyDate(dayStr)}`
                  : `Disponible (${formatFriendlyDate(dayStr)})`
              }
            >
              <span className="leading-none">{dayNum}</span>
              {isBlocked && (
                <span className="text-[8px] font-bold leading-none block mt-0.5 text-red-600">
                  Ocupado
                </span>
              )}
              {isCheckIn && (
                <span className="text-[7px] leading-none uppercase font-bold block mt-0.5">
                  Ingreso
                </span>
              )}
              {isCheckOut && (
                <span className="text-[7px] leading-none uppercase font-bold block mt-0.5">
                  Salida
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-red-100 border border-red-300 shrink-0"></span>
          <span className="text-red-600 font-bold">Ocupado / Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#4D7080] shrink-0"></span>
          <span>Tu Estadía</span>
        </div>
      </div>
    </div>
  );
};
