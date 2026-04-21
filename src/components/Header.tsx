import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Calendar, Lock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
export default function Header({ 
  onPortfolioClick, 
  onBookAppointment,
  user,
  onOpenBookings
}: { 
  onPortfolioClick: () => void;
  onBookAppointment: () => void;
  user: User | null;
  onOpenBookings: () => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Use localStorage to cache the global content to prevent the "Studio" text flash on load
  const [globalContent, setGlobalContent] = useState<any>(() => {
    const cached = localStorage.getItem('studio_global_content');
    return cached ? JSON.parse(cached) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('content').select('*').eq('id', 'global').single();
      if (data) {
        setGlobalContent(data);
        localStorage.setItem('studio_global_content', JSON.stringify(data));
      }
      setIsFetching(false);
    };
    fetchContent();

    const channel = supabase.channel('header_global_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.global' }, (payload) => {
        if (payload.new) {
          setGlobalContent(payload.new);
          localStorage.setItem('studio_global_content', JSON.stringify(payload.new));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Premium Minimalist Menu Unfold
  const menuVariants = {
    closed: {
      opacity: 0,
      clipPath: "inset(0% 0% 100% 0%)",
      transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] }
    },
    open: {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 30 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        delay: 0.1 + i * 0.1, 
        ease: [0.21, 1.02, 0.73, 1]
      }
    })
  };

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-[100] transition-colors duration-500 py-6 ${
          isScrolled || mobileMenuOpen 
            ? 'bg-pale-white/95 backdrop-blur-md border-b border-black/5 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center relative z-10">
          
          {/* Mobile Toggle */}
          <button 
            className="lg:hidden z-[110] relative text-black hover:opacity-50 transition-opacity flex items-center justify-center p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.div 
               animate={mobileMenuOpen ? "open" : "closed"}
               className="transform transition-transform"
            >
               {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1} /> : <Menu className="w-6 h-6" strokeWidth={1} />}
            </motion.div>
          </button>

          {/* Logo - Elegant & Responsive */}
          <div 
            className={`z-[110] cursor-pointer flex items-center gap-4 transition-all duration-700 hover:scale-105 active:scale-95 ${(isFetching && !globalContent) ? 'opacity-0' : 'opacity-100'}`} 
            onClick={() => {window.scrollTo(0, 0); setMobileMenuOpen(false);}}
          >
            {/* Logo with 3D shadow effect */}
            {globalContent?.logo && (
              <div className="relative group">
                <img 
                  src={globalContent.logo} 
                  alt={globalContent.sitename || 'Logo'} 
                  className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] transition-all duration-500" 
                />
              </div>
            )}
            
            {/* Business Name with fixed premium style */}
            {globalContent?.sitename && (
              <div className="flex flex-col items-start leading-none">
                <div className="brand-name relative">
                  {globalContent.sitename}
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="absolute -bottom-1 left-0 w-full h-[2px] bg-dark-khaki origin-left"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav - High-end Minimalist */}
          <nav className="hidden lg:flex items-center space-x-10">
            <button onClick={onPortfolioClick} className="font-sans text-[10px] tracking-[0.25em] uppercase text-black hover:opacity-40 transition-opacity duration-300">
              Portfolio
            </button>
            <a href="#about" className="font-sans text-[10px] tracking-[0.25em] uppercase text-black hover:opacity-40 transition-opacity duration-300">About</a>
            <a href="#services" className="font-sans text-[10px] tracking-[0.25em] uppercase text-black hover:opacity-40 transition-opacity duration-300">Services</a>
            
            <button onClick={() => navigate('/admin')} className="font-sans text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-black transition-opacity duration-300 ml-8">
              Admin
            </button>
            
            {(user && user.email !== 'rudranilchakraborty308@gmail.com') && (
              <>
                <div className="w-[1px] h-3 bg-black/20" />
                <button 
                  onClick={onOpenBookings}
                  className="font-sans text-[10px] tracking-[0.25em] uppercase text-black hover:opacity-40 transition-opacity duration-300"
                >
                  Bookings
                </button>
              </>
            )}
            
            <button 
              onClick={onBookAppointment}
              className="ml-4 px-6 py-3 font-sans text-[10px] uppercase tracking-[0.25em] text-black border border-black hover:bg-black hover:text-white transition-all duration-500 ease-out flex items-center gap-2 group"
            >
              {user ? 'New Booking' : 'Book Appointment'}
            </button>
          </nav>
        </div>
      </header>

      {/* Premium Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[90] bg-pale-white min-h-screen pt-40 pb-12 flex flex-col items-center justify-start overflow-y-auto"
          >
            <nav className="flex flex-col items-center justify-center flex-grow space-y-8 text-center w-full px-6 relative z-10">
              <motion.button 
                custom={1} variants={itemVariants}
                onClick={() => { setMobileMenuOpen(false); onPortfolioClick(); }}
                className="font-serif text-5xl text-black hover:italic transition-all duration-300"
              >
                Portfolio
              </motion.button>
              
              <motion.a 
                custom={2} variants={itemVariants}
                onClick={() => setMobileMenuOpen(false)} 
                href="#about" 
                className="font-serif text-5xl text-black hover:italic transition-all duration-300"
              >
                About
              </motion.a>
              
              <motion.a 
                custom={3} variants={itemVariants}
                onClick={() => setMobileMenuOpen(false)} 
                href="#services" 
                className="font-serif text-5xl text-black hover:italic transition-all duration-300"
              >
                Services
              </motion.a>
              
              <motion.div custom={4} variants={itemVariants} className="pt-6 w-full flex justify-center">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onBookAppointment(); }}
                  className="px-10 py-4 font-sans text-[10px] uppercase tracking-[0.25em] text-white bg-black hover:bg-black/80 transition-colors w-[80%] max-w-sm"
                >
                  {user ? 'New Booking' : 'Book Appointment'}
                </button>
              </motion.div>

              <motion.button 
                custom={5} variants={itemVariants}
                onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
                className="font-sans text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-black transition-colors duration-300 pt-8"
              >
                Admin Portal
              </motion.button>
              
              {(user && user.email !== 'rudranilchakraborty308@gmail.com') && (
                <motion.button 
                  custom={6} variants={itemVariants}
                  onClick={() => { setMobileMenuOpen(false); onOpenBookings(); }}
                  className="font-sans text-[10px] tracking-[0.25em] uppercase text-black hover:opacity-50 transition-opacity duration-300"
                >
                  My Bookings
                </motion.button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
