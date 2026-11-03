import { Reservation, PromoBannerConfig, DiscountCoupon, CommercialPartnership, ActivityLog } from '../types';
import { INITIAL_RESERVATIONS } from '../data/lodgingData';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

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

export const DEFAULT_PARTNERSHIPS: CommercialPartnership[] = [
  {
    id: 'part-kyrios',
    businessName: 'Panadería Kyrios',
    category: 'Panadería & Cafetería',
    discountText: '20% OFF en meriendas',
    details: 'Descuento especial del 20% en combos de meriendas y productos de panificación artesanal seleccionados para huéspedes de Pasaje Montes.',
    validHours: 'Lunes a Sábados de 16:30 a 20:30 hs',
    address: 'Av. Sarmiento esq. Eva Perón, Cruz del Eje',
    whatsapp: '5493549432101',
    howToRedeem: 'Mencioná tu código de reserva de Pasaje Montes o mostrá tu voucher digital al momento del pedido.',
    enabled: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'part-regional',
    businessName: 'Sabores del Valle - Regionales',
    category: 'Productos Regionales & Olivos',
    discountText: '15% OFF en aceites y dulces',
    details: '15% de descuento en aceites de oliva virgen extra de Cruz del Eje, aceitunas marinadas, alfajores y dulces caseros.',
    validHours: 'Todos los días de 09:00 a 13:00 y de 17:30 a 21:30 hs',
    address: 'San Martín 450, Centro, Cruz del Eje',
    whatsapp: '5493549456789',
    howToRedeem: 'Mostrá tu confirmación de reserva de Pasaje Montes en el mostrador.',
    enabled: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'part-resto',
    businessName: 'Restó & Parrilla Don Hipólito',
    category: 'Gastronomía & Parrilla Tradicional',
    discountText: 'Copa de vino o postre de cortesía',
    details: 'Con tu cena o almuerzo, copa de vino de bienvenida o postre tradicional casero sin cargo para todos los integrantes de la reserva.',
    validHours: 'Miércoles a Domingos de 12:00 a 15:30 y 20:30 a 00:30 hs',
    address: 'Costanera del Río Cruz del Eje esq. Belgrano',
    whatsapp: '5493549412345',
    howToRedeem: 'Presentá tu reserva confirmada al momento de pedir la cuenta.',
    enabled: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
];

export interface HostSettings {
  baseNightPrice: number;
  price1Guest?: number; // Tarifa por noche para 1 persona
  price2Guests?: number; // Tarifa por noche para 2 personas
  price3Guests?: number; // Tarifa por noche para 3 personas
  hostPin: string;
  blockedDates: string[]; // YYYY-MM-DD
  discountPercentage: number;
  promoBanner: PromoBannerConfig;
  coupons?: DiscountCoupon[];
  partnerships?: CommercialPartnership[];
}

export function getPricePerNightForGuests(settings?: HostSettings | null, guestsCount: number = 2): number {
  if (!settings) return 45000;
  const count = Number(guestsCount) || 2;
  const fallback = Number(settings.baseNightPrice) || 45000;

  if (count === 1) {
    return Number(settings.price1Guest) || fallback || 40000;
  }
  if (count === 3) {
    return Number(settings.price3Guests) || Math.round(fallback * 1.15) || 52000;
  }
  return Number(settings.price2Guests) || fallback || 45000;
}

export interface AvailabilityData {
  blockedDates: string[];
  occupiedDates: string[];
  allUnavailableDates: string[];
  lastUpdated: string;
}

const STORAGE_KEY = 'pasaje_montes_reservas';
const SETTINGS_KEY = 'pasaje_montes_settings';
const LOGS_KEY = 'pasaje_montes_logs';

function triggerDbUpdateEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pasaje_montes_db_update'));
  }
}

/**
 * Recursively strips undefined keys so Firestore setDoc / updateDoc
 * never throws "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        sanitized[key] = sanitizeForFirestore(val);
      }
    }
    return sanitized as T;
  }
  return data;
}

export const api = {
  // 1. GET ALL RESERVATIONS (Firestore Primary with Local Cache Fallback)
  async getReservations(): Promise<Reservation[]> {
    try {
      const q = query(collection(db, 'reservations'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: Reservation[] = [];
        snap.forEach((d) => {
          list.push(d.data() as Reservation);
        });

        // Auto-heal / Sync any unsynced local reservations into Firestore
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            const localList: Reservation[] = JSON.parse(local);
            for (const localRes of localList) {
              if (localRes && localRes.code && !list.some((r) => r.id === localRes.id || r.code === localRes.code)) {
                // Upload missing reservation to Firestore
                const clean = sanitizeForFirestore(localRes);
                await setDoc(doc(db, 'reservations', localRes.id), clean);
                console.log('✓ Auto-synced unsaved reservation to Firestore:', localRes.code);
                list.unshift(localRes);
              }
            }
          } catch {
            // ignore
          }
        }

        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return list;
      } else {
        // If Firestore is empty on first boot, seed with initial reservations
        for (const initRes of INITIAL_RESERVATIONS) {
          await setDoc(doc(db, 'reservations', initRes.id), sanitizeForFirestore(initRes));
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
        return INITIAL_RESERVATIONS;
      }
    } catch (err) {
      console.warn('Firestore getReservations failed, using fallback:', err);
    }

    // Server API or LocalStorage Fallback
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
      // offline
    }

    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : INITIAL_RESERVATIONS;
  },

  // 2. CREATE RESERVATION (Saves to Firestore + Logs Activity)
  async createReservation(reservation: Reservation): Promise<Reservation> {
    const finalRes: Reservation = {
      ...reservation,
      id: reservation.id || `res-${Date.now()}`,
      createdAt: reservation.createdAt || new Date().toISOString(),
      guestDni: reservation.guestDni || '',
      guestOrigin: reservation.guestOrigin || '',
      stayReason: reservation.stayReason || '',
      specialRequests: reservation.specialRequests || '',
      couponCode: reservation.couponCode || '',
      couponDiscount: Number(reservation.couponDiscount) || 0,
    };

    const cleanPayload = sanitizeForFirestore(finalRes);

    // 1. Write to Firestore
    try {
      await setDoc(doc(db, 'reservations', finalRes.id), cleanPayload);
      console.log('✓ Reserva guardada exitosamente en Firestore:', finalRes.id, finalRes.code);

      // Log creation in Firestore Activity Logs
      await this.logActivity({
        id: `log-${Date.now()}`,
        action: 'creacion_reserva',
        title: `Nueva solicitud de reserva creada (${finalRes.code})`,
        details: `Huésped: ${finalRes.guestName} | Fechas: ${finalRes.checkIn} al ${finalRes.checkOut} (${finalRes.nights} noches) | Total: $${finalRes.totalPrice.toLocaleString('es-AR')}`,
        performedBy: finalRes.specialRequests?.includes('Manualmente por Rodrigo')
          ? 'Rodrigo Sanz (Admin)'
          : 'Huésped en Línea',
        timestamp: new Date().toISOString(),
        type: 'success',
      });
    } catch (err) {
      console.error('Error al guardar reserva en Firestore:', err);
    }

    // 2. Sync server if available
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(finalRes),
      });
    } catch {
      // offline
    }

    // 3. Sync localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    const list: Reservation[] = local ? JSON.parse(local) : INITIAL_RESERVATIONS;
    const filtered = list.filter((r) => r.id !== finalRes.id);
    const updatedList = [finalRes, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    triggerDbUpdateEvent();
    return finalRes;
  },

  // 3. UPDATE RESERVATION (Updates Firestore + Logs Activity)
  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    let updatedRes: Reservation | null = null;
    const cleanUpdates = sanitizeForFirestore(updates);

    try {
      const docRef = doc(db, 'reservations', id);
      await updateDoc(docRef, cleanUpdates);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        updatedRes = snap.data() as Reservation;

        // Log status update
        if (updates.status) {
          const statusLabel =
            updates.status === 'confirmada'
              ? 'Seña del 50% Confirmada'
              : updates.status === 'cancelada'
              ? 'Reserva Cancelada (Fechas Liberadas)'
              : updates.status;

          const logDetails =
            updates.status === 'cancelada'
              ? `Reserva Cancelada por el anfitrión. Fechas ${updatedRes.checkIn} al ${updatedRes.checkOut} liberadas nuevamente en la web | Huésped: ${updatedRes.guestName} | Total: $${updatedRes.totalPrice.toLocaleString('es-AR')}`
              : `Nuevo estado: "${statusLabel}" | Huésped: ${updatedRes.guestName} | Total: $${updatedRes.totalPrice.toLocaleString('es-AR')}`;

          await this.logActivity({
            id: `log-${Date.now()}`,
            action: 'modificacion_estado',
            title: updates.status === 'cancelada'
              ? `Reserva ${updatedRes.code} Cancelada (Fechas liberadas)`
              : `Estado de reserva ${updatedRes.code} modificado`,
            details: logDetails,
            performedBy: 'Rodrigo Sanz (Admin)',
            timestamp: new Date().toISOString(),
            type: updates.status === 'confirmada' ? 'success' : updates.status === 'cancelada' ? 'danger' : 'info',
          });
        }
      }
    } catch (err) {
      console.warn('Firestore updateReservation failed:', err);
    }

    // Sync Server
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
        updatedRes = await res.json();
      }
    } catch {
      // offline
    }

    // Sync LocalStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        if (!updatedRes) updatedRes = list[idx];
      }
    }

    triggerDbUpdateEvent();
    return updatedRes;
  },

  // 4. DELETE RESERVATION (Deletes from Firestore + Logs Activity Permanently)
  async deleteReservation(id: string): Promise<boolean> {
    let deletedCode = id;
    let deletedGuest = '';

    // Check existing info before deletion to write detailed audit log
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const target = list.find((r) => r.id === id);
      if (target) {
        deletedCode = target.code;
        deletedGuest = target.guestName;
      }
    }

    try {
      await deleteDoc(doc(db, 'reservations', id));

      // Permanent Audit Log
      await this.logActivity({
        id: `log-${Date.now()}`,
        action: 'eliminacion_reserva',
        title: `Reserva eliminada de la base de datos (${deletedCode})`,
        details: `Se borró el registro de ${deletedGuest || 'huésped'}. Acción realizada por el anfitrión.`,
        performedBy: 'Rodrigo Sanz (Admin)',
        timestamp: new Date().toISOString(),
        type: 'danger',
      });
    } catch (err) {
      console.warn('Firestore deleteReservation failed:', err);
    }

    // Sync Server
    try {
      await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' },
      });
    } catch {
      // offline
    }

    // Sync LocalStorage
    if (local) {
      const list: Reservation[] = JSON.parse(local);
      const filtered = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    triggerDbUpdateEvent();
    return true;
  },

  // 5. GET SETTINGS (Firestore + Fallback)
  async getSettings(): Promise<HostSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'hostConfig'));
      if (snap.exists()) {
        const data = snap.data();
        const base = Number(data.baseNightPrice) || 45000;
        const merged: HostSettings = {
          baseNightPrice: base,
          price1Guest: data.price1Guest !== undefined ? Number(data.price1Guest) : (base > 5000 ? base - 5000 : base),
          price2Guests: data.price2Guests !== undefined ? Number(data.price2Guests) : base,
          price3Guests: data.price3Guests !== undefined ? Number(data.price3Guests) : Math.round(base * 1.15),
          hostPin: data.hostPin ?? '2026',
          blockedDates: data.blockedDates ?? [],
          discountPercentage: data.discountPercentage ?? 12,
          coupons: data.coupons || DEFAULT_COUPONS,
          partnerships: Array.isArray(data.partnerships) ? data.partnerships : DEFAULT_PARTNERSHIPS,
          promoBanner: {
            ...DEFAULT_PROMO_BANNER,
            ...(data.promoBanner || {}),
          },
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      } else {
        // Seed default settings to Firestore
        const defaultDoc: HostSettings = {
          baseNightPrice: 45000,
          price1Guest: 40000,
          price2Guests: 45000,
          price3Guests: 52000,
          hostPin: '2026',
          blockedDates: [],
          discountPercentage: 12,
          coupons: DEFAULT_COUPONS,
          partnerships: DEFAULT_PARTNERSHIPS,
          promoBanner: DEFAULT_PROMO_BANNER,
        };
        await setDoc(doc(db, 'settings', 'hostConfig'), defaultDoc);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultDoc));
        return defaultDoc;
      }
    } catch (err) {
      console.warn('Firestore getSettings failed, using fallback:', err);
    }

    // Server fallback
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
      // offline
    }

    const local = localStorage.getItem(SETTINGS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // use default
      }
    }

    return {
      baseNightPrice: 45000,
      price1Guest: 40000,
      price2Guests: 45000,
      price3Guests: 52000,
      hostPin: '2026',
      blockedDates: [],
      discountPercentage: 12,
      coupons: DEFAULT_COUPONS,
      partnerships: DEFAULT_PARTNERSHIPS,
      promoBanner: DEFAULT_PROMO_BANNER,
    };
  },

  // 6. UPDATE SETTINGS (Saves to Firestore + Logs Activity)
  async updateSettings(settings: Partial<HostSettings>): Promise<HostSettings> {
    const current = await this.getSettings();
    const updated: HostSettings = { ...current, ...settings };

    const cleanSettings = sanitizeForFirestore(updated);

    try {
      await setDoc(doc(db, 'settings', 'hostConfig'), cleanSettings, { merge: true });

      // Log specific setting changes
      let logTitle = 'Configuración del panel actualizada';
      let logDetails = '';

      if (settings.hostPin && settings.hostPin !== current.hostPin) {
        logTitle = `PIN de seguridad del anfitrión actualizado`;
        logDetails = `Se configuró un nuevo PIN de acceso exclusivo. El código anterior quedó invalidado de inmediato.`;
      } else if (settings.blockedDates) {
        logTitle = `Modificación de calendario de fechas bloqueadas`;
        logDetails = `Total de fechas bloqueadas: ${settings.blockedDates.length}`;
      } else if (settings.price1Guest !== undefined || settings.price2Guests !== undefined || settings.price3Guests !== undefined || settings.baseNightPrice !== undefined) {
        logTitle = `Tarifas por noche actualizadas`;
        logDetails = `Precios: 1 pers: $${(updated.price1Guest || updated.baseNightPrice).toLocaleString('es-AR')} | 2 pers: $${(updated.price2Guests || updated.baseNightPrice).toLocaleString('es-AR')} | 3 pers: $${(updated.price3Guests || Math.round(updated.baseNightPrice * 1.15)).toLocaleString('es-AR')} | Bonificación: ${updated.discountPercentage}%`;
      } else if (settings.coupons) {
        logTitle = `Cupones de descuento actualizados`;
        logDetails = `Total cupones activos: ${settings.coupons.filter((c) => c.enabled).length}`;
      } else if (settings.partnerships) {
        logTitle = `Convenios y alianzas comerciales actualizados`;
        logDetails = `Total convenios activos: ${settings.partnerships.filter((p) => p.enabled).length} de ${settings.partnerships.length}`;
      } else if (settings.promoBanner) {
        logTitle = `Barra superior de promociones modificada`;
        logDetails = `Mensaje: "${settings.promoBanner.badge}: ${settings.promoBanner.text}"`;
      }

      await this.logActivity({
        id: `log-${Date.now()}`,
        action: settings.blockedDates
          ? 'bloqueo_fechas'
          : settings.baseNightPrice
          ? 'cambio_tarifa'
          : settings.coupons
          ? 'creacion_cupon'
          : settings.partnerships
          ? 'cambio_alianza'
          : settings.promoBanner
          ? 'cambio_promo'
          : 'general',
        title: logTitle,
        details: logDetails || 'Cambios guardados en la base de datos de Firebase.',
        performedBy: 'Rodrigo Sanz (Admin)',
        timestamp: new Date().toISOString(),
        type: 'info',
      });
    } catch (err) {
      console.warn('Firestore updateSettings failed:', err);
    }

    // Sync Server
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(settings),
      });
    } catch {
      // offline
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    triggerDbUpdateEvent();
    return updated;
  },

  // 7. ACTIVITY AUDIT TRAIL LOGGING (Permanent record requested by user)
  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const q = query(collection(db, 'activity_logs'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const logs: ActivityLog[] = [];
        snap.forEach((d) => logs.push(d.data() as ActivityLog));
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
        return logs;
      }
    } catch (err) {
      console.warn('Firestore getActivityLogs failed, checking local:', err);
    }

    const local = localStorage.getItem(LOGS_KEY);
    return local ? JSON.parse(local) : [];
  },

  async logActivity(log: ActivityLog): Promise<void> {
    const cleanLog = sanitizeForFirestore(log);
    try {
      await setDoc(doc(db, 'activity_logs', log.id), cleanLog);
    } catch (err) {
      console.warn('Firestore logActivity write failed:', err);
    }

    // LocalStorage append
    try {
      const local = localStorage.getItem(LOGS_KEY);
      const list: ActivityLog[] = local ? JSON.parse(local) : [];
      list.unshift(log);
      localStorage.setItem(LOGS_KEY, JSON.stringify(list.slice(0, 100)));
    } catch {
      // ignore
    }
  },

  async verifyPin(pin: string): Promise<boolean> {
    const settings = await this.getSettings();
    const currentPin = (settings.hostPin && settings.hostPin.trim()) ? settings.hostPin.trim() : '2026';
    // Strictly validate against ONLY the currently configured PIN
    return pin.trim() === currentPin;
  },

  async sendConfirmationEmail(reservation: Reservation): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ reservation }),
      });
      if (res.ok) {
        const data = await res.json();
        // Log in Firestore activity logs
        await this.logActivity({
          id: `log-${Date.now()}`,
          action: 'general',
          title: `Email de confirmación de seña enviado a ${reservation.guestName}`,
          details: `Destinatario: ${reservation.guestEmail} | Reserva: ${reservation.code} | Seña: $${reservation.depositAmount.toLocaleString('es-AR')}`,
          performedBy: 'Rodrigo Sanz (Admin)',
          timestamp: new Date().toISOString(),
          type: 'success',
        });
        return { success: true, message: data.message || 'Email de confirmación enviado correctamente' };
      }
    } catch (err) {
      console.warn('Error sending confirmation email via backend proxy:', err);
    }
    return { success: true, message: 'Comprobante y mensaje listos' };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'hostConfig'));
      return snap.exists();
    } catch {
      return false;
    }
  },
};
