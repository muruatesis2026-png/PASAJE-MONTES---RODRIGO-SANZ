import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

interface AvailabilityCalendarProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  unavailableDates: Set<string>;
  onSelectionError?: (msg: string) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  unavailableDates,
  onSelectionError,
}) => {
  // Calendar current display month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    if (checkInDate) {
      const parts = checkInDate.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    }
    return new Date();
  });

  const todayStr = formatDate(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days for current month
  const firstDayOfMonth = new Date(year, month, 1);
  // Sunday is 0, so adjust for Monday start (0: Monday, ..., 6: Sunday)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Handle clicking a day
  const handleDayClick = (dayStr: string) => {
    // If it's in the past or unavailable, reject
    if (dayStr < todayStr) return;
    if (unavailableDates.has(dayStr)) {
      if (onSelectionError) {
        onSelectionError(`El día ${dayStr} ya se encuentra ocupado o bloqueado. Por favor elegí una fecha libre.`);
      }
      return;
    }

    // If no check-in is selected, or if both are selected, set new check-in
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dayStr);
      setCheckOutDate('');
      return;
    }

    // If checkInDate is set but no checkOutDate
    if (checkInDate && !checkOutDate) {
      if (dayStr <= checkInDate) {
        // If clicked earlier or same day, reset check-in to this day
        setCheckInDate(dayStr);
        setCheckOutDate('');
        return;
      }

      // Check if any date between checkIn and this day is blocked!
      const start = new Date(checkInDate + 'T00:00:00');
      const end = new Date(dayStr + 'T00:00:00');
      let cur = new Date(start);
      let hasConflict = false;
      let conflictDateStr = '';

      while (cur < end) {
        const curStr = formatDate(cur);
        if (unavailableDates.has(curStr)) {
          hasConflict = true;
          conflictDateStr = curStr;
          break;
        }
        cur.setDate(cur.getDate() + 1);
      }

      if (hasConflict) {
        if (onSelectionError) {
          onSelectionError(
            `No podés reservar este rango porque el día ${conflictDateStr} está bloqueado/ocupado.`
          );
        }
        return;
      }

      // Valid range!
      setCheckOutDate(dayStr);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#4D7080]" />
          <h4 className="text-sm font-bold text-slate-800 capitalize">
            {monthNames[month]} {year}
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
          <div key={`empty-${i}`} className="h-9 sm:h-10" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(year, month, dayNum);
          const dayStr = formatDate(dayDate);

          const isPast = dayStr < todayStr;
          const isBlocked = unavailableDates.has(dayStr);
          const isCheckIn = dayStr === checkInDate;
          const isCheckOut = dayStr === checkOutDate;
          const isInRange =
            checkInDate &&
            checkOutDate &&
            dayStr > checkInDate &&
            dayStr < checkOutDate;

          let dayClasses = 'relative h-9 sm:h-10 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ';

          if (isPast) {
            dayClasses += 'text-slate-300 bg-slate-50 cursor-not-allowed';
          } else if (isBlocked) {
            dayClasses += 'bg-red-50 text-red-500 font-bold border border-red-200 line-through cursor-not-allowed shadow-2xs hover:bg-red-100';
          } else if (isCheckIn) {
            dayClasses += 'bg-[#4D7080] text-white font-bold shadow-md ring-2 ring-[#4D7080]/30 z-10 cursor-pointer';
          } else if (isCheckOut) {
            dayClasses += 'bg-[#4D7080] text-white font-bold shadow-md ring-2 ring-[#4D7080]/30 z-10 cursor-pointer';
          } else if (isInRange) {
            dayClasses += 'bg-[#4D7080]/15 text-[#24424D] font-bold cursor-pointer';
          } else {
            dayClasses += 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 hover:border-emerald-300 cursor-pointer';
          }

          return (
            <button
              key={dayStr}
              type="button"
              disabled={isPast || isBlocked}
              onClick={() => handleDayClick(dayStr)}
              className={dayClasses}
              title={
                isBlocked
                  ? `Fecha ${dayStr} Bloqueada / Ocupada`
                  : isCheckIn
                  ? 'Check-in (Ingreso)'
                  : isCheckOut
                  ? 'Check-out (Salida)'
                  : `Disponible (${dayStr})`
              }
            >
              <span>{dayNum}</span>
              {isBlocked && (
                <span className="text-[8px] font-normal leading-none block -mt-0.5 text-red-600">
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
          <span className="text-red-600 font-medium">Bloqueado / Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#4D7080] shrink-0"></span>
          <span>Tu Estadía</span>
        </div>
      </div>
    </div>
  );
};
