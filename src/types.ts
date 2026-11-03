export interface Amenity {
  id: string;
  name: string;
  description: string;
  category: 'cocina' | 'confort' | 'conectividad' | 'habitaciones' | 'seguridad';
  icon: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'dormitorio' | 'living' | 'cocina' | 'bano' | 'exterior' | 'entorno';
  imageUrl: string;
  badge?: string;
}

export interface Reservation {
  id: string;
  code: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestDni?: string;
  guestOrigin?: string;
  stayReason?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  estimatedArrival: string;
  specialRequests?: string;
  pricePerNight: number;
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  couponCode?: string;
  couponDiscount?: number;
  totalPrice: number;
  depositAmount: number; // 50%
  balanceDue: number; // 50%
  status: 'pendiente_sena' | 'confirmada' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface DiscountCoupon {
  id: string;
  code: string; // e.g. "ESCAPADA10", "AMIGOS20"
  discountPercentage: number; // e.g. 10, 15, 20 (%)
  description?: string;
  enabled: boolean;
  createdAt?: string;
}

export interface BankDetails {
  banco: string;
  titular: string;
  cbu: string;
  alias: string;
  cuit: string;
  tipoCuenta: string;
}

export type PromoBannerIcon = 'sparkles' | 'tag' | 'gift' | 'percent' | 'heart' | 'flame' | 'bell';
export type PromoBannerTheme = 'emerald' | 'amber' | 'blue' | 'rose' | 'purple' | 'slate';

export interface PromoBannerConfig {
  enabled: boolean;
  badge: string;
  text: string;
  mobileText?: string;
  theme?: PromoBannerTheme;
  icon?: PromoBannerIcon;
  actionText?: string;
  actionType?: 'booking' | 'whatsapp' | 'none';
}

export interface ActivityLog {
  id: string;
  action:
    | 'creacion_reserva'
    | 'modificacion_estado'
    | 'eliminacion_reserva'
    | 'bloqueo_fechas'
    | 'desbloqueo_fechas'
    | 'cambio_tarifa'
    | 'creacion_cupon'
    | 'cambio_promo'
    | 'general';
  title: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

