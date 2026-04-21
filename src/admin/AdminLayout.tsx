import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarRange, Image as ImageIcon, FileText, Settings, MessageSquare, LogOut, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarRange },
    { name: 'Portfolio', path: '/admin/portfolio', icon: ImageIcon },
    { name: 'Site Content', path: '/admin/settings', icon: Settings },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-alabaster flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-pale-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <div className="text-xl font-sans tracking-widest uppercase font-light truncate">
            Studi<span className="text-dark-khaki">o</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">Admin Portal</p>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase transition-colors rounded-none ${
                  isActive ? 'bg-dark-khaki text-black font-semibold' : 'text-pale-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-pale-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            View Live Site
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-h-screen overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}
