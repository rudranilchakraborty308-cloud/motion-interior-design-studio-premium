import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, User, Clock, CheckCircle } from 'lucide-react';

export default function DashboardBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('createdat', { ascending: false });
      
      if (data) {
        setBookings(data);
      }
      setLoading(false);
    };

    fetchBookings();

    const channel = supabase.channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Check permissions.');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-dark-khaki" /></div>;
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-black">Bookings Manager</h1>
        <p className="font-sans text-stone-500 text-sm mt-2">Manage incoming consultation requests.</p>
      </div>

      <div className="bg-white shadow-sm border border-stone-200">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-stone-500 font-sans">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs tracking-widest uppercase text-stone-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Service Info</th>
                  <th className="px-6 py-4 font-medium">Date requested</th>
                  <th className="px-6 py-4 font-medium">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-alabaster/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-black">{bk.username}</span>
                        <span className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" /> {bk.useremail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{bk.service}</td>
                    <td className="px-6 py-4 font-semibold">{bk.date}</td>
                    <td className="px-6 py-4">
                      {bk.status === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-orange-600 text-xs font-semibold uppercase tracking-wider bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                          <button 
                            onClick={() => updateStatus(bk.id, 'confirmed')}
                            className="text-[10px] uppercase font-bold tracking-wider text-green-700 bg-green-50 px-3 py-1 hover:bg-green-100 border border-green-200 transition-colors"
                          >
                            Mark Confirmed
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-green-700 text-xs font-semibold uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full border border-green-100 w-fit">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
