import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import DashboardBookings from './DashboardBookings';
import DashboardPortfolio from './DashboardPortfolio';
import DashboardContent from './DashboardContent';
import DashboardSettings from './DashboardSettings';
import DashboardTestimonials from './DashboardTestimonials';

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-dark-khaki" />
      </div>
    );
  }

  // Strict check for admin email
  if (!user || user.email !== 'rudranilchakraborty308@gmail.com') {
    return <AdminLogin currentUser={user} />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<DashboardBookings />} />
        <Route path="portfolio" element={<DashboardPortfolio />} />
        <Route path="content" element={<DashboardContent />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="testimonials" element={<DashboardTestimonials />} />
      </Routes>
    </AdminLayout>
  );
}
