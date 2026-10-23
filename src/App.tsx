/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ApartmentOverview } from './components/ApartmentOverview';
import { PhotoGallery } from './components/PhotoGallery';
import { AmenitiesSection } from './components/AmenitiesSection';
import { BookingSystem } from './components/BookingSystem';
import { TariffsAndRules } from './components/TariffsAndRules';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BrochureModal } from './components/BrochureModal';
import { MyReservationsModal } from './components/MyReservationsModal';
import { GuestGuideModal } from './components/GuestGuideModal';
import { HostDashboardPage } from './components/HostDashboardPage';
import { INITIAL_RESERVATIONS, LODGING_INFO } from './data/lodgingData';
import { Reservation } from './types';
import { api, HostSettings, DEFAULT_PROMO_BANNER } from './services/api';
import { getAllUnavailableDates, checkRangeAvailability, formatDate } from './utils/dateUtils';

export default function App() {
  // Page Routing: 'public' or 'anfitrion'
  const [currentPage, setCurrentPage] = useState<'public' | 'anfitrion'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path.includes('/anfitrion') ||
        path.includes('/admin') ||
        search.includes('panel=anfitrion') ||
        search.includes('admin=true')
      ) {
        return 'anfitrion';
      }
    }
    return 'public';
  });

  // Host settings state (includes blockedDates, baseNightPrice, promoBanner, etc.)
  const [hostSettings, setHostSettings] = useState<HostSettings>({
    baseNightPrice: 45000,
    hostPin: '2026',
    blockedDates: [],
    discountPercentage: 12,
    promoBanner: DEFAULT_PROMO_BANNER,
  });

  // Persistent reservations database loaded from backend API
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);

  // Reload data from server API
  const refreshAppData = async () => {
    try {
      const [resData, settData] = await Promise.all([
        api.getReservations(),
        api.getSettings(),
      ]);
      setReservations(resData);
      setHostSettings(settData);
    } catch (err) {
      console.error('Failed to load app data:', err);
    }
  };

  useEffect(() => {
    refreshAppData();

    // 1. Listen to custom database updates triggered on reservation/block changes
    const handleDbUpdate = () => {
      refreshAppData();
    };
    window.addEventListener('pasaje_montes_db_update', handleDbUpdate);

    // 2. Listen to cross-tab storage changes
    window.addEventListener('storage', handleDbUpdate);

    // 3. Listen to window focus & tab visibility changes
    const handleVisibility = () => {
      if (!document.hidden) {
        refreshAppData();
      }
    };
    window.addEventListener('focus', handleDbUpdate);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Active live-sync polling (every 3 seconds) ensures instant updates across host & guests
    const interval = setInterval(refreshAppData, 3000);

    return () => {
      window.removeEventListener('pasaje_montes_db_update', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
      window.removeEventListener('focus', handleDbUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [currentPage]);

  // Compute all unavailable dates (manually blocked + active reservations)
  const unavailableDates = getAllUnavailableDates(
    reservations,
    hostSettings.blockedDates
  );

  // Dates and guests state for public booking
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return formatDate(nextFriday);
  });

  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilFriday + 3);
    return formatDate(nextSunday);
  });

  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Gallery photo selection for instant lightbox opening
  const [selectedGalleryPhotoId, setSelectedGalleryPhotoId] = useState<string | null>(null);

  // Modals for public users
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isMyBookingOpen, setIsMyBookingOpen] = useState(false);
  const [isGuestGuideOpen, setIsGuestGuideOpen] = useState(false);

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path.includes('/anfitrion') ||
        path.includes('/admin') ||
        search.includes('panel=anfitrion') ||
        search.includes('admin=true')
      ) {
        setCurrentPage('anfitrion');
      } else {
        setCurrentPage('public');
      }
      refreshAppData();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: 'public' | 'anfitrion') => {
    setCurrentPage(page);
    const newPath = page === 'anfitrion' ? '/anfitrion' : '/';
    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshAppData();
  };

  const handleReservationCreated = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
  };

  const scrollToBooking = () => {
    const bookingEl = document.getElementById('reservas');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. DEDICATED PRIVATE HOST PAGE (Invisible to normal public visitors)
  if (currentPage === 'anfitrion') {
    return <HostDashboardPage onBackToPublicSite={() => navigateTo('public')} />;
  }

  // 2. PUBLIC WEBSITE FOR GUESTS & VISITORS
  return (
    <div className="min-h-screen bg-[#FBF8F3] text-slate-800 flex flex-col selection:bg-[#4D7080] selection:text-white">
      {/* Navbar without any host button */}
      <Navbar
        onOpenBrochure={() => setIsBrochureOpen(true)}
        onOpenBooking={scrollToBooking}
        onOpenMyBooking={() => setIsMyBookingOpen(true)}
        onOpenGuide={() => setIsGuestGuideOpen(true)}
        onOpenAdmin={() => navigateTo('anfitrion')}
        promoBanner={hostSettings.promoBanner}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Live Availability Check */}
        <Hero
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
          guestsCount={guestsCount}
          setGuestsCount={setGuestsCount}
          onSearchClick={scrollToBooking}
          onOpenBrochure={() => setIsBrochureOpen(true)}
          unavailableDates={unavailableDates}
        />

        {/* The Apartment Overview */}
        <ApartmentOverview
          onSelectPhoto={(photoId) => {
            setSelectedGalleryPhotoId(photoId);
            const galeriaEl = document.getElementById('galeria');
            if (galeriaEl) {
              galeriaEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenBooking={scrollToBooking}
        />

        {/* Photo Gallery with Filter & Lightbox */}
        <PhotoGallery
          selectedPhotoId={selectedGalleryPhotoId}
          onCloseSelectedPhoto={() => setSelectedGalleryPhotoId(null)}
          onOpenBooking={scrollToBooking}
        />

        {/* Complete Amenities & Confort */}
        <AmenitiesSection />

        {/* Interactive Online Booking Engine with Visual Availability Calendar */}
        <BookingSystem
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
          guestsCount={guestsCount}
          setGuestsCount={setGuestsCount}
          onReservationCreated={handleReservationCreated}
          existingReservations={reservations}
          hostSettings={hostSettings}
        />

        {/* Tariffs, Conditions & FAQ */}
        <TariffsAndRules onOpenBooking={scrollToBooking} />

        {/* Location & Cruz del Eje Guide */}
        <LocationSection />
      </main>

      {/* Footer with subtle secret lock icon for host */}
      <Footer
        onOpenBooking={scrollToBooking}
        onOpenBrochure={() => setIsBrochureOpen(true)}
        onOpenMyBooking={() => setIsMyBookingOpen(true)}
        onOpenGuide={() => setIsGuestGuideOpen(true)}
        onOpenAdmin={() => navigateTo('anfitrion')}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Official Brochure Viewer Modal */}
      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        onOpenBooking={scrollToBooking}
      />

      {/* Guest Booking Lookup Modal */}
      <MyReservationsModal
        isOpen={isMyBookingOpen}
        onClose={() => setIsMyBookingOpen(false)}
        reservations={reservations}
      />

      {/* Official Guest Guide Modal */}
      <GuestGuideModal
        isOpen={isGuestGuideOpen}
        onClose={() => setIsGuestGuideOpen(false)}
      />
    </div>
  );
}
