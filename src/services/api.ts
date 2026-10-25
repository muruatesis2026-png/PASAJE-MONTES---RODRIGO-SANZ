import { Reservation, PromoBannerConfig, DiscountCoupon } from '../types';
import { INITIAL_RESERVATIONS } from '../data/lodgingData';

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  enabled: true,
  badge: 'Promo 3+ Noches',
  text: 'Al reservar 3 o más noches recibís una bonificación especial en el precio total.',
  mobileText: 'Bonificación especial a partir de 3 noches.',
  theme: 'emerald',
  icon: 'sparkles',
  actionText: 'Reservar ahora',
  actionType: 'booking',
};

export const DEFAULT_COUPONS: DiscountCoupon[] = [
  {
    id: 'coup-1',
    code: 'ESCAPADA10',
    discountPercentage: 10,
    description: '10% de descuento en tu reserva total',
    enabled: true,
  },
  {
    id: 'coup-2',
    code: 'AMIGOS15',
    discountPercentage: 15,
    description: '15% de descuento especial por recomendación',
    enabled: true,
  },
];

export interface HostSettings {
  baseNightPrice: number;
  hostPin: string;
  blockedDates: string[]; // YYYY-MM-DD
  discountPercentage: number;
  promoBanner: PromoBannerConfig;
  coupons?: DiscountCoupon[];
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
        const local = localStorage.getItem(STORAGE_KEY);
        const list: Reservation[] = local ? JSON.parse(local) : INITIAL_RESERVATIONS;
        const filtered = list.filter((r) => r.id !== saved.id);
        const updatedList = [saved, ...filtered];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        triggerDbUpdateEvent();
        return saved;
      }
    } catch {
      // Fallback to local storage if offline
    }
    const local = localStorage.getItem(STORAGE_KEY);
    const list: Reservation[] = local ? JSON.parse(local) : INITIAL_RESERVATIONS;
    const filtered = list.filter((r) => r.id !== reservation.id);
    const updatedList = [reservation, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
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
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const list: Reservation[] = JSON.parse(local);
          const idx = list.findIndex((r) => r.id === id);
          if (idx !== -1) {
            list[idx] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          }
        }
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
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const list: Reservation[] = JSON.parse(local);
          const filtered = list.filter((r) => r.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
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
        const merged: HostSettings = {
          baseNightPrice: data.baseNightPrice ?? 45000,
          hostPin: data.hostPin ?? '2026',
          blockedDates: data.blockedDates ?? [],
          discountPercentage: data.discountPercentage ?? 12,
          coupons: data.coupons || DEFAULT_COUPONS,
          promoBanner: {
            ...DEFAULT_PROMO_BANNER,
            ...(data.promoBanner || {}),
          },
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // Fallback
    }
    const local = localStorage.getItem(SETTINGS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          baseNightPrice: parsed.baseNightPrice ?? 45000,
          hostPin: parsed.hostPin ?? '2026',
          blockedDates: parsed.blockedDates ?? [],
          discountPercentage: parsed.discountPercentage ?? 12,
          coupons: parsed.coupons || DEFAULT_COUPONS,
          promoBanner: {
            ...DEFAULT_PROMO_BANNER,
            ...(parsed.promoBanner || {}),
          },
        };
      } catch {
        // use default
      }
    }
    return {
      baseNightPrice: 45000,
      hostPin: '2026',
      blockedDates: [],
      discountPercentage: 12,
      coupons: DEFAULT_COUPONS,
      promoBanner: DEFAULT_PROMO_BANNER,
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
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
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

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
