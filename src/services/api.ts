import { Reservation } from '../types';
import { INITIAL_RESERVATIONS } from '../data/lodgingData';

export interface HostSettings {
  baseNightPrice: number;
  hostPin: string;
  blockedDates: string[]; // YYYY-MM-DD
  discountPercentage: number;
}

export interface AvailabilityData {
  blockedDates: string[];
  occupiedDates: string[];
  allUnavailableDates: string[];
  lastUpdated: string;
}

const STORAGE_KEY = 'pasaje_montes_reservas';
const SETTINGS_KEY = 'pasaje_montes_settings';

function triggerDbUpdateEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pasaje_montes_db_update'));
  }
}

export const api = {
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch {
      // Offline/fallback
    }
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_RESERVATIONS;
  },

  async getAvailability(): Promise<AvailabilityData> {
    try {
      const res = await fetch('/api/availability', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const localSettings = await this.getSettings();
    return {
      blockedDates: localSettings.blockedDates || [],
      occupiedDates: [],
      allUnavailableDates: localSettings.blockedDates || [],
      lastUpdated: new Date().toISOString(),
    };
  },

  async createReservation(reservation: Reservation): Promise<Reservation> {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(reservation),
      });
      if (res.ok) {
        const saved = await res.json();
        triggerDbUpdateEvent();
        return saved;
      }
    } catch {
      // Fallback
    }
    // Fallback to local
    const local = localStorage.getItem(STORAGE_KEY);
    const list: Reservation[] = local ? JSON.parse(local) : INITIAL_RESERVATIONS;
    list.unshift(reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    triggerDbUpdateEvent();
    return reservation;
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        triggerDbUpdateEvent();
        return updated;
      }
    } catch {
      // Fallback
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        triggerDbUpdateEvent();
        return list[idx];
      }
    }
    return null;
  },

  async deleteReservation(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        triggerDbUpdateEvent();
        return true;
      }
    } catch {
      // Fallback
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const filtered = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      triggerDbUpdateEvent();
      return true;
    }
    return false;
  },

  async getSettings(): Promise<HostSettings> {
    try {
      const res = await fetch('/api/settings', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
        return data;
      }
    } catch {
      // Fallback
    }
    const local = localStorage.getItem(SETTINGS_KEY);
    return local
      ? JSON.parse(local)
      : {
          baseNightPrice: 45000,
          hostPin: '2026',
          blockedDates: [],
          discountPercentage: 12,
        };
  },

  async updateSettings(settings: Partial<HostSettings>): Promise<HostSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        triggerDbUpdateEvent();
        return updated;
      }
    } catch {
      // Fallback
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    triggerDbUpdateEvent();
    return updated;
  },

  async verifyPin(pin: string): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
    } catch {
      // Fallback check
    }
    const settings = await this.getSettings();
    return pin === settings.hostPin || pin === '2026';
  },
};
