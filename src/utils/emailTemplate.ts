import { Reservation } from '../types';
import { LODGING_INFO } from '../data/lodgingData';
import { formatFriendlyDate } from './dateUtils';

export interface EmailConfirmationData {
  subject: string;
  bodyPlain: string;
  mailtoUrl: string;
}

export function generateDepositConfirmationMessage(res: Reservation): EmailConfirmationData {
  const formattedCheckIn = formatFriendlyDate(res.checkIn);
  const formattedCheckOut = formatFriendlyDate(res.checkOut);
  const formattedDeposit = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(res.depositAmount);
  const formattedBalance = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(res.balanceDue);
  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(res.totalPrice);

  const subject = `¡Seña Recibida y Reserva Confirmada! - Pasaje Montes Alojamiento (${res.code})`;

  const bodyPlain = `¡Hola ${res.guestName}!

Te damos una muy cálida bienvenida de parte de Pasaje Montes - Alojamiento. 🌿

Te escribimos para confirmarte con mucha alegría que hemos recibido la seña del 50% (${formattedDeposit}) para tu estadía en nuestro departamento en Cruz del Eje, Córdoba. Tus fechas ya se encuentran 100% aseguradas y bloqueadas en nuestro calendario.

¡Muchísimas gracias por confiar en nosotros y elegirnos para tu descanso! Nos entusiasma recibirte y haremos que tu experiencia sea cómoda, placentera e inolvidable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMEN DE TU RESERVA CONFIRMADA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Código de Reserva: ${res.code}
• Huésped Principal: ${res.guestName}
• Cantidad de Personas: ${res.guestsCount} ${res.guestsCount === 1 ? 'persona' : 'personas'}
• Fecha de Ingreso (Check-in): ${formattedCheckIn} (Horario: ${LODGING_INFO.checkInWindow})
• Fecha de Salida (Check-out): ${formattedCheckOut} (Hasta las ${LODGING_INFO.checkOutTime})
• Total de Noches: ${res.nights} ${res.nights === 1 ? 'noche' : 'noches'}
• Monto Total Estadía: ${formattedTotal}
• Seña Recibida (50%): ${formattedDeposit} (✓ Confirmada en Base de Datos)
• Saldo Restante al Ingreso: ${formattedBalance}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMACIÓN ÚTIL PARA TU LLEGADA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Dirección: ${LODGING_INFO.fullAddress}
🚗 Cochera: Cubierta y privada dentro del predio, con portón corredizo.
📶 Wi-Fi de alta velocidad: Fibra óptica y Smart TV listos para vos.
🛏️ Equipamiento: Sommier Queen + individual, ropa de cama, toallas, vajilla completa, pava eléctrica, microondas, calefacción a gas natural y aire acondicionado split frío/calor.

El día de tu llegada, o si tenés alguna duda previa con el viaje o el horario estimado, podés comunicarte directamente con Rodrigo al WhatsApp: ${LODGING_INFO.phoneDisplay}.

¡Buen viaje y te esperamos pronto en Cruz del Eje!

Con el afecto y calidez de siempre,
Rodrigo Sanz
Pasaje Montes - Alojamiento
"Un descanso camino al lago"
Teléfono / WhatsApp: ${LODGING_INFO.phoneDisplay}
`;

  const mailtoUrl = `mailto:${encodeURIComponent(res.guestEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyPlain)}`;

  return { subject, bodyPlain, mailtoUrl };
}
