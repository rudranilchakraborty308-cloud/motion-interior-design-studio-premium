import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Quote,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Content', path: '/admin/content' },
    { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
    { icon: ImageIcon, label: 'Portfolio', path: '/admin/portfolio' },
    { icon: Quote, label: 'Testimonials', path: '/admin/testimonials' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-pale-white flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-b border-stone-100 z-50">
         <h1 className="font-serif text-xl font-bold tracking-tighter">STUDIO ADMIN</h1>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-white md:relative md:flex md:flex-col w-full md:w-72 border-r border-stone-100 p-8 transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-16 hidden md:block">
          <h1 className="font-serif text-2xl font-black tracking-tighter text-black">STUDIO</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mt-2">Master Controls</p>
        </div>

        <nav className="flex-grow space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300
                ${location.pathname === item.path 
                  ? 'bg-black text-white shadow-xl translate-x-2' 
                  : 'text-stone-400 hover:text-black hover:bg-stone-50'}
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? 'text-dark-khaki' : ''}`} />
                <span className="text-[11px] uppercase tracking-widest font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${location.pathname === item.path ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-stone-100 mt-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-stone-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-[#FAFAFA]">
        {children}
      </main>
    </div>
  );
}
