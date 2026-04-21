import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function MyBookingsModal({ isOpen, onClose, user }: MyBookingsModalProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchBookings();
    }
  }, [isOpen, user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('userid', user.id)
        .order('createdat', { ascending: false });
        
      if (!error && data) {
        setBookings(data);
      } else {
        console.error("Error fetching user bookings:", error);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
    setLoading(false);
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
            className="bg-pale-white w-full max-w-lg p-8 relative shadow-2xl"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-serif text-3xl text-black mb-6">My Bookings</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-dark-khaki" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-stone-500 font-sans">
                You don't have any bookings yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {bookings.map((b) => (
                  <div key={b.id} className="border border-stone-200 bg-white p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl">{b.service}</h3>
                      <span className={`text-[10px] uppercase font-sans tracking-widest px-2 py-1 ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm font-sans text-stone-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(b.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
