import { Reservation } from '../types';

/**
 * Parses YYYY-MM-DD string into year, month (1-12), day (1-31).
 * Completely timezone-safe: does NOT use new Date("YYYY-MM-DD") which shifts in UTC-3 (Argentina).
 */
export function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Formats year, month (1-12), day (1-31) to YYYY-MM-DD.
 */
export function buildDateStr(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date in local time as YYYY-MM-DD without any timezone drift.
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return buildDateStr(year, month, day);
}

/**
 * Timezone-safe date formatting for Date object using local year, month, date.
 */
export function formatDate(d: Date): string {
  return buildDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Safely adds N days to a YYYY-MM-DD date string using UTC arithmetic.
 * Guarantees zero timezone offset drift in UTC-3 or any other timezone.
 */
export function addDays(dateStr: string, daysToAdd: number): string {
  const p = parseDateParts(dateStr);
  if (!p) return dateStr;
  const utcDate = new Date(Date.UTC(p.year, p.month - 1, p.day + daysToAdd));
  return buildDateStr(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate()
  );
}

/**
 * Returns difference in nights between startStr and endStr (end - start).
 */
export function getDaysDifference(startStr: string, endStr: string): number {
  const p1 = parseDateParts(startStr);
  const p2 = parseDateParts(endStr);
  if (!p1 || !p2) return 0;
  const utc1 = Date.UTC(p1.year, p1.month - 1, p1.day);
  const utc2 = Date.UTC(p2.year, p2.month - 1, p2.day);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-friendly Spanish string, e.g. "4 de noviembre de 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  const p = parseDateParts(dateStr);
  if (!p) return dateStr;
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${p.day} de ${monthNames[p.month - 1]} de ${p.year}`;
}

/**
 * Collects all dates (YYYY-MM-DD) that are unavailable:
 * - Dates manually blocked by the host in hostSettings.blockedDates
 * - Nights occupied by active reservations (status != 'cancelada')
 * Optional: excludeReservationId prevents a newly confirmed reservation from conflicting with itself.
 */
export function getAllUnavailableDates(
  reservations: Reservation[] = [],
  blockedDates: string[] = [],
  excludeReservationId?: string
): Set<string> {
  const unavailable = new Set<string>();

  // 1. Manually blocked dates
  if (Array.isArray(blockedDates)) {
    blockedDates.forEach((d) => {
      if (d && typeof d === 'string') {
        const clean = d.trim();
        if (clean) unavailable.add(clean);
      }
    });
  }

  // 2. Dates from active reservations
  if (Array.isArray(reservations)) {
    reservations.forEach((res) => {
      if (!res || res.status === 'cancelada') return;
      if (excludeReservationId && res.id === excludeReservationId) return;
      if (!res.checkIn || !res.checkOut) return;

      const totalNights = getDaysDifference(res.checkIn, res.checkOut);
      if (totalNights <= 0) return;

      for (let i = 0; i < totalNights; i++) {
        const nightStr = addDays(res.checkIn, i);
        unavailable.add(nightStr);
      }
    });
  }

  return unavailable;
}

/**
 * Checks if a specific date string (YYYY-MM-DD) is unavailable
 */
export function isDateUnavailable(
  dateStr: string,
  unavailableDates: Set<string>
): boolean {
  return unavailableDates.has(dateStr);
}

/**
 * Validates if a stay range [checkIn, checkOut) is completely free of blocked dates.
 * Returns { available: boolean, conflictDate?: string, conflictDates: string[] }
 */
export function checkRangeAvailability(
  checkIn: string,
  checkOut: string,
  unavailableDates: Set<string>
): { available: boolean; conflictDate?: string; conflictDates: string[] } {
  if (!checkIn || !checkOut) {
    return { available: true, conflictDates: [] };
  }

  const nights = getDaysDifference(checkIn, checkOut);
  if (nights <= 0) {
    return { available: false, conflictDates: [] };
  }

  const conflicts: string[] = [];

  for (let i = 0; i < nights; i++) {
    const curDate = addDays(checkIn, i);
    if (unavailableDates.has(curDate)) {
      conflicts.push(curDate);
    }
  }

  return {
    available: conflicts.length === 0,
    conflictDate: conflicts[0],
    conflictDates: conflicts,
  };
}
