import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (data) {
        setTestimonials(data);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setQuote('');
    setAuthor('');
    setLocation('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditId(t.id);
    setQuote(t.quote);
    setAuthor(t.author);
    setLocation(t.location);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    // UI Remove
    setTestimonials(testimonials.filter(t => t.id !== id));
    
    try {
      const { error } = await supabase.from('testimonials').update({ is_deleted: true }).eq('id', id);
      if (error) throw error;
    } catch (e: any) {
      console.error("Delete failed", e);
      alert('Failed to delete: ' + e.message);
      fetchTestimonials(); // refresh
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const itemData = { quote, author, location };
      
      if (editId) {
        const { error } = await supabase
          .from('testimonials')
          .update(itemData)
          .eq('id', editId);
        
        if (error) throw error;
        
        setTestimonials(testimonials.map(t => t.id === editId ? { ...t, ...itemData } : t));
      } else {
        const { data, error } = await supabase
          .from('testimonials')
          .insert([itemData])
          .select();
        
        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials([data[0], ...testimonials]);
        }
      }
      
      setModalOpen(false);
      setQuote(''); setAuthor(''); setLocation('');
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-dark-khaki" /></div>;

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-black">Testimonials</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">Manage client quotes (Client Words).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-500 font-sans border border-stone-200">
          No testimonials added. The frontend will show defaults until you add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white border border-stone-200 p-6 shadow-sm relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(t)}
                  className="bg-dark-khaki/10 text-dark-khaki hover:bg-dark-khaki hover:text-white p-2 rounded-full transition-all shadow-sm"
                  title="Edit Testimonial"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-full transition-all shadow-sm"
                  title="Delete Testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-serif italic text-lg mb-4 pr-12 text-black">"{t.quote}"</p>
              <div className="opacity-70">
                <p className="font-sans text-xs uppercase tracking-widest font-semibold">{t.author}</p>
                <p className="font-sans text-xs uppercase tracking-widest text-stone-500">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-pale-white w-full max-w-lg p-8 shadow-2xl">
              <h2 className="font-serif text-3xl mb-6">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Quote</label>
                  <textarea required value={quote} onChange={e => setQuote(e.target.value)} rows={4} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent placeholder:italic text-sm" placeholder="e.g. Their attention to detail was incredible..." />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Author Name</label>
                  <input type="text" required value={author} onChange={e => setAuthor(e.target.value)} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" placeholder="e.g. Sarah & James" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Location / Project</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" placeholder="e.g. The Kensington Townhouse" />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 border border-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-black text-white uppercase text-xs tracking-widest hover:bg-dark-khaki transition-colors flex justify-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
