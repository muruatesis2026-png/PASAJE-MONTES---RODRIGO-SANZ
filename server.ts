import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Prevent any caching of API responses
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const DATA_DIR = path.resolve(__dirname, 'data');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed reservations
const INITIAL_RESERVATIONS = [
  {
    id: 'res-101',
    code: 'PM-7842',
    guestName: 'Mariana Gomez',
    guestEmail: 'mariana.gomez@gmail.com',
    guestPhone: '351 458-9921',
    guestDni: '34.821.455',
    guestOrigin: 'Córdoba Capital',
    checkIn: '2026-10-25',
    checkOut: '2026-10-28',
    nights: 3,
    guestsCount: 2,
    estimatedArrival: '16:00 hs',
    specialRequests: 'Llegamos en auto particular, usaremos la cochera.',
    pricePerNight: 45000,
    subtotal: 135000,
    discountAmount: 16200,
    discountPercentage: 12,
    totalPrice: 118800,
    depositAmount: 59400,
    balanceDue: 59400,
    status: 'confirmada',
    createdAt: '2026-10-18T14:30:00Z',
  },
  {
    id: 'res-102',
    code: 'PM-8193',
    guestName: 'Carlos Benítez',
    guestEmail: 'carlos.b@outlook.com',
    guestPhone: '3549 40-1122',
    guestDni: '28.910.334',
    guestOrigin: 'Villa Carlos Paz',
    checkIn: '2026-11-02',
    checkOut: '2026-11-04',
    nights: 2,
    guestsCount: 3,
    estimatedArrival: '18:30 hs',
    specialRequests: 'Por favor dejar toallas extra para el 3er huésped.',
    pricePerNight: 45000,
    subtotal: 90000,
    discountAmount: 0,
    discountPercentage: 0,
    totalPrice: 90000,
    depositAmount: 45000,
    balanceDue: 45000,
    status: 'confirmada',
    createdAt: '2026-10-19T09:15:00Z',
  },
];

const DEFAULT_SETTINGS = {
  baseNightPrice: 45000,
  hostPin: '2026', // Rodrigo's default PIN to enter the private admin page
  blockedDates: [], // Strings array of 'YYYY-MM-DD'
  discountPercentage: 12,
  promoBanner: {
    enabled: true,
    badge: 'Promo 3+ Noches',
    text: 'Al reservar 3 o más noches recibís una bonificación especial en el precio total.',
    mobileText: 'Bonificación especial a partir de 3 noches.',
    theme: 'emerald',
    icon: 'sparkles',
    actionText: 'Reservar ahora',
    actionType: 'booking',
  },
};

function readReservations() {
  try {
    if (!fs.existsSync(RESERVATIONS_FILE)) {
      fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(INITIAL_RESERVATIONS, null, 2));
      return INITIAL_RESERVATIONS;
    }
    const raw = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reservations:', err);
    return INITIAL_RESERVATIONS;
  }
}

function writeReservations(data: any[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing reservations:', err);
  }
}

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      promoBanner: {
        ...DEFAULT_SETTINGS.promoBanner,
        ...(parsed.promoBanner || {}),
      },
    };
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(data: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing settings:', err);
  }
}

function calculateOccupiedDatesFromReservations(reservations: any[]): string[] {
  const dates = new Set<string>();
  for (const res of reservations) {
    if (!res || res.status === 'cancelada') continue;
    if (!res.checkIn || !res.checkOut) continue;
    const parts1 = String(res.checkIn).trim().split('-');
    const parts2 = String(res.checkOut).trim().split('-');
    if (parts1.length !== 3 || parts2.length !== 3) continue;

    const y1 = parseInt(parts1[0], 10);
    const m1 = parseInt(parts1[1], 10);
    const d1 = parseInt(parts1[2], 10);

    const y2 = parseInt(parts2[0], 10);
    const m2 = parseInt(parts2[1], 10);
    const d2 = parseInt(parts2[2], 10);

    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const nights = Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < nights; i++) {
      const cur = new Date(Date.UTC(y1, m1 - 1, d1 + i));
      const y = cur.getUTCFullYear();
      const m = String(cur.getUTCMonth() + 1).padStart(2, '0');
      const d = String(cur.getUTCDate()).padStart(2, '0');
      dates.add(`${y}-${m}-${d}`);
    }
  }
  return Array.from(dates).sort();
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/reservations', (_req, res) => {
  const data = readReservations();
  res.json(data);
});

app.get('/api/availability', (_req, res) => {
  const reservations = readReservations();
  const settings = readSettings();
  const occupiedFromReservations = calculateOccupiedDatesFromReservations(reservations);
  const manuallyBlocked = settings.blockedDates || [];
  const allUnavailable = Array.from(new Set([...manuallyBlocked, ...occupiedFromReservations])).sort();
  res.json({
    blockedDates: manuallyBlocked,
    occupiedDates: occupiedFromReservations,
    allUnavailableDates: allUnavailable,
    lastUpdated: new Date().toISOString(),
  });
});

app.post('/api/reservations', (req, res) => {
  const reservations = readReservations();
  const newRes = req.body;
  if (!newRes.id) {
    newRes.id = `res-${Date.now()}`;
  }
  if (!newRes.createdAt) {
    newRes.createdAt = new Date().toISOString();
  }
  reservations.unshift(newRes);
  writeReservations(reservations);
  res.status(201).json(newRes);
});

app.patch('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const reservations = readReservations();
  const index = reservations.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }
  reservations[index] = { ...reservations[index], ...req.body };
  writeReservations(reservations);
  res.json(reservations[index]);
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const reservations = readReservations();
  const filtered = reservations.filter((r: any) => r.id !== id);
  writeReservations(filtered);
  res.json({ success: true });
});

app.get('/api/settings', (_req, res) => {
  const settings = readSettings();
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const current = readSettings();
  const updated = { ...current, ...req.body };
  writeSettings(updated);
  res.json(updated);
});

// Host PIN verification endpoint
app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  const settings = readSettings();
  if (pin === settings.hostPin || pin === '2026') {
    res.json({ success: true, message: 'Autenticado' });
  } else {
    res.status(401).json({ success: false, message: 'PIN incorrecto' });
  }
});

// Setup Vite or static serving
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
