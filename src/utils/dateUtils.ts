import { Reservation } from '../types';

/**
 * Returns a formatted date string YYYY-MM-DD for a given Date object in local time
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-friendly string, e.g. "25 de octubre"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Collects all dates (YYYY-MM-DD) that are unavailable:
 * - Dates manually blocked by the host in hostSettings.blockedDates
 * - Nights occupied by confirmed (or pending) reservations
 */
export function getAllUnavailableDates(
  reservations: Reservation[] = [],
  blockedDates: string[] = []
): Set<string> {
  const unavailable = new Set<string>();

  // 1. Manually blocked dates
  if (Array.isArray(blockedDates)) {
    blockedDates.forEach((d) => {
      if (d && typeof d === 'string') {
        unavailable.add(d.trim());
      }
    });
  }

  // 2. Dates from active reservations (status != 'cancelada')
  if (Array.isArray(reservations)) {
    reservations.forEach((res) => {
      if (res.status === 'cancelada') return;
      if (!res.checkIn || !res.checkOut) return;

      const start = new Date(res.checkIn + 'T00:00:00');
      const end = new Date(res.checkOut + 'T00:00:00');

      // Add each night of the reservation
      const cur = new Date(start);
      while (cur < end) {
        unavailable.add(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
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
 * Returns { available: boolean, conflictDate?: string, conflictCount: number }
 */
export function checkRangeAvailability(
  checkIn: string,
  checkOut: string,
  unavailableDates: Set<string>
): { available: boolean; conflictDate?: string; conflictDates: string[] } {
  if (!checkIn || !checkOut) {
    return { available: true, conflictDates: [] };
  }

  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');

  if (start >= end) {
    return { available: false, conflictDates: [] };
  }

  const conflicts: string[] = [];
  const cur = new Date(start);

  while (cur < end) {
    const dStr = formatDate(cur);
    if (unavailableDates.has(dStr)) {
      conflicts.push(dStr);
    }
    cur.setDate(cur.getDate() + 1);
  }

  return {
    available: conflicts.length === 0,
    conflictDate: conflicts[0],
    conflictDates: conflicts,
  };
}
