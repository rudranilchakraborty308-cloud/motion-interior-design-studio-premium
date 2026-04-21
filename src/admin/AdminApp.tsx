import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import DashboardBookings from './DashboardBookings';
import DashboardContent from './DashboardContent';
import DashboardPortfolio from './DashboardPortfolio';
import DashboardSettings from './DashboardSettings';
import DashboardTestimonials from './DashboardTestimonials';
import { Loader2 } from 'lucide-react';

export default function AdminApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAuth(session?.user?.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAuth(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = (email: string | undefined) => {
    // Only the owner can access the admin panel
    const allowedEmail = 'rudranilchakraborty308@gmail.com';
    setIsAuthorized(email === allowedEmail);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-pale-white"><Loader2 className="w-8 h-8 animate-spin text-dark-khaki" /></div>;

  if (!session || !isAuthorized) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/content" replace />} />
        <Route path="/bookings" element={<DashboardBookings />} />
        <Route path="/content" element={<DashboardContent />} />
        <Route path="/portfolio" element={<DashboardPortfolio />} />
        <Route path="/testimonials" element={<DashboardTestimonials />} />
        <Route path="/settings" element={<DashboardSettings />} />
      </Routes>
    </AdminLayout>
  );
}
