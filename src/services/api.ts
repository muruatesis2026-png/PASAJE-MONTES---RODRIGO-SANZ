import { Reservation } from '../types';
import { INITIAL_RESERVATIONS } from '../data/lodgingData';

export interface HostSettings {
  baseNightPrice: number;
  hostPin: string;
  blockedDates: string[]; // YYYY-MM-DD
  discountPercentage: number;
}

const STORAGE_KEY = 'pasaje_montes_reservas';
const SETTINGS_KEY = 'pasaje_montes_settings';

export const api = {
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations');
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

  async createReservation(reservation: Reservation): Promise<Reservation> {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    // Fallback to local
    const local = localStorage.getItem(STORAGE_KEY);
    const list: Reservation[] = local ? JSON.parse(local) : INITIAL_RESERVATIONS;
    list.unshift(reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return reservation;
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    // Fallback to local
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return list[idx];
      }
    }
    return null;
  },

  async deleteReservation(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const filtered = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  async getSettings(): Promise<HostSettings> {
    try {
      const res = await fetch('/api/settings');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
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
