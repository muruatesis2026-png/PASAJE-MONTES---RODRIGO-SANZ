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
  totalPrice: number;
  depositAmount: number; // 50%
  balanceDue: number; // 50%
  status: 'pendiente_sena' | 'confirmada' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface BankDetails {
  banco: string;
  titular: string;
  cbu: string;
  alias: string;
  cuit: string;
  tipoCuenta: string;
}
