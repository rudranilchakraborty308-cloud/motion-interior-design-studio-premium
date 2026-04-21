import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type ViewState = 'loading' | 'auth_choice' | 'login' | 'signup' | 'book' | 'success';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [view, setView] = useState<ViewState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Booking states
  const [date, setDate] = useState('');
  const [service, setService] = useState('Consultation');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (isOpen) {
        if (currentUser) setView('book');
        else setView('auth_choice');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (isOpen) {
        if (currentUser) setView('book');
        else setView('auth_choice');
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen]);

  // Reset states when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setError('');
        setIsLoading(false);
        if (user) setView('book');
        else setView('auth_choice');
      }, 500);
    }
  }, [isOpen, user]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });

      if (!signUpError) {
        // Signup succeeded — try to sign in immediately (works when email confirm is OFF)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError('Account created! Please check your email to confirm, then sign in.');
        }
        // If signInError is null, auth state change listener will move to book view automatically
      } else {
        // Check if the error is email rate limit — if so, user might already exist, try signing in
        const msg = signUpError.message?.toLowerCase() || '';
        if (msg.includes('rate limit') || msg.includes('email rate') || msg.includes('too many')) {
          // Try direct sign-in — user may already have an account
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) {
            // Successfully signed in — all good
            return;
          } else {
            setError('Too many signup attempts. Please wait a few minutes and try again, or sign in if you already have an account.');
          }
        } else if (msg.includes('already registered') || msg.includes('user already exists')) {
          // User already exists — try signing in
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) return;
          setError('This email is already registered. Please sign in instead.');
        } else {
          throw signUpError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('auth_choice');
  };

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: insertError } = await supabase.from('bookings').insert([{
        userid: user.id,
        useremail: user.email,
        username: name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
        date,
        service,
        status: 'pending',
        createdat: new Date().toISOString()
      }]);
      if (insertError) throw insertError;
      setView('success');
    } catch (err: any) {
      setError('Could not complete booking. Please try again or contact us directly.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-dark-khaki" />
          </div>
        );
        
      case 'auth_choice':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col space-y-6 text-center"
          >
            <h2 className="font-serif text-3xl text-black">Welcome to Studio</h2>
            <p className="font-sans text-stone-600 text-sm">Please sign in or create an account to book your consultation.</p>
            
            <div className="flex flex-col space-y-4 mt-6">
              <button 
                onClick={() => setView('login')}
                className="w-full bg-black text-white font-sans uppercase tracking-widest text-xs py-4 hover:bg-dark-khaki transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => setView('signup')}
                className="w-full border border-black text-black font-sans uppercase tracking-widest text-xs py-4 hover:bg-black hover:text-white transition-colors"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        );

      case 'login':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <button onClick={() => setView('auth_choice')} className="text-xs text-stone-500 hover:text-black uppercase tracking-widest mb-6 block">&larr; Back</button>
            <h2 className="font-serif text-3xl text-black mb-6">Sign In</h2>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
              </div>
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-sans uppercase tracking-widest text-xs py-4 mt-4 hover:bg-dark-khaki transition-colors disabled:opacity-50 flex justify-center items-center">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </motion.div>
        );

      case 'signup':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <button onClick={() => setView('auth_choice')} className="text-xs text-stone-500 hover:text-black uppercase tracking-widest mb-6 block">&larr; Back</button>
            <h2 className="font-serif text-3xl text-black mb-6">Create Account</h2>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
              </div>
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
              </div>
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Password (Min 6 chars)</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-sans uppercase tracking-widest text-xs py-4 mt-4 hover:bg-dark-khaki transition-colors disabled:opacity-50 flex justify-center items-center">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          </motion.div>
        );

      case 'book':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-3xl text-black">Book Consultation</h2>
              <button onClick={handleLogout} className="text-[10px] text-stone-500 uppercase tracking-widest hover:text-black">Sign Out</button>
            </div>
            <p className="font-sans tracking-widest text-[10px] uppercase text-dark-khaki mb-6">Signed in as {user?.email}</p>
            
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            
            <form onSubmit={handleBook} className="space-y-6">
              {/* If they didn't set a name during signup, ask for it now for the booking */}
              {(!name) && (
                 <div>
                    <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Your Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" />
                 </div>
              )}
            
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Service of Interest</label>
                <select 
                  value={service} 
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none"
                >
                  <option>Interior Architecture</option>
                  <option>Bespoke Joinery</option>
                  <option>Styling & Sourcing</option>
                  <option>General Consultation</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Preferred Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent rounded-none" 
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-sans uppercase tracking-widest text-xs py-4 mt-8 hover:bg-dark-khaki transition-colors disabled:opacity-50 flex justify-center items-center gap-2 group">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Confirm Booking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center py-10"
          >
            <div className="w-16 h-16 bg-pale-green text-green-700 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl text-black mb-4">Request Sent</h2>
            <p className="font-sans text-stone-600 mb-8 max-w-sm">
              Thank you {name || user?.email?.split('@')[0]}. Your appointment request for {new Date(date).toLocaleDateString()} has been received. Our team will contact you shortly to confirm the scheduled time.
            </p>
            <button 
              onClick={onClose}
              className="border border-black text-black font-sans uppercase tracking-widest text-xs py-3 px-8 hover:bg-black hover:text-white transition-colors"
            >
              Return to Site
            </button>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] grid place-items-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-pale-white w-full max-w-md p-8 relative shadow-2xl"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pt-2">
              <AnimatePresence mode="wait">
                <motion.div key={view}>
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
