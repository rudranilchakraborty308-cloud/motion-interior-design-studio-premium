import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, Clock, Trash2, Calendar, User, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (data) setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this booking entry?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err: any) {
      alert("Failed to delete booking: " + err.message);
    }
  };

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-dark-khaki" /></div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-black">Inquiries & Consultations</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">Manage all incoming booking requests from your clients.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-100">
           <Sparkles className="w-4 h-4 text-dark-khaki" />
           <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{bookings.length} Total Requests</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {bookings.map((b) => (
            <motion.div
              layout
              key={b.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                bg-white p-6 md:p-8 rounded-3xl border transition-all duration-500 shadow-sm hover:shadow-xl
                ${b.status === 'completed' ? 'border-green-100 opacity-70' : 'border-stone-100'}
              `}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-300 block">Client Info</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-alabaster rounded-full flex items-center justify-center text-dark-khaki font-serif italic text-lg">
                        {b.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-sans font-bold text-sm text-black">{b.username}</p>
                        <p className="text-[10px] text-stone-400">{b.useremail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-300 block">Service Detail</span>
                    <div className="flex items-center gap-3">
                       <Sparkles className="w-4 h-4 text-dark-khaki" />
                       <p className="font-serif text-lg text-black">{b.service}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-300 block">Requested For</span>
                    <div className="flex items-center gap-3">
                       <Calendar className="w-4 h-4 text-stone-400" />
                       <p className="font-sans text-sm font-semibold">{new Date(b.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                   {b.status === 'pending' ? (
                     <button 
                      onClick={() => updateStatus(b.id, 'completed')}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-full hover:bg-green-600 hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest"
                     >
                        <CheckCircle2 className="w-4 h-4" /> Mark Confirmed
                     </button>
                   ) : (
                     <div className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                     </div>
                   )}
                   <button 
                    onClick={() => deleteBooking(b.id)}
                    className="p-3 bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {bookings.length === 0 && (
          <div className="bg-white p-20 text-center rounded-[3rem] border border-stone-100 shadow-sm">
             <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-6 h-6 text-stone-200" />
             </div>
             <h3 className="font-serif text-2xl text-stone-300">Quiet for now.</h3>
             <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-2 font-bold">No incoming consultation requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
