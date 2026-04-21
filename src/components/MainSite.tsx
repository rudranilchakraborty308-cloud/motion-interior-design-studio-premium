import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import Header from './Header';
import PortfolioMenu from './PortfolioMenu';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import Portfolio from './Portfolio';
import Testimonials from './Testimonials';
import Footer from './Footer';
import AppointmentModal from './AppointmentModal';
import MyBookingsModal from './MyBookingsModal';
import WhatsAppButton from './WhatsAppButton';

export default function MainSite() {
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user;
      if (currentUser && currentUser.email !== 'rudranilchakraborty308@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      if (currentUser && currentUser.email !== 'rudranilchakraborty308@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative bg-pale-white min-h-screen font-sans selection:bg-dark-khaki selection:text-white">
      <Header 
        onPortfolioClick={() => setIsPortfolioMenuOpen(true)} 
        onBookAppointment={() => setIsAppointmentModalOpen(true)}
        user={user}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
      />
      <PortfolioMenu isOpen={isPortfolioMenuOpen} onClose={() => setIsPortfolioMenuOpen(false)} />
      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
      <MyBookingsModal isOpen={isBookingsModalOpen} onClose={() => setIsBookingsModalOpen(false)} user={user} />
      
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Testimonials />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
