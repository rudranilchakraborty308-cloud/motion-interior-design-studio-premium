import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, LogOut } from 'lucide-react';

export default function AdminLogin({ currentUser }: { currentUser?: User | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 z-50">
        <div className="w-full max-w-md bg-pale-white p-8 lg:p-12 shadow-2xl text-center">
          <h1 className="font-serif text-3xl mb-4 text-red-600">Access Denied</h1>
          <p className="font-sans text-sm text-stone-600 mb-8">
            You are currently logged in as client: <br/><strong className="text-black">{currentUser.email}</strong>.<br/><br/>
            Admin access is strictly restricted.
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-sans uppercase tracking-widest text-xs py-4 hover:bg-dark-khaki transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out from Client Mode
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (email !== 'rudranilchakraborty308@gmail.com') {
      setError('Unauthorized email address.');
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            setError('Authentication failed: ' + signUpError.message);
          }
        } else {
          setError(signInError.message || 'Login failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 z-50">
      <div className="w-full max-w-md bg-pale-white p-8 lg:p-12 shadow-2xl relative">
        <div className="text-center mb-10">
          <h1 className="font-sans text-2xl tracking-widest uppercase font-light">
            Studi<span className="text-dark-khaki">o</span>
          </h1>
          <p className="font-serif text-xl italic text-stone-500 mt-2">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 text-xs mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" 
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-black text-white font-sans uppercase tracking-widest text-xs py-4 mt-8 hover:bg-dark-khaki transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Portal'}
          </button>
        </form>
        
        <p className="mt-8 text-[10px] text-stone-400 font-sans tracking-widest uppercase text-center">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
