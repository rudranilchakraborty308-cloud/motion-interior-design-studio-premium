import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Loader2, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnauthorized(false);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Double check authorization manually for UI feedback
      if (data.user?.email !== 'rudranilchakraborty308@gmail.com') {
        setUnauthorized(true);
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-alabaster p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-black" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-pale-white p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-12">
           <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold block mb-4">Master Portal</span>
           <h1 className="font-serif text-4xl text-black">Motion Studio</h1>
        </div>

        {error && <p className="bg-red-50 text-red-600 text-[10px] p-4 uppercase tracking-widest mb-8 text-center">{error}</p>}
        {unauthorized && <p className="bg-amber-50 text-amber-600 text-[10px] p-4 uppercase tracking-widest mb-8 text-center">Unauthorized Access Attempt</p>}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold">Encrypted ID</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-black transition-colors bg-transparent font-sans" 
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold">Access Token</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-black transition-colors bg-transparent" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-5 font-sans uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-dark-khaki transition-all flex justify-center items-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Identify Access <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-[9px] uppercase tracking-widest text-stone-300">Restricted Area &copy; 2024</p>
        </div>
      </motion.div>

      {/* Decorative */}
      <div className="absolute bottom-20 right-20 text-[200px] font-serif text-black opacity-[0.02] pointer-events-none select-none italic">
        Studio
      </div>
    </div>
  );
}
